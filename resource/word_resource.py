# coding:utf-8
from flask.ext.restful import Resource, marshal
from resource import BaseArgs
from fields import category_fields, word_fields, status_fields, word_index_fields, recite_category_fields
from database import word_db, category_db

class WordQueryArgs(BaseArgs):
    def rules(self):
        self.parser.add_argument(u"category_id", type=int)


class CategorySetArgs(BaseArgs):
    def rules(self):
        self.parser.add_argument(u"category_id", type=unicode)
        self.parser.add_argument(u"index", type=int)


class ReciteCategoryArgs(BaseArgs):
    def rules(self):
        self.parser.add_argument(u"category_id", type=unicode)


class CategoryResource(Resource):
    def get(self):
        category_list = category_db.get_all_category()
        category_list = [{u"category_name": elem.name, u"category_id": elem.id} for elem in category_list]
        return marshal(category_list, category_fields)


class WordResource(Resource):
    def get(self):
        args = WordQueryArgs().args
        word_list = word_db.get_by_category(args[u"category_id"])
        return marshal(word_list, word_fields)


class CategoryIndexResource(Resource):
    def post(self):
        #import pdb;pdb.set_trace()
        args = CategorySetArgs().args
        category_db.set_category_index(args[u"category_id"], args[u"index"])
        return marshal({u"status": u"ok"}, status_fields)

    def get(self):
        #import pdb;pdb.set_trace()
        args = WordQueryArgs().args
        index = category_db.get_word_index(args[u"category_id"])
        return marshal({u"index": index}, word_index_fields)


class ReciteCategoryResource(Resource):
    def post(self):
        #import pdb;pdb.set_trace()
        args = ReciteCategoryArgs().args
        recite_category_id = args[u"category_id"]
        with open(u"/root/Desktop/shanbay_web/resource/recite_category_id.ini", u"w") as f:
            f.write(recite_category_id)
        return marshal({u"status": u"ok"}, status_fields)

    def get(self):
        #import pdb;pdb.set_trace()
        with open(u"/root/Desktop/shanbay_web/resource/recite_category_id.ini") as f:
            recite_category_id = f.read()
        recite_category_id = int(recite_category_id)
        return marshal({u"recite_category_id": recite_category_id}, recite_category_fields)


