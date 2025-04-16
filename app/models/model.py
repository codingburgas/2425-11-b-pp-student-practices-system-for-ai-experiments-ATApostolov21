import os
import json
import uuid
import pandas as pd
from datetime import datetime
from flask import current_app
from app.models.model_factory import ModelFactory
from typing import Optional

METADATA_FILENAME = 'metadata.csv'

class Model:
    def __init__(self, id, name, description, model_type, hyperparameters, 
                 filename, dataset_id, created_at=None):
        self.id = id
        self.name = name
        self.description = description
        self.model_type = model_type
        # Ensure hyperparameters are always a dict
        if isinstance(hyperparameters, str):
            try:
                self.hyperparameters = json.loads(hyperparameters)
            except json.JSONDecodeError:
                self.hyperparameters = {}
        else:
            self.hyperparameters = hyperparameters if hyperparameters else {}
        self.filename = filename
        self.dataset_id = dataset_id
        self.created_at = created_at or datetime.utcnow()

    @property
    def file_path(self):
        """Get the full path to the model file."""
        return os.path.join(current_app.config['MODEL_FOLDER'], self.filename)

    @staticmethod
    def _get_metadata_path() -> str:
        return os.path.join(current_app.config['MODEL_FOLDER'], METADATA_FILENAME)

    @staticmethod
    def _read_metadata() -> pd.DataFrame:
        """Reads the metadata CSV file into a DataFrame."""
        metadata_path = Model._get_metadata_path()
        if os.path.exists(metadata_path):
            try:
                return pd.read_csv(metadata_path)
            except pd.errors.EmptyDataError:
                 return pd.DataFrame(columns=['id', 'name', 'description', 'model_type', 'hyperparameters', 'filename', 'dataset_id', 'created_at'])
            except Exception as e:
                print(f"Error reading model metadata: {e}")
                return pd.DataFrame(columns=['id', 'name', 'description', 'model_type', 'hyperparameters', 'filename', 'dataset_id', 'created_at'])
        else:
            return pd.DataFrame(columns=['id', 'name', 'description', 'model_type', 'hyperparameters', 'filename', 'dataset_id', 'created_at'])

    @staticmethod
    def _write_metadata(df: pd.DataFrame):
        """Writes the DataFrame to the metadata CSV file."""
        metadata_path = Model._get_metadata_path()
        try:
            df.to_csv(metadata_path, index=False)
        except Exception as e:
            print(f"Error writing model metadata: {e}")

    @staticmethod
    def get_all() -> list['Model']:
        """Get all models from metadata."""
        models = []
        df = Model._read_metadata()
        if not df.empty:
            for _, row in df.iterrows():
                try:
                    hyperparams = json.loads(row['hyperparameters']) if pd.notna(row['hyperparameters']) and isinstance(row['hyperparameters'], str) else {}
                except (json.JSONDecodeError, TypeError):
                     hyperparams = {}
                models.append(Model(
                    id=row['id'],
                    name=row['name'],
                    description=row['description'],
                    model_type=row['model_type'],
                    hyperparameters=hyperparams,
                    filename=row['filename'],
                    dataset_id=row['dataset_id'],
                    created_at=datetime.fromisoformat(row['created_at']) if pd.notna(row['created_at']) else None
                ))
        return sorted(models, key=lambda m: m.created_at, reverse=True)

    @staticmethod
    def get_by_id(model_id: str) -> Optional['Model']:
        """Get a model by ID from metadata."""
        df = Model._read_metadata()
        model_row = df[df['id'] == model_id]
        if not model_row.empty:
            row = model_row.iloc[0]
            try:
                 hyperparams = json.loads(row['hyperparameters']) if pd.notna(row['hyperparameters']) and isinstance(row['hyperparameters'], str) else {}
            except (json.JSONDecodeError, TypeError):
                 hyperparams = {}
            return Model(
                id=row['id'],
                name=row['name'],
                description=row['description'],
                model_type=row['model_type'],
                hyperparameters=hyperparams,
                filename=row['filename'],
                dataset_id=row['dataset_id'],
                created_at=datetime.fromisoformat(row['created_at']) if pd.notna(row['created_at']) else None
            )
        return None
    
    @staticmethod
    def create(name: str, description: str, model_type: str, hyperparameters: dict, 
               filename: str, dataset_id: str) -> Optional['Model']:
        """Create a new model instance and add its metadata."""
        try:
            model_id = str(uuid.uuid4())
            model = Model(
                id=model_id,
                name=name,
                description=description,
                model_type=model_type,
                hyperparameters=hyperparameters,
                filename=filename,
                dataset_id=dataset_id,
                created_at=datetime.now()
            )
            
            # Append metadata
            metadata_df = Model._read_metadata()
            new_metadata = pd.DataFrame([{
                'id': model.id,
                'name': model.name,
                'description': model.description,
                'model_type': model.model_type,
                'hyperparameters': json.dumps(model.hyperparameters),
                'filename': model.filename,
                'dataset_id': model.dataset_id,
                'created_at': model.created_at.isoformat()
            }])
            updated_metadata = pd.concat([metadata_df, new_metadata], ignore_index=True)
            Model._write_metadata(updated_metadata)
            
            return model
        except Exception as e:
            print(f"Error creating model metadata: {e}")
            return None

    def load_model(self):
        """Load the actual model from storage."""
        if not os.path.exists(self.file_path):
            print(f"Model file not found: {self.file_path}")
            return None
        return ModelFactory.load_model(self.file_path)

    def predict(self, X):
        """Make predictions using the loaded model."""
        model = self.load_model()
        if model:
            return ModelFactory.predict(model, X, self.model_type)
        return None

    def get_metrics(self, X, y):
        """Calculate model metrics."""
        model = self.load_model()
        if model:
            return ModelFactory.get_model_metrics(model, X, y, self.model_type)
        return None

    def update(self, **kwargs):
        """Update model attributes in metadata."""
        try:
            metadata_df = Model._read_metadata()
            idx = metadata_df.index[metadata_df['id'] == self.id].tolist()
            
            if not idx:
                print(f"Error updating model: ID {self.id} not found in metadata.")
                return False

            # Update DataFrame row
            for key, value in kwargs.items():
                if key == 'hyperparameters': # Special handling for dict -> json str
                     value_to_write = json.dumps(value)
                else:
                     value_to_write = value
                     
                if key in metadata_df.columns:
                    metadata_df.loc[idx[0], key] = value_to_write
                    # Update instance attribute as well
                    if hasattr(self, key):
                         setattr(self, key, value)

            Model._write_metadata(metadata_df)
            return True
        except Exception as e:
            print(f"Error updating model metadata: {str(e)}")
            return False

    def delete(self) -> bool:
        """Delete the model file and remove from metadata."""
        try:
            # Delete file
            if os.path.exists(self.file_path):
                os.remove(self.file_path)
            
            # Remove from metadata
            metadata_df = Model._read_metadata()
            initial_rows = len(metadata_df)
            metadata_df = metadata_df[metadata_df['id'] != self.id]
            
            # Check if a row was actually removed
            row_removed = len(metadata_df) < initial_rows
            
            if row_removed:
                Model._write_metadata(metadata_df)
            else:
                 print(f"Warning: Model ID {self.id} not found in metadata during delete.")
                 # Proceed even if metadata wasn't found, as file was deleted
            
            return True
        except Exception as e:
            print(f"Error deleting model {self.id}: {str(e)}")
            return False

    def __repr__(self):
        return f'<Model {self.name} ({self.model_type})>' 