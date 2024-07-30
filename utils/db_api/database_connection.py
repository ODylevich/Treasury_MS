from flask_sqlalchemy import SQLAlchemy

# Initialize SQLAlchemy
db = SQLAlchemy()

from utils.db_api.client_db import ClientTable
from utils.db_api.promocodes_db import PromocodeTable