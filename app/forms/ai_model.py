from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, SelectField, FloatField, IntegerField, SubmitField
from wtforms.validators import DataRequired, Length, NumberRange, Optional
from app.models.model_type import ModelType

class AIModelForm(FlaskForm):
    name = StringField('Име на модела:', validators=[DataRequired()])
    description = TextAreaField('Описание:', validators=[DataRequired()])
    model_type = SelectField('Тип на модела:', choices=[
        (ModelType.PERCEPTRON, 'Перцептрон'),
        (ModelType.LINEAR_REGRESSION, 'Линейна регресия'),
        (ModelType.LOGISTIC_REGRESSION, 'Логистична регресия'),
        (ModelType.NEURAL_NETWORK, 'Невронна мрежа'),
        (ModelType.DECISION_TREE, 'Дърво на решенията'),
        (ModelType.RANDOM_FOREST, 'Случайна гора'),
        (ModelType.SVM, 'Метод на опорните вектори (SVM)'),
        (ModelType.KNN, 'k-Най-близки съседи (k-NN)')
    ], validators=[DataRequired()])
    dataset_id = SelectField('Dataset', coerce=int, validators=[DataRequired()])
    target_column = StringField('Target Column', validators=[DataRequired()])
    
    # Hyperparameters
    learning_rate = FloatField('Learning Rate', 
                              validators=[Optional(), NumberRange(min=0.0001, max=1.0)],
                              default=0.01)
    iterations = IntegerField('Iterations', 
                             validators=[Optional(), NumberRange(min=1, max=10000)],
                             default=100)
    hidden_layers = StringField('Hidden Layers (comma-separated nodes per layer)',
                              default="10,5")
    
    submit = SubmitField('Train Model')

class CommentForm(FlaskForm):
    content = TextAreaField('Comment', validators=[DataRequired()])
    submit = SubmitField('Add Comment')
 