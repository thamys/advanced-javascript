# Promises em JavaScript - Guia Completo

Este guia cobre conceitos fundamentais e avançados sobre Promises em JavaScript, incluindo armadilhas comuns e melhores práticas.

---

## 📚 Índice

1. [O que é uma Promise](#o-que-é-uma-promise)
2. [Anatomia de uma Promise](#anatomia-de-uma-promise)
3. [Conceito Crítico: Execução Imediata](#conceito-crítico-execução-imediata)
4. [Estados de uma Promise](#estados-de-uma-promise)
5. [Para que serve o `await`](#para-que-serve-o-await)
6. [Concorrência vs Sequencial](#concorrência-vs-sequencial)
7. [Exemplos Práticos](#exemplos-práticos)
8. [Armadilhas Comuns](#armadilhas-comuns)

---

## O que é uma Promise

Uma **Promise** é um objeto que representa a eventual conclusão (ou falha) de uma operação assíncrona. É como uma "promessa" de que algo vai acontecer no futuro.

```javascript
const promise = new Promise((resolve, reject) => {
    // Operação assíncrona
    setTimeout(() => {
        resolve('Sucesso!');
    }, 1000);
});
```

---

## Anatomia de uma Promise

### 1) Criar uma Promise (executor function)

```javascript
new Promise((resolve, reject) => {
    // ⚡ ESTE CÓDIGO EXECUTA IMEDIATAMENTE!
    // Não espera .then() ou await - roda assim que a Promise é criada.

    console.log('Executando agora!'); // Isso aparece IMEDIATAMENTE

    // Operação assíncrona (setTimeout, fetch, etc)
    setTimeout(() => {
        resolve('Sucesso');  // Sinaliza sucesso (chama o .then)
        // ou
        reject('Erro');      // Sinaliza erro (chama o .catch)
    }, 1000);
});
```

**🔑 IMPORTANTE:** O corpo da Promise (executor function) executa **SINCRONAMENTE** na hora da criação. Apenas o `resolve`/`reject` é que acontece depois (assincronamente).

### 2) Consumir uma Promise

```javascript
promise
    .then(valor => {})      // Chamado quando resolve() é executado
    .catch(erro => {})      // Chamado quando reject() é executado
    .finally(() => {})      // Sempre executado no final
```

Ou com `async/await`:

```javascript
async function exemplo() {
    try {
        const valor = await promise;  // Espera a Promise resolver
        console.log(valor);
    } catch (erro) {
        console.error(erro);
    }
}
```

---

## Conceito Crítico: Execução Imediata

### ⚠️ O Problema

Quando você cria uma Promise, ela **EXECUTA IMEDIATAMENTE**:

```javascript
// ❌ PROBLEMA: O fetch é feito AGORA, não quando você usar await
const promiseUsuarios = fetch('/api/usuarios');

// ... 100 linhas depois...

const usuarios = await promiseUsuarios;  // Só pega o resultado (fetch não roda aqui)
```

### 🚨 Consequência: Dados Desatualizados

Se você chamar a mesma Promise múltiplas vezes, o fetch **NÃO é refeito**:

```javascript
const promiseUsuarios = fetch('/api/usuarios');  // Fetch feito AGORA

// Todas as chamadas abaixo usam o MESMO resultado:
await promiseUsuarios;  // Usa o resultado do fetch original
await promiseUsuarios;  // Usa o MESMO resultado (não faz novo fetch!)
await promiseUsuarios;  // Ainda o MESMO resultado!

// Se os dados mudaram no servidor, você NÃO verá as atualizações!
```

### ✅ A Solução: Funções que Retornam Promises

Em vez de criar a Promise diretamente, crie uma **função** que retorna a Promise:

```javascript
// ✅ CORRETO: Função que retorna uma Promise (execução sob demanda)
const getUsuarios = () => fetch('/api/usuarios');

// Nada foi executado ainda!

// ... 100 linhas depois...

await getUsuarios();  // AGORA faz o fetch
await getUsuarios();  // Faz OUTRO fetch (nova requisição!)
await getUsuarios();  // Faz OUTRO fetch (nova requisição!)
```

### 📊 Comparação: Eager vs Lazy

| Tipo | Quando Executa | Múltiplas Chamadas | Uso |
|------|----------------|-------------------|-----|
| **Promise direta** (eager) | IMEDIATAMENTE ao criar | Retorna o mesmo resultado | Cache de resultado único |
| **Função → Promise** (lazy) | Quando a função é CHAMADA | Executa novamente cada vez | Operações sob demanda |

### 💡 Exemplo Prático Completo

```javascript
// ❌ ERRADO: Execução imediata
async function buscarDadosErrado() {
    // As 3 chamadas são feitas IMEDIATAMENTE (ao criar as Promises)
    const promiseUser = fetch('/api/user/1');
    const promisePosts = fetch('/api/posts');
    const promiseComments = fetch('/api/comments');

    // Aqui só estamos pegando os resultados (já foram buscados)
    const user = await promiseUser;
    const posts = await promisePosts;
    const comments = await promiseComments;
}

// ✅ CORRETO: Execução sob demanda
async function buscarDadosCerto() {
    // Funções que retornam Promises (nada executa ainda)
    const getUser = () => fetch('/api/user/1');
    const getPosts = () => fetch('/api/posts');
    const getComments = () => fetch('/api/comments');

    // Agora SIM, cada fetch é feito quando chamamos a função
    const user = await getUser();      // Fetch do user
    const posts = await getPosts();    // Fetch dos posts
    const comments = await getComments(); // Fetch dos comments
}

// ✅ CORRETO: Criando inline (sem variável)
async function buscarDadosMelhor() {
    // Criamos as Promises QUANDO precisamos
    const user = await fetch('/api/user/1');
    const posts = await fetch('/api/posts');
    const comments = await fetch('/api/comments');
}
```

---

## Estados de uma Promise

Uma Promise pode estar em 3 estados:

| Estado | Significado | Pode mudar para |
|--------|-------------|-----------------|
| **pending** | Aguardando (em andamento) | fulfilled ou rejected |
| **fulfilled** | Resolvida com sucesso | - (estado final) |
| **rejected** | Rejeitada com erro | - (estado final) |

```javascript
const promise = new Promise((resolve) => {
    setTimeout(() => resolve('Pronto!'), 1000);
});

// t=0ms:    promise está "pending"
// t=1000ms: promise está "fulfilled" com valor "Pronto!"
```

---

## Para que serve o `await`

O `await` **espera a Promise mudar de "pending" para "fulfilled" ou "rejected"**.

### Caso 1: Promise JÁ resolvida (fulfilled)

```javascript
const p = new Promise((resolve) => resolve('imediato'));

// A Promise JÁ está fulfilled
const resultado = await p;  // Retorna INSTANTANEAMENTE (não espera)
console.log(resultado);  // 'imediato'
```

### Caso 2: Promise PENDENTE (pending)

```javascript
const p = new Promise((resolve) => {
    setTimeout(() => resolve('depois'), 1000);
});

// A Promise está PENDING (aguardando)
const resultado = await p;  // ESPERA 1 segundo até o resolve
console.log(resultado);  // Só aparece depois de 1 segundo
```

### Resumo: O que `await` faz

| Situação | O que `await` faz |
|----------|-------------------|
| Promise já resolvida (fulfilled) | Retorna o valor **instantaneamente** |
| Promise pendente (pending) | **ESPERA** até resolver, depois retorna o valor |
| Promise rejeitada (rejected) | **Lança um erro** (pode ser capturado com try/catch) |

**⚠️ IMPORTANTE:** `await` **NÃO executa** a Promise. Ele apenas **espera ela terminar** (se ainda não terminou) e **pega o resultado**.

---

## Concorrência vs Sequencial

### Execução CONCORRENTE (paralela)

Todas as Promises começam ao mesmo tempo:

```javascript
async function concorrente() {
    // Todas começam JUNTAS
    const [user, posts, comments] = await Promise.all([
        fetch('/api/user'),
        fetch('/api/posts'),
        fetch('/api/comments'),
    ]);

    // Tempo total = tempo da mais lenta (~1 segundo se todas levam 1s)
}
```

**Características:**
- ✅ Mais rápido (execução paralela)
- ✅ Ideal quando as operações são independentes
- ❌ Se uma falhar, todas falham (Promise.all rejeita imediatamente)

### Execução SEQUENCIAL (uma após a outra)

Cada Promise só começa quando a anterior termina:

```javascript
async function sequencial() {
    // Uma por vez
    const user = await fetch('/api/user');       // Espera terminar
    const posts = await fetch('/api/posts');     // Só então começa
    const comments = await fetch('/api/comments'); // Só então começa

    // Tempo total = soma de todas (~3 segundos se cada uma leva 1s)
}
```

**Características:**
- ✅ Ideal quando uma operação DEPENDE da anterior
- ✅ Mais controle sobre a ordem de execução
- ❌ Mais lento (espera sequencial)

### Quando usar cada um?

| Use Promise.all (CONCORRENTE) | Use await sequencial |
|-------------------------------|---------------------|
| Operações independentes | Uma operação depende da outra |
| Otimizar tempo total | Manter ordem específica |
| Buscar dados de 3 APIs diferentes | Autenticar → depois buscar dados do usuário |
| Processar múltiplos arquivos | Salvar usuário → depois salvar endereço |

---

## Exemplos Práticos

### Exemplo 1: Buscar dados de múltiplas APIs (Concorrente)

```javascript
async function buscarDadosDashboard() {
    console.time('total');

    // Todas as requisições começam AO MESMO TEMPO
    const [usuarios, vendas, produtos] = await Promise.all([
        fetch('/api/usuarios').then(r => r.json()),
        fetch('/api/vendas').then(r => r.json()),
        fetch('/api/produtos').then(r => r.json()),
    ]);

    console.timeEnd('total');  // ~1 segundo (tempo da mais lenta)

    return { usuarios, vendas, produtos };
}
```

### Exemplo 2: Fluxo de autenticação (Sequencial)

```javascript
async function fazerLogin(email, senha) {
    // 1. Autentica o usuário
    const { token } = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha })
    }).then(r => r.json());

    // 2. Só DEPOIS de autenticar, busca os dados (precisa do token)
    const usuario = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json());

    // 3. Só DEPOIS de ter os dados, busca as preferências
    const preferencias = await fetch(`/api/usuarios/${usuario.id}/preferencias`, {
        headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json());

    return { token, usuario, preferencias };
}
```

### Exemplo 3: Processar dados em lote

```javascript
async function processarPedidos(pedidosIds) {
    // Concorrente: processa todos ao mesmo tempo
    const resultados = await Promise.all(
        pedidosIds.map(id => processarPedido(id))
    );

    return resultados;
}

async function processarPedidosSequencial(pedidosIds) {
    // Sequencial: processa um por vez
    const resultados = [];
    for (const id of pedidosIds) {
        const resultado = await processarPedido(id);
        resultados.push(resultado);
    }

    return resultados;
}
```

---

## Armadilhas Comuns

### ❌ Armadilha 1: Criar Promises antes do loop

```javascript
// ❌ ERRADO: Promises já começam a executar ANTES do loop
const promises = [
    fetch('/api/1'),  // Começa AGORA
    fetch('/api/2'),  // Começa AGORA
    fetch('/api/3'),  // Começa AGORA
];

// Mesmo que você use await em loop, elas JÁ estão executando
for (const p of promises) {
    await p;  // Só pega o resultado (não controla a execução)
}
```

```javascript
// ✅ CORRETO: Criar as Promises DENTRO do loop
for (const id of [1, 2, 3]) {
    await fetch(`/api/${id}`);  // Cria E aguarda uma por vez
}
```

### ❌ Armadilha 2: Esquecer de retornar no `.then()`

```javascript
// ❌ ERRADO: Não retorna o valor processado
fetch('/api/user')
    .then(response => response.json())
    .then(user => {
        console.log(user.name);  // Faz o log mas não retorna
    })
    .then(resultado => {
        console.log(resultado);  // undefined!
    });

// ✅ CORRETO: Retornar o valor
fetch('/api/user')
    .then(response => response.json())
    .then(user => {
        console.log(user.name);
        return user;  // Retorna para o próximo .then()
    })
    .then(resultado => {
        console.log(resultado);  // { id: 1, name: '...' }
    });
```

### ❌ Armadilha 3: Não tratar erros

```javascript
// ❌ ERRADO: Se falhar, erro não é tratado
await fetch('/api/dados');

// ✅ CORRETO: Tratar erros
try {
    await fetch('/api/dados');
} catch (erro) {
    console.error('Erro ao buscar dados:', erro);
}

// Ou com .catch()
fetch('/api/dados')
    .then(response => response.json())
    .catch(erro => console.error('Erro:', erro));
```

### ❌ Armadilha 4: Usar `forEach` com async/await

```javascript
// ❌ ERRADO: forEach não espera Promises
[1, 2, 3].forEach(async (id) => {
    await fetch(`/api/${id}`);
});
console.log('Fim');  // Aparece ANTES dos fetches terminarem!

// ✅ CORRETO: Usar for...of
for (const id of [1, 2, 3]) {
    await fetch(`/api/${id}`);
}
console.log('Fim');  // Aparece DEPOIS de todos os fetches
```

---

## 🎯 Resumo Final

| Conceito | Regra de Ouro |
|----------|---------------|
| **Execução** | Promises executam IMEDIATAMENTE ao serem criadas |
| **Controle** | Use funções que retornam Promises para controlar QUANDO executar |
| **await** | Espera a Promise resolver (se pendente) ou pega o valor (se resolvida) |
| **Concorrente** | Promise.all para operações independentes (mais rápido) |
| **Sequencial** | await em sequência para operações dependentes (mais controle) |
| **Erros** | Sempre use try/catch ou .catch() para tratar erros |

---

## 📖 Arquivos de Estudo

- **`concurrency.js`** - Demonstração prática de Promise.all vs await sequencial

---

**Material de estudo criado para ensino de JavaScript moderno e boas práticas com Promises.**
