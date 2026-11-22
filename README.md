# desafio_teste_ludo

**Ludo simplificado para 2 jogadores**, 4 peças cada, pista circular de **52 casas** e reta final própria de **6 casas**. A suite em `tests/` especifica `src/ludo.js` (JavaScript + Jest): README e testes usam exatamente as mesmas constantes e nomes de métodos.

## Constantes

| Nome | Valor | Significado |
|------|------:|-------------|
| `PLAYER_ONE`, `PLAYER_TWO`, `PLAYERS` | `1`, `2`, `[1, 2]` | Jogadores |
| `PIECES_PER_PLAYER` | 4 | Peças por jogador (índices `0`–`3`) |
| `TRACK_LENGTH` | 52 | Casas da pista circular (`0`–`51`) |
| `HOME_STRETCH_LENGTH` | 6 | Casas da reta final de cada jogador (`step` `1`–`6`) |
| `START_SQUARES` | `{ 1: 0, 2: 26 }` | Casa de saída de cada jogador (lados opostos) |
| `SAFE_SQUARES` | `[0, 26]` | Casas seguras (as duas saídas) |
| `BASE_PROGRESS` | -1 | Progresso de peça na base |
| `LAST_TRACK_PROGRESS` | 50 | Último progresso na pista (51 casas percorridas) |
| `GOAL_PROGRESS` | 57 | Progresso da meta |
| `DICE_MIN`, `DICE_MAX` | 1, 6 | Faixa do dado |
| `ENTRY_ROLL` | 6 | Valor necessário para sair da base |
| `EXTRA_TURN_ROLL` | 6 | Valor que dá jogada extra |
| `ZONE_BASE`, `ZONE_TRACK`, `ZONE_HOME_STRETCH`, `ZONE_GOAL` | `'base'`, `'track'`, `'homeStretch'`, `'goal'` | Zonas de uma posição |
| `STATUS_PLAYING`, `STATUS_FINISHED` | `'playing'`, `'finished'` | Status da partida |
| `TURN_ROLL`, `TURN_MOVE` | `'roll'`, `'move'` | Fase do turno |
| `REASONS` | `{ GAME_OVER, NOT_YOUR_TURN, MUST_ROLL, MUST_MOVE, INVALID_MOVE }` | Motivos de recusa (`'game_over'`, `'not_your_turn'`, `'must_roll'`, `'must_move'`, `'invalid_move'`) |

## Posições

Internamente cada peça tem um **progresso** (casas andadas desde a própria saída). Para fora, a posição é sempre um objeto com `zone`:

| Zona | Progresso | `getPiecePosition(player, piece)` |
|------|-----------|-----------------------------------|
| Base | -1 | `{ zone: 'base' }` |
| Pista | 0–50 | `{ zone: 'track', square }`, com `square = (START_SQUARES[player] + progresso) % 52` |
| Reta final | 51–56 | `{ zone: 'homeStretch', step }`, com `step = progresso - 50` (1–6) |
| Meta | 57 | `{ zone: 'goal' }` |

Percurso de cada jogador:

| Jogador | Sai na casa | Percorre na pista | Última casa da pista | Casa que nunca visita |
|---------|------------:|-------------------|---------------------:|----------------------:|
| 1 | 0 | 0 → 50 | 50 | 51 |
| 2 | 26 | 26 → 51 → 0 → 24 | 24 | 25 |

Nenhuma peça dá segunda volta: depois da última casa da pista ela entra na **sua** reta final.

## Regras

