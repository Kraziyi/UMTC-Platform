from flask_wtf import FlaskForm
from wtforms import FloatField, SubmitField
from wtforms.validators import DataRequired

class CalculationForm(FlaskForm):
    x = FloatField('Input X', validators=[DataRequired()])
    y = FloatField('Input Y', validators=[DataRequired()])
    z = FloatField('Input Z', validators=[DataRequired()])
    submit = SubmitField('Calculate')
