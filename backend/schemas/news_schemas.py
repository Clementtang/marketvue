"""
News Schemas - Marshmallow validation for news API requests and responses.
"""

from marshmallow import Schema, fields, validate, validates, ValidationError


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
    has_more = fields.Bool(required=True)
    cached_at = fields.Str(allow_none=True, load_default=None)


class NewsRequestParamsSchema(Schema):
    """Schema for news API query parameters"""
    limit = fields.Int(
        load_default=10,
        validate=validate.Range(min=1, max=50)
    )
    page = fields.Int(
        load_default=1,
        validate=validate.Range(min=1)
    )

    @validates('limit')
    def validate_limit(self, value):
        if value < 1 or value > 50:
            raise ValidationError('Limit must be between 1 and 50')
        return value
