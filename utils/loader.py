from flask import Flask
from config import Config
from utils.db_api.promocodes_db import db
import os
from flask_restful import Api
from utils.api_endpoints import initialize_api


def create_app():
    root_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    app = Flask(__name__,
                template_folder=os.path.join(root_path, 'templates'),
                static_folder=os.path.join(root_path, 'static'))
    app.config.from_object(Config)

    # Initialize SQLAlchemy
    db.init_app(app)

    # Create tables
    with app.app_context():
        db.create_all()

    # Initialize Flask-RESTful API
    api = Api(app)
    initialize_api(api)  # Initialize API with resources

    return app


app = create_app()

