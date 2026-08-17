# Prompt de handoff para o Cursor

Cole o bloco abaixo no chat do Cursor (modo Agent), com a pasta do projeto
aberta. Ele executa **uma task por vez** e para para você revisar.

A Fase 0-1 já foi implementada. Este prompt entrega as duas próximas.

---

```
Você vai continuar o jogo Math Runner. A Fase 0-1 já está implementada e
commitada neste repositório. Leia estes documentos ANTES de escrever qualquer
linha de código:

1. `SPEC.md` — o design do jogo (o "porquê" de cada decisão)
2. `docs/superpowers/plans/2026-08-16-math-runner-fase-2-identidade-visual.md`
3. `docs/superpowers/plans/2026-08-16-math-runner-fase-3-desafios.md`

Execute os dois planos NA ORDEM: primeiro o da Fase 2 inteiro, depois o da
Fase 3. A Fase 3 usa a paleta criada na Task 1 da Fase 2 — começar pelo fim
não compila.

## Como trabalhar

Execute cada plano TASK POR TASK, na ordem. Para cada task:

1. Anuncie qual task está começando.
2. Execute os steps na ordem exata em que estão escritos. Onde houver step de
   teste, ele vem ANTES da implementação — não inverta, não pule o step de
   "rode e confirme que falha". Se um teste passar antes da implementação
   existir, o teste está errado: conserte o teste.
3. Rode os comandos indicados e me mostre a saída real. Não diga que passou
   sem ter rodado.
4. Faça o commit indicado no fim da task.
5. **PARE e me peça revisão.** Não comece a próxima task até eu responder.

O código dentro dos planos é para ser usado como está. Ele foi conferido
contra a base atual. Não "melhore" enquanto copia.

Se um step não funcionar (API diferente, erro de tipo, comando que falha),
NÃO improvise silenciosamente: pare, me explique o que quebrou e proponha a
correção. Eu decido.

## Regras inegociáveis (valem em todas as tasks)

- TypeScript `strict: true`. **`any` é proibido**, inclusive em testes.
- `noUncheckedIndexedAccess` está ligado: `array[i]` é `T | undefined`. Trate
  o caso, não use `!`.
- Nenhum arquivo passa de 200 linhas.
- **Sem backend, sem banco, sem login.** Persistência só em `localStorage`.
- Separação de arquivos React: `Component.tsx` / `.styles.ts` / `.hooks.ts` /
  `.types.ts`. Zero lógica dentro do JSX — extraia para hooks.
- Estado global via Zustand. **Não instale TanStack Query** (não existe server
  state neste projeto).
- **Nenhuma dependência nova.** Tudo nos dois planos usa o que já está no
  `package.json`. Se achar que falta uma, pergunte antes.
- **Nunca renderize UI dentro do Phaser.** Menus, HUD, card da conta e botões
  são React/HTML. Exceção única, escrita no plano da Fase 3: o balão da tecla
  que flutua acima do Painel de Cálculo é objeto de mundo e fica no Phaser.
  Nada além disso.
- Não crie abstração "para o futuro": nada de interface com uma implementação
  só, factory, ou config para valor que nunca muda.
- Commits em português, um por task, prefixo `feat:` / `test:` / `chore:` /
  `fix:`.
- **Commits sem trailer de coautoria.** Nada de `Co-Authored-By`, `Generated
  with`, emoji de ferramenta ou qualquer assinatura de IA — nem na mensagem de
  commit, nem em comentário de código, nem em README. O trabalho é do Junior e
  da Ana.

## Textos fixos que aparecem na tela (não invente, não traduza)

- Título: `MATH RUNNER`
- Subtítulo: `O Resgate dos Números`
- Alunos: `Junior · Ana`
- Escola: `Escola Euclides da Cunha — 2026`
- Personagens jogáveis: `Ana` e `Junior` (são os próprios autores do trabalho)
- Modos: `Aventura` (com monstros) e `Explorador` (sem monstros)

## Duas coisas que você não pode fazer

1. **O brasão é do jogo, desenhado do zero** — escudo, raiz quadrada
   estilizada e as letras `EC`, como está no código da Task 2 da Fase 2. Não
   reproduza, não copie e não se inspire em brasão de governo, de estado ou de
   secretaria de educação de verdade.
2. **Não mexa em `GAME_FEEL` sem rodar `npm run test`.** Os limites de alcance
   das plataformas são derivados dele. Mudar o pulo e não rodar o teste é como
   a fase 1-1 nasceu com uma plataforma impossível de pisar.

## O que importa em cada fase

**Fase 2 — identidade visual.** O entregável é a primeira impressão. A tela de
título é a primeira coisa que a professora vê, e hoje ela é uma coluna
centralizada com um retângulo branco no lugar do personagem. Tarefa visual não
tem teste automatizado que prove que ficou bonito: o portão é `npx tsc -b &&
npm run lint && npm run test` **mais** abrir o jogo e olhar. Olhe de verdade,
inclusive no modo celular do Chrome, em paisagem.

**Fase 3 — os desafios.** O entregável é o loop do jogo fechando pela primeira
vez: correr, esbarrar num buraco largo demais, achar o painel, responder a
conta, ver a ponte deitar e atravessar. Duas regras pedagógicas do `SPEC.md`
que não são detalhe:

- Errar num mecanismo do cenário **não pune**. A mesma conta continua aberta e,
  no segundo erro seguido, a dica em fichas aparece. Nada de perder vida aqui.
- A divisão é sempre exata e nenhuma conta dá resultado negativo. Tem teste
  rodando mil contas de cada combinação — ele existe por isso.

Comece anunciando a Task 1 da Fase 2 e me mostrando o que vai fazer.
```

---

## Depois que o Cursor terminar

Rode você mesmo antes de aprovar:

```bash
npm run test && npx tsc -b && npm run lint && npm run build
```

E confira à mão, com o jogo aberto (`npm run dev`):

**Fase 2 — tela de título e cenário**

- [ ] A tela de título tem duas colunas, não uma coluna centralizada
- [ ] O brasão aparece ao lado de `Escola Euclides da Cunha — 2026`
- [ ] Ana e Junior aparecem desenhados, de uniforme, e dá para ver a diferença
- [ ] O card escolhido tem borda destacada; o outro não
- [ ] Recarregar a página mantém personagem e modo escolhidos
- [ ] Em tela estreita (celular em pé) as duas colunas empilham sem cortar nada
- [ ] Dentro do jogo, o personagem é o que foi escolhido — não um retângulo
- [ ] O cenário tem céu, morros, muro e mangueiras, e as camadas se movem em
      velocidades diferentes quando você corre

**Fase 3 — os desafios**

- [ ] Existe um buraco que **não dá para pular** de jeito nenhum
- [ ] Chegando perto do painel, aparece o balão `E`
- [ ] `E` (ou `Enter`) abre a conta no rodapé, com o cenário visível atrás
- [ ] O personagem para de andar enquanto a conta está aberta
- [ ] Errar não tira nada: a mesma conta continua, a tela só treme
- [ ] No segundo erro seguido, as fichas douradas desenham a conta
- [ ] Acertar faz a ponte deitar com quique e o `?` virar `✓` dourado
- [ ] Depois da ponte, dá para atravessar o buraco andando
- [ ] As teclas `1`–`4` respondem sem precisar do mouse
- [ ] No celular, tocar o canto superior direito abre a conta
- [ ] Console do navegador limpo
