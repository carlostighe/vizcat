from os import path, getenv

basedir = path.abspath(path.dirname(__file__))


class Config:
    """
    Basic Configuration that other config objects inherit from 
    """
    SECRET_KEY = 'secret_key_goes_here'
    DEBUG = False
    UPLOAD_FOLDER = "public/images"
    ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif'])


class DevelopmentConfig(Config):
    """
    The development configuration object. Use for development
    Provide your own mysql database

    Args:
        Config (str): The string key used with the dict below to choose which config to use
    """
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'mysql+mysqlconnector://{username}:{password}@{server}/{database}'
    SQLALCHEMY_TRACK_MODIFICATIONS = True
    DEBUG_TB_INTERCEPT_REDIRECTS = False


class TestingConfig(Config):
    """
    The testing config object

    Args:
        Config (str): The string key used with the dict below to choose which config to use
    """
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + \
        path.join(basedir, 'data-test.sqlite')
    WTF_CSRF_ENABLED = False
    SQLALCHEMY_TRACK_MODIFICATIONS = True


class ProductionConfig(Config):
    """
    The production configuration. Debug set to false. Set up your production database here.

    Args:
        Config (str): The string key used with the dict below to choose which config to use
    """
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = 'mysql+mysqlconnector://{username}:{password}@{server}/{database}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False


config_by_name = dict(
    dev=DevelopmentConfig,
    test=TestingConfig,
    prod=ProductionConfig
)
