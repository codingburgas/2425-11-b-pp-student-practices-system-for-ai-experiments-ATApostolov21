import pandas as pd
import os
import json
from werkzeug.utils import secure_filename
from config import Config

def save_dataset_file(file):
    """
    Save the uploaded CSV file to the upload folder
    """
    filename = secure_filename(file.filename)
    file_path = os.path.join(Config.UPLOAD_FOLDER, filename)
    file.save(file_path)
    return file_path

def get_dataset_columns(file_path):
    """
    Get column names from CSV file
    """
    try:
        df = pd.read_csv(file_path)
        columns = df.columns.tolist()
        return columns
    except Exception as e:
        return None

def get_dataset_preview(file_path, rows=10):
    """
    Get a preview of the dataset (first N rows)
    """
    try:
        print(f"Attempting to read CSV file: {file_path}")
        if not os.path.exists(file_path):
            print(f"Error: File does not exist at path: {file_path}")
            return None
            
        df = pd.read_csv(file_path)
        print(f"Successfully read CSV with {len(df)} rows and {len(df.columns)} columns")
        return df.head(rows)
    except Exception as e:
        print(f"Error reading dataset preview: {str(e)}")
        return None

def get_dataset_stats(file_path):
    """
    Get basic statistics about the dataset (count, mean, std, min, max)
    """
    try:
        print(f"Attempting to generate stats for file: {file_path}")
        if not os.path.exists(file_path):
            print(f"Error: File does not exist at path: {file_path}")
            return None
            
        df = pd.read_csv(file_path)
        print(f"Successfully read CSV for stats with {len(df)} rows")
        
        # Prepare stats result
        stats = {}
        
        # General info
        stats['memory_usage'] = f"{df.memory_usage(deep=True).sum() / (1024 * 1024):.2f} MB"
        
        # Data types summary
        dtypes = df.dtypes.astype(str)
        stats['dtypes'] = dtypes.value_counts().to_dict()
        
        # Column types
        stats['column_types'] = {col: str(dtype) for col, dtype in zip(df.columns, df.dtypes)}
        
        # Missing values
        stats['missing_values'] = df.isna().sum().to_dict()
        
        # Only calculate numeric stats if we have numeric columns
        numeric_df = df.select_dtypes(include=['number'])
        if not numeric_df.empty:
            stats['numeric_stats'] = numeric_df.describe().to_dict()
        else:
            stats['numeric_stats'] = None
            
        print(f"Successfully generated stats for {file_path}")
        return stats
    except Exception as e:
        print(f"Error generating dataset stats: {str(e)}")
        return None 