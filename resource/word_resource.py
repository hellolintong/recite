# coding:utf-8
from flask.ext.restful import Resource, marshal
from resource import BaseArgs
from fields import category_fields, word_fields
from database import word_db


class WordQueryArgs(BaseArgs):
    def rules(self):
        self.parser.add_argument(u"category", type=unicode)


class CategoryResource(Resource):
    def get(self):
        category_list = word_db.get_all_category()
        category_list = list(set(category_list))
        category_list = [{u"category": elem[0]} for elem in category_list]
        return marshal(category_list, category_fields)


class WordResource(Resource):
    def get(self):
        import pdb;pdb.set_trace()
        args = WordQueryArgs().args
        word_list = word_db.get_by_category(args[u"category"])
        return marshal(word_list, word_fields)
