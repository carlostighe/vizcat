from os import path, getenv

basedir = path.abspath(path.dirname(__file__))


class Config:
    SECRET_KEY = '\x96\x03\x9aQ\x86\x99\x18\xd3t\xb5z\xe5\xc7\xec\xc3{\x93 t\\\rB\x8c\xbd'
    DEBUG = False
    UPLOAD_FOLDER = "public/images"
    ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif'])


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'mysql://carlos:the cat in the hat@localhost/vizcat'
    SQLALCHEMY_TRACK_MODIFICATIONS = True
    DEBUG_TB_INTERCEPT_REDIRECTS = False


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + \
        path.join(basedir, 'data-test.sqlite')
    WTF_CSRF_ENABLED = False
    SQLALCHEMY_TRACK_MODIFICATIONS = True


class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = 'mysql+mysqlconnector://carlosti_vizcat:3DCdFJ8wX}Vs@localhost/carlosti_vizcat'
    SQLALCHEMY_TRACK_MODIFICATIONS = False


config_by_name = dict(
    dev=DevelopmentConfig,
    test=TestingConfig,
    prod=ProductionConfig
)
