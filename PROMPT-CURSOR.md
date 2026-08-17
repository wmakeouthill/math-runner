# Prompt de handoff para o Cursor

Cole o bloco abaixo no chat do Cursor (modo Agent), com a pasta do projeto
aberta. Ele executa **uma task por vez** e para para você revisar.

As Fases 0 a 4 já foram implementadas e commitadas: as cinco fases do Mundo 1
são jogáveis do começo ao fim, com som, partículas, comemoração na porta,
dificuldade adaptativa e guardião no modo Aventura. Este prompt entrega a
Fase 5, que é a fase de **variedade** — tirar a sensação de que as cinco fases
são a mesma fase.

---

```
Você vai continuar o jogo Math Runner. As Fases 0 a 4 já estão implementadas e
commitadas neste repositório. Leia estes dois documentos ANTES de escrever
qualquer linha de código:

1. `SPEC.md` — o design do jogo (o "porquê" de cada decisão)
2. `docs/superpowers/plans/2026-08-16-math-runner-fase-5-variedade-e-dificuldade.md`

O plano tem 8 tasks, numeradas de 0 a 7. Execute NA ORDEM — elas dependem umas
das outras:

- a **Task 0** é refatoração e vem primeiro de propósito: ela tira a montagem
  do mundo de dentro da `LevelScene`, e as Tasks 2 e 3 mexem justamente nessa
  montagem. Fazer na ordem inversa significa editar um `create()` de 359 linhas.
- o `effectiveTier` da Task 2 é usado na Task 4
- o `FolkKind` da Task 3 é usado na Task 4
- as fases da Task 6 dependem das coordenadas dos monstros da Task 3

## Como trabalhar

Execute o plano TASK POR TASK, na ordem. Para cada task:

1. Anuncie qual task está começando.
2. Execute os steps na ordem exata em que estão escritos. Onde houver step de
   teste, ele vem ANTES da implementação — não inverta, não pule o step de
   "rode e confirme que falha". Se um teste passar antes da implementação
   existir, o teste está errado: conserte o teste.
3. Rode os comandos indicados e me mostre a saída real. Não diga que passou
   sem ter rodado.
4. Faça o commit indicado no fim da task.
5. **PARE e me peça revisão.** Não comece a próxima task até eu responder.

O código dentro do plano é para ser usado como está. Ele foi conferido contra a
base atual, arquivo por arquivo — inclusive as coordenadas das plataformas
novas, que foram calculadas contra `SAFE_STEP` e `SAFE_GAP`. Não "melhore"
enquanto copia.

Se um step não funcionar (API diferente, erro de tipo, comando que falha),
NÃO improvise silenciosamente: pare, me explique o que quebrou e proponha a
correção. Eu decido.

## O comando de lint deste projeto

`npm run lint` está quebrado neste ambiente e falha sem motivo. Use:

    npx oxlint src tests

O portão de cada task é: `npx tsc -b` && `npx oxlint src tests` && `npx vitest run`.

## Regras inegociáveis (valem em todas as tasks)

- TypeScript `strict: true`. **`any` é proibido**, inclusive em testes.
- `noUncheckedIndexedAccess` está ligado: `array[i]` é `T | undefined`. Trate
  o caso, não use `!`.
- `erasableSyntaxOnly` está ligado: **não existe parameter property**.
  `constructor(private readonly x: number)` não compila. Declare o campo e
  atribua no corpo do construtor.
- **Sem backend, sem banco, sem login.** Persistência só em `localStorage`.
- **Nenhuma dependência nova.** Os cinco cenários e os cinco monstros do
  folclore são primitivas do Phaser desenhadas em runtime, de propósito: nada
  de tileset, nada de spritesheet baixado, nada de asset de CDN. Se você se vir
  querendo baixar uma imagem, parou de seguir o plano.
- **Toda cor sai de `src/theme/palette.ts`.** Nunca escreva hex à mão fora
  dali. O `PALETTE.saci` já existe — não crie um segundo vermelho para ele.
- Separação de arquivos React: `Component.tsx` / `.styles.ts` / `.hooks.ts` /
  `.types.ts`. Zero lógica dentro do JSX — extraia para hooks.
- Estado global via Zustand. Não instale TanStack Query (não existe server
  state neste projeto).
- **Nunca renderize UI dentro do Phaser.** Menus, HUD, card da conta, tela de
  resultado, corações e o seletor de dificuldade são React/HTML. Exceção única,
  já existente: o balão da tecla `E` que flutua acima do Painel de Cálculo é
  objeto de mundo. Nada além disso.
- Não crie abstração "para o futuro": nada de interface com uma implementação
  só, factory, ou config para valor que nunca muda.
- Commits em português, um por task, prefixo `feat:` / `test:` / `chore:` /
  `fix:` / `docs:` / `refactor:`.
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
- Dificuldades: `Fácil`, `Médio`, `Difícil`

## Três coisas que você não pode fazer

1. **Não mexa na identidade visual do cabeçalho.** O que está em `Title.tsx`
   hoje é decisão fechada do dono do projeto. Não troque, não substitua por
   outra imagem, não "padronize" e não importe brasão novo de lugar nenhum.
   Se algo ali parecer inconsistente, pare e me pergunte.

2. **Não mexa em `GAME_FEEL`.** Os limites de alcance das plataformas
   (`SAFE_STEP`, `SAFE_GAP`, `FLIGHT_STEP`, `FLIGHT_GAP`) são derivados dele, e
   as cinco fases foram desenhadas contra esses números — inclusive os trechos
   novos da Task 6. Mudar o pulo desloca todos os limites de uma vez. Se alguma
   coisa parecer pedir uma calibragem do pulo, pare e me pergunte.

3. **Não relaxe o teste de alcance para fazer uma fase passar.** Se
   `tests/game/reach.test.ts` reprovar uma fase, quem está errada é a
   geometria da fase — mexa nas coordenadas, nunca no teste. Esse teste existe
   porque a 1-1 nasceu com uma plataforma 6 px acima do alcance máximo,
   impossível de pisar, e ninguém percebeu olhando.

## O que importa nesta fase

O problema que a Fase 5 resolve, em uma frase: **as cinco fases parecem a mesma
fase**. Mesmo cenário nas cinco, mesmo monstro nas cinco, e todas acabam rápido
demais.

Quatro pontos do plano que não são detalhe:

- **A Task 0 é dívida, não enfeite.** `LevelScene.ts` está com 359 linhas e o
  teto do projeto é 200. É refatoração pura: **nenhum teste pode mudar**. Se
  você precisar ajustar um teste para ela passar, o corte saiu do lugar errado
  — pare e me mostre.

- **A escada de blocos muda de regra na Task 1.** Hoje ela cresce um bloco por
  unidade da resposta; passa a ser a fase que declara de 2 a 4 degraus, e a
  conta certa só dispara. Isso apaga `MAX_BLOCK_STEPS` e `MIN_ANSWER` do código
  e apaga o teste do `MIN_ANSWER` de `mathEngine.test.ts`. **Apagar é parte da
  task** — não deixe os dois vivos "por segurança".

- **A dificuldade escolhida e a adaptativa convivem.** A adaptativa mede o
  aluno, a escolhida é a decisão dele. `effectiveTier` combina as duas e é a
  ÚNICA porta: nenhum lugar do código pode continuar fazendo
  `Math.max(spec.tier, playerTier[op])` na mão depois da Task 2. São dois
  lugares na `LevelScene` — o `openChallenge` e o laço dos guardiões.

- **Cenário não tem teste que prove que ficou bonito.** A Task 5 é a única com
  um step de olhar: abra as cinco fases lado a lado e confirme que dá para
  saber em qual você está sem ler o nome. Se não der, o cenário não ficou
  pronto, mesmo com o teste verde.

Comece anunciando a Task 0 e me mostrando o que vai fazer.
```

---

## Depois que o Cursor terminar

Rode você mesmo antes de aprovar:

```bash
npx tsc -b && npx oxlint src tests && npx vitest run && npm run build
wc -l src/game/scenes/LevelScene.ts
```

E confira à mão, com o jogo aberto (`npm run dev`). A lista completa está no
**Step 3 da Task 7** do plano — escada, dificuldade, folclore, cenários,
tamanho das fases e celular.

Os quatro itens que eu olharia primeiro, porque são os que provam que a fase
funcionou:

- [ ] As cinco fases têm céu, chão e enfeite diferentes — dá para saber onde
      você está sem ler o nome
- [ ] Aparecem Saci, Cuca, Boitatá e Boto, cada um cobrando a conta dele
- [ ] No Difícil as contas vêm bem maiores, o HUD mostra 2 corações e aparecem
      3 monstros por fase
- [ ] A escada de blocos tem sempre o tamanho do vão, não importa a resposta
