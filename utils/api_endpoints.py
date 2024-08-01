from utils.loader import app
from flask_restx import Resource
from flask import request, make_response, render_template, jsonify
from utils.db_api.promocodes_db import PromocodeTableService
from utils.swagger_models import fetch_promocode_model, create_promocode_model, error_model, upload_response_model, api
import pandas as pd
from werkzeug.utils import secure_filename
import os
from utils.db_api.client_db import ClientTableService


class DashboardResource(Resource):
    def get(self):
        return make_response(render_template('dashboard.html'))


class ClientManagementResource(Resource):
    def get(self):
        return make_response(render_template('clientManagement.html'))


class ClientUploadStagesResource(Resource):
    def get(self):
        return make_response(render_template('clientUploadStages.html'))


class ClientUploadResultsResource(Resource):
    def get(self):
        return make_response(render_template('clientUploadResults.html'))


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


app.config['UPLOAD_FOLDER'] = 'uploads/'


def process_file(file_path, selected_promocode):
    clients_df = pd.read_excel(file_path)

    def clean_and_convert(column):
        column = column.fillna('')  # Replace NaNs with empty strings
        column = column.astype(str)  # Convert to string
        column = column.str.replace('.0', '', regex=False)  # Remove decimal point notation
        return column

    clients_df['RCIF'] = clean_and_convert(clients_df['RCIF'])
    clients_df['CCIF'] = clean_and_convert(clients_df['CCIF'])

    # Step 1: Remove duplicate rows
    clients_df = clients_df.drop_duplicates(subset=['RCIF', 'CCIF'])

    # Step 2: Concatenate RCIF and CCIF to create UniqueID and populate new promocode column
    clients_df['new_promocode'] = selected_promocode
    clients_df['UniqueID'] = clients_df['RCIF'] + clients_df['CCIF']

    clients_from_db = ClientTableService.retrieve_all_clients()

    existing_clients_dict = {
        client['uniqueID']: client['promocode']
        for client in clients_from_db
    }

    # Initialize list for conflict cases
    conflict_cases = []

    # Check for conflicts and build the conflict_cases list
    for _, row in clients_df.iterrows():
        unique_id = row['UniqueID']
        if unique_id in existing_clients_dict:
            conflict_cases.append({
                "conflict_type": "client_already_in_promo",
                "details": {
                    "RCIF": row['RCIF'],
                    "CCIF": row['CCIF'],
                    "promocode": existing_clients_dict[unique_id]  # Get the promocode from existing_clients_dict
                }
            })

    # Filter DataFrame to keep only new clients (not in existing_clients_dict)
    new_clients_df = clients_df[~clients_df['UniqueID'].isin(existing_clients_dict.keys())]

    upload_result = ClientTableService.bulk_insert_new_clients(new_clients_df)
    return {"conflicts cases": conflict_cases,
            "upload result": upload_result}


# Helper function to validate file content
def validate_file(file_path):
    try:
        df = pd.read_excel(file_path)
        required_columns = ['CCIF', 'RCIF']

        # Check if file contains exactly two columns and both are the required columns
        if set(df.columns) != set(required_columns):
            return False, "File must contain exactly 'CCIF' and 'RCIF' columns."

        # Check if all entries in 'CCIF' and 'RCIF' are numeric
        if not df[required_columns].applymap(lambda x: isinstance(x, (int, float))).all().all():
            return False, "All entries in 'CCIF' and 'RCIF' must be numeric."

        return True, "File parsed successfully"
    except Exception as e:
        return False, str(e)


class ClientResource(Resource):
    def get(self):
        """
        Get all clients or search clients by UniqueID.
        """
        query = request.args.get('uniqueID')
        try:
            if query:
                clients = ClientTableService.search_client_by_uniqueID(query)
            else:
                clients = ClientTableService.retrieve_all_clients()
            return jsonify(clients)
        except Exception as e:
            return {'error': str(e)}, 400  # Return 400 if there's an exception


    @api.response(200, 'Success', upload_response_model)
    def post(self):
        # Initialize response dictionary with default values
        upload_response = {
            "message": "",
            "number_clean_cases": 0,
            "number_conflict_cases": 0,
        }
        try:
            if 'client_upload_file' not in request.files:
                return {"error": "No file part"}, 400

            file = request.files['client_upload_file']
            selected_promocode = request.form.get('selected_promocode')

            if not file.filename.endswith(('.xls', '.xlsx')):
                return {"error": "Please upload an Excel file"}, 400

            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)

            # Validate file content
            is_valid, result = validate_file(file_path)
            upload_response["message"] = result

            if not is_valid:
                return {"error": result}, 422

            process_result = process_file(file_path=file_path, selected_promocode=selected_promocode)
            upload_response['number_clean_cases'] = process_result['upload result']['count']
            upload_response['number_conflict_cases'] = len(process_result['conflicts cases'])
            upload_response['conflict_cases'] = process_result['conflicts cases']

            return upload_response, 200
        except Exception as e:
            print(e)
            return {"error": "Internal Server Error"}, 500


# Add resources to API
api.add_resource(SegmentManagementResource, '/segment-management', endpoint='segment_management_resource')
api.add_resource(PromocodeResource, '/promocode', endpoint='promocode_resource')
api.add_resource(ClientManagementResource, '/client-management', endpoint='client_management_resource')
api.add_resource(DashboardResource, '/overview-dashboard', endpoint='dashboard_resource')
api.add_resource(ClientUploadStagesResource, '/client-management/client-upload-stages', endpoint='client_upload_stages_resource')
api.add_resource(ClientResource, '/client', endpoint='client_file_upload_resource')
api.add_resource(ClientUploadResultsResource, '/client-management/client-upload-results', endpoint='client_upload_results_resource')