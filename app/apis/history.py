from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app import db
from app.models import History, User, Folder
from sqlalchemy.exc import IntegrityError
from app.utils.history import calculate_history_size
import json

history = Blueprint('history', __name__)

def validate_folder_id(folder_id):
    try:
        return int(folder_id)
    except ValueError:
        return None
    
@history.route('/', methods=['GET'])
@login_required
def index():
    history_id = request.args.get('history_id', None)
    if history_id:
        history = History.query.filter_by(id=history_id, user_id=current_user.id).first_or_404()
        return jsonify(history.to_dict())
    history = History.query.filter_by(user_id=current_user.id).order_by(History.timestamp.desc()).all()
    return jsonify([h.to_dict() for h in history])

@history.route('/name', methods=['GET'])
@login_required
def get_by_name():
    name = request.args.get('name')
    if not name:
        return jsonify({'error': 'Missing required parameter: name'}), 400
    
    histories = History.query.filter_by(
        user_id=current_user.id,
        name=name
    ).order_by(History.timestamp.desc()).all()
    
    return jsonify([h.to_dict() for h in histories]) 

@history.route('/name/<int:history_id>', methods=['PUT'])
@login_required
def update_name(history_id):
    data = request.get_json()
    new_name = data.get('new_name')

    if not new_name:
        return jsonify({'error': 'New name is required'}), 400

    history = History.query.filter_by(id=history_id, user_id=current_user.id).first_or_404()
    history.name = new_name
    db.session.commit()

    return jsonify({
        'id': history.id,
        'name': history.name
    }), 200


# Delete history
@history.route('/<int:history_id>', methods=['DELETE'])
@login_required
def delete_history(history_id):
    history = History.query.filter_by(id=history_id, user_id=current_user.id).first_or_404()
    current_user.storage_used -= history.size
    db.session.delete(history)
    db.session.commit()
    return jsonify({'message': 'History deleted'}), 200

@history.route('/storage', methods=['GET'])
@login_required
def get_storage():
    return jsonify({
        'used': current_user.storage_used,
        'limit': current_user.storage_limit
    })

