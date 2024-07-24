from flask import Flask
from config import Config
from utils.db_api.promocodes_db import db
import os
from flask_restx import Api, Resource, fields
from flask import request, redirect, make_response, render_template
from utils.db_api.promocodes_db import PromocodeTableService

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
        # Redirect to the segment management page
        return redirect('/segment-management')

    # Initialize Flask-RESTX API
    api = Api(app, version='1.0', title='Promocode API', description='A simple API for managing promocodes', doc='/api/docs')

    promocode_model = api.model('Promocode', {
        'promo-name': fields.String(required=True, description='The name of the promocode'),
        'valid-till': fields.String(required=False, description='The expiration date of the promocode'),
        'max-trades': fields.Integer(required=False, description='The maximum number of trades allowed'),
        'valid-ccy-pairs': fields.String(required=True, description='The currency pairs the promocode applies to')
    })

    class SegmentManagementResource(Resource):
        @api.doc('get_segment_management')
        def get(self):
            message = request.args.get('message')
            error = request.args.get('error')
            return make_response(render_template('segmentManagement.html', message=message, error=error))

    class CreatePromoResource(Resource):
        @api.doc('create_promo')
        @api.expect(promocode_model)
        def post(self):
            # Get JSON data from the request body
            data = request.get_json()
            if not data:
                return {"error": "No JSON data provided"}, 400

            promocode_name = data.get('promo-name')
            promocode_validity = data.get('valid-till')
            promocode_max_trades = data.get('max-trades')
            promocode_ccy_pairs = data.get('valid-ccy-pairs')

            # Store received data in the database
            result = PromocodeTableService.create_promocode(
                name=promocode_name,
                valid_till=promocode_validity,
                max_trades=promocode_max_trades,
                valid_ccy_pairs=promocode_ccy_pairs
            )

            # Check for errors
            if isinstance(result, dict) and "error" in result:
                error_message = result["error"]
                if "already exists" in error_message.lower():
                    return {"error": error_message}, 409  # Conflict
                else:
                    return {"error": error_message}, 400  # Bad Request

            # Return a success message
            return {"message": "Promocode created successfully!"}, 201

    # Add resources to API
    api.add_resource(SegmentManagementResource, '/segment-management', endpoint='segment_management_resource')
    api.add_resource(CreatePromoResource, '/create_promo', endpoint='create_promo')

    return app


app = create_app()

