# from flask_restful import Resource
# from flask import request, redirect, make_response, render_template
# from utils.db_api.promocodes_db import PromocodeTableService
#
# # Resource for the index route
# class IndexResource(Resource):
#     def get(self):
#         # Redirect to the segment management page
#         return redirect('/segment-management')
#
#
# class SegmentManagementResource(Resource):
#     def get(self):
#         message = request.args.get('message')
#         error = request.args.get('error')
#         return make_response(render_template('segmentManagement.html', message=message, error=error))
#
#
# class CreatePromoResource(Resource):
#     def post(self):
#         # Get JSON data from the request body
#         data = request.get_json()
#         if not data:
#             return {"error": "No JSON data provided"}, 400
#
#         promocode_name = data.get('promo-name')
#         promocode_validity = data.get('valid-till')
#         promocode_max_trades = data.get('max-trades')
#         promocode_ccy_pairs = data.get('valid-ccy-pairs')
#
#         # Store received data in the database
#         result = PromocodeTableService.create_promocode(
#             name=promocode_name,
#             valid_till=promocode_validity,
#             max_trades=promocode_max_trades,
#             valid_ccy_pairs=promocode_ccy_pairs
#         )
#
#         # Check for errors
#         if isinstance(result, dict) and "error" in result:
#             error_message = result["error"]
#             if "already exists" in error_message.lower():
#                 return {"error": error_message}, 409  # Conflict
#             else:
#                 return {"error": error_message}, 400  # Bad Request
#
#         # Return a success message
#         return {"message": "Promocode created successfully!"}, 201
#
#
# def initialize_api(api):
#     api.add_resource(IndexResource, '/', endpoint='index')
#     api.add_resource(SegmentManagementResource, '/segment-management', endpoint='segment_management_resource')
#     api.add_resource(CreatePromoResource, '/create_promo', endpoint='create_promo')
