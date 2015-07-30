# coding:utf-8
import os
import json
import codecs
import word_db
import category_db
import pdb


def insert():
    dir_name = u"database/json_file"
    file_list = os.listdir(u"database/json_file")
    file_list = [elem for elem in file_list if elem.endswith(u".json")]
    for filename in file_list:
        with codecs.open(dir_name + os.sep + filename, u"r", u"utf-8") as infile:
            try:
                json_data = json.load(infile)
            except Exception, e:
                print e
                return
            category_elem = dict()
            category_elem[u"name"] = filename[:-5]
            category_id = category_db.add(**category_elem)
            for elem in json_data:
                elem[u"sound"] = elem[u"sound"].replace(u"\\", os.sep)
                elem[u"category_id"] = category_id
                word_db.add(**elem)
        os.remove(dir_name + os.sep + filename)

def add_error_db():
    category_elem = dict()
    category_elem[u"name"] = u"错误单词库"
    category_db.add(**category_elem)