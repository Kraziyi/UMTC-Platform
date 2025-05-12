from scipy.interpolate import CubicSpline
from scipy.interpolate import interp1d


def intepolation_cubic(x_array, y_array, new_x):

    cubic_spline = CubicSpline(x_array, y_array)
    new_y = cubic_spline(new_x)
    
    return new_y


def intepolation_linear(x_array, y_array, new_x):

    cubic_spline = interp1d(x_array, y_array, kind='linear')
    new_y = cubic_spline(new_x)
    
    return new_y


def intepolation_nearest(x_array, y_array, new_x):

    cubic_spline = interp1d(x_array, y_array, kind='nearest')
    new_y = cubic_spline(new_x)
    
    return new_y