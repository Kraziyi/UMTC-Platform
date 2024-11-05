import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Subscription from './components/Subscription';
import Logout from './components/Logout';
import Diffusion from './components/Diffusion';
import User from './components/User';
import History from './components/History';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user" element={<User />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/history" element={<History />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/calculation/diffusion" element={<Diffusion />} />
      </Routes>
    </Router>
  );
}

export default App;
