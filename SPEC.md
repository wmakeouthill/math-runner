# Math Runner: O Resgate dos Números

> Jogo de plataforma 2D educativo. A arma do jogador é a conta certa: ela
> abaixa pontes, faz nascer plataformas e **derrota monstros**. Web, joga no
> Chrome do PC e do celular, instalável como app via PWA.

- **Alunos:** Junior e Ana
- **Escola:** Escola Euclides da Cunha
- **Engine:** Phaser 3 (HTML5 / JavaScript)

---

## 1. Nome

**Escolhido:** `Math Runner: O Resgate dos Números`

Por quê: é a preferência de vocês, a pasta já se chama `math-runner`, e o par
"gancho em inglês + subtítulo em português" funciona bem tanto no ícone do
celular (`Math Runner`, curto) quanto na apresentação da escola (subtítulo
explica). Alternativas descartadas e o motivo:

| Nome | Por que não |
|---|---|
| Super Conta Land | Colado demais em Super Mario Land — problema se o trabalho for publicado |
| Pixel & Parênteses | Bonito, mas não comunica que é matemática básica |
| MathHop / SumJump | Bons, porém genéricos: já existem apps com esses nomes |
| Reino da Tabuada | Limita o escopo à multiplicação |

Ressalva honesta: "Runner" costuma indicar o gênero *endless runner* (correr
automático). Aqui é plataforma com controle total. Ninguém vai reclamar num
trabalho escolar, mas se quiser 100% de precisão de gênero, o subtítulo
resolve: **Math Runner: O Resgate dos Números — Aventura de Plataforma**.

---

## 2. Pilares de design

Três regras que decidem qualquer dúvida futura de design:

1. **A conta é o obstáculo, não uma prova.** Nada de "tela de quiz". A conta
   aparece num painel dentro do cenário, some rápido e o mundo reage.
2. **A resposta vira coisa física.** Respondeu 5 → nascem **5 blocos** de
   plataforma. Respondeu 3 → a ponte desce **3 níveis**. Esse é o "uau" do
   jogo: o número não é pontuação, é geometria do nível.
3. **Errar custa, mas nunca trava.** Existem dois contextos e eles são
   diferentes de propósito:
   - **Mecanismos do cenário** (ponte, blocos, elevador) → errar não pune.
     Balança o painel, mostra dica, tenta de novo. É onde se **aprende**.
   - **Monstros** → errar custa um coração. É onde se **testa** o que aprendeu.

   Em nenhum dos dois o jogo trava: depois de 2 erros seguidos aparece a dica
   visual e o monstro para de contra-atacar. Ninguém fica preso numa conta.

⚠️ **Mudança em relação ao conceito original.** A ideia inicial do Junior e da
Ana era "sem monstros, só obstáculos". A adição dos monstros (seção 4b) foi
decisão posterior — **confirmar com os dois**, o trabalho é deles.

---

## 3. Loop de jogo

```
correr/pular  →  caminho bloqueado  →  chegar no Painel de Cálculo
      ↑                                          ↓
   checkpoint  ←  avançar  ←  mecanismo anima  ←  responder
```

"Caminho bloqueado" é tanto um **mecanismo do cenário** (seção 4) quanto um
**monstro** (seção 4b) — os dois usam exatamente o mesmo card de conta. Muda só
a consequência do erro.

**Interação com o painel:** o jogador encosta e aperta ↑ (ou o botão de ação no
celular). Abre um card no rodapé da tela (não tela cheia — o cenário continua
visível atrás, isso mantém a sensação de fluxo). 4 botões grandes de resposta.

**Por que múltipla escolha e não digitar:** teclado virtual do celular cobre
metade da tela e leva ~400 ms pra abrir. Mata o ritmo. Nos mundos finais, um
teclado numérico *desenhado no jogo* (não o do sistema) libera a dificuldade
sem esse custo.

---

## 4. Mecanismos (os obstáculos)

| # | Mecanismo | O que a resposta controla | Mundo |
|---|---|---|---|
| 1 | **Ponte levantada** | Desce a ponte sobre o buraco | 1 |
| 2 | **Blocos-plataforma** | Nascem **N blocos**, N = resposta | 1 |
| 3 | **Portão numérico** | Abre o portão | 2 |
| 4 | **Elevador** | Sobe até a **altura N** | 3 |
| 5 | **Plataforma temporizada** | Fica sólida por **N segundos** | 4 |
| 6 | **Porta-chave da fase** | Conta maior, abre a saída | todos |

