const { Ludo, REASONS } = require('../src/ludo');
const { base, track, stretch, goal, oneTrackPiece, lastPieceAt } = require('./fixtures/posicoes');

describe('reta final e valor exato', () => {
  it('jogador 1 deixa a pista na casa 50: com 1 vai ao step 1, com 6 ao step 6', () => {
    const withOne = new Ludo({ positions: { 1: oneTrackPiece(50) } });
    withOne.rollDice(1, 1);
    expect(withOne.movePiece(1, 0).to).toEqual(stretch(1));

    const withSix = new Ludo({ positions: { 1: oneTrackPiece(50) } });
    withSix.rollDice(1, 6);
    expect(withSix.movePiece(1, 0).to).toEqual(stretch(6));
  });

  it('jogador 2 deixa a pista na casa 24 e entra na reta final sem passar pela 25', () => {
    const game = new Ludo({ currentPlayer: 2, positions: { 2: oneTrackPiece(24) } });
    game.rollDice(2, 3);
    expect(game.movePiece(2, 0).to).toEqual(stretch(3));
  });

  it('valor exato leva a peça à meta', () => {
    const game = new Ludo({ positions: { 1: [stretch(4), base(), base(), base()] } });
    game.rollDice(1, 3);
    expect(game.movePiece(1, 0)).toMatchObject({ changed: true, from: stretch(4), to: goal() });
  });

  it('valor acima do necessário é movimento inválido para aquela peça', () => {
    const game = new Ludo({ positions: { 1: [stretch(4), track(10), base(), base()] } });
    expect(game.rollDice(1, 5).movablePieces).toEqual([1]);
    expect(game.movePiece(1, 0)).toEqual({ changed: false, reason: REASONS.INVALID_MOVE });
    expect(game.getPiecePosition(1, 0)).toEqual(stretch(4));
    expect(game.getTurnPhase()).toBe('move');
  });

  it('se o único movimento ultrapassaria a meta, a vez passa', () => {
    const game = new Ludo({ positions: { 1: lastPieceAt(stretch(4)) } });
    expect(game.rollDice(1, 5)).toMatchObject({ movablePieces: [], turnPassed: true });
    expect(game.getCurrentPlayer()).toBe(2);
    expect(game.getPiecePosition(1, 3)).toEqual(stretch(4));
  });

  it('peça que chegou à meta não se move mais', () => {
    const game = new Ludo({ positions: { 1: [goal(), track(10), base(), base()] } });
    expect(game.rollDice(1, 2).movablePieces).toEqual([1]);
    expect(game.movePiece(1, 0)).toEqual({ changed: false, reason: REASONS.INVALID_MOVE });
    expect(game.getPiecePosition(1, 0)).toEqual(goal());
  });

  it('a reta final é própria de cada jogador: não há captura dentro dela', () => {
    const game = new Ludo({
      positions: {
        1: [stretch(1), base(), base(), base()],
        2: [stretch(3), base(), base(), base()],
      },
    });
    game.rollDice(1, 2);
    expect(game.movePiece(1, 0).captured).toEqual([]);
    expect(game.getPiecePosition(1, 0)).toEqual(stretch(3));
    expect(game.getPiecePosition(2, 0)).toEqual(stretch(3));
  });
});
