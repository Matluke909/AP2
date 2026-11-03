const tabelaCursos = document.getElementById('tabela-cursos');
const tabela = document.getElementById('tabela-alunos');
const msg = document.getElementById('msg');
const modal = document.getElementById('modal');
const modalTitulo = document.getElementById('modal-titulo');
const form = document.getElementById('form-aluno');
const inputNome = document.getElementById('nome');
const inputRa = document.getElementById('ra');
const selectCurso = document.getElementById('curso');
const filtroCurso = document.getElementById('filtro-curso');
const formCurso = document.getElementById('form-curso');
const inputNovoCurso = document.getElementById('novo-curso');
const alunosStatus = document.getElementById('alunos-status');
const sentinelaAlunos = document.getElementById('sentinela-alunos');

let modo = 'criar';
let raEditando = '';
let cursosCache = [];

const ALUNOS_POR_PAGINA = 5;
let alunosInicio = 0;
let alunosTotal = 0;
let alunosTemMais = false;
let alunosCarregando = false;
let alunosPedido = 0;

function mostrarMsg(texto, tipo = '') {
  msg.hidden = false;
  msg.textContent = texto;
  msg.className = 'msg' + (tipo ? ' ' + tipo : '');
}

async function listarCursos() {
  const resposta = await fetch('/cursos');
  const cursos = await resposta.json();
  if (!resposta.ok) {
    mostrarMsg(cursos.erro || 'Erro ao listar cursos', 'erro');
    return;
  }
  montarTabelaCursos(cursos);
  preencherSelects(cursos);
}

function montarTabelaCursos(cursos) {
  if (!cursos.length) {
    tabelaCursos.innerHTML = '<tr><td colspan="3" class="vazio">Nenhum curso cadastrado ainda.</td></tr>';
    return;
  }
  tabelaCursos.innerHTML = '';
  for (const curso of cursos) {
    const tr = document.createElement('tr');
    
    const tdNome = document.createElement('td');
    tdNome.textContent = curso.nome;
    
    const tdTotal = document.createElement('td');
    tdTotal.textContent = curso.total_alunos;
    
    const tdAcoes = document.createElement('td');
    tdAcoes.className = 'acoes';
    
    const btnVer = document.createElement('button');
    btnVer.textContent = 'Ver alunos';
    btnVer.className = 'btn btn-secundario';
    btnVer.onclick = () => {
      filtroCurso.value = curso.id;
      alunosInicio = 0;
      listarAlunos(false);
    };
    
    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = 'Excluir';
    btnExcluir.className = 'btn btn-perigo';
    btnExcluir.onclick = () => excluirCurso(curso.id, curso.nome);
    
    tdAcoes.appendChild(btnVer);
    tdAcoes.appendChild(btnExcluir);
    
    tr.appendChild(tdNome);
    tr.appendChild(tdTotal);
    tr.appendChild(tdAcoes);
    tabelaCursos.appendChild(tr);
  }
}

function preencherSelects(cursos) {
  cursosCache = cursos;
  const filtroAtual = filtroCurso.value;
  const datalist = document.getElementById('lista-cursos');
  
  filtroCurso.innerHTML = '<option value="">Todos os cursos</option>';
  if (datalist) datalist.innerHTML = '';
  
  for (const curso of cursos) {
    filtroCurso.appendChild(new Option(curso.nome, curso.id));
    if (datalist) datalist.appendChild(new Option(curso.nome, curso.nome));
  }
  
  filtroCurso.value = filtroAtual;
  if (filtroCurso.selectedIndex === -1) filtroCurso.value = '';
}

async function adicionarCurso(evento) {
  evento.preventDefault();
  const nome = inputNovoCurso.value.trim();
  const resposta = await fetch('/cursos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome }),
  });
  const dados = await resposta.json();
  if (!resposta.ok) {
    mostrarMsg(dados.erro || 'Erro ao cadastrar curso', 'erro');
    return;
  }
  inputNovoCurso.value = '';
  mostrarMsg(`Curso "${dados.nome}" cadastrado!`, 'ok');
  listarCursos();
}

