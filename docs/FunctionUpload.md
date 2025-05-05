# UMTC-Platform
 
Function Return Value Format Requirements
Uploaded functions must return a dictionary in JSON format containing the following fields:

type: Specifies the data type (e.g., "chart", "text").
data: Contains the actual data, which may include multiple fields such as x_axis, y_axis, loss_value, etc.
metadata: Contains metadata or additional information about the data, such as labels (e.g., x_label, y_label), description (e.g., description), and other relevant data (e.g., loss_value).
Example Function
python
Copy
Edit
def ac_test(d, r, ns):
    # Function computation logic
    return {
        "type": "chart",  # Specifies that the result is a chart
        "data": {
            "x_axis": rp_disc.tolist(),  # X-axis data points (list)
            "y_axis": cs_iter.tolist(),  # Y-axis data points (list)
            "loss_value": loss_value  # Loss value computed from the function
        },
        "metadata": {
            "x_label": "rp_disc",  # Label for the x-axis
            "y_label": "cs_iter",  # Label for the y-axis
            "loss_value": "loss_value",  # Description of the loss value
            "description": "Simulation results for diffusion model."  # Additional description of the data
        }
    }
Explanation:
type: This field indicates the type of the result being returned. It could be a chart, text, or any other data type that your function generates. For charts, this is usually set to "chart".

data: The actual data returned by the function. For a chart, this typically includes x_axis and y_axis values, and any other relevant data like loss_value. For text-based results, this could just be a plain string or other structured data.

metadata: Metadata provides additional context or description of the result. This often includes labels for axes (in charts), a description of the data, and other helpful information such as the calculated loss_value. The metadata helps users understand the context of the data, especially in charts.

Notes:
x_axis and y_axis: When the function returns a chart, these represent the data points to be plotted on the X and Y axes, respectively. These are usually arrays or lists of numeric values.

loss_value: This is an optional field that can be used to store the loss value or any other quantitative metric related to the data. It can be used to provide additional insight into the model's performance or the quality of the generated data.

description: Provides a short description of what the result represents. This is especially useful when sharing the function with other users to understand what the result data means.