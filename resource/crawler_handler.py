# coding:utf-8
import jinjia2
import spider
import os
import re

def crawler(url):
    spider.login()
    return spider.crawler_collection(url)

def replace_img(parent_dir, content_list):
    def replace(img_path, content):
        if not content:
            return
        url_list = []
        match_group = re.search(r"img src=\"http://[a-zA-Z0-9]*\.jpg\"", answer_information[u"content"]).group()
        for match in match_group:
            url = match[9:]
            url_list.append(url)
            spider.crawler_img(parent_dir, url)
        for url in url_list:
            new_url = parent_dir + os.pathsep + u"img" + os.pathsep + url.split(u"/")[-1]
            re.sub(url, new_url, answer_information[u"content"])

    #创建文件夹
    img_path = parent_dir + os.pathsep + u"img"
    if not os.path.exists(img_path):
        os.makedirs(img_path)

    for content in content_list:
        for answer_information in content[u"answer_list"]:
            replace(answer_information[u"content"])
            replace(answer_information[u"question"][u"title"])

def generate_html(parent_dir, content):
    out = jinjia2.render_template(u"template.html", content=content)
    filename = parent_dir + os.pathsep + content[u"name"] + u".html"
    with open(filename) as f:
        f.write(out)

if __name__ == "__main__":
    import pdb; pdb.set_trace()
    url = raw_input(u"输入你要抓取的用户的URL：".encode(u"utf8"))
    user_id = url.split(u"/")[-1]
    if not os.path.exists(user_id):
        os.makedirs(user_id)
        result = crawler(url)
        replace_img(user_id, result)
        for content in result:
            generate_html(user_id, content)
