from flask import Blueprint, render_template, flash, redirect, url_for, request
from flask_login import login_user, logout_user, current_user, login_required
from app import db
from app.models import User
from app.forms import LoginForm, RegistrationForm, SubscriptionForm
from datetime import datetime, timedelta, timezone

auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user is None or not user.check_password(form.password.data):
            flash('Invalid username or password')
            return redirect(url_for('auth.login'))
        login_user(user, remember=form.remember_me.data)
        next_page = request.args.get('next')
        if not next_page or not next_page.startswith('/'):
            next_page = url_for('main.index')
        return redirect(next_page)
    return render_template('login.html', title='Sign In', form=form)

@auth.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('main.index'))

@auth.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash('Congratulations, you are now a registered user!')
        return redirect(url_for('auth.login'))
    return render_template('register.html', title='Register', form=form)

@auth.route('/subscription', methods=['GET', 'POST'])
@login_required
def subscription():
    form = SubscriptionForm()
    
    if current_user.is_subscribed():
        flash(f'You are already subscribed until {current_user.subscription_end.strftime("%Y-%m-%d")}. You can extend your subscription.', 'info')
    
    if form.validate_on_submit():
        subscription_period = form.subscription_period.data

        #TODO: Implement auto-renewal logic here
        auto_renew = form.auto_renew.data
        
        if current_user.is_subscribed():
            subscription_start = current_user.subscription_end
        else:
            subscription_start = datetime.now(timezone.utc)
        
        if subscription_period == '1month':
            subscription_extension = timedelta(days=30)
        elif subscription_period == '3months':
            subscription_extension = timedelta(days=90)
        elif subscription_period == '1year':
            subscription_extension = timedelta(days=365)
        
        current_user.subscription_end = subscription_start + subscription_extension
        
        db.session.commit()
        
        flash('Your subscription has been updated!', 'success')
        return redirect(url_for('main.index'))
    
    return render_template('subscription.html', form=form)