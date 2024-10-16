from flask_wtf import FlaskForm
from wtforms import BooleanField, SubmitField, RadioField  
from wtforms.validators import DataRequired

class SubscriptionForm(FlaskForm):
    subscription_period = RadioField(
        'Choose your subscription period:',
        choices=[('1month', '1 Month'), ('3months', '3 Months'), ('1year', '1 Year')],
        validators=[DataRequired()]
    )
    auto_renew = BooleanField('Enable Auto-Renew')
    submit = SubmitField('Subscribe')
