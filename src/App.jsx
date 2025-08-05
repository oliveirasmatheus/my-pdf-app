import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import CadastroCliente from './pages/CadastroCliente';
import CadastroTerreno from './pages/CadastroTerreno';

export default function App() {
  return (
    <Router>
      <div style={{ display: 'flex', height: '100vh'}}>
        <Sidebar />
        <div style={{ flexGrow: 1, padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cadastro-cliente" element={<CadastroCliente />} />
            <Route path="/cadastro-terreno" element={<CadastroTerreno />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}