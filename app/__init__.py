import os
from flask import Flask, Markup
from config import Config
from .extensions import db, login_manager, migrate

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Print the database URI for debugging
    print(f"Using database: {app.config['SQLALCHEMY_DATABASE_URI']}")
    
    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app, db)
    
    # Add len function to Jinja2's global environment
    app.jinja_env.globals.update(len=len)
    
    # Add custom filters to Jinja2's environment
    @app.template_filter('nl2br')
    def nl2br_filter(text):
        if text:
            return Markup(text.replace('\n', '<br>'))
        return ''
    
    # Create upload folder if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(os.path.dirname(app.config['UPLOAD_FOLDER'] + '/../models/'), exist_ok=True)
    
    # Register blueprints
    from app.auth import bp as auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')
    
    from app.main import bp as main_bp
    app.register_blueprint(main_bp)
    
    from app.datasets import bp as datasets_bp
    app.register_blueprint(datasets_bp, url_prefix='/datasets')
    
    # Use models init_app function
    from app.models import init_app as init_models
    init_models(app)
    
    # Comment out API routes for now
    # from app.api import bp as api_bp
    # app.register_blueprint(api_bp, url_prefix='/api')

    # Configure login manager
    from app.models import User
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    return app 