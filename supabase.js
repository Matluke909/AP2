require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Configure SUPABASE_URL e SUPABASE_ANON_KEY no .env');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inserirAluno(nome, ra, curso_id) {
  const { data, error } = await supabase
    .from('alunos')
    .insert([{ nome, ra, curso_id }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function listarAlunos() {
  const { data, error } = await supabase
    .from('alunos')
    .select('id, nome, ra, curso_id');

  if (error) throw error;
  return data;
}

async function excluirAluno(id) {
  const { data, error } = await supabase
    .from('alunos')
    .delete()
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
}

module.exports = {
  supabase,
  inserirAluno,
  listarAlunos,
  excluirAluno,
};