from app import db

class Folder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    name = db.Column(db.String(128))
    parent_id = db.Column(db.Integer, db.ForeignKey('folder.id'))

    parent = db.relationship('Folder', remote_side=[id], backref='children')
    histories = db.relationship('History', backref='folder', lazy='dynamic')

    def get_all_subfolders(self):
        return Folder.query.filter_by(parent_id=self.id).all()

    @property
    def is_root(self):
        return self.parent_id is None or self.parent_id == self.id