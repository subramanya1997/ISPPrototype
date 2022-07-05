import os
import re
import time
import argparse

from flask import Flask, request, redirect, url_for
from flask import render_template
from flask import g # global session-level object
from flask import session
import pandas as pd

from aslite.db import get_test_db

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Server')
    parser.add_argument('-d', '--debug', action="store_true", help='up to how many papers to fetch')
    args = parser.parse_args()
    print(args)

    # -----------------------------------------------------------------------------
    # inits and globals

    app = Flask(__name__)

    # set the secret key so we can cryptographically sign cookies and maintain sessions
    if os.path.isfile('secret_key.txt'):
        # example of generating a good key on your system is:
        # import secrets; secrets.token_urlsafe(16)
        sk = open('secret_key.txt').read().strip()
    else:
        print("WARNING: no secret key found, using default devkey")
        sk = 'devkey'
    app.secret_key = sk

    if args.debug:
        app.config["ENV"] = "development"
        app.config["DEBUG"] = True

    # -----------------------------------------------------------------------------
    # globals that manage the (lazy) loading of various state for a request
    @app.before_request
    def add_close():
        pdb = get_test_db(flag='c')
        for i in range(10):
            pdb[i] = i + 1

        pdb.close()

    @app.route("/")
    def hello():
        tdb = get_test_db()
        _t = ""
        for i in range(10):
            _t += f"{tdb[i]+1}_"

        return f"Hello, World! {_t}"

    app.run()