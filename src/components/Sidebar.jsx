import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, MapPin, FileText, Menu, X } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="logo-container">
        {!collapsed ? (
          <>
            <img src="/logo.png" alt="logo" />
            <button className="collapse-btn" onClick={() => setCollapsed(true)}><X size={20} /></button>
          </>
        ) : (
          <button className="collapse-btn" onClick={() => setCollapsed(false)}><Menu size={20} /></button>
        )}
      </div>

      <nav>
        <ul>
          <li>
            <NavLink to="/home">
              <Home size={18} className="icon" />
              {!collapsed && <span>Home</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/cadastro-cliente">
              <Users size={18} className="icon" />
              {!collapsed && <span>Cadastro Cliente</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/cadastro-terreno">
              <MapPin size={18} className="icon" />
              {!collapsed && <span>Cadastro Terreno</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/preencher-documentos">
              <FileText size={18} className="icon" />
              {!collapsed && <span>Preencher Documentos</span>}
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
}
