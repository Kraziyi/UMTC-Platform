import json

def calculate_history_size(input_data, output_data):
    """Calculate the total size of history entry in bytes"""
    # Convert to string if not already
    input_str = input_data if isinstance(input_data, str) else json.dumps(input_data)
    output_str = output_data if isinstance(output_data, str) else json.dumps(output_data)
    
    # Calculate size in bytes
    input_size = len(input_str.encode('utf-8'))
    output_size = len(output_str.encode('utf-8'))
    
    return input_size + output_size 