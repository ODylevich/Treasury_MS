from utils.db_api.database_connection import db
from datetime import datetime


class ClientTable(db.Model):
    __tablename__ = 'clients'

    id = db.Column(db.Integer, primary_key=True)
    client_rcif = db.Column(db.String(255), nullable=True)
    client_ccif = db.Column(db.String(255), nullable=True)
    client_uniqueID = db.Column(db.String(255), nullable=False)
    client_promocode = db.Column(db.String(255), nullable=False)

    client_uploaded_on = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    client_creator = db.Column(db.String(255), nullable=False)
    client_trx_executed = db.Column(db.Integer, nullable=True)

    def __repr__(self):
        return (f"<ClientTable(id={self.id}, rcif={self.client_rcif}, ccif={self.client_ccif}, "
                f"uniqueID={self.client_uniqueID}, promocode={self.client_promocode}, "
                f"uploaded_on={self.client_uploaded_on}, creator={self.client_creator}, "
                f"trx_executed={self.client_trx_executed})>")

    def to_dict(self):
        return {
            'id': self.id,
            'rcif': self.client_rcif,
            'ccif': self.client_ccif,
            'uniqueID': self.client_uniqueID,
            'promocode': self.client_promocode,
            'uploaded_on': self.client_uploaded_on.isoformat() if self.client_uploaded_on else None,
            'creator': self.client_creator,
            'trx_executed': self.client_trx_executed
        }