| Tópico | Regra |
|--------|-------|
| Início | Todas as peças na base; status `playing`; jogador 1 começa (ou `currentPlayer` do construtor); fase `roll` |
| Dado | Inteiro de 1 a 6. `rollDice(player)` usa o dado do construtor (padrão: `Math.random`); `rollDice(player, valor)` força o valor. Valor fora de 1–6 ou não inteiro lança `RangeError` |
| Quem rola | Só o jogador da vez, e só na fase `roll` |
| Turno | `roll` → `rollDice` → se houver peça movível, fase `move` → `movePiece` → próximo `roll` (do mesmo jogador se o dado foi 6, senão do adversário) |
| Sair da base | Só com 6; a peça vai para a casa de saída do jogador (não anda as 6 casas) |
| Movimento | A peça escolhida avança exatamente o valor do dado, no sentido crescente da pista (51 → 0) |
| Reta final | Após a última casa da pista a peça entra na própria reta final (6 casas) e depois na meta |
| Valor exato | Se `progresso + dado > 57` o movimento daquela peça é inválido; peça na meta não se move |
| Captura | Parar (não apenas passar) numa casa da pista **não segura** onde há peça(s) adversária(s) manda **todas** elas de volta à base. Não há captura na reta final nem na meta |
| Casas seguras | 0 e 26 (as saídas). Nelas peças adversárias coexistem; sair da base nunca captura |
| Empilhar | Peças do mesmo jogador podem dividir casa; não existe bloqueio (barreira) |
| Jogada extra | Mover uma peça com 6 (inclusive sair da base) dá nova rolagem ao mesmo jogador. Sem limite de 6 seguidos. Captura não dá bônus |
| Passar a vez | Se após rolar nenhuma peça pode se mover, a vez passa automaticamente — **mesmo com 6** (sem jogada extra) |
| Vitória | Quando as 4 peças de um jogador chegam à meta: status `finished`, `winner` definido, sem jogada extra |
| Após o fim | `rollDice`/`movePiece` retornam `{ changed: false, reason: 'game_over' }` e o estado não muda; `getTurnPhase()` é `null` |

## API

```javascript
const { Ludo } = require('./src/ludo');

const game = new Ludo();
game.rollDice(1, 6);
game.movePiece(1, 0);
game.getPiecePosition(1, 0);
```

Exporta todas as constantes acima, a classe `Ludo` e os helpers puros abaixo.

### Lança erro × retorna sem mudança

- **Lança erro** quando o argumento é inválido (erro de quem chama), em qualquer estado da partida, inclusive depois do fim: jogador fora de `1`/`2`, índice de peça fora de `0`–`3`, valor de dado fora de 1–6, opções/posições inválidas no construtor.
- **Retorna `{ changed: false, reason }`** quando o argumento é válido mas a jogada não é permitida agora. Ordem de verificação: `game_over` → `not_your_turn` → `must_roll`/`must_move` → `invalid_move`. Uma recusa não consome o dado injetado.

### `new Ludo(options)`

| Opção | Padrão | Descrição | Lança |
|-------|--------|-----------|-------|
| `dice` | `Math.floor(Math.random() * 6) + 1` | Função sem argumentos que devolve o valor do dado (injeção para testes determinísticos) | `TypeError` se não for função; `RangeError` em `rollDice` se devolver valor fora de 1–6 |
| `currentPlayer` | `1` | Quem começa | `RangeError` se não for 1 ou 2 |
| `positions` | todas na base | `{ 1: Position[4], 2: Position[4] }`; jogador omitido fica na base | `RangeError` se não tiver 4 posições ou alguma for inválida para o jogador; `Error` se um jogador já tiver as 4 na meta ou se peças adversárias dividirem casa não segura |

### Métodos

| Método | Parâmetros | Retorno | Lança | Retorna sem mudança |
|--------|------------|---------|-------|---------------------|
| `rollDice(player, value?)` | jogador; valor opcional 1–6 | `{ changed: true, value, movablePieces, turnPassed }` | jogador inválido; `value` fora de 1–6/não inteiro; dado injetado devolvendo valor inválido | `game_over`, `not_your_turn`, `must_move` |
| `movePiece(player, piece)` | jogador; índice 0–3 | `{ changed: true, from, to, captured, extraTurn, winner }` | jogador ou índice inválido | `game_over`, `not_your_turn`, `must_roll`, `invalid_move` |
| `getPiecePosition(player, piece)` | jogador; índice 0–3 | `Position` (cópia) | jogador ou índice inválido | — |
| `getMovablePieces()` | — | índices movíveis do jogador da vez com o dado pendente; `[]` fora da fase `move` | — | — |
| `getState()` | — | `{ status, currentPlayer, turnPhase, lastRoll, winner, movablePieces, pieces: { 1: Position[], 2: Position[] } }` (cópia) | — | — |
| `getStatus()` | — | `'playing'` \| `'finished'` | — | — |
| `getCurrentPlayer()` | — | `1` \| `2` (após o fim continua sendo o vencedor) | — | — |
| `getTurnPhase()` | — | `'roll'` \| `'move'` \| `null` (após o fim) | — | — |
| `getLastRoll()` | — | último valor rolado ou `null` | — | — |
| `getWinner()` | — | `null` \| `1` \| `2` | — | — |

