# coding:utf-8
from flask.ext.restful import fields

word_fields = {
    u"id": fields.Integer,
    u"chinese": fields.String,
    u"english": fields.String,
    u"sound": fields.String,
    u"sound_mark": fields.String,
    u"category_id": fields.String,
}

category_fields = {
    u"category_name": fields.String,
    u"category_id": fields.Integer,
}

status_fields = {
    u"status": fields.String,
}

word_index_fields = {
    u"index": fields.Integer,
}
