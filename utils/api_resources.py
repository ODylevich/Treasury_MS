from flask_restful import Resource

# Define the Promocode resource
class PromocodeListResource(Resource):
    def get(self):
        # Example: Return a list of promocodes
        # Replace this with actual database retrieval logic
        promocodes = [
            {"id": 1, "name": "Summer2024", "validity": "2024-08-31"},
            {"id": 2, "name": "Winter2024", "validity": "2024-12-31"}
        ]
        return {"promocodes": promocodes}

    def post(self):
        # Example: Create a new promocode
        # Replace this with actual creation logic and validation
        return {"message": "Promocode created successfully!"}, 201

# Function to add resources to API
def initialize_api(api):
    api.add_resource(PromocodeListResource, '/api/promocodes')
