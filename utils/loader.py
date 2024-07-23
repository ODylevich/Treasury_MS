from flask import Flask
from config import Config
from utils.db_api.promocodes_db import db, PromocodeTableService, PromocodeTable  # Import the db and tables
import os
from flask_restful import Api
from .api_resources import initialize_api


def create_app():
    root_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    app = Flask(__name__,
                template_folder=os.path.join(root_path, 'templates'),
                static_folder=os.path.join(root_path, 'static'))
    app.config.from_object(Config)

    # Initialize SQLAlchemy
    db.init_app(app)

    # Initialize Flask-RESTful API
    api = Api(app)
    initialize_api(api)  # Add API resources to the API

    # Create tables
    with app.app_context():
        db.create_all()

    return app