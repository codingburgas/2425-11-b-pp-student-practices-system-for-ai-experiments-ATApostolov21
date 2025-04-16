from flask import Flask
from flask_bootstrap import Bootstrap
from config import config
import datetime

bootstrap = Bootstrap()

def create_app(config_name):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)
    
    # Initialize extensions
    bootstrap.init_app(app)
    
    # Add template context processor to make bootstrap available in templates
    @app.context_processor
    def inject_bootstrap():
        return dict(bootstrap=bootstrap)
    
    # Add template context processor to provide datetime
    @app.context_processor
    def inject_now():
        return {'current_year': datetime.datetime.now().year}
    
    # Register blueprints
    from app.routes.main import main as main_blueprint
    app.register_blueprint(main_blueprint)
    
    from app.routes.models import models as models_blueprint
    app.register_blueprint(models_blueprint, url_prefix='/models')
    
    from app.routes.datasets import datasets_bp as datasets_blueprint
    app.register_blueprint(datasets_blueprint, url_prefix='/datasets')
    
    return app 