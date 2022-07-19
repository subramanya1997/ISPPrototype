from aslite.db import get_projects_db


def setupProject():
    temp = get_projects_db(flag='c')
    temp.close()

def init():
    
    #setup project
    setupProject()

init()