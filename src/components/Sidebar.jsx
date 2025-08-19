import { NavLink } from 'react-router-dom';
import { Home, Users, MapPin, FileText } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="logo-container">
        <img src="/logo.png" alt="logo" />
      </div>
      <nav>
        <ul>
          <li>
            <NavLink to="/home">
              <Home size={18} className="icon" />
              <span>Home</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/cadastro-cliente">
              <Users size={18} className="icon" />
              <span>Cadastro Cliente</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/cadastro-terreno">
              <MapPin size={18} className="icon" />
              <span>Cadastro Terreno</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/preencher-documentos">
              <FileText size={18} className="icon" />
              <span>Preencher Documentos</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
}
