from app import create_app
import os
import sys
from werkzeug.debug import DebuggedApplication

sys.path.insert(0, os.path.dirname(__file__))

application = create_app('prod')
# application = DebuggedApplication(application, evalex=True)
