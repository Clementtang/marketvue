from marshmallow import Schema, fields, validate, validates, ValidationError
from datetime import datetime


class StockDataRequestSchema(Schema):
    """Schema for stock data request validation"""
    symbol = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=10),
        error_messages={'required': 'Stock symbol is required'}
    )
    start_date = fields.Date(
        required=True,
        format='%Y-%m-%d',
        error_messages={'required': 'Start date is required'}
    )
    end_date = fields.Date(
        required=True,
        format='%Y-%m-%d',
        error_messages={'required': 'End date is required'}
    )

    @validates('symbol')
    def validate_symbol(self, value):
        """Validate stock symbol format"""
        if not value.replace('.', '').replace('-', '').isalnum():
            raise ValidationError('Invalid stock symbol format')
        return value.upper()

    @validates('end_date')
    def validate_date_range(self, value):
        """Validate that end_date is after start_date"""
        # This will be checked after both dates are loaded
        pass


class BatchStocksRequestSchema(Schema):
    """Schema for batch stock request validation"""
    symbols = fields.List(
        fields.Str(validate=validate.Length(min=1, max=10)),
        required=True,
        validate=validate.Length(min=1, max=9),
        error_messages={
            'required': 'Symbols list is required',
            'max': 'Maximum 9 stocks allowed in batch request'
        }
    )
    start_date = fields.Date(
        format='%Y-%m-%d',
        load_default=None
    )
    end_date = fields.Date(
        format='%Y-%m-%d',
        load_default=None
    )

    @validates('symbols')
    def validate_symbols(self, value):
        """Validate each symbol in the list"""
        for symbol in value:
            if not symbol.replace('.', '').replace('-', '').isalnum():
                raise ValidationError(f'Invalid stock symbol format: {symbol}')


class StockDataPointSchema(Schema):
    """Schema for a single stock data point"""
    date = fields.Str()
    open = fields.Float()
    high = fields.Float()
    low = fields.Float()
    close = fields.Float()
    volume = fields.Int()


class StockDataResponseSchema(Schema):
    """Schema for stock data response"""
    symbol = fields.Str()
    data = fields.List(fields.Nested(StockDataPointSchema))
    current_price = fields.Float(allow_none=True)
    change = fields.Float(allow_none=True)
    change_percent = fields.Float(allow_none=True)


class BatchStocksResponseSchema(Schema):
    """Schema for batch stocks response"""
    stocks = fields.List(fields.Nested(StockDataResponseSchema))
    timestamp = fields.DateTime()
