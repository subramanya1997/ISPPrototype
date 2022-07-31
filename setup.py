from aslite.db import get_projects_db, delete_duplicate

def setupProject():
    temp = get_projects_db(flag='c')
    temp.close()

def init():
    
    #setup project
    # setupProject()
    delete_duplicate('project1')

init()