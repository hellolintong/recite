# coding:utf-8
from flask.ext.restful import reqparse


class RequestParser(reqparse.RequestParser):
    def parse_args(self, req=None):
        """
            clean the arg without value
        """
        ret = super(RequestParser, self).parse_args(req)
        new_ret = {key: val for key, val in ret.iteritems() if val is not None}
        return new_ret


class BaseArgs(object):
    """
        base args class, subclass should implement rules, use self.args to get args in request
    """
    def __init__(self):
        self.parser = RequestParser()
        self.rules()
        self.args = self.parser.parse_args()

    def rules(self):
        """use add_argument to add rule here"""
        raise NotImplementedError


def filter_elem(elem_list, start, end):
    if start > end:
        return elem_list
    if end < 0:
        return elem_list[start:]
    return elem_list[start: end]