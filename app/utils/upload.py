import os
import tempfile
import importlib.util

def save_uploaded_file(file):
    """
    Save the uploaded file to a temporary directory.
    """
    upload_dir = tempfile.mkdtemp()
    filepath = os.path.join(upload_dir, file.filename)
    file.save(filepath)
    return filepath


def validate_python_file(filepath):
    """
    Validate if the uploaded file is a Python script and extract callable functions.
    """
    try:
        module_name = os.path.splitext(os.path.basename(filepath))[0]
        spec = importlib.util.spec_from_file_location(module_name, filepath)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        functions = {
            name: func for name, func in vars(module).items() if callable(func)
        }
        return True, functions
    except Exception:
        return False, {}
