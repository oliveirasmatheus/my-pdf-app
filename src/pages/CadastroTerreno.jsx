import { useState, useEffect } from 'react';
import db from '../firebaseConfig';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export default function CadastroTerreno() {
  const [terreno, setTerreno] = useState({
    numeroMatricula: '',
    setor: '',
    quadra: '',
    lote: '',
    endereco: '',
  });

  const [terrenos, setTerrenos] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTerreno((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'terrenos'), terreno);
      setTerreno({
        numeroMatricula: '',
        setor: '',
        quadra: '',
        lote: '',
        endereco: '',
      });
      fetchTerrenos(); // Refresh list
    } catch (error) {
      console.error('Erro ao salvar terreno:', error);
    }
  };

  const fetchTerrenos = async () => {
    const querySnapshot = await getDocs(collection(db, 'terrenos'));
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setTerrenos(data);
  };

  useEffect(() => {
    fetchTerrenos();
  }, []);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2>Cadastro de Terreno</h2>
        <input name="numeroMatricula" placeholder="Número da Matrícula" value={terreno.numeroMatricula} onChange={handleChange} />
        <input name="setor" placeholder="Setor" value={terreno.setor} onChange={handleChange} />
        <input name="quadra" placeholder="Quadra" value={terreno.quadra} onChange={handleChange} />
        <input name="lote" placeholder="Lote" value={terreno.lote} onChange={handleChange} />
        <input name="endereco" placeholder="Endereço do Terreno" value={terreno.endereco} onChange={handleChange} />
        <button type="submit">Salvar Terreno</button>
      </form>

      <h2>Terrenos Cadastrados</h2>
      <table>
        <thead>
          <tr>
            <th>Número da Matrícula</th>
            <th>Setor</th>
            <th>Quadra</th>
            <th>Lote</th>
            <th>Endereço</th>
          </tr>
        </thead>
        <tbody>
          {terrenos.map((terreno) => (
            <tr key={terreno.id}>
              <td>{terreno.numeroMatricula}</td>
              <td>{terreno.setor}</td>
              <td>{terreno.quadra}</td>
              <td>{terreno.lote}</td>
              <td>{terreno.endereco}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