async function excluirCurso(id, nome) {
  if (!confirm(`Excluir o curso "${nome}"?`)) return;
  const resposta = await fetch('/cursos/' + id, { method: 'DELETE' });
  const dados = await resposta.json();
  if (!resposta.ok) {
    mostrarMsg(dados.erro || 'Erro ao excluir curso', 'erro');
    return;
  }
  mostrarMsg('Curso excluído.', 'ok');
  atualizarTudo();
}

function abrirModalCriar() {
  modo = 'criar';
  raEditando = '';
  modalTitulo.textContent = 'Novo aluno';
  form.reset();
  if (filtroCurso.value) {
    const cursoSelecionado = cursosCache.find(c => String(c.id) === String(filtroCurso.value));
    if (cursoSelecionado) selectCurso.value = cursoSelecionado.nome;
  }
  inputRa.disabled = false;
  modal.hidden = false;
  inputNome.focus();
}

function abrirModalEditar(aluno) {
  modo = 'editar';
  raEditando = aluno.ra;
  modalTitulo.textContent = 'Editar aluno';
  inputNome.value = aluno.nome || '';
  inputRa.value = aluno.ra || '';
  selectCurso.value = aluno.curso ? aluno.curso.nome : '';
  inputRa.disabled = true;
  modal.hidden = false;
  inputNome.focus();
}

function fecharModal() {
  modal.hidden = true;
  form.reset();
  inputRa.disabled = false;
}

function linhaAluno(aluno) {
  const tr = document.createElement('tr');
  
  const tdNome = document.createElement('td');
  tdNome.textContent = aluno.nome;
  
  const tdRa = document.createElement('td');
  tdRa.textContent = aluno.ra;
  
  const tdCurso = document.createElement('td');
  tdCurso.textContent = aluno.curso ? aluno.curso.nome : '';
  
  const tdAcoes = document.createElement('td');
  tdAcoes.className = 'acoes';
  
  const btnEditar = document.createElement('button');
  btnEditar.textContent = 'Editar';
  btnEditar.className = 'btn btn-secundario';
  btnEditar.onclick = () => abrirModalEditar(aluno);
  
  const btnExcluir = document.createElement('button');
  btnExcluir.textContent = 'Excluir';
  btnExcluir.className = 'btn btn-perigo';
  btnExcluir.onclick = () => excluirAluno(aluno.ra, aluno.nome);
  
  tdAcoes.appendChild(btnEditar);
  tdAcoes.appendChild(btnExcluir);
  
  tr.appendChild(tdNome);
  tr.appendChild(tdRa);
  tr.appendChild(tdCurso);
  tr.appendChild(tdAcoes);
  return tr;
}

async function listarAlunos(acrescentar = false) {
  if (acrescentar && (alunosCarregando || !alunosTemMais)) return;
  
  const pedido = ++alunosPedido;
  const inicio = acrescentar ? alunosInicio : 0;
  
  alunosCarregando = true;
  atualizarStatus();
  
  const cursoId = filtroCurso.value;
  const base = cursoId ? `/cursos/${cursoId}/alunos` : '/alunos';
  const url = `${base}?inicio=${inicio}&limite=${ALUNOS_POR_PAGINA}`;
  
  try {
    const resposta = await fetch(url);
    const dados = await resposta.json();
    
    if (pedido !== alunosPedido) return;
    
    if (!resposta.ok) {
      mostrarMsg(dados.erro || 'Erro ao listar alunos', 'erro');
      if (!acrescentar) tabela.innerHTML = '<tr><td colspan="4" class="vazio">Não foi possível carregar a lista.</td></tr>';
      return;
    }
    
    const listaAlunos = Array.isArray(dados) ? dados : (dados.alunos || []);
    alunosTotal = Array.isArray(dados) ? listaAlunos.length : (dados.total || 0);
    
    if (!acrescentar) {
      tabela.innerHTML = '';
    }
    
    if (!listaAlunos.length && !acrescentar) {
      tabela.innerHTML = '<tr><td colspan="4" class="vazio">Nenhum aluno encontrado.</td></tr>';
      alunosTemMais = false;
      atualizarStatus();
      return;
    }
    
    for (const aluno of listaAlunos) {
      tabela.appendChild(linhaAluno(aluno));
    }
    
    alunosInicio = inicio + listaAlunos.length;
    alunosTemMais = !Array.isArray(dados) && (alunosInicio < alunosTotal);
    
  } catch (err) {
    if (pedido === alunosPedido) {
      mostrarMsg('Erro de rede ao listar alunos', 'erro');
    }
  } finally {
    if (pedido === alunosPedido) {
      alunosCarregando = false;
      atualizarStatus();
      pedirMaisSeVisivel();
    }
  }
}

