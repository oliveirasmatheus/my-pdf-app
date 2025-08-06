import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2>My PDF App</h2>
      <nav>
        <ul>
          <li><NavLink to="/">Home</NavLink></li>
          <li><NavLink to="/cadastro-cliente">Cadastro Cliente</NavLink></li>
          <li><NavLink to="/cadastro-terreno">Cadastro Terreno</NavLink></li>
          <li><NavLink to="/preencher-documentos">Preencher Documentos</NavLink></li>
        </ul>
      </nav>
    </div>
  );
}
