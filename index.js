require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

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

module.exports = { supabase, inserirAluno, listarAlunos, excluirAluno };