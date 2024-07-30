from flask import Flask, redirect
from config import Config
import os
from utils.db_api.database_connection import db


def create_app():
    root_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    app = Flask(__name__,
                template_folder=os.path.join(root_path, 'templates'),
                static_folder=os.path.join(root_path, 'static'))
    app.config.from_object(Config)


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


app= create_app()

