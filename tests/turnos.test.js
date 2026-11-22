const { Ludo, REASONS } = require('../src/ludo');
const { track, oneTrackPiece } = require('./fixtures/posicoes');

describe('fluxo do turno: rolar → mover', () => {
  it('o turno alterna entre as fases roll e move', () => {
    const game = new Ludo();
    expect(game.getTurnPhase()).toBe('roll');
    game.rollDice(1, 6);
    expect(game.getTurnPhase()).toBe('move');
    expect(game.getMovablePieces()).toEqual([0, 1, 2, 3]);
    game.movePiece(1, 0);
    expect(game.getTurnPhase()).toBe('roll');
    expect(game.getMovablePieces()).toEqual([]);
  });

  it('mover antes de rolar é recusado com must_roll', () => {
    const game = new Ludo({ positions: { 1: oneTrackPiece(10) } });
    const before = game.getState();
    expect(game.movePiece(1, 0)).toEqual({ changed: false, reason: REASONS.MUST_ROLL });
    expect(game.getState()).toEqual(before);
  });

  it('rolar de novo com movimento pendente é recusado com must_move', () => {
    const game = new Ludo();
    game.rollDice(1, 6);
    const before = game.getState();
    expect(game.rollDice(1, 3)).toEqual({ changed: false, reason: REASONS.MUST_MOVE });
    expect(game.getState()).toEqual(before);
    expect(game.getLastRoll()).toBe(6);
  });

  it('os turnos alternam 1 → 2 → 1 quando não sai 6', () => {
    const game = new Ludo({ positions: { 1: oneTrackPiece(10), 2: oneTrackPiece(30) } });
    game.rollDice(1, 3);
    game.movePiece(1, 0);
    expect(game.getCurrentPlayer()).toBe(2);
    game.rollDice(2, 2);
    game.movePiece(2, 0);
    expect(game.getCurrentPlayer()).toBe(1);
    expect(game.getPiecePosition(1, 0)).toEqual(track(13));
    expect(game.getPiecePosition(2, 0)).toEqual(track(32));
  });
});

describe('ações fora do turno e argumentos inválidos', () => {
  it('jogador fora da vez não move a peça dele (not_your_turn)', () => {
    const game = new Ludo({ positions: { 1: oneTrackPiece(10), 2: oneTrackPiece(30) } });
    game.rollDice(1, 4);
    const before = game.getState();
    expect(game.movePiece(2, 0)).toEqual({ changed: false, reason: REASONS.NOT_YOUR_TURN });
    expect(game.getState()).toEqual(before);
  });

  it('índice de peça fora de 0–3 lança RangeError', () => {
    const game = new Ludo();
    game.rollDice(1, 6);
    for (const piece of [4, -1, 1.5, '0', undefined]) {
      expect(() => game.movePiece(1, piece)).toThrow(RangeError);
      expect(() => game.getPiecePosition(1, piece)).toThrow(RangeError);
    }
  });

  it('jogador inexistente lança RangeError em movePiece e getPiecePosition', () => {
    const game = new Ludo();
    game.rollDice(1, 6);
    expect(() => game.movePiece(3, 0)).toThrow(RangeError);
    expect(() => game.getPiecePosition(0, 0)).toThrow(RangeError);
    expect(game.getTurnPhase()).toBe('move');
  });
});
