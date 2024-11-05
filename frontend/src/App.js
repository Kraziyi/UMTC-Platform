import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Subscription from './components/Subscription';
import Logout from './components/Logout';
import Diffusion from './components/Diffusion';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/calculation/diffusion" element={<Diffusion />} />
      </Routes>
    </Router>
  );
}

export default App;
