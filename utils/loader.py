from flask import Flask, render_template, redirect
from config import Config
from utils.db_api.promocodes_db import db
import os


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

    @app.route('/')
    def load_homepage():
        return redirect('segment-management')
        # Render the segment management page directly
        #return render_template('segmentManagement.html')

    return app


app = create_app()

