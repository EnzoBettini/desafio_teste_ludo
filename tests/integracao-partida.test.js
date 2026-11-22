const { Ludo, REASONS } = require('../src/ludo');
const { stretch, goal, allBase, endgameRace } = require('./fixtures/posicoes');
const { createDiceSequence } = require('./fixtures/dados');
const { FULL_GAME, FULL_GAME_DICE, ENDGAME_DICE } = require('./fixtures/partidas');

function playStep(game, step) {
  const roll = game.rollDice(step.player);
  expect(roll).toMatchObject({ changed: true, value: step.roll });
  if (step.piece === null) {
    expect(roll.turnPassed).toBe(true);
    return null;
  }
  const move = game.movePiece(step.player, step.piece);
  expect(move).toMatchObject({ changed: true, to: step.to, captured: step.captured });
  return move;
}

describe('partida completa', () => {
  it('do estado inicial até a vitória do jogador 1 com sequência fixa de dados (inclui captura)', () => {
    const dice = createDiceSequence(FULL_GAME_DICE);
    const game = new Ludo({ dice });
    const moves = FULL_GAME.map((step) => playStep(game, step)).filter(Boolean);

    expect(moves.flatMap((m) => m.captured)).toEqual([{ player: 2, piece: 0 }]);
    expect(moves[moves.length - 1].winner).toBe(1);
    expect(dice.remaining()).toBe(0);
    expect(game.getState()).toEqual({
      status: 'finished',
      currentPlayer: 1,
      turnPhase: null,
      lastRoll: 3,
      winner: 1,
      movablePieces: [],
      pieces: { 1: [goal(), goal(), goal(), goal()], 2: allBase() },
    });
    expect(game.rollDice(2, 6)).toEqual({ changed: false, reason: REASONS.GAME_OVER });
  });

  it('final pré-montado: 6 dá jogada extra, valor exato decide e quem chega primeiro vence', () => {
    const game = new Ludo({ dice: createDiceSequence(ENDGAME_DICE), positions: endgameRace() });

    expect(game.rollDice(1).movablePieces).toEqual([3]);
    expect(game.movePiece(1, 3)).toMatchObject({ to: stretch(5), extraTurn: true });

    expect(game.rollDice(1)).toMatchObject({ value: 3, turnPassed: true });
    expect(game.rollDice(2)).toMatchObject({ value: 6, turnPassed: true });
    expect(game.getCurrentPlayer()).toBe(1);

    expect(game.rollDice(1).value).toBe(2);
    expect(game.movePiece(1, 3)).toMatchObject({ to: goal(), winner: 1 });
    expect(game.getWinner()).toBe(1);
    expect(game.getPiecePosition(2, 3)).toEqual(stretch(2));
  });
});
