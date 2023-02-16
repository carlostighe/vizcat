import logging
import os
import sys
import time

from flask import Flask, json, jsonify, request, session
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from werkzeug.exceptions import HTTPException
from werkzeug.utils import secure_filename

from app.config import config_by_name
from app.models import Category, Comment, Image, Tag, db


class InvalidAPIUsage(Exception):
    """
    Process any invalid calls to the api

    Args:
        Exception (Exception): The Exception raised by the invalid call

    Returns:
        dict: dictionary with error message
    """
    print('Exception: ', Exception)
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        super().__init__()
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv


def check_filename(new_filename, old_filename):
    if (new_filename.split('.')[-1]) not in ['png', 'jpg', 'jpeg', 'gif']:
        new_filename = ".".join([new_filename, old_filename.split('.')[-1]])
    return secure_filename(new_filename)


def create_app(config_name):
    """
    The application factory for creating the flask application

    Args:
        config_name (str): String config name to load the appropriate configuration object from config.py

    Raises:
        InvalidAPIUsage: Raises the apporpriate invalid api usage error if there is an invalid api call
        InvalidAPIUsage: [description]
        InvalidAPIUsage: [description]
        InvalidAPIUsage: [description]
        InvalidAPIUsage: [description]
        InvalidAPIUsage: [description]
        InvalidAPIUsage: [description]

    Returns:
        application: Returns the flask api application
    """
    if not isinstance(config_name, str):
        config_name = 'dev'
    app = Flask(__name__, static_folder='../build', static_url_path='/')
    app.config.from_object(config_by_name[config_name])
    db.init_app(app)

    @app.errorhandler(InvalidAPIUsage)
    def invalid_api_usage(e):
        """
        Process any invalid api calls and return them as json

        Args:
            e (error): the error

        Returns:
            json: dictionary of error details returned as json
        """
        return jsonify(e.to_dict())

    @app.route('/')
    def index():
        """
        The index route. The home page

        Returns:
            file: Returns the React app file
        """
        if request.method == "GET":
            return app.send_static_file('index.html')

    @app.route('/api/images', methods=["GET", "POST"])
    def images():
        """
        The Images api
        GET:
            Get all images, serialise them, and return as Json
        POST:
            Get the file. Get the attributes. If the attributes exist check if the filename has been changed and
            ensure that the filetype is attached. Set the filename. Check if the image is already in the database and return if it is.
            Get the upload folder. If it doesnt exists create it. Save the file there.
            Create the Image model. Add the associated tags to it.
            Create the associated Comments Models.
            Save the comments and images.
            Raise an exception if something goes wrong

        Raises:
            InvalidAPIUsage: Raises an exception if something goes wrong in one of the steps

        Returns:
            dict: a dict that is returned as json with success code, message, and updated image data for the frontend
        """
        if request.method == "GET":
            all_images = Image.query.all()
            images = [image.serialize for image in all_images]
            return {"images": images}

        if request.method == "POST":
            file = request.files['file']
            attributes = request.form.get('attributes')
            if attributes is not None:
                attributes = json.loads(attributes)
                new_filename = attributes['filename']
                # check that the file type is on the filename, if not take it off the actual file
                filename = check_filename(new_filename, file.filename)
            else:
                filename = secure_filename(file.filename)

            # check if image name already exists
            imageExists = Image.query.filter(
                Image.image_url.contains(filename)).first()
            if imageExists is not None:
                return {
                    "code": 404,
                    "source": {"pointer": "/api/images"},
                    "title":  "error",
                    "detail": "An image by the same name already exists in the database"
                }

            target = app.config['UPLOAD_FOLDER']
            if not os.path.isdir(target):
                os.mkdir(target)

            destination = "/".join([target, filename])
            file.save(destination)
            # saving image details to database
            image = Image(image_url=filename)
            if attributes['tags']:
                for tag in attributes['tags']:
                    image.tags.append(Tag.query.get(tag['id']))

            try:
                db.session.add(image)
                if attributes['comment']:
                    comment = Comment(text=attributes['comment'],
                                      image_id=image.id)
                    db.session.add(comment)
                db.session.commit()
                images = [image.serialize for image in Image.query.all()]
                return {
                    "code": 200,
                    "source": {"pointer": "/api/images"},
                    "title":  "success",
                    "detail": "Image uploaded",
                    "data": images
                }

            except Exception as err:
                db.session.rollback()
                return {
                    "code": 403,
                    "source": {"pointer": "/api/images"},
                    "title":  "error",
                    "detail": "Image not uploaded: " + err,
                }

            raise InvalidAPIUsage("There was an error", status_code=404)

    @app.route('/api/images/<int:image_id>/edit', methods=["POST"])
    def editImage(image_id):
        target = app.config['UPLOAD_FOLDER']
        image = Image.query.get_or_404(image_id)
        old_filename = image.image_url
        attributes = request.form.get('attributes')
        attributes = json.loads(attributes)
        if image:
            new_filename = check_filename(attributes['filename'], old_filename)
            try:
                image.image_url = new_filename
                image.tags = []
                for tag in attributes['tags']:
                    image.tags.append(
                        Tag.query.filter_by(tag_name=tag).first())
                if attributes['newComment']:
                    comment = Comment(text=attributes['commentText'],
                                      image_id=image_id)
                    db.session.add(comment)
                else:
                    comment = Comment.query.get(attributes['commentId'])
                    if comment is not None:
                        comment.text = attributes['commentText']
                    else:
                        raise InvalidAPIUsage(
                            "There was an issue with comments", status_code=404)

                db.session.commit()
                os.rename("/".join([target, old_filename]),
                          "/".join([target, new_filename]))
                images = [image.serialize for image in Image.query.all()]
                return {
                    "code": 200,
                    "source": {"pointer": "/api/images/edit"},
                    "title":  "success",
                    "detail": "Image updated",
                    "data": images
                }

            except Exception as err:
                db.session.rollback()
                return {
                    "code": 403,
                    "source": {"pointer": "/api/images/edit"},
                    "title":  "error",
                    "detail": "Image not updated: " + err,
                }

        raise InvalidAPIUsage("There is no such image", status_code=404)

    @app.route('/api/tags', methods=["GET", "POST"])
    def tags():
        """
        Tags api.
        GET - get all the tags from the database and return them sorted by category id
        POST - create a new tag in the db.

        Raises:
            InvalidAPIUsage: Raises an exception if something goes wrong in one of the steps

        Returns:
            dict: dict returned as json with code and error, or code and updated list of tags
        """
        if request.method == "GET":
            tags = Tag.get_sorted_tags()
            return tags

        if request.method == "POST":
            name = request.json.get("name").lower()
            cat = int(request.json.get("category"))
            if not name or not cat:
                raise InvalidAPIUsage("No tag or category provided")

            tag_names = [tag.tag_name for tag in Tag.query.all()]
            check_tag = ''.join(e for e in name if e.isalnum())
            for tag_name in tag_names:
                if ''.join(e for e in tag_name if e.isalnum()).lower() == check_tag:
                    return {
                        "code": 404,
                        "source": {"pointer": "/api/tags"},
                        "title":  "error",
                        "detail": "That tag already exists in the database"
                    }

            tag = Tag(tag_name=name,
                      category_id=cat)
            db.session.add(tag)
            db.session.commit()
            tags = Tag.get_sorted_tags()
            return {
                "code": 200,
                "source": {"pointer": "/api/tags"},
                "title":  "success",
                "detail": "Tag created",
                "data": tags
            }
        return {
            "code": 404,
            "source": {"pointer": "/api/tags"},
            "title":  "error",
            "detail": "That method is not allowed."
        }

    @app.route('/api/tags/delete/<int:tag_id>', methods=["POST"])
    def delete_tag(tag_id):
        tag = db.session.query(Tag).filter(Tag.id == tag_id).first_or_404()
        if tag.images.count() > 0:
            return {
                "code": 404,
                "source": {"pointer": "/api/tags/delete"},
                "title":  "error",
                "detail": "That tag is attached to at least one image so cant be deleted"
            }
        try:
            db.session.delete(tag)
            db.session.commit()
            tags = Tag.get_sorted_tags()
            return {
                "code": 200,
                "source": {"pointer": "/api/tags/delete"},
                "title":  "success",
                "detail": "Tag deleted",
                "data": tags
            }

        except Exception as err:
            db.session.rollback()
            return {
                "code": 403,
                "source": {"pointer": "/api/tags/delete"},
                "title":  "error",
                "detail": "Unable to delete Tag: " + err,
            }

    @app.route('/api/categories', methods=["GET"])
    def get_all_categories():
        """
        Get and return all the categories in the database

        Returns:
            list: list of categories with category id and text
        """
        cats = Category.query.all()
        data = jsonify([{"id": cat.id, "text": cat.text} for cat in cats])
        return data

    return app


if __name__ == '__main__':
    application = create_app('dev')
    application.run()
