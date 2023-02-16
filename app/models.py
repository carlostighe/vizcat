from datetime import datetime
from flask import flash, redirect, url_for, jsonify, json
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

tags = db.Table('tags',
                db.Column('tag_id',
                          db.Integer(),
                          db.ForeignKey('tag.id'),
                          primary_key=True),
                db.Column('image_id',
                          db.Integer(),
                          db.ForeignKey('image.id'),
                          primary_key=True))


def sort_tags(all_tags):
    """
    Sort tags byt their categories for easier representation on the frontend

    Args:
        all_tags (model): SQLAlchemy model returned from query

    Returns:
        dictionary: a dictionary of sorted tags sorted by category id
    """
    sorted_tags = {}
    for tag in all_tags:
        sorted_tags.setdefault(tag["category_id"], []).append({
            "id": tag["id"],
            "tag": tag["tag_name"]
        })
    return sorted_tags


class Tag(db.Model):
    """
    The Tag model

    Args:
        db (Model): Database model from which this inherits

    Returns:
        Model: returns tag model from the database
    """
    id = db.Column(db.Integer, primary_key=True)
    tag_name = db.Column(db.String(500))
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))

    @property
    def serialize(self):
        """
        Serialise the model to return in json format

        Returns:
            dict: A dictionary representation of the tag, with its id, name, and category id
        """
        return {
            "id": self.id,
            "tag_name": self.tag_name,
            "category_id": self.category_id
        }

    @staticmethod
    def get_sorted_tags():
        """
        Sort all tags by their categories and return them 

        Returns:
            function: calls the function to return a sorted dictionary of tags. See sort_tags() function
        """
        all_tags = [tag.serialize for tag in Tag.query.all()]
        return sort_tags(all_tags)

    @property
    def check_tag(self):
        # x = Tag.query.filter(Tag.images.any(tag_name=self.tag_name)).all()
        tag = Tag.query.filter(self.id)
        tag.images.count
        print('tag.images.count: ', tag.images.count)
        return


class Category(db.Model):
    """
    The category model. Maybe unecessary but in terms of future development it was created

    Args:
        db (Model): Database model from which this inherits
    """
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(500))
    tags = db.relationship('Tag', backref='category', lazy='dynamic')


class Comment(db.Model):
    """
    The Comment Model. 

    Args:
        db (Model): Database model from which this inherits

    Returns:
        Model: Returns comment model
    """
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(1000))
    image_id = db.Column(db.Integer, db.ForeignKey('image.id'))

    @property
    def serialize(self):
        """
        Serialise the model to return in json format

        Returns:
            dict: A dictionary representation of the tag, with its id and text
        """
        return {
            "id": self.id,
            "text": self.text,
        }


class Image(db.Model):
    """
    The Image model

    Args:
        db (Model): Database model from which this inherits

    Returns:
        Model: returns Image model from the database
    """
    id = db.Column(db.Integer, primary_key=True)
    image_url = db.Column(db.String(500))
    comments = db.relationship('Comment', backref='image', lazy='dynamic')
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    tags = db.relationship('Tag',
                           secondary=tags,
                           lazy='dynamic',
                           backref=db.backref('images', lazy='dynamic'))

    @property
    def serialize(self):
        """
        Serialise the model to return in json format
        Get related comments and serialise them
        Get related tags and sort them  

        Returns:
            dict: Returns a serialised dictionary with image id, image url, related comments, and related tags
        """
        comment = Comment.query.filter(Comment.image_id == self.id).first()
        if comment is not None:
            comment = comment.serialize
        tags = sort_tags([tag.serialize for tag in self.tags])
        return {
            "id": self.id,
            "image_url": self.image_url,
            "comments": comment,
            "tags": tags
        }
