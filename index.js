const { 
  listarCategorias, 
  listarFilmes, 
  inserirFilme, 
  moverFilme, 
  excluirFilme 
} = require('./supabase');

async function main() {
  try {
    const categorias = await listarCategorias();
    console.log('--- SUAS COLUNAS DO KANBAN ---');
    console.log(categorias);
    console.log('\n--- TENTANDO INSERIR FILME ---');
    try {
      const novo = await inserirFilme('Matrix', 'Ficção Científica', 4);
      console.log('Filme inserido com sucesso:', novo);
    } catch (e) {
      console.log('Não inseriu:', e.message || e);
    }

    console.log('\n--- LISTANDO TODOS OS FILMES ---');
    const todos = await listarFilmes();
    console.log(`Total de filmes: ${todos.length}`);
    console.dir(todos, { depth: null }); 

  } catch (err) {
    console.error('ERRO GERAL:', err.message || err);
  }
}

main();