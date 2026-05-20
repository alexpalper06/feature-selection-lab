# app/utils/dataset.py
import pandas as pd

def extract_shape(df: pd.DataFrame) -> tuple[int, int]:
    """Returns (num_rows, num_cols) for the structural matrix layout."""
    return df.shape[0], df.shape[1]