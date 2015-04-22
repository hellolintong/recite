# coding:utf-8
# coding:utf-8
from resource.word_resource import WordResource
from resource.word_resource import CategoryResource
from resource.word_resource import CategoryIndexResource

url = {
    u"/api/category/": CategoryResource,
    u"/api/word/": WordResource,
    u"/api/set_index/": CategoryIndexResource,
}


def set_url_map(api):
    global url
    for key in url:
        api.add_resource(url[key], key)
