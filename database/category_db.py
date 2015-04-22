# coding:utf-8
import traceback
import sys
from sqlalchemy import Column, Integer, String
from database import DB
from config.config import Config

DB.init(Config.USER, Config.PASSWORD, Config.DATABASE)


class Category(DB.Base):
    __tablename__ = u"category"
    id = Column(Integer, primary_key=True)
    name = Column(String(40))
    start_index = Column(Integer)

    def __init__(self, **kwargs):
        self.name = kwargs[u"name"]
        self.start_index = 0


def add(**kwargs):
    category = Category(**kwargs)
    return DB.add(category)


@DB.query
def get_all_category(session):
    return session.query(Category).filter().all()


@DB.query
def get_word_index(session, category_id):
    category = session.query(Category).filter(Category.id == category_id).all()
    if not category:
        return 0
    category = category[0]
    return category.start_index


def set_category_index(category_id, index):
    session = DB.get_session()
    category = session.query(Category).filter(Category.id == category_id).all()
    if not category:
        return
    category = category[0]
    category.start_index = index
    try:
        session.add(category)
    except Exception:
        traceback.print_exc(file=sys.stdout)
        session.close()
    DB.clear_session(session)


DB.create_table(u"category")