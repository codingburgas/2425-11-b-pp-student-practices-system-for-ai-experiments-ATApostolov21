from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileRequired, FileAllowed
from wtforms import StringField, TextAreaField, SubmitField
from wtforms.validators import DataRequired, Length

class DatasetForm(FlaskForm):
    name = StringField('Dataset Name', validators=[DataRequired(), Length(max=64)])
    description = TextAreaField('Description')
    file = FileField('CSV File', validators=[
        FileRequired(),
        FileAllowed(['csv'], 'CSV files only!')
    ])
    submit = SubmitField('Upload Dataset') 