O mecanismo 2 e o 4 são os que fazem professor levantar a sobrancelha — a
resposta certa é literalmente medida em blocos/altura na tela. Priorize os dois.

---

## 4b. Monstros — os Guardiões dos Números

Monstros bloqueiam a passagem e só saem do caminho com a conta certa. **Não é
combate de ação:** eles não perseguem, não exigem timing nem reflexo. O monstro
é um obstáculo com risco — a habilidade testada é a matemática, não o polegar.

**Fluxo do confronto:**

```
chegar perto  →  monstro fecha a passagem, card da conta abre
                          │
            ┌─────────────┴─────────────┐
         ACERTOU                      ERROU
            │                           │
   golpe do jogador           contra-ataque: −1 coração
   monstro vira partículas    knockback curto para trás
   de dígitos, caminho livre  conta nova é sorteada, tenta de novo
```

**Sistema de vida:**

- **3 corações**, mostrados no HUD (canto superior esquerdo, React).
- Zerar os corações → volta ao **checkpoint** com os corações cheios.
  **Sem tela de "Game Over", sem contador global de vidas.** Perder tempo é a
  punição; humilhar quem errou conta, não.
- Corações recarregam ao tocar num checkpoint.
- Cair num buraco também custa um coração, mantendo a regra coerente.

**Válvula anti-frustração (obrigatória):** após **2 erros seguidos no mesmo
monstro**, a dica visual aparece e o monstro **para de contra-atacar** até o
jogador acertar. Sem isso, uma criança que travou no `7 × 8` entra em ciclo
infinito de dano — que é exatamente o oposto do objetivo do jogo. Este é o
detalhe que separa "educativo" de "castigo".

**Um guardião por mundo, todos do folclore brasileiro.** Não são vilões: são
figuras travessas que testam quem quer passar — o que combina com o tom do jogo
e evita monstro assustador numa escola. Folclore é domínio público, então não há
custo nem licença envolvida.

| Mundo | Guardião | Operação | Como aparece |
|---|---|---|---|
| 1 | **Saci-Pererê** | `+` | Chega num redemoinho, apoiado numa perna só, de gorro vermelho |
| 2 | **Cuca** | `−` | Sai de trás da barraca da feira, resmungando |
| 3 | **Boitatá** | `×` | Serpente de fogo que se ergue da fogueira da quadrilha |
| 4 | **Boto-cor-de-rosa** | `÷` | Emerge do rio, de chapéu branco |
| 5 | **Curupira** (chefe) | 3 contas mistas | Guardião da mata, pés virados para trás |

O Curupira pede **3 contas seguidas sem errar**; errar reinicia a sequência mas
**não** tira coração — o chefe testa constância, não resistência.

Bônus para a defesa do trabalho: o jogo vira interdisciplinar (matemática +
cultura brasileira) sem custo nenhum de desenvolvimento.

### Monstros são opcionais — escolha na tela inicial

Um botão na tela de título define o modo antes de começar. A escolha fica salva.

| Modo | Monstros | Corações | Para quem |
|---|---|---|---|
| **Aventura** *(padrão)* | ligados | 3 | Quem quer o jogo com risco |
| **Explorador** | desligados | — | Conceito original do Junior e da Ana: só obstáculos, zero punição |

No modo Explorador os guardiões simplesmente não nascem na fase; os mecanismos
do cenário continuam iguais e a fase continua completável e pontuável (o
requisito de estrela "zero erros" permanece). **Nenhuma fase pode depender de
derrotar um monstro para ser terminada** — essa é a regra de level design que
mantém os dois modos válidos, e vale para todas as fases.

Isso também serve de acessibilidade: quem travou pode desligar o risco e
continuar aprendendo, e o professor pode demonstrar o jogo sem tomar dano.

---

## 5. Progressão

Cada mundo é um **cenário brasileiro**, escolhido para que o tema explique a
operação sozinho:

| Mundo | Cenário | Operação | Por que combina |
|---|---|---|---|
| 1 | **Quintal da Escola** | `+` | Quadra, muro, mangueira, bola. Território conhecido — é o tutorial |
| 2 | **Feira Livre** | `−` | Barraca, caixote de fruta, **troco**. Subtração é literalmente dar o troco |
| 3 | **Festa Junina** | `×` | Bandeirinhas, fogueira, barraca de pescaria. "4 barracas × 6 bandeirinhas" |
| 4 | **Floresta Amazônica** | `÷` | Rio, vitória-régia como plataforma, cipó. Dividir = repartir |
| 5 | **Sertão — Ruínas de Euclides** | as 4 + parênteses | Caatinga, mandacaru, céu alaranjado, ruínas de pedra. Amarra com o nome da escola |