function atualizarStatus() {
  if (alunosCarregando && alunosInicio === 0) {
    alunosStatus.textContent = 'Carregando...';
    return;
  }
  if (alunosTotal === 0) {
    alunosStatus.textContent = 'Nenhum aluno para mostrar.';
    return;
  }
  const statusTexto = `Mostrando ${alunosInicio} de ${alunosTotal}.`;
  if (alunosTemMais) {
    alunosStatus.textContent = `${statusTexto} ${alunosCarregando ? 'Carregando mais...' : 'Role a tela para carregar mais.'}`;
  } else {
    alunosStatus.textContent = `${statusTexto} Fim da lista.`;
  }
}

function pedirMaisSeVisivel() {
  if (!alunosTemMais || alunosCarregando) return;
  const topo = sentinelaAlunos.getBoundingClientRect().top;
  if (topo < window.innerHeight + 160) {
    listarAlunos(true);
  }
}

async function salvarAluno(evento) {
  evento.preventDefault();
  const nome = inputNome.value.trim();
  const ra = inputRa.value.trim();
  const nomeCurso = selectCurso.value.trim();
  
  let cursoObj = cursosCache.find(c => c.nome.toLowerCase() === nomeCurso.toLowerCase());
  if (!cursoObj) {
    const respCurso = await fetch('/cursos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: nomeCurso }),
    });
    cursoObj = await respCurso.json();
    if (!respCurso.ok) {
      mostrarMsg(cursoObj.erro || 'Erro ao criar curso automaticamente', 'erro');
      return;
    }
  }
  const curso_id = cursoObj.id;
  
  if (modo === 'criar') {
    const resposta = await fetch('/alunos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, ra, curso_id }),
    });
    const dados = await resposta.json();
    if (!resposta.ok) {
      mostrarMsg(dados.erro || 'Erro ao cadastrar aluno', 'erro');
      return;
    }
    mostrarMsg('Aluno cadastrado com sucesso!', 'ok');
  } else {
    const resposta = await fetch('/alunos/' + encodeURIComponent(raEditando), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, curso_id }),
    });
    const dados = await resposta.json();
    if (!resposta.ok) {
      mostrarMsg(dados.erro || 'Erro ao atualizar aluno', 'erro');
      return;
    }
    mostrarMsg('Aluno atualizado com sucesso!', 'ok');
  }
  fecharModal();
  atualizarTudo();
}

async function excluirAluno(ra, nome) {
  if (!confirm(`Excluir o aluno "${nome}" (RA ${ra})?`)) return;
  const resposta = await fetch('/alunos/' + encodeURIComponent(ra), {
    method: 'DELETE',
  });
  const dados = await resposta.json();
  if (!resposta.ok) {
    mostrarMsg(dados.erro || 'Erro ao excluir aluno', 'erro');
    return;
  }
  mostrarMsg('Aluno excluído.', 'ok');
  atualizarTudo();
}

async function atualizarTudo() {
  await listarCursos();
  alunosInicio = 0;
  await listarAlunos(false);
}

document.getElementById('btn-novo').addEventListener('click', abrirModalCriar);
document.getElementById('btn-atualizar').addEventListener('click', atualizarTudo);
document.getElementById('btn-cancelar').addEventListener('click', fecharModal);
document.getElementById('modal-fundo').addEventListener('click', fecharModal);

form.addEventListener('submit', salvarAluno);
formCurso.addEventListener('submit', adicionarCurso);
filtroCurso.addEventListener('change', () => {
  alunosInicio = 0;
  listarAlunos(false);
});
window.addEventListener('scroll', pedirMaisSeVisivel);
window.addEventListener('resize', pedirMaisSeVisivel);

atualizarTudo();