from sqlalchemy import inspect
from flask_restx import fields, Api
from utils.db_api.promocodes_db import PromocodeTable, db
from utils.loader import app

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

duplicate_entry_model = api.model('DuplicateEntry', {
    'RCIF': fields.String(example="123"),
    'CCIF': fields.String(example="456")
})

conflict_entry_model = api.model('ConflictEntry', {
    'RCIF': fields.String(example="123"),
    'CCIF': fields.String(example="456"),
    'Current_promo': fields.String(example="Promo2024"),
    'New_promo': fields.String(example="Promo2025")
})

# Define the ConflictCase model
conflict_case_model = api.model('ConflictCase', {
    'conflict_type': fields.String(
        example="duplicate_in_file",
        enum=["duplicate_in_file", "client_already_in_promo"],
        description="Type of conflict: either 'duplicate_in_file' or 'client_already_in_promo'"
    ),
    'details': fields.Raw(
        description="Details about the conflict. Can be a a 'DuplicateEntry' or 'ConflictEntry'.",
    )
})

# Define the UploadResponse model
upload_response_model = api.model('UploadResponse', {
    'message': fields.String(example="File processed successfully"),
    'number_clean_cases': fields.Integer(example=100),
    'number_conflict_cases': fields.Integer(example=2),
    'conflict_cases': fields.List(fields.Nested(conflict_case_model))
})