O Mundo 3 é o mais bonito de todos com pouco esforço: bandeirinhas coloridas em
3 camadas de parallax + a luz da fogueira. Se for fazer só um mundo caprichado
além do primeiro, faça esse.

**Escopo real:** entregue o **Mundo 1 completo e polido** como versão final.
Mundos 2–5 são a mesma engine com tilemap e operação trocadas — se der tempo,
entram; se não der, o Mundo 1 bem-feito impressiona muito mais que 25 fases
sem acabamento.

**Estrelas por fase** (3 no máximo):
- ⭐ terminou a fase
- ⭐ pegou todos os **dígitos dourados** espalhados
- ⭐ zero erros nas contas

---

## 5b. Personagens — Ana e Junior

Os dois personagens jogáveis **são o Junior e a Ana**. Eles não são só os
autores no rodapé dos créditos: são os heróis do jogo. É de graça de
implementar e é o detalhe que faz a turma reagir na apresentação.

Escolha na tela de título, antes de começar. A escolha fica salva.

**Diferença entre eles: nenhuma.** Mesma hitbox, mesma velocidade, mesmo pulo.
Só muda o sprite. Isso evita trabalho de balanceamento e evita passar a ideia de
que um dos dois é melhor.

### Uniforme (baseado na referência enviada)

Uniforme de escola estadual: camisa **branca** modelo *ringer*, com gola e punho
**azul-marinho**, brasão no peito esquerdo, calça/short marinho, tênis.

| Peça | Cor | Hex |
|---|---|---|
| Camisa | branco levemente azulado | `#F2F5FF` |
| Gola e punho | azul-marinho | `#1B2A5E` |
| Calça / short | azul-marinho escuro | `#141F42` |
| Tênis | branco com sola escura | `#E8ECFF` / `#2B3A67` |
| Mochila | detalhe em azul-claro | `#6EE7FF` |

- **Ana:** cabelo preso, short marinho, mochila nas costas.
- **Junior:** cabelo curto, calça marinho, mochila em uma alça só.
- Tons de pele diferentes entre os dois — a dupla representa melhor a turma.

⚠️ **Não reproduza o brasão oficial do Governo do Estado** que aparece no print.
É insígnia oficial e não é nossa para usar. Faça o brasão **do jogo**: um escudo
simples com `EC` ou um `√` estilizado, e o nome `Escola Euclides da Cunha`
embaixo. Além de resolver a questão, fica melhor — coloca o nome da escola
literalmente no peito dos personagens.

### Onde o detalhe do uniforme aparece

Num sprite de `32 × 48` px o brasão tem uns 4 pixels: vira uma mancha. Então:

- **No jogo (Phaser):** o uniforme é lido por **silhueta e cor** — corpo branco,
  faixa marinho na gola e no punho, pernas marinho. Só isso já lê como uniforme.
- **Na tela de seleção (React/SVG):** aí sim o retrato aparece grande e nítido,
  com o brasão legível. É HTML, não tem limite de pixel.

Esse é o mesmo princípio da regra "UI é React, mundo é Phaser" da seção 9.

### Animações necessárias (por personagem)

`idle` (4 frames) · `run` (6) · `jump` (1) · `fall` (1) · `hit` (2, só no modo
Aventura) · `golpe` (4, o ataque que derrota o guardião).

---

## 6. Motor de contas

```ts
type Op = '+' | '-' | '*' | '/';

type Question = {
  a: number;
  b: number;
  op: Op;
  answer: number;
  options: number[];  // 4 opções embaralhadas, uma correta
};
```

Regras não-negociáveis do gerador:

- **Subtração nunca dá negativo** → garantir `a >= b`.
- **Divisão sempre exata** → gerar `b` e `answer` primeiro, depois `a = b * answer`.
- **Distratores plausíveis**, nunca aleatórios: erro de ±1, operação trocada
  (`7+3` → distrator `4`), dígito invertido. Isso impede o chute por eliminação
  e ainda mostra ao aluno *qual* erro ele cometeu.
- **Tiers por mundo:** T1 `1..10`, T2 `1..20`, T3 dois dígitos. Sobe de tier
  após 3 acertos seguidos, desce após 2 erros.
- **Dica após 2 erros:** desenha a conta com objetos na tela (3 moedas + 4
  moedas). Pedagogicamente é o ponto mais forte do jogo — deixe visível na
  apresentação.

