require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const { inserirAluno, listarAlunos, excluirAluno } = require('./supabase');

const app = express();
app.use(cors()); 
app.use(express.json());
app.use(express.static('frontend')); 

app.get('/alunos', async (req, res) => {
  try {
    const dados = await listarAlunos();
    res.json(dados);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

app.post('/alunos', async (req, res) => {
  try {
    const { nome, ra, curso_id } = req.body;
    if (!nome || !ra) return res.status(400).json({ erro: 'Nome e RA são obrigatórios' });
    
    const aluno = await inserirAluno(nome, ra, curso_id || 1);
    res.status(201).json(aluno);
  } catch (e) {
    res.status(400).json({ erro: e.message });
  }
});

app.delete('/alunos/:id', async (req, res) => {
  try {
    const data = await excluirAluno(req.params.id);
    res.json(data);
  } catch (e) {
    res.status(400).json({ erro: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API Escolar rodando em http://localhost:${PORT}`));