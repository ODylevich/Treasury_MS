from sqlalchemy.exc import IntegrityError
from datetime import datetime
from utils.db_api.database_connection import db


class PromocodeTable(db.Model):
    __tablename__ = 'promocodes'

    id = db.Column(db.Integer, primary_key=True)
    promocode_name = db.Column(db.String(255), nullable=False, unique=True)
    promocode_valid_till = db.Column(db.Date, nullable=True)
    promocode_max_trades = db.Column(db.Integer, nullable=True)
    promocode_valid_ccy_pairs = db.Column(db.String(1000), nullable=False)

    promocode_creation_date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    promocode_status = db.Column(db.String(50), nullable=False, default="Active")
    promocode_creator = db.Column(db.String(255), nullable=False)

    def __repr__(self):
        return (f"<Promocode(id={self.id}, name={self.promocode_name}, valid_till={self.promocode_valid_till}, "
                f"max_trades={self.promocode_max_trades}, valid_ccy_pairs={self.promocode_valid_ccy_pairs}, "
                f"creation_date={self.promocode_creation_date}, status={self.promocode_status}, "
                f"creator={self.promocode_creator})>")

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.promocode_name,
            'valid_till': self.promocode_valid_till.isoformat() if self.promocode_valid_till else None,
            'max_trades': self.promocode_max_trades,
            'valid_ccy_pairs': self.promocode_valid_ccy_pairs,
            'creation_date': self.promocode_creation_date.isoformat(),
            'status': self.promocode_status,
            'creator': self.promocode_creator
        }


class PromocodeTableService:
    @staticmethod
    def create_promocode(name, valid_till, max_trades, valid_ccy_pairs):
        valid_till = valid_till if valid_till else None
        max_trades = int(max_trades) if max_trades else None

        # Create a new Promocode instance
        new_promocode = PromocodeTable(
            promocode_name=name,
            promocode_valid_till=valid_till,
            promocode_max_trades=max_trades,
            promocode_valid_ccy_pairs=valid_ccy_pairs,
            promocode_creator="Dylevich Oleg"
        )

        try:
            # Add to session and commit
            db.session.add(new_promocode)
            db.session.commit()
        except IntegrityError as e:
            db.session.rollback()
            if 'duplicate key value violates unique constraint' in str(e):
                return {"error": "Promocode name already exists."}
            else:
                return {"error": "An unexpected error occurred."}
        return new_promocode

    @staticmethod
    def search_promocode_by_name(name):
        """
        Search for promocodes by name.
        """
        try:
            promocodes = PromocodeTable.query.filter(PromocodeTable.promocode_name.ilike(f"%{name}%")).all()
            return [promocode.to_dict() for promocode in promocodes]
        except Exception as e:
            return {"error": str(e)}

    @staticmethod
    def get_all_promocodes():
        """
        Retrieve all promocodes.
        """
        try:
            promocodes = PromocodeTable.query.all()
            return [promocode.to_dict() for promocode in promocodes]
        except Exception as e:
            return {"error": str(e)}
