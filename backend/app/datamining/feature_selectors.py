from abc import ABC, abstractmethod
from typing import Any, List, Dict, Type
import pandas as pd
from pydantic import BaseModel
from sklearn import neighbors
from sklearn.ensemble import RandomForestClassifier

from sklearn.feature_selection import SelectKBest, chi2, mutual_info_classif, RFE, RFECV, SequentialFeatureSelector
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVR

from app.models.fs_run_model import MethodCategory


# https://fastapi.tiangolo.com/tutorial/body/#create-your-data-model
class ParameterSpec(BaseModel):
    """Definition for a configurable parameter for a FS method"""
    name: str
    type: str
    default: Any
    label: str


class BaseFeatureSelector(ABC):
    """Abstract base class for all Feature Selectors"""
    name: str
    category: MethodCategory
    description: str
    # Information for each configurable parameter. This is not the data used for configuring the FS method, but to provide
    # the available arguments to configure, and to obtain the values from the user
    parameters_schema: List[ParameterSpec]

    def __init__(self, **kwargs):
        # This is the dictionary that obtains the parameter and the value. If there is no user value, use the default one
        # assigned in a FS class
        self.params = {}
        for spec in self.parameters_schema:
            user_value = kwargs.get(spec.name)
            self.params[spec.name] = user_value if user_value is not None else spec.default

    @abstractmethod
    def select_features(self, x: pd.DataFrame, y: pd.Series) -> List[str]:
        """Executes the feature selection and returns a list of selected column names."""
        pass


# We use a registry pattern that automaitcally registers the feature selector.
FS_REGISTRY: Dict[str, Type[BaseFeatureSelector]] = {}


def register_selector(cls):
    """Decorator to automatically register a feature selector."""
    FS_REGISTRY[cls.name] = cls
    return cls


@register_selector
class ChiSquareSelector(BaseFeatureSelector):
    name = "Chi-Square"
    category = MethodCategory.FILTER
    description = "Statistical feature selection for classification"
    parameters_schema = [
        ParameterSpec(name="k", type="number", default=10, label="Number of features to select"),
    ]

    def select_features(self, x: pd.DataFrame, y: pd.Series) -> List[str]:
        # If input is more than allowed size, use the maximum
        k = min(int(self.params["k"]), x.shape[1] - 1)

        selector = SelectKBest(score_func=chi2, k=k)
        selector.fit(x, y)
        return x.columns[selector.get_support()].tolist()


@register_selector
class MutualInformationSelector(BaseFeatureSelector):
    name = "Mutual Information"
    category = MethodCategory.FILTER
    description = "Information-theoretic feature ranking"
    parameters_schema = [
        ParameterSpec(name="k", type="number", default=10, label="Number of features to select"),
    ]

    def select_features(self, x: pd.DataFrame, y: pd.Series) -> List[str]:
        k = min(int(self.params["k"]), x.shape[1])

        selector = SelectKBest(score_func=mutual_info_classif, k=k)
        selector.fit(x, y)
        return x.columns[selector.get_support()].tolist()


@register_selector
class RFESelector(BaseFeatureSelector):
    name = "RFE"
    category = MethodCategory.WRAPPER
    description = "Recursive Feature Elimination"
    parameters_schema = [
        ParameterSpec(name="k", type="number", default=10, label="Number of features to select"),
        ParameterSpec(name="step", type="number", default=1, label="Number of features to eliminate per iteration")
    ]

    def select_features(self, x: pd.DataFrame, y: pd.Series) -> List[str]:
        k = min(int(self.params["k"]), x.shape[1])
        step = int(self.params["step"])

        estimator = LogisticRegression(max_iter=10000, random_state=42)
        selector = RFE(estimator, n_features_to_select=k, step=step)
        selector.fit(x, y)

        return x.columns[selector.get_support()].tolist()


@register_selector
class RFECVSelector(BaseFeatureSelector):
    name = "RFECV"
    category = MethodCategory.WRAPPER
    description = "Recursive Feature Elimination with Cross Validation"
    parameters_schema = [
        ParameterSpec(name="cv", type="number", default=5, label="Cross-validation folds"),
    ]

    def select_features(self, x: pd.DataFrame, y: pd.Series) -> List[str]:
        cv = int(self.params["cv"])
        estimator = RandomForestClassifier(random_state=42)
        selector = RFECV(estimator=estimator, cv=cv)
        selector.fit(x, y)

        return x.columns[selector.get_support()].tolist()


@register_selector
class ForwardSelectionSelector(BaseFeatureSelector):
    name = "Forward Selection"
    category = MethodCategory.WRAPPER
    description = "Iterative forward feature selection"
    parameters_schema = [
        ParameterSpec(name="cv_folds", type="number", default=5, label="Cross-validation folds")
    ]

    # https://sklearner.com/sklearn-kneighborsclassifier-n_neighbors-parameter/
    def select_features(self, x: pd.DataFrame, y: pd.Series) -> List[str]:
        cv_folds = int(self.params["cv_folds"])

        estimator = KNeighborsClassifier()
        selector = SequentialFeatureSelector(
            estimator,
            n_features_to_select='auto',
            direction="forward",
            cv=cv_folds
        )
        selector.fit(x, y)

        return x.columns[selector.get_support()].tolist()
