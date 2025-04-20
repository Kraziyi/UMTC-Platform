import numpy as np
import matplotlib.pyplot as plt
import casadi as ca
import os

def calculate_temperature_influence(x0, Ea=50000, T=313):
    T_ref = 293
    R = 8.41
    x = x0 * np.exp(Ea * (1 / T_ref - 1 / T) / R)
    return x

def diffusion_solver(d, r, ns):
    """
    Traditional solver using numpy
    
    Args:
        d (float): Diffusion coefficient
        r (float): Radius
        ns (int): Number of spatial discretization points
    """
    F = 96485 # Faraday's constant
    Sa = 3E5
    
    rp_loc_disc = np.linspace(0, r, (2*ns + 1) + 1)
    rp_disc = np.linspace(0, r, ns + 1)
    delta_rp = r / (2*ns + 1)
    dt = 1
    
    r_kplus = np.linspace(delta_rp*2, r - delta_rp, ns)
    r_kminus = np.linspace(0, r - delta_rp, ns + 1)
    
    delta_Vk = (np.power(r_kplus, 3) - np.power(r_kminus[:-1], 3))/3
    
    # Coefficients
    a_tk = delta_Vk / dt
    a_wk = np.power(r_kminus[:-1], 2)*d / (2*delta_rp)
    a_ek = np.power(r_kplus, 2)*d / (2*delta_rp)
    
    # Normalized coefficients
    a_tk_bar = a_tk / (a_wk + a_ek + a_tk)
    a_wk_bar = a_wk / (a_wk + a_ek + a_tk)
    a_ek_bar = a_ek / (a_wk + a_ek + a_tk)
    
    # Boundary conditions
    delta_Vn = (r**3 - (r - delta_rp)**3)/3
    a_tn = delta_Vn / dt
    a_wn = (r - delta_rp)**2 * d / (2*delta_rp)
    a_tn_bar = a_tn / (a_tn + a_wn)
    a_wn_bar = a_wn / (a_tn + a_wn)
    m = r**2 / ((a_tn + a_wn)*Sa*F)
    
    # Initial conditions
    cs = np.ones(ns + 1)*10000
    cs_iter = cs.copy()
    j = -Sa*6
    Spn_newton = 1
    
    iteration = 1000
    tolerance = 1e-10
    
    for n in range(iteration):
        f_p = np.zeros(ns + 1)
        jacob_p = np.zeros((ns + 1, ns + 1))
        
        for i in range(ns + 1):
            if i == 0:
                jacob_p[i, i] = 1
                jacob_p[i, i+1] = -a_ek_bar[i]
                f_p[i] = cs_iter[i] - a_ek_bar[i]*cs_iter[i + 1] - a_tk_bar[i]*cs[i]
            elif i == ns:
                jacob_p[i, i - 1] = -a_wn_bar
                jacob_p[i, i] = Spn_newton
                f_p[i] = -a_wn_bar*cs_iter[i-1] + cs_iter[i] - a_tn_bar*cs[i] + m*j
            else:
                jacob_p[i, i - 1] = -a_wk_bar[i]
                jacob_p[i, i] = 1
                jacob_p[i, i + 1] = -a_ek_bar[i]
                f_p[i] = -a_wk_bar[i]*cs_iter[i - 1] + cs_iter[i] - a_ek_bar[i]*cs_iter[i + 1] - a_tk_bar[i]*cs[i]
        
        jacob_p_inv = np.linalg.inv(jacob_p)
        cs_iter_update = cs_iter - jacob_p_inv @ f_p
        cs_iter = cs_iter_update
        
        loss_value = np.linalg.norm(f_p, ord=2)
        if loss_value < tolerance:
            break
    
    return rp_disc, cs_iter, loss_value

