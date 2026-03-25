"""
News Schemas - Marshmallow validation for news API requests and responses.
"""

from marshmallow import Schema, fields


class NewsArticleSchema(Schema):
    """Schema for a single news article"""
    id = fields.Str(required=True)
    headline = fields.Str(required=True)
    summary = fields.Str(allow_none=True, load_default=None)
    source = fields.Str(allow_none=True, load_default=None)
    url = fields.Str(required=True)
    image = fields.Str(allow_none=True, load_default=None)
    published_at = fields.Str(required=True)
    language = fields.Str(load_default="en-US")


class NewsResponseSchema(Schema):
    """Schema for news API response"""
    symbol = fields.Str(required=True)
    news = fields.List(fields.Nested(NewsArticleSchema), required=True)
    total = fields.Int(required=True)
    cached_at = fields.Str(allow_none=True, load_default=None)