Campos dos resultados:

- `movablePieces`: índices das peças que podem se mover com o valor rolado.
- `turnPassed`: `true` quando nenhuma peça pode se mover e a vez já passou ao adversário.
- `captured`: lista `{ player, piece }` das peças adversárias mandadas para a base.
- `extraTurn`: `true` quando o dado foi 6 e a partida não acabou.
- `winner`: jogador vencedor quando o movimento encerra a partida, senão `null`.

### Helpers puros

| Função | Retorno | Lança |
|--------|---------|-------|
| `progressToPosition(player, progress)` | `Position` para progresso -1…57 | `RangeError` para jogador ou progresso inválido |
| `positionToProgress(player, position)` | progresso -1…57 | `RangeError` para posição malformada ou casa que o jogador nunca visita (J1: 51, J2: 25) |
| `isSafeSquare(square)` | `true` para 0 e 26 | — |
| `opponentOf(player)` | o outro jogador | `RangeError` para jogador inválido |

## Organização dos testes

| Arquivo | O que cobre |
|---------|-------------|
| `tests/constantes-api.test.js` | Valores das constantes, zonas, status, fases, `REASONS`, exports e `opponentOf` |
| `tests/posicoes.test.js` | Conversão progresso ↔ posição dos dois jogadores, casa nunca visitada, posições malformadas |
| `tests/estado-inicial.test.js` | Estado inicial, `getState` (snapshot e cópia), opções e validações do construtor |
| `tests/dado.test.js` | Faixa 1–6, valores inválidos, `Math.random` padrão, dado injetado, quem rola |
| `tests/saida-base.test.js` | Sair só com 6, casa de saída de cada jogador, peça da base sem 6 |
| `tests/movimento-pista.test.js` | Avanço pelo valor do dado, volta circular 51 → 0, sem segunda volta, empilhar peças próprias |
| `tests/reta-final.test.js` | Entrada na reta final (J1 na 50, J2 na 24), valor exato para a meta, peça na meta parada |
| `tests/captura-casa-segura.test.js` | Captura simples e múltipla, passar por cima, captura após a volta, casas seguras 0 e 26 |
| `tests/jogada-extra.test.js` | 6 dá nova rolagem, sem limite de 6 seguidos, 6 sem movimento passa a vez, 6 vencedor |
| `tests/passar-vez.test.js` | Vez passa automaticamente sem jogada possível |
| `tests/turnos.test.js` | Fluxo `roll` → `move`, `must_roll`, `must_move`, fora do turno, índices/jogadores inválidos |
| `tests/vitoria.test.js` | Vitória com 4 peças na meta, bloqueio de ações após o fim |
| `tests/integracao-partida.test.js` | Partida completa do início à vitória com sequência fixa de dados e final pré-montado |
| `tests/fixtures/posicoes.js` | Construtores de posição (`base`, `track`, `stretch`, `goal`) e estados pré-montados |
| `tests/fixtures/dados.js` | `createDiceSequence(valores)`: dado determinístico que conta quantos valores restam |
| `tests/fixtures/partidas.js` | Roteiro da partida completa (`FULL_GAME`) e dados do final pré-montado |

## Como executar

```bash
npm install
npm test
```

Modo observação e cobertura:

```bash
npm run test:watch
npx jest --coverage
```

## Colaboradores

| Nome | RA |
|------|-----|
| Enzo Ayres Bettini | 241955272 |
| Gabriel Henrik de Castro Maia | _(a definir)_ |

## Entrega

Formulário: https://forms.gle/bgbV2TwrreR8LiAGA