def diffusion_solver_casadi(D, R, Ns):
    """
    CasADi solver for the diffusion problem
    
    Args:
        D (float): Diffusion coefficient
        R (float): Radius
        Ns (int): Number of spatial discretization points
    """
    F = 96485
    Sa = 3E5
    
    delta_rp = R / (2*Ns + 1)
    dt = 1
    
    r_kplus = np.linspace(delta_rp*2, R - delta_rp, Ns)
    r_kminus = np.linspace(0, R - delta_rp, Ns + 1)
    
    # Create CasADi variables
    cs = ca.MX.sym('cs', Ns + 1)
    
    delta_Vk = (ca.power(r_kplus, 3) - ca.power(r_kminus[:-1], 3))/3
    
    a_tk = delta_Vk / dt
    a_wk = ca.power(r_kminus[:-1], 2)*D / (2*delta_rp)
    a_ek = ca.power(r_kplus, 2)*D / (2*delta_rp)
    
    a_tk_bar = a_tk / (a_wk + a_ek + a_tk)
    a_wk_bar = a_wk / (a_wk + a_ek + a_tk)
    a_ek_bar = a_ek / (a_wk + a_ek + a_tk)
    
    # Boundary conditions
    delta_Vn = (R**3 - (R - delta_rp)**3)/3
    a_tn = delta_Vn / dt
    a_wn = (R - delta_rp)**2 * D / (2*delta_rp)
    a_tn_bar = a_tn / (a_tn + a_wn)
    a_wn_bar = a_wn / (a_tn + a_wn)
    M = R**2 / ((a_tn + a_wn)*Sa*F)
    
    eq = []
    j = -Sa*6
    cs_init = np.ones(Ns + 1)*10000
    
    for i in range(Ns + 1):
        if i == 0:
            eq.append(cs[i] - a_ek_bar[i]*cs[i + 1] - a_tk_bar[i]*cs_init[i])
        elif i == Ns:
            eq.append(-a_wn_bar*cs[i-1] + cs[i] - a_tn_bar*cs_init[i] + M*j)
        else:
            eq.append(-a_wk_bar[i]*cs[i - 1] + cs[i] - a_ek_bar[i]*cs[i + 1] - a_tk_bar[i]*cs_init[i])
    
    # Create the nonlinear problem
    eq = ca.vertcat(*eq)
    nlp = {'x': cs, 'f': ca.dot(eq, eq)}
    
    # Create solver
    opts = {'ipopt.print_level': 0, 'print_time': 0}
    solver = ca.nlpsol('solver', 'ipopt', nlp, opts)

    sol = solver(x0=cs_init)
    cs_sol = sol['x'].full().flatten()
    residual = np.sqrt(sol['f'].full()[0])
    
    rp_disc = np.linspace(0, R, Ns + 1)
    return rp_disc, cs_sol, residual

def diffusion_2d_solver(nx, ny, dt, d, t_max):
    """
    Solve 2D diffusion equation with initial condition of step function
    Returns frames as RGB color data
    """
    print(f"Starting 2D diffusion solver with parameters: nx={nx}, ny={ny}, dt={dt}, d={d}, t_max={t_max}")
    
    # Calculate grid spacing
    dx = dy = 1.0 / nx
    
    # Calculate maximum stable time step
    dt_max = dx**2 / (4 * d)
    dt = min(0.9 * dt_max, dt)  # ensure stability
    print(f"Adjusted dt for stability: {dt} (max stable dt: {dt_max})")
    
    # Calculate number of time steps
    nt = int(t_max / dt)
    print(f"Number of time steps: {nt}")
    
    # Initialize field with step function
    u = np.zeros((nx, ny))
    for i in range(nx):
        for j in range(ny):
            if j >= ny // 2:
                u[i, j] = 1  # upper part
            else:
                u[i, j] = -1  # lower part
    
    # Store frames as RGB data
    frames = []
    
    # Time stepping
    for step in range(nt):
        u_new = u.copy()
        for i in range(1, nx - 1):
            for j in range(1, ny - 1):
                laplacian = (u[i+1, j] - 2*u[i, j] + u[i-1, j]) / dx**2 + \
                           (u[i, j+1] - 2*u[i, j] + u[i, j-1]) / dy**2
                u_new[i, j] = np.clip(u[i, j] + d * dt * laplacian, -1, 1)
        u = u_new
        
        # Convert to RGB data
        rgb_frame = np.zeros((nx, ny, 3), dtype=np.uint8)
        for i in range(nx):
            for j in range(ny):
                value = u[i, j]
                if value < 0:
                    # Blue to white
                    t = abs(value)
                    rgb_frame[i, j] = [int(255 * t), int(255 * t), 255]
                else:
                    # White to red
                    t = value
                    rgb_frame[i, j] = [255, int(255 * (1 - t)), int(255 * (1 - t))]
        
        frames.append(rgb_frame.tolist())

    return frames, nt, nx, ny

