import numpy as np
from app.utils.ecm_potential_data import ocv_mat_regul
from app.utils import intepolation_cubic, intepolation_linear, intepolation_nearest

def ecm_interp_solution(t_tot, dt, OCV_import, Cn, SOC_0, i_app, intepolation_choice):
    
    
    soc_interp = np.linspace(0, 1, 21)
    
    R0_char_list = [0.01, 0.01, 0.51, 0.35, 0.39, 0.4, 0.41, 0.44, 0.47, 0.47, 0.47, 0.46, 0.45, 0.4, 0.45, 0.46, 0.45, 0.46, 0.46, 0.44, 0.17]
    R0_dis_list = [1, 1, 0.65, 0.62, 0.59, 0.58, 0.57, 0.55, 0.54, 0.54, 0.53, 0.53, 0.53, 0.55, 0.52, 0.5, 0.5, 0.5, 0.49, 0.5, 0.71]
    
    R1_list = [1, 1, 0.6, 0.43, 0.4, 0.38, 0.37, 0.36, 0.36, 0.35, 0.34, 0.33, 0.33, 0.35, 0.35, 0.34, 0.34, 0.34, 0.33, 0.32, 0.41]
    R2_list = R1_list
    
    tao1_list = [50, 50, 50, 10.55, 10.76, 11.08, 11.27, 12.47, 14.31, 13.91, 13.53, 13.2, 12.74, 10.55, 12.95, 13.59, 14.37, 14.8, 14.6, 12.71, 7.18]
    tao2_list = [157.56, 157.56, 499.63, 355.08, 500, 500, 500, 500, 456.73, 416.17, 426.76, 459.72, 482.44, 450.18, 500, 403.97, 362.14, 397.06, 430.51, 432.6, 425.62]
    
    R0_char = np.array(R0_char_list) * 1E-3    # unit of Ohm
    R0_dis = np.array(R0_dis_list) * 1E-3    # unit of Ohm
    
    R1 = np.array(R1_list) * 1E-3    # unit of Ohm
    R2 = np.array(R2_list) * 1E-3    # unit of Ohm
    
    tao1 = np.array(tao1_list)    # unit of s
    tao2 = np.array(tao2_list)    # unit of s
    
    C1 = tao1/R1    # unit of F
    C2 = tao2/R2    # unit of F
    
    Cn = 130

    # =========================================================================

    OCV = ocv_mat_regul if OCV_import.size == 0 else OCV_import
        
        
    # =========================================================================
    Nt = int(np.ceil(t_tot/dt))
    t_table = np.linspace(0, t_tot, Nt)
    


    if intepolation_choice == 'linear':
        intep_method = intepolation_linear
    elif intepolation_choice == 'cubic':
        intep_method = intepolation_cubic
    elif intepolation_choice == 'nearest':  
        intep_method = intepolation_nearest
    else:
        raise ValueError("Invalid intepolation choice. Choose 'linear', 'cubic', or 'nearest'.")
    
    OCV_0 = intep_method(OCV[:, 0], OCV[:, 1], SOC_0)
    
    U1 = np.zeros(Nt + 1)
    U2 = np.zeros(Nt + 1)
    SOC_store = np.ones(Nt) * SOC_0
    Vt = np.ones(Nt) * OCV_0
    OCV_store = np.ones(Nt) * OCV_0
    
    SOC_val = SOC_0
    n = 0
    
    for i in range(Nt):
        
        R0_val = intep_method(soc_interp, R0_char, SOC_val)
        R1_val = intep_method(soc_interp, R1, SOC_val)
        R2_val = intep_method(soc_interp, R2, SOC_val)
        C1_val = intep_method(soc_interp, C1, SOC_val)
        C2_val = intep_method(soc_interp, C2, SOC_val)
        OCV_val = intep_method(OCV[:, 0], OCV[:, 1], SOC_val)
        
        U1_cal = U1[i]*np.exp(-dt/(R1_val*C1_val)) + i_app*R1_val*(1 - np.exp(-dt/(R1_val*C1_val)))
        U2_cal = U2[i]*np.exp(-dt/(R2_val*C2_val)) + i_app*R2_val*(1 - np.exp(-dt/(R2_val*C2_val)))
        Vt[i] = U1_cal + U2_cal + OCV_val
        OCV_store[i] = OCV_val
        
        U1[i+1] = U1_cal
        U2[i+1] = U2_cal
        
        SOC_val = SOC_val + (dt/Cn)*i_app + R0_val*i_app
        SOC_store[i] = SOC_val
        n = i
        
        if Vt[i] >= 4:
            break  

    ecm_result = {
        'OCV_store': OCV_store[:n],
        'Vt': Vt[:n],
        't_table': t_table[:n],
        'SOC_store': SOC_store[:n]
        }
    
    return ecm_result