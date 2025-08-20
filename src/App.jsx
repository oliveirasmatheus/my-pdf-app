import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import CadastroCliente from './pages/CadastroCliente';
import CadastroTerreno from './pages/CadastroTerreno';
import PreencherDocumentos from './pages/PreencherDocumentos';
import Login from './pages/Login';
import './App.css';

function DashboardLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route element={<DashboardLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/cadastro-cliente" element={<CadastroCliente />} />
          <Route path="/cadastro-terreno" element={<CadastroTerreno />} />
          <Route path="/preencher-documentos" element={<PreencherDocumentos />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
