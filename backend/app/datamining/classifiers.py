from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import numpy as np

# https://sklearner.com/scikit-learn-accuracy_score/
# https://sklearner.com/scikit-learn-balanced_accuracy_score/
def knn_evaluate(X, y, selected_features):
    """Calculates accuracy using a standard KNN model."""
    X_subset = X[selected_features]
    X_train, X_test, y_train, y_test = train_test_split(X_subset, y, test_size=0.2, random_state=42)

    knn = KNeighborsClassifier()
    knn.fit(X_train, y_train)
    y_pred = knn.predict(X_test)
    return accuracy_score(y_test, y_pred)


