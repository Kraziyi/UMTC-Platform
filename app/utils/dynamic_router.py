class DynamicRouter:
    """
    A central registry for dynamically registering and calling functions.
    """
    def __init__(self):
        self.registered_functions = {}
        self.function_visibility = {}  # Stores function visibility

    def register_function(self, name, func, visible=True):
        """
        Register a function to the router with a name and initial visibility.
        """
        if name in self.registered_functions:
            raise ValueError(f"Function {name} is already registered.")
        self.registered_functions[name] = func
        self.function_visibility[name] = visible

    def call_function(self, name, **kwargs):
        """
        Call a registered function by name with the given kwargs.
        """
        if name not in self.registered_functions:
            raise ValueError(f"Function {name} is not registered.")
        return self.registered_functions[name](**kwargs)

    def get_visible_functions(self):
        """
        Get a list of visible functions for non-admin users.
        """
        return [
            {"endpoint": name, "url": f"/api/calculation/{name}"}
            for name, visible in self.function_visibility.items()
            if visible
        ]

    def update_function_visibility(self, name, visible):
        """
        Update the visibility of a specific function.
        """
        if name not in self.function_visibility:
            raise ValueError(f"Function {name} is not registered.")
        self.function_visibility[name] = visible


dynamic_router = DynamicRouter()