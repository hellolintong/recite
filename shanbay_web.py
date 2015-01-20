from flask import Flask
from flask import request
from flask import session
from flask import make_response
from flask import render_template

from flask.ext.restful import Api
from config.config import Config
from config.url_map import set_url_map

from database.insert_by_json import insert

app = Flask(__name__)
app.config.update(
    SECRET_KEY=Config.SECRET_KEY,
)

api = Api(app)
set_url_map(api)

app.debug = True


@app.route(u"/")
def index():
    return u"hello"


if __name__ == u"__main__":
#    insert()
    app.run(host=u"0.0.0.0")