def diffusion_2d_solver_alt(nx=50, ny=50, dt=0.001, d=1.0, t_max=9e-3):
    """
    Solve 2D diffusion equation with initial condition of step function
    Returns frames as RGB color data and metadata
    
    Parameters:
    -----------
    nx : int, optional
        Number of grid points in x direction (default 50)
    ny : int, optional
        Number of grid points in y direction (default 50)
    dt : float, optional
        Time step (default 0.001)
    d : float, optional
        Diffusion coefficient (default 1.0)
    t_max : float, optional
        Maximum simulation time (default 9e-3)
    
    Returns:
    --------
    frames : list of RGB frames
    nt : int
        Number of time steps
    nx : int
        Grid size in x direction
    ny : int
        Grid size in y direction
    """
    # Calculate grid spacing
    dx = dy = 1.0 / nx

    # Largest stable time step calculation
    dt_max = dx**2 / (4 * d)
    dt = min(0.9 * dt_max, dt)  # ensure stability
    print(f"Stable time step: dt = {dt:.5e} (max stable dt: {dt_max:.5e})")

    # Calculate number of time steps
    nt = int(t_max / dt)
    print(f"Number of time steps: {nt}")

    # Initialize field with step function
    u = np.zeros((nx, ny))
    for i in range(nx):
        for j in range(ny):
            if j >= ny // 2:
                u[i, j] = 1  # upper part
            else:
                u[i, j] = -1  # lower part

    # Store frames as RGB data
    frames = []

    # Time stepping
    for step in range(nt):
        # Create a copy for updating
        u_new = u.copy()

        # Compute diffusion
        for i in range(1, nx - 1):
            for j in range(1, ny - 1):
                # Compute Laplacian
                laplacian = (u[i+1, j] - 2*u[i, j] + u[i-1, j]) / dx**2 + \
                            (u[i, j+1] - 2*u[i, j] + u[i, j-1]) / dy**2
                
                # Update with diffusion and clip values
                u_new[i, j] = np.clip(u[i, j] + d * dt * laplacian, -1, 1)

        # Update field
        u = u_new

        # Convert to RGB data
        rgb_frame = np.zeros((nx, ny, 3), dtype=np.uint8)
        for i in range(nx):
            for j in range(ny):
                value = u[i, j]
                if value < 0:
                    # Blue to white gradient for negative values
                    t = abs(value)
                    rgb_frame[i, j] = [int(255 * t), int(255 * t), 255]
                else:
                    # White to red gradient for positive values
                    t = value
                    rgb_frame[i, j] = [255, int(255 * (1 - t)), int(255 * (1 - t))]

        frames.append(rgb_frame.tolist())

        # Logging for every 10th step
        if step % 10 == 0:
            print(f"Step {step}: min={np.min(u):.3f}, max={np.max(u):.3f}")

    print(f"Generated {len(frames)} frames")
    return frames, nt, nx, ny


if __name__ == "__main__":
    # Parameters
    D = 1e-12  
    R = 5e-6 
    Ns = 100   
    
    # Solve using traditional method
    rp_disc1, cs_sol1, loss1 = diffusion_solver(D, R, Ns)
    
    # Solve using CasADi
    # rp_disc2, cs_sol2, loss2 = diffusion_solver_casadi(D, R, Ns)
    
    # Plot results
    plt.figure(figsize=(10, 6))
    plt.plot(rp_disc1, cs_sol1, 'b-', label='Traditional')
    # plt.plot(rp_disc2, cs_sol2, 'r--', label='CasADi')
    plt.xlabel('Radius')
    plt.ylabel('Concentration')
    plt.legend()
    plt.title('Comparison of Traditional and CasADi Solutions')
    plt.grid(True)
    plt.show()
    
    print(f"Traditional method loss: {loss1}")
    # print(f"CasADi method loss: {loss2}")