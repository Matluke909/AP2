require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Configure SUPABASE_URL e SUPABASE_ANON_KEY no .env');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inserirFilme(titulo, genero, categoria_id) {
  const { data, error } = await supabase
    .from('filmes')
    .insert([{ titulo, genero, categoria_id }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function listarFilmes() {
  const { data, error } = await supabase
    .from('filmes')
    .select('id, titulo, genero, categoria_id');

  if (error) throw error;
  return data;
}

async function moverFilme(id, nova_categoria_id) {
  const { data, error } = await supabase
    .from('filmes')
    .update({ categoria_id: nova_categoria_id })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
}

async function excluirFilme(id) {
  const { data, error } = await supabase
    .from('filmes')
    .delete()
    .eq('id', id)
    .select();
  if (error) throw error;
  return data;
}

module.exports = {
  supabase,
  inserirFilme,
  listarFilmes,
  moverFilme,
  excluirFilme,
};