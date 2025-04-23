from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileRequired, FileAllowed
from wtforms import StringField, TextAreaField, SubmitField
from wtforms.validators import DataRequired, Length, ValidationError
import os
from config import Config

class DatasetUploadForm(FlaskForm):
    name = StringField('Dataset Name', validators=[DataRequired(), Length(min=3, max=100)])
    description = TextAreaField('Description', validators=[Length(max=500)])
    file = FileField('CSV File', validators=[
        FileRequired(),
        FileAllowed(['csv'], 'CSV files only!')
    ])
    submit = SubmitField('Upload Dataset')
    
    def validate_file(self, file):
        # Additional validation for file (e.g., size limit)
        if file.data:
            filename = file.data.filename
            if os.path.exists(os.path.join(Config.UPLOAD_FOLDER, filename)):
                raise ValidationError('A file with this name already exists. Please rename your file.')
            
            # Check file size (limit to 10MB)
            file.data.seek(0, os.SEEK_END)
            size = file.data.tell()
            file.data.seek(0)  # Reset file pointer to the beginning
            
            if size > 10 * 1024 * 1024:  # 10MB in bytes
                raise ValidationError('File size exceeds the 10MB limit.') 