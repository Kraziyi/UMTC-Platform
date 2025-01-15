def add_numbers(d, r, ns):
    """
    Adds two numbers together.

    Args:
        a (float): The first number.
        b (float): The second number.

    Returns:
        float: The sum of the two numbers.
    """
    return d + r + ns


# Example usage for testing
if __name__ == "__main__":
    print("Testing add_numbers function:")
    print(f"add_numbers(3, 5) = {add_numbers(3, 5, 1)}")
