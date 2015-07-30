from flask import Flask
from flask import request
from flask import session
from flask import make_response
from flask import render_template

from flask.ext.restful import Api
from config.config import Config
from config.url_map import set_url_map

app = Flask(__name__)
app.config.update(
    SECRET_KEY=Config.SECRET_KEY,
)
app.jinja_env.variable_start_string = u"[["
app.jinja_env.variable_end_string = u"]]"

api = Api(app)
set_url_map(api)

app.debug = False


@app.route(u"/")
def index():
    return render_template(u"index.html")


if __name__ == u"__main__":
    app.run(host=u"0.0.0.0", port=5998)
