from marshmallow import Schema, fields, validate, validates, ValidationError, validates_schema
from datetime import datetime, timedelta


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
        # Allow alphanumeric, dots, hyphens, and carets (for indices like ^GSPC)
        allowed_chars = set('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-^')
        if not all(c in allowed_chars for c in value.upper()):
            raise ValidationError(
                'Invalid stock symbol format. Only letters, numbers, dots, hyphens, and carets allowed.'
            )

        # Additional length check
        if len(value) > 10:
            raise ValidationError('Stock symbol cannot exceed 10 characters')

        return value.upper()

    @validates('start_date')
    def validate_start_date(self, value):
        """Validate start date"""
        today = datetime.now().date()

        # Prevent querying too far in the past (performance/abuse prevention)
        max_history = today - timedelta(days=365 * 20)  # 20 years
        if value < max_history:
            raise ValidationError('Start date cannot be more than 20 years ago')

        # Prevent future dates
        if value > today:
            raise ValidationError('Start date cannot be in the future')

        return value

    @validates('end_date')
    def validate_end_date(self, value):
        """Validate end date"""
        if value > datetime.now().date():
            raise ValidationError('End date cannot be in the future')
        return value

    @validates_schema
    def validate_date_range(self, data, **kwargs):
        """Validate date range"""
        if 'start_date' in data and 'end_date' in data:
            if data['end_date'] < data['start_date']:
                raise ValidationError(
                    {'end_date': ['End date must be after start date']}
                )

            # Prevent excessively large date ranges (performance)
            max_range = timedelta(days=365 * 5)  # 5 years
            if (data['end_date'] - data['start_date']) > max_range:
                raise ValidationError(
                    {'date_range': ['Date range cannot exceed 5 years']}
                )


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
        load_default=None,
        allow_none=True
    )
    end_date = fields.Date(
        format='%Y-%m-%d',
        load_default=None,
        allow_none=True
    )

    @validates('symbols')
    def validate_symbols(self, value):
        """Validate each symbol in the list"""
        allowed_chars = set('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-^')

        for symbol in value:
            if not symbol:
                raise ValidationError('Empty symbol not allowed')

            if not all(c in allowed_chars for c in symbol.upper()):
                raise ValidationError(
                    f'Invalid stock symbol format: {symbol}. '
                    'Only letters, numbers, dots, hyphens, and carets allowed.'
                )

            if len(symbol) > 10:
                raise ValidationError(f'Symbol too long: {symbol}')

        # Check for duplicates
        upper_symbols = [s.upper() for s in value]
        if len(upper_symbols) != len(set(upper_symbols)):
            raise ValidationError('Duplicate symbols not allowed')

        return upper_symbols

    @validates('start_date')
    def validate_start_date(self, value):
        """Validate start date if provided"""
        if value is None:
            return value

        today = datetime.now().date()
        max_history = today - timedelta(days=365 * 20)

        if value < max_history:
            raise ValidationError('Start date cannot be more than 20 years ago')

        if value > today:
            raise ValidationError('Start date cannot be in the future')

        return value

    @validates('end_date')
    def validate_end_date(self, value):
        """Validate end date if provided"""
        if value is None:
            return value

        if value > datetime.now().date():
            raise ValidationError('End date cannot be in the future')

        return value

    @validates_schema
    def validate_date_range(self, data, **kwargs):
        """Validate date range if both dates provided"""
        start = data.get('start_date')
        end = data.get('end_date')

        if start and end:
            if end < start:
                raise ValidationError(
                    {'end_date': ['End date must be after start date']}
                )

            # Prevent excessively large date ranges
            max_range = timedelta(days=365 * 5)
            if (end - start) > max_range:
                raise ValidationError(
                    {'date_range': ['Date range cannot exceed 5 years']}
                )


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
