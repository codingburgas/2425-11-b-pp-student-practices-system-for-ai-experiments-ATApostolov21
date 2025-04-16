from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField, SelectField
from wtforms.validators import DataRequired, Length, Email, EqualTo, ValidationError
from app.models.user import User, Role

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('Remember Me')
    submit = SubmitField('Sign In')

class RegistrationForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email(), Length(max=120)])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])
    password2 = PasswordField('Confirm Password', 
                             validators=[DataRequired(), EqualTo('password')])
    role = SelectField('Role', choices=[(Role.STUDENT, 'Student'), (Role.TEACHER, 'Teacher')],
                      default=Role.STUDENT)
    submit = SubmitField('Register')
    
    def validate_email(self, email):
        user = User.get_by_email(email.data)
        if user is not None:
            raise ValidationError('Email already registered. Please use a different email address.') 