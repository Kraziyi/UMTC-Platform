import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';

import Calculation from './pages/Calculation';
import Diffusion from './pages/Diffusion';
import DiffusionAnimation from './pages/DiffusionAnimation';

import ECM from './pages/ECM';
import ThreeDDemo from './pages/ThreeDDemo';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calculation" element={<Calculation />} />
        <Route path="/calculation/diffusion" element={<Diffusion />} />
        <Route path="/calculation/diffusion-animation" element={<DiffusionAnimation />} />
        <Route path="/calculation/ecm" element={<ECM />} />
        <Route path="/3d-demo" element={<ThreeDDemo />} />
      </Routes>
    </Router>
  );
}

export default App;
