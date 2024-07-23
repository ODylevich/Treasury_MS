from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError

# Initialize SQLAlchemy
db = SQLAlchemy()


class PromocodeTable(db.Model):
    __tablename__ = 'promocodes'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, unique=True)  # Ensure unique values
    valid_till = db.Column(db.Date, nullable=True)
    max_trades = db.Column(db.Integer, nullable=True)
    valid_ccy_pairs = db.Column(db.String(255), nullable=False)

    def __repr__(self):
        return f"<Promocode(name={self.name}, valid_till={self.valid_till}, max_trades={self.max_trades}, valid_ccy_pairs={self.valid_ccy_pairs})>"


class PromocodeTableService:

    @staticmethod
    def create_promocode(name, valid_till, max_trades, valid_ccy_pairs):
        valid_till = valid_till if valid_till else None
        max_trades = int(max_trades) if max_trades else None

        # Create a new Promocode instance
        new_promocode = PromocodeTable(
            name=name,
            valid_till=valid_till,
            max_trades=max_trades,
            valid_ccy_pairs=valid_ccy_pairs
        )

        # Add to session and commit
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
