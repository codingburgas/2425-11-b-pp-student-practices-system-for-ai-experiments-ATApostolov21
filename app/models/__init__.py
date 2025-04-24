from flask import Blueprint

bp = Blueprint('models', __name__, template_folder='templates')

# First import models
from app.models.models import Model, Prediction, Feedback
from app.models.user import User

# Then import routes which uses those models
from app.models import routes
from app.models.routes import models

def init_app(app):
    app.register_blueprint(models) 