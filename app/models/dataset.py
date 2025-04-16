import os
import pandas as pd
import uuid
import shutil
from datetime import datetime
from typing import Dict, List, Optional, Union, Tuple
from flask import current_app

METADATA_FILENAME = 'metadata.csv'

class Dataset:
    """Dataset model for working with local file storage."""
    
    def __init__(self, id: str, name: str, description: str, filename: str, 
                 file_type: str, file_size: int, created_at: Optional[datetime] = None):
        self.id = id
        self.name = name
        self.description = description
        self.filename = filename
        self.file_type = file_type
        self.file_size = file_size
        self.created_at = created_at if created_at else datetime.now()
    
    @property
    def file_path(self):
        """Get the full path to the dataset file."""
        return os.path.join(current_app.config['DATASET_FOLDER'], self.filename)

    @staticmethod
    def _get_metadata_path() -> str:
        return os.path.join(current_app.config['DATASET_FOLDER'], METADATA_FILENAME)

    @staticmethod
    def _read_metadata() -> pd.DataFrame:
        """Reads the metadata CSV file into a DataFrame."""
        metadata_path = Dataset._get_metadata_path()
        if os.path.exists(metadata_path):
            try:
                return pd.read_csv(metadata_path)
            except pd.errors.EmptyDataError:
                return pd.DataFrame(columns=['id', 'name', 'description', 'filename', 'file_type', 'file_size', 'created_at'])
            except Exception as e:
                print(f"Error reading dataset metadata: {e}")
                # Return empty frame if error occurs
                return pd.DataFrame(columns=['id', 'name', 'description', 'filename', 'file_type', 'file_size', 'created_at'])
        else:
            # Create empty dataframe if file doesn't exist
            return pd.DataFrame(columns=['id', 'name', 'description', 'filename', 'file_type', 'file_size', 'created_at'])

    @staticmethod
    def _write_metadata(df: pd.DataFrame):
        """Writes the DataFrame to the metadata CSV file."""
        metadata_path = Dataset._get_metadata_path()
        try:
            df.to_csv(metadata_path, index=False)
        except Exception as e:
            print(f"Error writing dataset metadata: {e}")
    
    @staticmethod
    def get_all() -> List['Dataset']:
        """Get all datasets from metadata."""
        datasets = []
        df = Dataset._read_metadata()
        if not df.empty:
            for _, row in df.iterrows():
                datasets.append(Dataset(
                    id=row['id'],
                    name=row['name'],
                    description=row['description'],
                    filename=row['filename'],
                    file_type=row['file_type'],
                    file_size=int(row['file_size']),
                    created_at=datetime.fromisoformat(row['created_at']) if pd.notna(row['created_at']) else None
                ))
        return sorted(datasets, key=lambda d: d.created_at, reverse=True)
    
    @staticmethod
    def get_by_id(dataset_id: str) -> Optional['Dataset']:
        """Get a dataset by ID from metadata."""
        df = Dataset._read_metadata()
        dataset_row = df[df['id'] == dataset_id]
        if not dataset_row.empty:
            row = dataset_row.iloc[0]
            return Dataset(
                id=row['id'],
                name=row['name'],
                description=row['description'],
                filename=row['filename'],
                file_type=row['file_type'],
                file_size=int(row['file_size']),
                created_at=datetime.fromisoformat(row['created_at']) if pd.notna(row['created_at']) else None
            )
        return None
    
    @staticmethod
    def create(name: str, description: str, file) -> Union['Dataset', Dict[str, str]]:
        """Create a new dataset, save file, and append metadata."""
        try:
            # Generate unique ID and filename
            dataset_id = str(uuid.uuid4())
            original_filename = file.filename
            file_type = os.path.splitext(original_filename)[1][1:].lower()  # Get extension without dot
            
            # Check file type is CSV
            if file_type != 'csv':
                return {'error': 'Only CSV files are supported'}
            
            # Create unique filename
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            filename = f"{dataset_id}_{timestamp}.csv"
            
            # Get file size
            file.seek(0, os.SEEK_END)
            file_size = file.tell()
            file.seek(0)  # Reset file pointer

            # Validate CSV content (basic check)
            try:
                pd.read_csv(file, nrows=5) # Try reading a few rows
                file.seek(0) # Reset pointer again
            except Exception as e:
                 return {'error': f'Invalid CSV file: {e}'}

            # Save file to dataset folder
            file_path = os.path.join(current_app.config['DATASET_FOLDER'], filename)
            file.save(file_path)
            
            # Create dataset instance
            dataset = Dataset(
                id=dataset_id,
                name=name,
                description=description,
                filename=filename,
                file_type=file_type,
                file_size=file_size,
                created_at=datetime.now()
            )
            
            # Append metadata to CSV
            metadata_df = Dataset._read_metadata()
            new_metadata = pd.DataFrame([{
                'id': dataset.id,
                'name': dataset.name,
                'description': dataset.description,
                'filename': dataset.filename,
                'file_type': dataset.file_type,
                'file_size': dataset.file_size,
                'created_at': dataset.created_at.isoformat()
            }])
            updated_metadata = pd.concat([metadata_df, new_metadata], ignore_index=True)
            Dataset._write_metadata(updated_metadata)
            
            return dataset
            
        except Exception as e:
            print(f"Error creating dataset: {str(e)}")
            # Clean up saved file if metadata fails
            if 'file_path' in locals() and os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except OSError as rm_err:
                    print(f"Error cleaning up file {file_path}: {rm_err}")
            return {'error': f'Internal error during dataset creation: {str(e)}'}
    
    def load_data(self) -> Union[pd.DataFrame, Dict[str, str]]:
        """Load dataset from storage as a pandas DataFrame."""
        if not os.path.exists(self.file_path):
             return {'error': f'Dataset file not found at {self.file_path}'}
        try:
            # Read CSV file into DataFrame
            df = pd.read_csv(self.file_path)
            return df
        except Exception as e:
            print(f"Error loading dataset {self.filename}: {str(e)}")
            return {'error': f'Failed to load data: {str(e)}'}
    
    def get_statistics(self) -> Dict[str, Union[int, List[str]]]:
        """Get basic statistics about the dataset."""
        data = self.load_data()
        if isinstance(data, dict) and 'error' in data:
             return data # Return error dict from load_data
        
        try:
            return {
                'rows': len(data),
                'columns': len(data.columns),
                'column_names': data.columns.tolist(),
                'file_size': self.file_size,
                'file_type': self.file_type
            }
        except Exception as e:
            print(f"Error getting dataset statistics: {str(e)}")
            return {'error': str(e)}
    
    def update(self, **kwargs) -> bool:
        """Update dataset attributes in metadata."""
        try:
            metadata_df = Dataset._read_metadata()
            idx = metadata_df.index[metadata_df['id'] == self.id].tolist()
            
            if not idx:
                print(f"Error updating dataset: ID {self.id} not found in metadata.")
                return False

            # Update DataFrame row
            for key, value in kwargs.items():
                if key in metadata_df.columns:
                    metadata_df.loc[idx[0], key] = value
                    # Update instance attribute as well
                    if hasattr(self, key):
                         setattr(self, key, value)

            Dataset._write_metadata(metadata_df)
            return True
        except Exception as e:
            print(f"Error updating dataset metadata: {str(e)}")
            return False
    
    def delete(self) -> bool:
        """Delete the dataset file and remove from metadata."""
        try:
            # Delete file
            if os.path.exists(self.file_path):
                os.remove(self.file_path)
            
            # Remove from metadata
            metadata_df = Dataset._read_metadata()
            initial_rows = len(metadata_df)
            metadata_df = metadata_df[metadata_df['id'] != self.id]
            
            # Check if a row was actually removed
            row_removed = len(metadata_df) < initial_rows
            
            if row_removed:
                Dataset._write_metadata(metadata_df)
            else:
                print(f"Warning: Dataset ID {self.id} not found in metadata during delete.")
                # Proceed even if metadata wasn't found, as file was deleted
            
            return True
        except Exception as e:
            print(f"Error deleting dataset {self.id}: {str(e)}")
            return False
    
    def get_preview(self, rows: int = 10) -> Union[Dict[str, List], Dict[str, str]]:
        """Get a preview of the dataset as a dictionary."""
        data = self.load_data()
        if isinstance(data, dict) and 'error' in data:
            return data # Return error dict from load_data

        try:
            preview = data.head(rows)
            return {
                'columns': preview.columns.tolist(),
                'data': preview.values.tolist()
            }
        except Exception as e:
            print(f"Error getting dataset preview: {str(e)}")
            return {'error': str(e)}
    
    def download_file(self) -> str:
        """Get the path to the dataset file for download."""
        # Check if file exists before returning path
        if os.path.exists(self.file_path):
            return self.file_path
        else:
            return None # Indicate file not found
    
    def __repr__(self) -> str:
        return f"<Dataset {self.name} ({self.id})>" 