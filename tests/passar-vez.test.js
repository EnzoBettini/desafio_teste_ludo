const { Ludo, REASONS } = require('../src/ludo');
const { base, stretch, goal } = require('./fixtures/posicoes');
const { createDiceSequence } = require('./fixtures/dados');

describe('passar a vez sem jogada possível', () => {
  it('todas as peças na base e dado diferente de 6: a vez passa automaticamente', () => {
    const game = new Ludo();
    expect(game.rollDice(1, 3)).toEqual({
      changed: true,
      value: 3,
      movablePieces: [],
      turnPassed: true,
    });
    expect(game.getCurrentPlayer()).toBe(2);
    expect(game.getTurnPhase()).toBe('roll');
    expect(game.getLastRoll()).toBe(3);
  });

  it('depois de passar a vez, quem rolou não pode mover nem rolar de novo', () => {
    const game = new Ludo();
    game.rollDice(1, 3);
    expect(game.movePiece(1, 0)).toEqual({ changed: false, reason: REASONS.NOT_YOUR_TURN });
    expect(game.rollDice(1, 6)).toEqual({ changed: false, reason: REASONS.NOT_YOUR_TURN });
    expect(game.rollDice(2, 6).movablePieces).toEqual([0, 1, 2, 3]);
  });

  it('a vez também passa quando as peças fora da base só ultrapassariam a meta', () => {
    const game = new Ludo({ positions: { 1: [stretch(5), stretch(6), goal(), base()] } });
    expect(game.rollDice(1, 3)).toMatchObject({ movablePieces: [], turnPassed: true });
    expect(game.getState().pieces[1]).toEqual([stretch(5), stretch(6), goal(), base()]);
  });

  it('rodadas sem jogada alternam os jogadores consumindo o dado injetado', () => {
    const dice = createDiceSequence([2, 5, 1]);
    const game = new Ludo({ dice });
    expect(game.rollDice(1).turnPassed).toBe(true);
    expect(game.rollDice(2).turnPassed).toBe(true);
    expect(game.rollDice(1).turnPassed).toBe(true);
    expect(game.getCurrentPlayer()).toBe(2);
    expect(dice.remaining()).toBe(0);
  });
});
