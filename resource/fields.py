# coding:utf-8
from flask.ext.restful import fields

word_fields = {
    u"id": fields.Integer,
    u"chinese": fields.String,
    u"english": fields.String,
    u"sound": fields.String,
    u"sound_mark": fields.String,
}

category_fields = {
    u"category": fields.String,
}