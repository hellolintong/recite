# coding:utf-8
# coding:utf-8
from resource.word_resource import WordResource
from resource.word_resource import CategoryResource

url = {
    u"/api/category/": CategoryResource,
    u"/api/word/": WordResource,
}


def set_url_map(api):
    global url
    for key in url:
        api.add_resource(url[key], key)
