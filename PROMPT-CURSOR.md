# Prompt de handoff para o Cursor

Cole o bloco abaixo no chat do Cursor (modo Agent), com a pasta do projeto
aberta. Ele executa **uma task por vez** e para para você revisar.

---

```
Você vai implementar o jogo Math Runner seguindo dois documentos que já estão
neste repositório. Leia os dois ANTES de escrever qualquer linha de código:

1. `SPEC.md` — o design do jogo (o "porquê" de cada decisão)
2. `docs/superpowers/plans/2026-08-16-math-runner-fase-0-1.md` — o plano de
   implementação, com o código de cada passo

## Como trabalhar

Execute o plano TASK POR TASK, na ordem. Para cada task:

1. Anuncie qual task está começando.
2. Execute os steps na ordem exata em que estão escritos. Os steps de teste
   vêm ANTES da implementação — não inverta, não pule o step de "rodar o teste
   e confirmar que falha". Se um teste passar antes da implementação existir,
   o teste está errado: conserte o teste.
3. Rode os comandos indicados e me mostre a saída real. Não diga que passou
   sem ter rodado.
4. Faça o commit indicado no fim da task.
5. **PARE e me peça revisão.** Não comece a próxima task até eu responder.

Se um step do plano não funcionar (dependência com API diferente, erro de
tipo, comando que falha), NÃO improvise silenciosamente: pare, me explique o
que quebrou e proponha a correção. Eu decido.

## Regras inegociáveis (valem em todas as tasks)

- TypeScript `strict: true`. **`any` é proibido**, inclusive em testes.
- Nenhum arquivo passa de 200 linhas.
- **Sem backend, sem banco, sem login.** Persistência só em `localStorage`.
- Separação de arquivos React: `Component.tsx` / `.styles.ts` / `.hooks.ts` /
  `.types.ts`. Zero lógica dentro do JSX — extraia para hooks.
- Estado global via Zustand. **Não instale TanStack Query** (não existe server
  state neste projeto).
- **Nunca renderize UI dentro do Phaser.** Texto, botões, menus e HUD são
  React/HTML. O Phaser desenha só o mundo do jogo.
- Não adicione bibliotecas que não estejam no plano. Se achar que falta uma,
  pergunte antes.
- Não crie abstração "para o futuro": nada de interface com uma implementação
  só, factory, ou config para valor que nunca muda.
- Commits em português, um por task, prefixo `feat:` / `test:` / `chore:`.
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

## O que importa nesta fase

O entregável real da Fase 1 é **o pulo parecer bom**. Coyote time, jump buffer
e pulo variável não são detalhe de polimento — são o motivo da fase existir. A
lógica deles mora em `JumpController`, que é uma classe pura, sem Phaser, com
10 testes. Se você sentir vontade de mover essa lógica para dentro da cena do
Phaser, não mova: ela é testável justamente por estar fora.

Comece anunciando a Task 1 e me mostrando o que vai fazer.
```

---

## Depois que o Cursor terminar

Rode você mesmo antes de aprovar:

```bash
npm run test && npx tsc --noEmit && npm run build
```

E confira à mão, com o jogo aberto (`npm run dev`):

- [ ] Tela de título mostra `Junior · Ana` e `Escola Euclides da Cunha — 2026`
- [ ] Dá para escolher Ana ou Junior, e Aventura ou Explorador
- [ ] Recarregar a página mantém personagem e modo escolhidos
- [ ] Segurar o pulo sobe mais alto que um toque rápido
- [ ] Dá para pular logo depois de sair da beirada (coyote time)
- [ ] Apertar pulo pouco antes de aterrissar funciona ao encostar (jump buffer)
- [ ] Não dá pulo duplo
- [ ] No celular, dá para andar e pular ao mesmo tempo (multi-touch)
- [ ] Console sem aviso de instância duplicada do Phaser

O último item da lista de calibragem do plano é o mais importante e nenhum
teste cobre: **abra o jogo e ajuste `GAME_FEEL` até o pulo ficar gostoso.**
