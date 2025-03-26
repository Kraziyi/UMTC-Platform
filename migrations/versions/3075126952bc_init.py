"""Init

Revision ID: 3075126952bc
Revises: 
Create Date: 2025-02-11 18:36:54.153511

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3075126952bc'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('user',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=64), nullable=True),
        sa.Column('email', sa.String(length=120), nullable=True),
        sa.Column('password_hash', sa.String(length=512), nullable=True),
        sa.Column('is_admin', sa.Boolean(), nullable=True),
        sa.Column('subscription_end', sa.DateTime(timezone=True), nullable=True),
        sa.Column('storage_used', sa.Integer(), nullable=True),
        sa.Column('storage_limit', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_email'), 'user', ['email'], unique=True)
    op.create_index(op.f('ix_user_username'), 'user', ['username'], unique=True)

    op.create_table('folder',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('name', sa.String(length=128), nullable=True),
        sa.Column('parent_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['parent_id'], ['folder.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    op.add_column('user', sa.Column('default_folder_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_user_default_folder', 'user', 'folder', ['default_folder_id'], ['id'])

    op.create_table('history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('folder_id', sa.Integer(), nullable=True),
        sa.Column('input', sa.Text(), nullable=True),
        sa.Column('output', sa.Text(), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=True),
        sa.Column('size', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['folder_id'], ['folder.id'], name='fk_history_folder'),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_history_timestamp'), 'history', ['timestamp'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_history_timestamp'), table_name='history')
    op.drop_table('history')

    op.drop_constraint('fk_user_default_folder', 'user', type_='foreignkey')
    op.drop_column('user', 'default_folder_id')

    op.drop_table('folder')

    op.drop_index(op.f('ix_user_username'), table_name='user')
    op.drop_index(op.f('ix_user_email'), table_name='user')
    op.drop_table('user')