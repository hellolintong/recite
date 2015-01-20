#coding:utf-8
from sqlalchemy import Column, Integer, String
from database import DB
from config.config import Config

DB.init(Config.USER, Config.PASSWORD, Config.DATABASE)


class Word(DB.Base):
    __tablename__ = u"word"
    id = Column(Integer, primary_key=True)
    chinese = Column(String(40))
    english = Column(String(40))
    sound_mark = Column(String(40))
    category = Column(String(40))
    sound = Column(String(40))

    def __init__(self, **kwargs):
        self.chinese = kwargs[u"chinese"]
        self.english = kwargs[u"english"]
        self.sound = kwargs[u"sound"]
        self.sound_mark = kwargs[u"sound_mark"]
        self.category = kwargs[u"category"]


def add(**kwargs):
    word = Word(**kwargs)
    return DB.add(word)


@DB.query
def get_by_category(session, category):
    return session.query(Word).filter(Word.category == category).all()

@DB.query
def get_all_category(session):
    return session.query(Word.category).filter().all()

DB.create_table(u"word")
