# Prompt de handoff para o Cursor

Cole o bloco abaixo no chat do Cursor (modo Agent), com a pasta do projeto
aberta. Ele executa **uma task por vez** e para para você revisar.

As Fases 0 a 3 já foram implementadas e commitadas, e as três primeiras fases do
jogo já são jogáveis do começo ao fim. Este prompt entrega a Fase 4.

---

```
Você vai continuar o jogo Math Runner. As Fases 0 a 3 já estão implementadas e
commitadas neste repositório. Leia estes dois documentos ANTES de escrever
qualquer linha de código:

1. `SPEC.md` — o design do jogo (o "porquê" de cada decisão)
2. `docs/superpowers/plans/2026-08-16-math-runner-fase-4-som-efeitos-e-guardiao.md`

O plano tem 10 tasks. Execute NA ORDEM — elas dependem umas das outras:
o `playSfx` da Task 1 é usado da Task 3 em diante, o `burst` da Task 2 aparece
na 3, 5 e 8, e as fases da Task 9 usam a ventania da Task 8.

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
base atual, arquivo por arquivo. Não "melhore" enquanto copia.

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
- **Nenhuma dependência nova.** A Fase 4 inteira — som, partículas, confete,
  voo — usa só o que já está no `package.json`. O áudio é sintetizado em
  WebAudio de propósito: nada de baixar arquivo de som, nada de biblioteca de
  áudio, nada de tocar som de CDN.
- Separação de arquivos React: `Component.tsx` / `.styles.ts` / `.hooks.ts` /
  `.types.ts`. Zero lógica dentro do JSX — extraia para hooks.
- Estado global via Zustand. Não instale TanStack Query (não existe server
  state neste projeto).
- **Nunca renderize UI dentro do Phaser.** Menus, HUD, card da conta, tela de
  resultado e botões são React/HTML. Exceção única, já existente: o balão da
  tecla `E` que flutua acima do Painel de Cálculo é objeto de mundo. Nada além
  disso — o botão de mudo e os corações são React, no HUD.
- Não crie abstração "para o futuro": nada de interface com uma implementação
  só, factory, ou config para valor que nunca muda.
- Commits em português, um por task, prefixo `feat:` / `test:` / `chore:` /
  `fix:` / `docs:`.
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

## Três coisas que você não pode fazer

1. **O brasão é do jogo, desenhado do zero** — é o componente
   `src/app/Portrait/Crest.tsx`, com escudo, raiz quadrada estilizada e as
   letras `EC`. Não reproduza, não copie e não se inspire em brasão de governo,
   de estado ou de secretaria de educação de verdade, e não importe imagem de
   brasão para dentro do projeto. Se encontrar um `src/assets/brasao-rj.png` ou
   um `import` dele em `Title.tsx`, **pare e me avise** — não é para estar aí.

2. **Não mexa em `GAME_FEEL`.** Os limites de alcance das plataformas
   (`SAFE_STEP`, `SAFE_GAP`, e agora `FLIGHT_STEP` e `FLIGHT_GAP`) são
   derivados dele, e as cinco fases foram desenhadas contra esses números.
   Mudar o pulo desloca todos os limites de uma vez. Se alguma coisa parecer
   pedir uma calibragem do pulo, pare e me pergunte.

3. **Não relaxe o teste de alcance para fazer uma fase passar.** Se
   `tests/game/reach.test.ts` reprovar uma fase, quem está errada é a
   geometria da fase — mexa nas coordenadas, nunca no teste. Esse teste existe
   porque a 1-1 nasceu com uma plataforma 6 px acima do alcance máximo,
   impossível de pisar, e ninguém percebeu olhando.

## O que importa nesta fase

O entregável é o jogo deixar de ser uma demonstração e virar um jogo: cinco
fases, som, comemoração no fim, e as quatro operações aparecendo de verdade.

Três coisas do plano que não são detalhe:

- **A Task 6 é conserto de bug, não enfeite.** A escada de blocos cresce um
  bloco por unidade da resposta e hoje não tem teto. Com a dificuldade
  adaptativa da Task 4 ligada, um `99 + 99` constrói 198 degraus e quase
  8000 px de escada atravessando a fase. Não pule, e não deixe para depois da
  Task 4 sem perceber que a Task 4 é justamente o que arma o problema.

- **Errar num mecanismo do cenário continua não punindo.** A conta segue
  aberta, a tela treme, e no segundo erro seguido a dica em fichas aparece.
  Só o guardião do modo Aventura tira coração — e perder os três devolve o
  jogador à bandeira com os corações cheios, nunca ao começo da fase.

- **A divisão é sempre exata e nenhuma conta dá resultado negativo.** Já tem
  teste rodando mil contas de cada combinação. Ao espalhar `−`, `×` e `÷` pelas
  fases na Task 7, isso não pode regredir.

## Uma dívida conhecida, para você não me surpreender

`src/game/scenes/LevelScene.ts` está com 233 linhas e a regra do projeto é 200.
Este plano faz ele crescer mais (comemoração, guardiões, ventania). Não
reestruture por conta própria no meio do caminho — mas quando terminar a
Task 9, me avise e proponha a extração da montagem dos mecanismos para um
`src/game/scenes/buildLevel.ts`. Aí decidimos juntos.

Comece anunciando a Task 1 e me mostrando o que vai fazer.
```

---

## Depois que o Cursor terminar

Rode você mesmo antes de aprovar:

```bash
npx tsc -b && npx oxlint src tests && npx vitest run && npm run build
```

E confira à mão, com o jogo aberto (`npm run dev`). A lista completa está no
**Step 4 da Task 10** do plano — áudio, partículas, fim de fase, contas,
dificuldade adaptativa, ventania, as cinco fases, o guardião e o celular.

Os três itens que eu olharia primeiro, porque são os que provam que a fase
funcionou:

- [ ] A tela de fases mostra **cinco** cartões
- [ ] Na 1-4, acertar a conta abre o redemoinho e dá para **voar** até a laje
- [ ] Uma resposta grande nos blocos para no oitavo degrau — não atravessa o
      terraço nem sai da tela
