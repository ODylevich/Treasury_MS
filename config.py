from environs import Env

env = Env()
env.read_env()


class Config:
    SQLALCHEMY_DATABASE_URI = env.str("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = env.str("SECRET_KEY")  # Read the secret key from the environment