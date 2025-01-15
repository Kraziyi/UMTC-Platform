class DynamicRouter:
    """
    A central registry for dynamically registering and calling functions.
    """
    def __init__(self):
        self.registered_functions = {}

    def register_function(self, name, func):
        """
        Register a function to the router with a name.
        """
        if name in self.registered_functions:
            raise ValueError(f"Function {name} is already registered.")
        self.registered_functions[name] = func

    def call_function(self, name, **kwargs):
        """
        Call a registered function by name with the given kwargs.
        """
        if name not in self.registered_functions:
            raise ValueError(f"Function {name} is not registered.")
        return self.registered_functions[name](**kwargs)


# Create a singleton instance of the router
dynamic_router = DynamicRouter()
