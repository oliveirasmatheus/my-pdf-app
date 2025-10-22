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
            <img src="/logo-full.svg" alt="PDFDocs Logo" className="logo-full" />
            <button className="collapse-btn" onClick={() => setCollapsed(true)} title="Collapse sidebar"><X size={20} /></button>
          </>
        ) : (
          <button className="logo-btn" onClick={() => setCollapsed(false)} title="Expand sidebar">
            <img src="/logo-icon.svg" alt="PDFDocs" className="logo-icon" />
          </button>
        )}
      </div>

      <nav>
        <ul>
          <li>
            <NavLink to="/app">
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
