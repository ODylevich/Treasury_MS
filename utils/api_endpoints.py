from utils.loader import app
from flask_restx import Api, Resource, fields
from flask import request, make_response, render_template, jsonify
from utils.db_api.promocodes_db import PromocodeTableService, PromocodeTable, db
from sqlalchemy import inspect

# Initialize Flask-RESTX API
api = Api(app, version='1.0', title='Promocode API', description='A simple API for managing promocodes', doc='/api/docs')


# Function to create a dynamic model based on SQLAlchemy model
def create_dynamic_model(model_class):
    # Use SQLAlchemy's inspect function to get model column info
    columns = inspect(model_class).c
    model_fields = {}

    for column in columns:
        field_type = fields.String  # Default type
        if isinstance(column.type, db.Integer):
            field_type = fields.Integer
        elif isinstance(column.type, db.Date):
            field_type = fields.String  # Dates are represented as strings in REST API
        elif isinstance(column.type, db.Boolean):
            field_type = fields.Boolean
        # Add more mappings if needed

        model_fields[column.name] = field_type(description=column.name.capitalize())

    # Create and return a new model with dynamically determined fields
    return api.model(f'{model_class.__name__}Model', model_fields)


fetch_promocode_model = create_dynamic_model(PromocodeTable)

# Define the promocode model
create_promocode_model = api.model('Promocode', {
    'promo-name': fields.String(
        required=True,
        description='The name of the promocode'
    ),
    'valid-till': fields.String(
        required=False,
        description='The expiration date of the promocode (YYYY-MM-DD or empty)',
        pattern='^\\d{4}-\\d{2}-\\d{2}$'  # Regex pattern for date format
    ),
    'max-trades': fields.Integer(
        required=False,
        description='The maximum number of trades allowed'
    ),
    'valid-ccy-pairs': fields.String(
        required=True,
        description='The currency pairs the promocode applies to'
    )
})

error_model = api.model('Error', {
    'error': fields.String(description='Error message describing what went wrong')
})


class DashboardResource(Resource):
    def get(self):
        return make_response(render_template('dashboard.html'))


class ClientManagementResource(Resource):
    def get(self):
        return make_response(render_template('clientManagement.html'))


class SegmentManagementResource(Resource):
    @api.doc('get_segment_management')
    def get(self):
        """
        Redirect to segment management page.
        Message parameter:
        - message: Display success message in Promocode creation form

         Error parameter:
        - error: Display error in Promocode creation form
        """
        message = request.args.get('message')
        error = request.args.get('error')
        return make_response(render_template('segmentManagement.html', message=message, error=error))


class PromocodeResource(Resource):
    @api.doc('get_promocode', description='Get all promocodes or search promocodes by name')
    @api.param('query', 'Search term for filtering promocodes by name')
    @api.response(200, 'Success', [fetch_promocode_model])  # Documenting the response model for successful retrieval
    @api.response(400, 'Bad Request', error_model)  # Documenting the error response model
    def get(self):
        """
        Get all promocodes or search promocodes by name.
        """
        query = request.args.get('query')
        try:
            if query:
                promocodes = PromocodeTableService.search_promocode_by_name(query)
            else:
                promocodes = PromocodeTableService.get_all_promocodes()
            return jsonify(promocodes)
        except Exception as e:
            return {'error': str(e)}, 400  # Return 400 if there's an exception

    @api.doc('create_promocode', description='Create a new promocode with user input parameters')
    @api.expect(create_promocode_model)
    @api.response(201, 'Promocode created successfully!')
    @api.response(400, 'No JSON data provided or Bad Request')
    @api.response(409, 'Promocode already exists')
    def post(self):
        """
        Create a new promocode with user input parameters.
        """
        # Get JSON data from the request body
        data = request.get_json()
        if not data:
            return {"error": "No JSON data provided"}, 400

        # When no valid-till is passed in the JSON data, the promocode_validity variable will be None.
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
api.add_resource(PromocodeResource, '/promocode', endpoint='promocode_resource')
api.add_resource(ClientManagementResource, '/client-management', endpoint='client_management_resource')
api.add_resource(DashboardResource, '/overview-dashboard', endpoint='dashboard_resource')
