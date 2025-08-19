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
    setTerrenos(data);
  };

  useEffect(() => {
    fetchTerrenos();
  }, []);

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
        <h2>{editandoId ? "Editar Terreno" : "Cadastro de Terreno"}</h2>
        <div className="grid-2">
          <input
            name="numeroMatricula"
            placeholder="Número da Matrícula"
            value={terreno.numeroMatricula}
            onChange={handleChange}
          />
          <input
            name="setor"
            placeholder="Setor"
            value={terreno.setor}
            onChange={handleChange}
          />
          <input
            name="quadra"
            placeholder="Quadra"
            value={terreno.quadra}
            onChange={handleChange}
          />
          <input
            name="lote"
            placeholder="Lote"
            value={terreno.lote}
            onChange={handleChange}
          />
          <input
            name="endereco"
            placeholder="Endereço do Terreno"
            value={terreno.endereco}
            onChange={handleChange}
          />
          <select
            name="clienteId"
            value={terreno.clienteId}
            onChange={handleChange}
          >
            <option value="">Selecione o Cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="submit-btn">
          {editandoId ? "Atualizar Terreno" : "Salvar Terreno"}
        </button>
      </form>

      <div>
        <h3>Terrenos Cadastrados</h3>
        {terrenos.length === 0 ? (
          <p>Nenhum terreno cadastrado ainda.</p>
        ) : (
          <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
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
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