**Um teste basta aqui:** `mathEngine.test.ts` verificando que 1000 questões
geradas nunca dão negativo, nunca dão divisão quebrada, e que `options` sempre
contém `answer` e não tem repetido.

---

## 7. Game feel — o que separa "trabalho de escola" de "isso é bom"

Sem estes quatro itens, o pulo parece travado e ninguém sabe explicar por quê:

1. **Coyote time (~100 ms):** ainda dá pra pular por um instante depois de sair
   da beirada.
2. **Jump buffer (~120 ms):** apertou pulo um pouco antes de encostar no chão →
   pula ao encostar.
3. **Pulo variável:** segurou = mais alto; soltou cedo = pulinho.
4. **Câmera com lerp + look-ahead:** a câmera olha um pouco à frente da direção
   em que o jogador corre.

Complementos baratos e de alto impacto: parallax de 3 camadas no fundo,
partículas + leve screen shake quando o mecanismo ativa, som de acerto em
arpejo subindo, som de erro suave (nunca um "buzz" agressivo).

**Física:** Arcade Physics do Phaser (AABB). Não use Matter.js — é physics de
corpo rígido, errado para plataforma e muito mais difícil de acertar.

---

## 7b. Cabeçalho e créditos (requisito do trabalho)

Os nomes dos alunos e da escola precisam aparecer no jogo. Três lugares, todos
fora da gameplay — nada de poluir a tela durante a fase:

1. **Tela de título (principal):** faixa fixa abaixo do logo, sempre visível ao
   abrir o jogo, junto da escolha de personagem e do modo.

   ```
              MATH RUNNER
       O Resgate dos Números
   ─────────────────────────────
     Junior  ·  Ana
     Escola Euclides da Cunha — 2026
   ─────────────────────────────
     [ retrato Ana ]  [ retrato Junior ]     ← escolha do personagem
        Monstros:  ( Aventura | Explorador )  ← escolha do modo
                  [  JOGAR  ]
   ```

   Como os personagens são o Junior e a Ana, a própria seleção já cumpre o
   requisito de exibir os nomes dos alunos — a faixa de crédito reforça.

2. **Tela de Créditos:** item no menu, com os papéis (conceito/design: Junior e
   Ana) e os créditos de arte/áudio da Kenney (CC0 não exige atribuição, mas
   citar pega bem na defesa do trabalho).

3. **Metadados:** `<title>` do `index.html` e o campo `name` do manifest —
   assim o nome aparece na aba do Chrome e no ícone instalado.

É texto em React na shell, então são poucos minutos de trabalho. Fica em
`src/app/Menu/`.

⚠️ Confirmar com Junior e Ana: nome completo dos dois e o nome oficial da
escola (Pinheirinho está por confirmar) antes de fechar a versão final.

---

## 8. Controles

**PC:** `← →` ou `A D` mover · `Espaço` / `W` / `↑` pular · `↑` / `E` interagir ·
`1–4` responder · `Esc` pausar.

**Celular (paisagem):** metade esquerda da tela = d-pad virtual; metade direita
= botão de pulo + botão de ação. Respostas por toque nos 4 botões.

⚠️ Bug clássico: multi-touch. Rastreie o **pointer id** de cada toque
separadamente, senão apertar pulo cancela o movimento.

---

## 9. Stack

| Camada | Escolha | Por quê |
|---|---|---|
| Build | **Vite** | build estático, dev server instantâneo |
| Shell/UI | **React 19 + TypeScript** | menus, HUD, card da conta — e é onde seu plugin `regras-frontend-react` se aplica |
| Jogo | **Phaser 3** | tilemap, arcade physics, sprites e áudio prontos |
| Estado | **Zustand** | progresso/estrelas compartilhados entre React e Phaser (padrão do seu plugin) |
| PWA | **vite-plugin-pwa** | gera manifest + service worker, zero config manual |
| Persistência | **localStorage** (Zustand `persist`) | sem backend. Sem backend = deploy trivial |
| Níveis | **Tiled** (editor gratuito) | exporta JSON que o Phaser lê nativamente |
| Arte (cenário) | **Kenney.nl** (CC0) | tiles e props de plataforma, uso livre, recoloríveis para os cenários brasileiros |
| Arte (personagens e guardiões) | **Piskel** ou **Aseprite** (feita à mão) | Ana, Junior de uniforme e o folclore não existem em pack pronto — ver seção 5b |
| Áudio | Kenney Audio + jsfxr | mesma licença livre |
| Deploy | **nginx em container** na VPS | seu plugin `regras-deploy` cobre isso |

