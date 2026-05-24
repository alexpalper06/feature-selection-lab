# app/utils/dataset.py
from typing import Any, Dict

import pandas as pd


def extract_shape(df: pd.DataFrame) -> tuple[int, int]:
    """Returns (num_rows, num_cols) for the structural matrix layout."""
    return df.shape[0], df.shape[1]


def get_class_distribution(df: pd.DataFrame, target_column: str) -> Dict[str, Any]:
    """
    Calculates counts and percentages for each class in the target column.
    """
    # Calculates number of entries for each value in a target attribute
    counts = df[target_column].value_counts().to_dict()

    # Calculate relative frequencies (normalized)
    percentages = df[target_column].value_counts(normalize=True).to_dict()

    # Ensure that the keys are string to facilitate JSON serialization
    counts_serialized = {str(k): int(v) for k, v in counts.items()}
    percentages_serialized = {str(k): round(float(v), 4) for k, v in percentages.items()}

    return {"counts": counts_serialized, "percentages": percentages_serialized}
