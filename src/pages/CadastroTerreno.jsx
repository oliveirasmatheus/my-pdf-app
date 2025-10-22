import { useState, useEffect } from 'react';
import db from '../firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import './CadastroCliente.css'; // Reaproveitando o CSS

export default function CadastroTerreno() {
  const [terreno, setTerreno] = useState({
    clienteId: '',
    numeroMatricula: '',
    setor: '',
    quadra: '',
    lote: '',
    endereco: '',
  });

  const [editandoId, setEditandoId] = useState(null); // 👈 para saber se está editando
  const [terrenos, setTerrenos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [viewingId, setViewingId] = useState(null); // mobile 'Detalhes' read-only view

  // Buscar clientes
  const fetchClientes = async () => {
    const querySnapshot = await getDocs(collection(db, 'clientes'));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setClientes(data);
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  // Buscar terrenos
  const fetchTerrenos = async () => {
    const querySnapshot = await getDocs(collection(db, 'terrenos'));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sorting the terrenos by the corresponding cliente's name
    data.sort((a, b) => {
      const clienteA = clientes.find(c => c.id === a.clienteId);
      const clienteB = clientes.find(c => c.id === b.clienteId);

      const nomeA = clienteA ? clienteA.nome : '';
      const nomeB = clienteB ? clienteB.nome : '';
      
      return nomeA.localeCompare(nomeB, 'pt', { sensitivity: 'base' });
    });

    setTerrenos(data);
  };

  useEffect(() => {
    if (clientes.length > 0) {
      fetchTerrenos();
    }
  }, [clientes]); // Trigger fetching terrenos after clientes have been loaded

  // Alteração dos inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTerreno((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Salvar ou atualizar terreno
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) {
        // Atualizar
        const terrenoRef = doc(db, 'terrenos', editandoId);
        await updateDoc(terrenoRef, terreno);
        setEditandoId(null);
      } else {
        // Criar novo
        await addDoc(collection(db, 'terrenos'), terreno);
      }

      // Resetar form
      setTerreno({
        clienteId: '',
        numeroMatricula: '',
        setor: '',
        quadra: '',
        lote: '',
        endereco: '',
      });

      fetchTerrenos();
    } catch (error) {
      console.error('Erro ao salvar terreno:', error);
    }
  };

  // Editar terreno
  const handleEdit = (t) => {
    setTerreno({
      clienteId: t.clienteId,
      numeroMatricula: t.numeroMatricula,
      setor: t.setor,
      quadra: t.quadra,
      lote: t.lote,
      endereco: t.endereco,
    });
    setEditandoId(t.id);
    setViewingId(null);
  };

  // Excluir terreno
  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este terreno?")) return;
    try {
      await deleteDoc(doc(db, 'terrenos', id));
      fetchTerrenos();
    } catch (error) {
      console.error("Erro ao excluir terreno:", error);
    }
  };

  return (
    <div className="cadastro-container">
      <form className="form-cliente" onSubmit={handleSubmit}>
        <h2>{viewingId ? 'Visualizar Terreno' : editandoId ? "Editar Terreno" : "Cadastro de Terreno"}</h2>
        <div className="grid-2">
          <input
            name="numeroMatricula"
            placeholder="Número da Matrícula"
            value={terreno.numeroMatricula}
            onChange={handleChange}
            disabled={!!viewingId}
          />
          <input
            name="setor"
            placeholder="Setor"
            value={terreno.setor}
            onChange={handleChange}
            disabled={!!viewingId}
          />
          <input
            name="quadra"
            placeholder="Quadra"
            value={terreno.quadra}
            onChange={handleChange}
            disabled={!!viewingId}
          />
          <input
            name="lote"
            placeholder="Lote"
            value={terreno.lote}
            onChange={handleChange}
            disabled={!!viewingId}
          />
          <input
            name="endereco"
            placeholder="Endereço do Terreno"
            value={terreno.endereco}
            onChange={handleChange}
            disabled={!!viewingId}
          />
          <select
            name="clienteId"
            value={terreno.clienteId}
            onChange={handleChange}
            disabled={!!viewingId}
          >
            <option value="">Selecione o Cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
        {!viewingId && (
          <button type="submit" className="submit-btn">
            {editandoId ? "Atualizar Terreno" : "Salvar Terreno"}
          </button>
        )}
      </form>

      <h3 className="table-title">Terrenos Cadastrados</h3>
      <div className="table-section">
        {terrenos.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum terreno cadastrado ainda.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Número da Matrícula</th>
                  <th>Setor</th>
                  <th>Quadra</th>
                  <th>Lote</th>
                  <th>Endereço</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {terrenos.map((t) => {
                  const cliente = clientes.find(c => c.id === t.clienteId);
                  return (
                    <tr key={t.id}>
                      <td>{cliente ? cliente.nome : '-'}</td>
                      <td>{t.numeroMatricula}</td>
                      <td>{t.setor}</td>
                      <td>{t.quadra}</td>
                      <td>{t.lote}</td>
                      <td>{t.endereco}</td>
                      <td>
                        <div className="acoes">
                          <button onClick={() => handleEdit(t)} className="btn-editar">Editar</button>
                          <button onClick={() => handleDelete(t.id)} className="btn-excluir">Excluir</button>
                          <button
                            className="btn-detalhes"
                            onClick={() => {
                              setTerreno({
                                clienteId: t.clienteId,
                                numeroMatricula: t.numeroMatricula,
                                setor: t.setor,
                                quadra: t.quadra,
                                lote: t.lote,
                                endereco: t.endereco,
                              });
                              setViewingId(t.id);
                              setEditandoId(null);
                            }}
                          >
                            Detalhes
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
