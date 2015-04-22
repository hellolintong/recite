#! E:\\Program Files\\Python2.7\\python
# coding:utf-8
import random
import time
import os
import requests
import json
import codecs
from bs4 import BeautifulSoup
from config import SpiderConfig


def get_request(url, stream=False):
    ret = {
        u"result": False,
        u"r": None,
    }
    for i in xrange(3):
        try:
            length = random.randint(SpiderConfig.crawler_interval_min, SpiderConfig.crawler_interval_max)
            time.sleep(length)
            r = requests.get(url, timeout=30, stream=stream)
        except requests.exceptions.ConnectionError:
            continue
        except requests.exceptions.Timeout:
            continue
        ret[u"result"] = True
        ret[u"r"] = r
        break
    return ret


def write_stream_file(file_name, r):
    with open(file_name, u"wb") as f:
        for block in r.iter_content(1024):
            if not block:
                break
            f.write(block)

"""
def get_file():
    file_name = raw_input("file_name:")
    url = raw_input("url:")
    r = requests.get(url, stream=True)
    if not r.ok:
        print "get false"
        return None
    file_name = file_name.decode("utf8") + u".mp3"
    with open(file_name, "wb") as f:
        for block in r.iter_content(1024):
            if not block:
                break
            f.write(block)
"""


def fetch_word_sound(cid, start, end):
    url = u"http://word.kekenet.com/index.php?do=recall&type=word&cid=" + cid + u"&coid=%d"
    parent_dir = unicode(os.getcwd()) + os.sep + cid
    if not os.path.exists(parent_dir):
        os.mkdir(parent_dir)

    word_information_list = []
    for i in xrange(start, end + 1):
        sound_dir = parent_dir + os.sep + unicode(i)
        if not os.path.exists(sound_dir):
            os.mkdir(sound_dir)

        result = get_request(url % i)
        if not result[u"result"]:
            continue
        soup = BeautifulSoup(result[u"r"].text)

        word_list = soup.find(u"table", class_=u"martop20px").find_all(u"tr")[1:]
        for j, word in enumerate(word_list):
            #fetch english
            word_information = {}
            try:
                word_english = word.find_all(u"td")[0].find(u"span").text
            except Exception:
                word_information[u"english"] = u""
            else:
                word_information[u"english"] = word_english

            #fetch chinese
            try:
                word_chinese = word.find_all(u"td")[1].find(u"span").text
            except Exception:
                word_information[u"chinese"] = u""
            else:
                word_information[u"chinese"] = word_chinese

            #fetch sound_mark
            try:
                word_sound_mark = word.find_all(u"td")[2].find(u"span").text
            except Exception:
                word_information[u"sound_mark"] = u""
            else:
                word_information[u"sound_mark"] = word_sound_mark

            #fetch sound
            sound_url = word.find_all(u"td")[3]
            try:
                sound_url = sound_url.find(u"a")[u"onclick"].split(u"\'")[1]
            except Exception:
                continue
            sound_result = get_request(u"http://word.kekenet.com/" + sound_url, True)
            if not sound_result[u"result"]:
                continue
            file_name = sound_dir + os.sep + unicode(i) + u"_" + unicode(j) + u".mp3"
            if not os.path.exists(file_name):
                while True:
                    try:
                        write_stream_file(file_name, sound_result[u"r"])
                    except Exception:
                        continue
                    break
            word_information[u"sound"] = os.sep.join(file_name.split(os.getcwd())[1:])[1:]
            word_information_list.append(word_information)

    file_name = parent_dir + os.sep + cid + u".json"
    with codecs.open(file_name, u"w", encoding=u"utf-8") as out_file:
        json.dump(word_information_list, out_file, ensure_ascii=False, indent=4)

if __name__ == u"__main__":
    cid_list = [ (583, 1, 179), (535, 1, 56), (414, 1, 96), (456, 1, 25), (579, 1, 123), (580, 1, 152),
                (411, 1, 87), (524, 1, 28), (173, 1, 529), (172, 1, 225), (614, 1, 327),
                (613, 1, 179), (610, 1, 95), (579, 1, 123), (580, 1, 152), ]

    for elem in cid_list:
        fetch_word_sound(unicode(elem[0]), elem[1], elem[2])
        print u"finish: " + unicode(elem[0])