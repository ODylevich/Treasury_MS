from datetime import datetime
from utils.db_api.database_connection import db
from sqlalchemy.exc import IntegrityError


class ClientTable(db.Model):
    __tablename__ = 'clients'

    id = db.Column(db.Integer, primary_key=True)
    client_rcif = db.Column(db.String(255), nullable=True)
    client_ccif = db.Column(db.String(255), nullable=True)
    client_uniqueID = db.Column(db.String(255), nullable=False, unique=True)
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


class ClientTableService:
    @staticmethod
    def search_client_by_uniqueID(UniqueID):
        """
        Search for clients by UniqueID.
        """
        try:
            clients = ClientTable.query.filter(ClientTable.client_uniqueID.ilike(f"%{UniqueID}%")).all()
            return [client.to_dict() for client in clients]
        except Exception as e:
            return {"error": str(e)}

    @staticmethod
    def retrieve_all_clients():
        """
        Retrieve all clients.
        """
        try:
            clients = ClientTable.query.all()
            return [client.to_dict() for client in clients]
        except Exception as e:
            return {"error": str(e)}

    @staticmethod
    def bulk_insert_new_clients(clients_df):
        new_clients = []
        for _, row in clients_df.iterrows():
            new_client = ClientTable(
                client_rcif=row['RCIF'],
                client_ccif=row['CCIF'],
                client_uniqueID=row['UniqueID'],
                client_promocode=row['new_promocode'],
                client_uploaded_on=datetime.utcnow(),
                client_creator="Dylevich Oleg"
            )
            new_clients.append(new_client)

        try:
            db.session.bulk_save_objects(new_clients)
            db.session.commit()
            return {"message": "Clients successfully inserted", "count": len(new_clients)}
        except IntegrityError as e:
            db.session.rollback()
            if 'duplicate key value violates unique constraint' in str(e):
                return {"error": "Client already exists."}
            else:
                return {"error": "An unexpected error occurred."}