**Sem backend, sem banco, sem login — decidido.** O jogo só guarda progresso
local (fase desbloqueada, estrelas, dígitos, tier de cada operação): poucos KB
em `localStorage`, nada multiusuário. Backend só se justificaria para ranking
global, sync entre aparelhos ou painel do professor — nenhum é requisito.

E adicionar backend **custaria** o offline: hoje o service worker faz precache e
o jogo abre sem internet; com API, a tela de fases passaria a depender de rede
justamente no dia da apresentação. Somando LGPD sobre dados de menores, a conta
não fecha. Se depois quiserem ranking, entra uma API minúscula — mas não antes.

**Divisão React ↔ Phaser:** React desenha tudo que é *interface* (menu, seleção
de fase, HUD, card da conta, tela de vitória). Phaser desenha só o *canvas do
jogo*. Zustand é a ponte entre os dois. Nunca renderize UI dentro do Phaser —
é o erro que mais custa tempo nesse tipo de projeto.

### Estrutura

```
math-runner/
├── index.html
├── vite.config.ts             # vite-plugin-pwa aqui
├── public/
│   ├── icons/                 # 192, 512, maskable
│   └── assets/                # sprites, tilesets, áudio
└── src/
    ├── main.tsx
    ├── app/                   # React
    │   ├── Menu/  LevelSelect/  Hud/  MathCard/
    ├── game/                  # Phaser
    │   ├── scenes/            # Boot, Preload, Level
    │   ├── systems/           # controls.ts, mechanisms.ts, camera.ts
    │   ├── mathEngine.ts
    │   └── levels/            # w1-1.json … (exportados do Tiled)
    └── store/useGameStore.ts  # Zustand
```

### PWA

```jsonc
{
  "name": "Math Runner: O Resgate dos Números",
  "short_name": "Math Runner",
  "display": "fullscreen",
  "orientation": "landscape",
  "background_color": "#0b1020",
  "theme_color": "#0b1020"
}
```

Dois pontos que costumam quebrar:
- **HTTPS é obrigatório** para o Chrome oferecer "Instalar app". `http://` não
  mostra o botão. Use Caddy (TLS automático) ou nginx + certbot.
- O service worker faz **precache dos assets** → o jogo roda **offline**. Num
  dia de apresentação com wi-fi ruim da escola, isso salva o trabalho. Vale
  mencionar na defesa.

---

## 10. Ordem de construção

Cada fase termina com algo jogável — nunca fique 3 dias sem conseguir rodar.

| Fase | Entrega | Pronto quando |
|---|---|---|
| 0 | Setup Vite + React + Phaser + PWA | Canvas azul abre no celular |
| 1 | **Vertical slice**: correr e pular num cenário fixo | O pulo está gostoso (coyote + buffer + variável) |
| 2 | Tilemap do Tiled + colisão + câmera + checkpoint | Dá pra percorrer uma fase inteira |
| 3 | `mathEngine` + card da conta + mecanismo Ponte | Uma conta abaixa uma ponte de verdade |
| 4 | Mecanismo Blocos + dígitos dourados + HUD (corações e estrelas) | Fase 1-1 completa, do início ao fim |
| 5 | **Monstro Slime Somador**: confronto, golpe, dano, válvula anti-frustração | Dá pra derrotar um monstro acertando a conta |
| 6 | Fases 1-2 a 1-5 + áudio + partículas + menu + **cabeçalho/créditos** | **Mundo 1 fechado — versão entregável** |
| 7 | Deploy VPS + HTTPS + teste de instalação no celular | Instala como app no celular do Junior e da Ana |
| 8 | *(extra)* Mundos 2–5 + chefe Guardião de Euclides | Só se sobrar tempo |

A fase 1 é a mais importante do projeto. Se o pulo estiver bom, o resto é
conteúdo. Se estiver ruim, nenhuma quantidade de fases salva.

---

## Decisões fechadas

- **Engine:** Phaser 3 — na ficha da escola, informar
  `Phaser 3 (HTML5/JavaScript)`.
- **Interface:** shell em React + canvas do Phaser, ponte via Zustand.
- **Sem backend:** persistência só em `localStorage`.
- **Monstros:** opcionais, escolhidos na tela inicial (Aventura / Explorador).

## Pendências

1. **Nome completo do Junior e da Ana** para o cabeçalho e os créditos.
2. **Nome oficial da escola** — "Escola Pinheirinho" está por confirmar.
3. Série/idade da turma alvo, para calibrar os tiers do gerador de contas.
