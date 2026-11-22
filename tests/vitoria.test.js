const { Ludo, REASONS } = require('../src/ludo');
const { track, stretch, goal, lastPieceAt, playerOneNeedsTwo } = require('./fixtures/posicoes');
const { createDiceSequence } = require('./fixtures/dados');

function finishedGame(dice) {
  const game = new Ludo({ dice, positions: playerOneNeedsTwo() });
  game.rollDice(1, 2);
  game.movePiece(1, 3);
  return game;
}

describe('vitória', () => {
  it('levar a 4ª peça à meta encerra a partida com vencedor', () => {
    const game = new Ludo({ positions: playerOneNeedsTwo() });
    game.rollDice(1, 2);
    expect(game.movePiece(1, 3)).toEqual({
      changed: true,
      from: stretch(5),
      to: goal(),
      captured: [],
      extraTurn: false,
      winner: 1,
    });
    expect(game.getStatus()).toBe('finished');
    expect(game.getWinner()).toBe(1);
    expect(game.getTurnPhase()).toBeNull();
    expect(game.getMovablePieces()).toEqual([]);
  });

  it('com 3 peças na meta a partida continua', () => {
    const game = new Ludo({ positions: { 1: [goal(), goal(), stretch(5), track(10)] } });
    game.rollDice(1, 2);
    expect(game.movePiece(1, 2)).toMatchObject({ to: goal(), winner: null });
    expect(game.getStatus()).toBe('playing');
    expect(game.getWinner()).toBeNull();
    expect(game.getCurrentPlayer()).toBe(2);
  });

  it('jogador 2 também vence ao levar as 4 peças à meta', () => {
    const game = new Ludo({ currentPlayer: 2, positions: { 2: lastPieceAt(stretch(6)) } });
    game.rollDice(2, 1);
    expect(game.movePiece(2, 3).winner).toBe(2);
    expect(game.getState()).toMatchObject({ status: 'finished', winner: 2, turnPhase: null });
  });
});

describe('bloqueio de ações após o fim', () => {
  it('rollDice e movePiece retornam game_over e não alteram o estado', () => {
    const game = finishedGame();
    const before = game.getState();
    const gameOver = { changed: false, reason: REASONS.GAME_OVER };
    expect(game.rollDice(1)).toEqual(gameOver);
    expect(game.rollDice(2, 6)).toEqual(gameOver);
    expect(game.movePiece(1, 0)).toEqual(gameOver);
    expect(game.movePiece(2, 3)).toEqual(gameOver);
    expect(game.getState()).toEqual(before);
  });

  it('após o fim o dado injetado não é mais consumido', () => {
    const dice = createDiceSequence([6]);
    const game = finishedGame(dice);
    expect(game.rollDice(2)).toEqual({ changed: false, reason: REASONS.GAME_OVER });
    expect(dice.remaining()).toBe(1);
  });

  it('argumentos inválidos continuam lançando erro mesmo após o fim', () => {
    const game = finishedGame();
    expect(() => game.rollDice(1, 9)).toThrow(RangeError);
    expect(() => game.movePiece(1, 7)).toThrow(RangeError);
    expect(() => game.rollDice(5)).toThrow(RangeError);
  });
});
