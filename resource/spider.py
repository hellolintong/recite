# coding:utf-8
import copy
import time
import random
import re
import os
import requests
import shutil
from bs4 import BeautifulSoup
from spider_config import SpiderConfig

g_session = None
g_count = 0


def get_request(url, method=u"get", data=None):
    global g_session

    ret = {
        u"result": False,
        u"r": None,
    }
    headers = {
                u"Accept": u"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                u"Accept-Language": u"zh-CN,zh;q=0.8,en;q=0.6",
                u"Connection": u"keep-alive",
                u"DNT": u"1",
                u"Host": u"www.zhihu.com",
                u"Referer": u"http://www.zhihu.com/collection/19556771",
                u"User-Agent": u"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36",
    }

    for i in xrange(3):
        try:
            length = random.randint(SpiderConfig.CRAWLER_INTERVAL_MIN, SpiderConfig.CRAWLER_INTERVAL_MAX)
            time.sleep(length)
            if method == u"get":
                r = g_session.get(url, data=data, timeout=30, headers=headers)
            else:
                r = g_session.post(url, data=data, timeout=30, headers=headers)
        except requests.exceptions.ConnectionError:
            continue
        except requests.exceptions.Timeout:
            continue
        ret[u"result"] = True
        ret[u"r"] = r
        break

    fresh_session()
    return ret


def _login(email, password):
    global g_session
    g_session = requests.session()
    data = {
        u"email": email.encode(u"utf8"),
        u"password": password.encode(u"utf8"),
    }
    g_session.post(u"http://www.zhihu.com/login", data=data)


def fresh_session(right_now=False):
    global g_count
    global g_session

    if right_now:
        g_count = 3

    g_count += 1
    if g_count % 4 == 0:
        g_session.get(u"http://www.zhihu.com/logout")
        time.sleep(10)
        _login(SpiderConfig.ZHIHU_USER, SpiderConfig.ZHIHU_PASSWORD)
        g_count = 0


def crawler(url):
    collection_information = dict()
    collection_information[u"id"] = url.split(u"/")[-1]
    collection_information[u"answer_list"] = []
    prefix_url = url

    while True:
        crawler_result = get_request(url)
        if not crawler_result[u"result"]:
            return None
        soup = BeautifulSoup(crawler_result[u"r"].text)
        collection_information[u"name"] = soup.find(u"h2", id=u"zh-fav-head-title").string.decode(u"utf8")
        answer_soup_list = soup.find(u"div", id=u"zh-list-answer-wrap").find_all(u"div", class_=u"zm-item")

        #因为可能出现一个问题下有多个推荐答案，所以把问题信息放在外面
        pre_question_information = dict()
        for answer_soup in answer_soup_list:
            answer_information = dict()
            question_information = dict()
            #问题
            question = answer_soup.find(u"h2", class_=u"zm-item-title")
            if question:
                question = question.find(u"a")
                question_information[u"name"] = question.string.decode(u"utf8")
                question_information[u"id"] = question[u"href"].split(u"/")[-1]
                pre_question_information = copy.copy(question_information)
            else:
                question_information = copy.copy(pre_question_information)
            #简短的答案是不值得收藏的（一般都是抖机灵之类的）
            full_answer = answer_soup.find(u"a", class_=u"toggle-expand")
            if not full_answer:
                continue
            full_answer_url = u"http://www.zhihu.com" + full_answer[u"href"]
            answer_information[u"id"] = full_answer_url.split(u"/")[-1]

            full_answer_result = get_request(full_answer_url)
            if not full_answer_result[u"result"]:
                continue
            full_answer_soup = BeautifulSoup(full_answer_result[u"r"].text)

            #处理剩余question信息
            if full_answer_soup.find(u"textarea", class_=u"content hidden"):
                question_information[u"title"] = full_answer_soup.find(u"textarea", class_=u"content hidden").string.decode(u"utf8")
            else:
                question_information[u"title"] = full_answer_soup.find(u"div", id=u"zh-question-detail").\
                    find(u"div", class_=u"zm-editable-content").string.decode(u"utf8")

            answer_information[u"question"] = question_information

            #获取完整答案
            answer_information[u"content"] = re.search(r"<div class=\" zm-editable-content clearfix\">[\s,\S]*?<a class=\"zg-anchor-hidden ac\"", full_answer_result[u"r"].text).group(0)[43:-30]

            for i in range(2):
                index = answer_information[u"content"].rfind(u"</div>")
                answer_information[u"content"] = answer_information[u"content"][:index]

            collection_information[u"answer_list"].append(answer_information)

        next_page_soup = soup.find(u"div", class_=u"zm-invite-pager")
        if next_page_soup:
            next_page = next_page_soup.find_all(u"span")[-1]
            if next_page.find(u"a"):
                url = prefix_url + next_page.find(u"a")[u"href"]
                continue
        break

    return collection_information


def crawler_collection(url):
    user_zhihu_id = url.split('/')[-1]
    collection_list = []
    #获取用户的收藏列表
    url = u"http://www.zhihu.com/people/" + user_zhihu_id + u"/collections"
    while True:
        result = get_request(url)
        if not result[u"result"]:
            return None
        soup = BeautifulSoup(result[u"r"].text)
        collection_soup_list = soup.find(id=u"zh-profile-fav-list").\
            find_all(u"div", class_=u"zm-profile-section-item zg-clear")

        for collection_soup in collection_soup_list:
            url = collection_soup.find(u"div", class_=u"zm-profile-fav-item-title-wrap").\
                find(u"a", class_=u"zm-profile-fav-item-title")[u"href"]
            collection_list.append(u"http://www.zhihu.com" + url)

        next_page_url = soup.find(u"div", class_=u"border-pager")
        try:
            url = next_page_url.find(u"div", class_=u"zm-invite-pager").\
                find_all(u"span")[-1].find(u"a").get(u"href")
        #遇到异常说明没有下一页
        except Exception:
            break
        url = u"http://www.zhihu.com/people/" + user_zhihu_id + u"/collections" + url

    #对每个收藏进行爬取
    result = []
    for url in collection_list:
        try:
            collection_information = crawler(url)
            result.append(collection_information)
        except Exception:
            fresh_session()
            continue
    return result

def crawler_img(parent_dir, url):
    response = requests.get(url, stream=True)
    if response.status_code == 200:
        filename = parent_dir + os.pathsep + u"img" + os.pathsep + url.split(u"/")[-1]
        with open(filename, u"wb") as out_file:
            shutil.copyfileobj(response.raw, out_file)
    del response


def login():
    _login(SpiderConfig.ZHIHU_USER, SpiderConfig.ZHIHU_PASSWORD)
