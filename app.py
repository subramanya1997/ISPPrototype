import os
import re
import time
import argparse
import json
import uuid

from flask import Flask, request, redirect, url_for
from flask import render_template
from werkzeug.utils import secure_filename

from aslite.db import get_projects_db, save_project_to_db

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
    app.config['UPLOAD_FOLDER'] = "static/save/"

    if args.debug:
        app.config["ENV"] = "development"
        app.config["DEBUG"] = True

    ALLOWED_EXTENSIONS = set(['svg'])
    def allowed_file(filename):
	    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

    # -----------------------------------------------------------------------------
    # routes

    @app.route("/")
    def hello():
        return render_template('index.html')

    @app.route("/edit")
    def edit_page(filename=""):
        return render_template('edit.html', filename=filename)

    @app.route('/edit', methods=['POST'])
    def upload_image():
        print("upload_image..")
        
        
        if 'file' not in request.files:
            return render_template('edit.html')
        file = request.files['file']
        if file.filename == '':
            return render_template('edit.html')
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            data = json.loads(request.form['hdata'])
            data['id'] = str(uuid.uuid1())
            data['name'] = request.form['name']
            print(data)
            save_project_to_db(data, data['id'])
            return render_template('edit.html', filename=filename)
        else:
            return redirect(request.url)

    app.run()