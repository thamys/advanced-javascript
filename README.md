# advanced-javascript

Material de estudo sobre conceitos avançados de JavaScript.

---

## 📚 Promises

Estudo completo sobre Promises, incluindo execução imediata, concorrência vs sequencial, e armadilhas comuns.

### 📖 [Guia Completo de Promises](promises/README.md)

Documentação detalhada cobrindo:
- Anatomia de uma Promise
- **Conceito Crítico:** Execução Imediata vs Sob Demanda
- Estados de Promises
- Para que serve o `await`
- Concorrência vs Sequencial
- Exemplos práticos
- Armadilhas comuns

### 🧪 Exemplos Práticos

#### Promises: Concorrentes vs Sequenciais
- **Arquivo:** `promises/concurrency.js`
- **Descrição:** Demonstra a diferença entre Promise.all (paralelo) e await em loop (sequencial)

**Rodar:**
```bash
node promises/concurrency.js
```

**Output esperado:**
- Concorrente: tempo ≈ duração da tarefa mais lenta
- Sequencial: tempo ≈ 0ms (Promises já resolvidas - veja os comentários no código)

**⚠️ Conceito-chave:** Promises executam IMEDIATAMENTE ao serem criadas. Para controlar quando executar, use funções que retornam Promises.

---

## 🎯 Como usar este repositório

Cada pasta contém:
- Código comentado com explicações detalhadas
- README.md com teoria e exemplos
- Casos práticos do mundo real

**Sugestão de estudo:**
1. Leia o README da pasta
2. Execute o código
3. Experimente modificar e ver o resultado
4. Leia os comentários no código para entender cada parte