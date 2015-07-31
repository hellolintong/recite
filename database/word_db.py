#coding:utf-8
from sqlalchemy import Column, Integer, String, and_
from database import DB
from config.config import Config

DB.init(Config.USER, Config.PASSWORD, Config.DATABASE)


class Word(DB.Base):
    __tablename__ = u"word"
    id = Column(Integer, primary_key=True)
    chinese = Column(String(40))
    english = Column(String(40))
    sound_mark = Column(String(40))
    category_id = Column(Integer)
    sound = Column(String(40))

    def __init__(self, **kwargs):
        self.chinese = kwargs[u"chinese"]
        self.english = kwargs[u"english"]
        self.sound = kwargs[u"sound"]
        self.sound_mark = kwargs[u"sound_mark"]
        self.category_id = kwargs[u"category_id"]


def add(**kwargs):
    word = Word(**kwargs)
    return DB.add(word)

def del_by_id(word_id):
    word = get_by_id(word_id)
    DB.delete(word)


@DB.query
def get_by_category(session, category_id):
    return session.query(Word).filter(Word.category_id == category_id).all()


@DB.query
def get_by_id(session, word_id):
    word_list = session.query(Word).filter(Word.id == word_id).all()
    return word_list[0] if word_list else None


@DB.query
def check_by_english_and_category(session, english, category_id):
    word_list = session.query(Word).filter(and_(Word.english == english, Word.category_id == category_id)).all()
    return True if word_list else False

DB.create_table(u"word")
