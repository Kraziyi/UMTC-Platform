import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Subscription from './pages/Subscription';
import Logout from './pages/Logout';
import User from './pages/User';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import History from './pages/History';
import HistoryView from './pages/HistoryView';
import HistorySearch from './pages/HistorySearch';

import Calculation from './pages/Calculation';
import Diffusion from './pages/Diffusion';
import DiffusionAnimation from './pages/DiffusionAnimation';

import FileUploadPage from './pages/FileUploadPage';
import FunctionInvoker from './pages/FunctionInvoker';
import ManageCalculation from './pages/ManageCalculations';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user" element={<User />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/history" element={<History />} />
        <Route path="/history/:id" element={<HistoryView />} />
        <Route path="/history/search" element={<HistorySearch />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/calculation" element={<Calculation />} />
        <Route path="/calculation/diffusion" element={<Diffusion />} />
        <Route path="/calculation/diffusion-animation" element={<DiffusionAnimation />} />
        <Route path="/file-upload" element={<FileUploadPage />} />
        <Route path="/functions/:functionName" element={<FunctionInvoker />} />
        <Route path="/manage-calculation" element={<ManageCalculation />} />
      </Routes>
    </Router>
  );
}

export default App;
