# coding:utf-8
import os
import json
import codecs
import word_db
import pdb


def insert():
    pdb.set_trace()
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
            for elem in json_data:
                elem[u"sound"] = elem[u"sound"].replace(u"\\", os.sep)
                elem[u"category"] = filename[:-5]
                word_db.add(**elem)
        os.remove(dir_name + os.sep + filename)
