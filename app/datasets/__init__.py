from flask import Blueprint

bp = Blueprint('datasets', __name__, template_folder='templates')

from app.datasets import routes
from app.datasets.models import Dataset 