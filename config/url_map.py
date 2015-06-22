# coding:utf-8
from resource.word_resource import WordResource
from resource.word_resource import CategoryResource
from resource.word_resource import CategoryIndexResource
from resource.word_resource import ReciteCategoryResource

url = {
    u"/api/category/": CategoryResource,
    u"/api/word/": WordResource,
    u"/api/set_index/": CategoryIndexResource,
    u"/api/recite_category/": ReciteCategoryResource,
}


def set_url_map(api):
    global url
    for key in url:
        api.add_resource(url[key], key)
