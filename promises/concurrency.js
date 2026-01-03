/*
═══════════════════════════════════════════════════════════════════════
ESTUDO: Concorrência vs Sequencial com Promises
═══════════════════════════════════════════════════════════════════════
📖 Para teoria completa, veja: promises/README.md

⚠️ CONCEITO-CHAVE:
   - Promises EXECUTAM imediatamente ao serem criadas
   - MAS só retornam o resultado quando são RESOLVIDAS (resolve/reject)
   - await/then ESPERAM a Promise resolver para pegar o resultado

   Para controlar QUANDO executar, use funções que retornam Promises.
   Detalhes em: promises/README.md (seção "Execução Imediata")
*/

// Criando 3 Promises (todas começam a executar AGORA)
const promises = [
    // Promise 1: corpo executa agora, resolve após 1 segundo
    new Promise((resolve) => {
        console.log('Corpo da Promise 1: executa IMEDIATAMENTE ao criar a Promise');
        setTimeout(() => resolve('Promise 1'), 1000);
    }),

    // Promise 2 e 3: já resolvidas instantaneamente
    new Promise((resolve) => resolve('Promise 2')),
    new Promise((resolve) => resolve('Promise 3')),
];

// ═══════════════════════════════════════════════════════════════════════
// MODO 1: CONCORRENTE - Promise.all
// ═══════════════════════════════════════════════════════════════════════
// Executa todas ao mesmo tempo, espera TODAS terminarem
// Tempo total = tempo da mais lenta (~1000ms neste caso)
async function concorrente() {
    console.log('Concorrente (Promise.all)');
    console.time('concorrente');

    // Aguarda todas as Promises e loga conforme resolvem
    await Promise.all(promises.map(p => p.then(v => console.log(v + ' - concluída'))));

    console.timeEnd('concorrente');
}

// ═══════════════════════════════════════════════════════════════════════
// MODO 2: SEQUENCIAL - await em loop
// ═══════════════════════════════════════════════════════════════════════
// Aguarda cada Promise uma por vez
// ⚠️ PEGADINHA: Como as Promises foram criadas lá em cima, já estão resolvidas
// Por isso o tempo é ~0ms (não há espera real, só lê valores prontos)
async function sequencial() {
    console.log('Sequencial (await em loop)');
    console.time('sequencial');

    // Aguarda cada Promise individualmente (mas já estão resolvidas)
    console.log((await promises[0]) + ' - concluída');
    console.log((await promises[1]) + ' - concluída');
    console.log((await promises[2]) + ' - concluída');

    console.timeEnd('sequencial');
}

// Executa os dois modos
(async () => {
    await concorrente();  // ~1000ms
    await sequencial();   // ~0ms (valores já prontos)
})();

/*
═══════════════════════════════════════════════════════════════════════
💡 QUANDO USAR CADA ABORDAGEM:
═══════════════════════════════════════════════════════════════════════

✅ Use Promise.all (CONCORRENTE) quando:
   - As operações são independentes entre si
   - Você quer otimizar o tempo total de execução
   - Exemplo: buscar dados de 3 APIs diferentes simultaneamente

✅ Use await em loop (SEQUENCIAL) quando:
   - Uma operação DEPENDE do resultado da anterior
   - Você precisa manter uma ordem específica de execução
   - Exemplo: autenticar → depois buscar dados do usuário autenticado

⚠️  ATENÇÃO: Promises começam a executar assim que são criadas!
   Se criar todas antes e depois iterar, não será verdadeiramente sequencial.
   Veja exemplos completos em: promises/README.md
═══════════════════════════════════════════════════════════════════════
*/
