#coding:utf-8
import traceback
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base


class DB(object):
    engine = None
    Session = None
    Base = object
    argument_init_flag = False
    all_db_create_flag = {u"word": False, u"category": False}

    @classmethod
    def init(cls, user, password, db, engine_name=u"mysql"):
        if not cls.argument_init_flag:
            engine_arg = engine_name + u"://" + user + u":" + password + u"@localhost/" + db + u"?charset=utf8"
            cls.engine = create_engine(engine_arg, convert_unicode=True)
            cls.Session = sessionmaker(bind=cls.engine)
            cls.Base = declarative_base()
            cls.argument_init_flag = True

    @classmethod
    def create_table(cls, key_name):
        if key_name in cls.all_db_create_flag and not cls.all_db_create_flag[key_name]:
            cls.Base.metadata.create_all(cls.engine)
            cls.all_db_create_flag[key_name] = True

    @classmethod
    def get_session(cls):
        return cls.Session()

    @staticmethod
    def query(func):
        def deco_query(*args, **kwargs):
            session = DB.get_session()
            result = func(session, *args, **kwargs)
            session.close()
            return result
        return deco_query

    @classmethod
    def clear_session(cls, session):
        session.flush()
        session.commit()
        session.close()

    @classmethod
    def add(cls, elem):
        session = DB.get_session()
        try:
            session.add(elem)
        except Exception:
            traceback.print_exc(file=sys.stdout)
            session.close()
            return None
        session.flush()
        elem_id = elem.id
        cls.clear_session(session)
        return elem_id

    @classmethod
    def delete(cls, elem):
        session = DB.get_session()
        try:
            session.delete(elem)
        except Exception:
            traceback.print_exc(file=sys.stdout)
            session.close()
            return
        cls.clear_session(session)