require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const COLUNAS_ALUNO = 'id, nome, ra, curso_id, criado_em, curso:cursos(id, nome)';

async function inserirCurso(nome) {
  const { data, error } = await supabase.from('cursos').insert([{ nome }]).select().single();
  if (error) throw error;
  return data;
}

async function listarCursos() {
  const { data, error } = await supabase.from('cursos').select('id, nome, alunos(count)').order('nome', { ascending: true });
  if (error) throw error;
  return data.map((curso) => ({
    id: curso.id,
    nome: curso.nome,
    total_alunos: curso.alunos[0]?.count ?? 0,
  }));
}

async function excluirCurso(id) {
  const { data, error } = await supabase.from('cursos').delete().eq('id', id).select();
  if (error) throw error;
  return data;
}

async function inserirAluno(nome, ra, cursoId) {
  const { data, error } = await supabase.from('alunos').insert([{ nome, ra, curso_id: cursoId }]).select(COLUNAS_ALUNO).single();
  if (error) throw error;
  return data;
}

async function listarAlunos({ inicio = 0, limite, cursoId, busca, ordem, direcao } = {}) {
  let consulta = supabase
    .from('alunos')
    .select(COLUNAS_ALUNO, limite ? { count: 'exact' } : undefined);

  if (cursoId) consulta = consulta.eq('curso_id', cursoId);
  
  if (busca) {
    const limpo = busca.replace(/[%,]/g, '').trim();
    if (limpo) consulta = consulta.or(`nome.ilike.%${limpo}%,ra.ilike.%${limpo}%`);
  }

  const ascendente = direcao !== 'desc';
  if (ordem === 'curso') {
    consulta = consulta.order('nome', { ascending: ascendente, foreignTable: 'cursos' });
  } else if (ordem === 'nome' || ordem === 'ra') {
    consulta = consulta.order(ordem, { ascending: ascendente });
  }
  consulta = consulta.order('id', { ascending: true });

  if (limite) consulta = consulta.range(inicio, inicio + limite - 1);

  const { data, error, count } = await consulta;
  if (error) throw error;
  if (!limite) return data || [];
  return { alunos: data || [], total: count ?? 0 };
}

async function listarAlunosDoCurso(cursoId, opcoes = {}) {
  return listarAlunos({ ...opcoes, cursoId });
}

async function buscarPorRa(ra) {
  const { data, error } = await supabase.from('alunos').select(COLUNAS_ALUNO).eq('ra', ra).maybeSingle();
  if (error) throw error;
  return data;
}

async function buscarPorNome(parteNome) {
  const { data, error } = await supabase.from('alunos').select(COLUNAS_ALUNO).ilike('nome', `%${parteNome}%`).order('nome', { ascending: true });
  if (error) throw error;
  return data;
}

async function atualizarAluno(ra, nome, cursoId) {
  const campos = {};
  if (nome) campos.nome = nome;
  if (cursoId) campos.curso_id = cursoId;
  if (!Object.keys(campos).length) throw new Error('Informe nome e/ou curso para atualizar');

  const { data, error } = await supabase.from('alunos').update(campos).eq('ra', ra).select(COLUNAS_ALUNO);
  if (error) throw error;
  return data;
}

async function excluirPorRa(ra) {
  const { data, error } = await supabase.from('alunos').delete().eq('ra', ra).select();
  if (error) throw error;
  return data;
}

module.exports = {
  supabase,
  inserirCurso, listarCursos, excluirCurso,
  inserirAluno, listarAlunos, listarAlunosDoCurso,
  buscarPorRa, buscarPorNome, atualizarAluno,
  excluirPorRa, excluirAluno: excluirPorRa,
};