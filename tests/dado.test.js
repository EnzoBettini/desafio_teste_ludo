const { Ludo, REASONS } = require('../src/ludo');
const { createDiceSequence } = require('./fixtures/dados');

afterEach(() => {
  jest.restoreAllMocks();
});

describe('dado: faixa e valor explícito', () => {
  it('rollDice(player, valor) aceita 1 a 6 e registra o valor rolado', () => {
    for (let value = 1; value <= 6; value += 1) {
      const game = new Ludo();
      const result = game.rollDice(1, value);
      expect(result.changed).toBe(true);
      expect(result.value).toBe(value);
      expect(game.getLastRoll()).toBe(value);
    }
  });

  it('valores fora de 1–6 ou não inteiros lançam RangeError e não alteram o estado', () => {
    const game = new Ludo();
    const before = game.getState();
    for (const value of [0, 7, -1, 2.5, '3', NaN, null]) {
      expect(() => game.rollDice(1, value)).toThrow(RangeError);
    }
    expect(game.getState()).toEqual(before);
  });
});

describe('dado: injeção e aleatoriedade', () => {
  it('sem valor explícito usa Math.random por padrão, mapeado para 1–6', () => {
    jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.9999);
    expect(new Ludo().rollDice(1).value).toBe(1);
    expect(new Ludo().rollDice(1).value).toBe(4);
    expect(new Ludo().rollDice(1).value).toBe(6);
  });

  it('dado injetado no construtor é consumido em ordem', () => {
    const dice = createDiceSequence([6, 3]);
    const game = new Ludo({ dice });
    expect(game.rollDice(1).value).toBe(6);
    game.movePiece(1, 0);
    expect(game.rollDice(1).value).toBe(3);
    expect(dice.remaining()).toBe(0);
  });

  it('valor explícito tem prioridade e não consome o dado injetado', () => {
    const dice = createDiceSequence([4]);
    const game = new Ludo({ dice });
    expect(game.rollDice(1, 2).value).toBe(2);
    expect(dice.remaining()).toBe(1);
  });

  it('dado injetado que devolve valor inválido lança RangeError', () => {
    expect(() => new Ludo({ dice: () => 7 }).rollDice(1)).toThrow(RangeError);
    expect(() => new Ludo({ dice: () => 0.5 }).rollDice(1)).toThrow(RangeError);
  });
});

describe('dado: quem rola', () => {
  it('só o jogador da vez rola; a recusa não consome o dado injetado', () => {
    const dice = createDiceSequence([6]);
    const game = new Ludo({ dice });
    expect(game.rollDice(2)).toEqual({ changed: false, reason: REASONS.NOT_YOUR_TURN });
    expect(dice.remaining()).toBe(1);
    expect(game.getLastRoll()).toBeNull();
    expect(game.getCurrentPlayer()).toBe(1);
  });

  it('jogador 2 rola primeiro quando a partida começa com currentPlayer 2', () => {
    const game = new Ludo({ currentPlayer: 2 });
    expect(game.rollDice(1, 6)).toEqual({ changed: false, reason: REASONS.NOT_YOUR_TURN });
    expect(game.rollDice(2, 6).changed).toBe(true);
  });

  it('jogador inexistente lança RangeError', () => {
    const game = new Ludo();
    expect(() => game.rollDice(3, 4)).toThrow(RangeError);
    expect(() => game.rollDice(0)).toThrow(RangeError);
    expect(() => game.rollDice('1', 6)).toThrow(RangeError);
  });
});
