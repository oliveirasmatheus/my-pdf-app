import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import db from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import './HomeDoc.css';

export default function HomeDoc() {
  const navigate = useNavigate();
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalTerrenos, setTotalTerrenos] = useState(0);

  useEffect(() => {
    const fetchClientes = async () => {
      const snapshot = await getDocs(collection(db, 'clientes'));
      setTotalClientes(snapshot.size);
    };
    const fetchTerrenos = async () => {
      const snapshot = await getDocs(collection(db, 'terrenos'));
      setTotalTerrenos(snapshot.size);
    };
    fetchClientes();
    fetchTerrenos();
  }, []);

  return (
    <div className="home-container">
      <h1>Bem-vindo ao Sistema de Geração de Documentos!</h1>

      <div className="home-cards">
        <div className="card">
          <h2>Total de Clientes</h2>
          <p>{totalClientes}</p>
          <button onClick={() => navigate('/cadastro-cliente')}>Gerenciar Clientes</button>
        </div>

        <div className="card">
          <h2>Total de Terrenos</h2>
          <p>{totalTerrenos}</p>
          <button onClick={() => navigate('/cadastro-terreno')}>Gerenciar Terrenos</button>
        </div>

        <div className="card">
          <h2>Gerar Documento</h2>
          <button onClick={() => navigate('/preencher-documentos')}>Ir para Geração</button>
        </div>

      </div>

      <div className="home-footer">
        <p>Escolha uma ação para começar.</p>
      </div>
    </div>
  );
}