@history.route('/storage/recalculate', methods=['POST'])
@login_required
def recalculate_storage():
    try:
        # Get all histories for the current user
        histories = History.query.filter_by(user_id=current_user.id).all()
        total_size = 0
        
        # Recalculate size for each history entry
        for history_entry in histories:
            try:
                # Parse the stored JSON strings back to objects
                input_data = json.loads(history_entry.input)
                output_data = json.loads(history_entry.output)
                
                # Calculate new size
                new_size = calculate_history_size(input_data, output_data)
                
                # Update the history entry's size
                history_entry.size = new_size
                total_size += new_size
            except Exception as e:
                # If there's an error with one entry, log it but continue with others
                print(f"Error calculating size for history {history_entry.id}: {str(e)}")
                continue
        
        # Update user's storage_used
        current_user.storage_used = total_size
        db.session.commit()
        
        return jsonify({
            'used': current_user.storage_used,
            'limit': current_user.storage_limit
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@history.route('/folders', methods=['GET'])
@login_required
def get_folders():
    parent_id = request.args.get('parent_id', None)
    
    if parent_id in ['', 'root']:
        folders = Folder.query.filter(
            Folder.user_id == current_user.id,
            Folder.parent_id == Folder.id
        ).all()
    else:
        folders = Folder.query.filter(
            Folder.user_id == current_user.id,
            Folder.parent_id == parent_id
        ).all()

    return jsonify([{
        'id': f.id,
        'name': f.name,
        'type': 'folder',
        'is_root': f.parent_id == f.id
    } for f in folders])

@history.route('/folders', methods=['POST'])
@login_required
def create_folder():
    data = request.get_json()
    folder_name = data.get('folder_name')
    parent_id = data.get('parent_id', None)
    
    if not folder_name:
        return jsonify({'error': 'Folder name is required'}), 400
    if parent_id:
        parent_folder = Folder.query.filter_by(id=parent_id, user_id=current_user.id).first()
        if not parent_folder:
            return jsonify({'error': 'Parent folder not found'}), 404
        folder = Folder(user_id=current_user.id, name=folder_name, parent_id=parent_id)
    else:
        folder = Folder(user_id=current_user.id, name=folder_name)
        folder.parent_id = folder.id
    db.session.add(folder)
    db.session.commit()

    return jsonify({
        'id': folder.id,
        'name': folder.name,
        'type': 'folder',
        'parent_id': folder.parent_id
    }), 201


@history.route('/folders/<int:folder_id>/histories', methods=['GET'])
def get_histories(folder_id):
    if not folder_id:
        return jsonify({'histories': []})
    histories = History.query.filter_by(folder_id=folder_id).all()
    history_data = [h.to_dict() for h in histories]
    return jsonify({'histories': history_data})

@history.route('/folders/<int:folder_id>', methods=['DELETE'])
@login_required
def delete_folder(folder_id):
    folder = Folder.query.filter_by(id=folder_id, user_id=current_user.id).first_or_404()

    # Recursive function to delete all sub-folders and histories
    def delete_folder_recursive(folder):
        for sub_folder in Folder.query.filter_by(parent_id=folder.id, user_id=current_user.id).all():
            delete_folder_recursive(sub_folder)

        for history in History.query.filter_by(folder_id=folder.id, user_id=current_user.id).all():
            current_user.storage_used -= history.size
            db.session.delete(history)

        db.session.delete(folder)

    delete_folder_recursive(folder)
    db.session.commit()

    return jsonify({'message': 'Folder deleted'}), 200

@history.route('/folders/<int:folder_id>', methods=['PUT'])
@login_required
def rename_folder(folder_id):
    data = request.get_json()
    new_name = data.get('new_name')

    if not new_name:
        return jsonify({'error': 'New name is required'}), 400

    folder = Folder.query.filter_by(id=folder_id, user_id=current_user.id).first_or_404()
    folder.name = new_name
    db.session.commit()

    return jsonify({
        'id': folder.id,
        'name': folder.name,
        'type': 'folder'
    }), 200

@history.route('/folders/<int:folder_id>', methods=['GET'])
@login_required
def get_folder_details(folder_id):
    folder = Folder.query.filter_by(id=folder_id).first_or_404()
    return jsonify({
        'id': folder.id,
        'name': folder.name,
        'parent_id': folder.parent_id,
        'user_id': folder.user_id
    })

@history.route('/items/<int:item_id>/move', methods=['PUT'])
@login_required
def move_item(item_id):
    data = request.get_json()
    new_parent_id = data.get('parent_id', 'root')
    item_type = data.get('type')  # 'folder' or 'history'

    if new_parent_id == 'root':
        new_parent = Folder.query.filter_by(
            user_id=current_user.id,
            parent_id=None
        ).first()
        if not new_parent:
            return jsonify({'error': 'Root folder not found'}), 404
        new_parent_id = new_parent.id
    else:
        new_parent_id = validate_folder_id(new_parent_id)
        new_parent = Folder.query.filter_by(
            id=new_parent_id,
            user_id=current_user.id
        ).first()
        if not new_parent:
            return jsonify({'error': 'Parent folder not found'}), 404

    # Validate item
    if item_type == 'folder':
        item = Folder.query.filter_by(
            id=item_id,
            user_id=current_user.id
        ).first()
    elif item_type == 'history':
        item = History.query.filter_by(
            id=item_id,
            user_id=current_user.id
        ).first()
    else:
        return jsonify({'error': 'Invalid item type'}), 400

    if not item:
        return jsonify({'error': 'Item not found'}), 404

    # Check for cyclic dependencies
    if item_type == 'folder':
        def is_cyclic(parent, original_id):
            if parent is None:
                return False
            if parent.id == original_id:
                return True
            return is_cyclic(parent.parent, original_id)

        if is_cyclic(new_parent, item.id):
            return jsonify({'error': 'Cyclic dependency detected'}), 400

    try:
        if item_type == 'folder':
            item.parent_id = new_parent_id
        else:
            item.folder_id = new_parent_id
        
        db.session.commit()
        return jsonify({'message': 'Item moved successfully'}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Move operation failed'}), 500

@history.route('/user/default_folder', methods=['GET'])
@login_required
def get_default_folder():
    default_folder_id = current_user.default_folder_id
    current_folder = Folder.query.filter_by(id=default_folder_id).first()
    # Get the path from the root folder to the default folder
    path = []
    while current_folder:
        if current_folder.id in [f['id'] for f in path]:
            break
        path.append({
            'id': current_folder.id,
            'name': current_folder.name
        })
        current_folder = Folder.query.filter_by(id=current_folder.parent_id).first()
    path.reverse()
    return jsonify({
        'default_folder_id': current_user.default_folder_id,
        'path': path
    })

@history.route('/user/default_folder', methods=['PUT'])
@login_required
def set_default_folder():
    data = request.get_json()
    folder_id = data.get('folder_id')

    if folder_id:
        current_user.default_folder_id = folder_id

    db.session.commit()

    return jsonify({
        'default_folder_id': current_user.default_folder_id
    }), 200

@history.route('folders/root', methods=['GET'])
@login_required
def get_root_folders():
    root_folders = Folder.query.filter_by(user_id=current_user.id).filter(Folder.parent_id == Folder.id).all()
    if root_folders:
        return jsonify([{
            'id': folder.id,
            'name': folder.name,
            'user_id': folder.user_id
        } for folder in root_folders])
    else:
        return jsonify({'message': 'No root folders found'}), 404