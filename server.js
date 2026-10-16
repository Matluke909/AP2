require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const { inserirFilme, listarFilmes, moverFilme, excluirFilme } = require('./supabase');
const app = express();
app.use(cors()); 
app.use(express.json());
app.use(express.static('frontend')); 
app.get('/filmes', async (req, res) => {
  try {
    const dados = await listarFilmes();
    res.json(dados);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});
app.post('/filmes', async (req, res) => {
  try {
    const { titulo, genero, categoria_id } = req.body;
    if (!titulo) {
      return res.status(400).json({ erro: 'O título é obrigatório' });
    }
    const idDaColuna = categoria_id || 2;
    const filme = await inserirFilme(titulo, genero, idDaColuna);
    res.status(201).json(filme);
  } catch (e) {
    res.status(400).json({ erro: e.message });
  }
});
app.put('/filmes/:id', async (req, res) => {
  try {
    const data = await moverFilme(req.params.id, req.body.categoria_id);
    res.json(data);
  } catch (e) {
    res.status(400).json({ erro: e.message });
  }
});
app.delete('/filmes/:id', async (req, res) => {
  try {
    const data = await excluirFilme(req.params.id);
    res.json(data);
  } catch (e) {
    res.status(400).json({ erro: e.message });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API de Filmes a rodar em http://localhost:${PORT}`);
});