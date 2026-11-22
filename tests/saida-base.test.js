const { Ludo, REASONS } = require('../src/ludo');
const { base, track, oneTrackPiece } = require('./fixtures/posicoes');
const { NON_ENTRY_ROLLS } = require('./fixtures/dados');

describe('saída da base', () => {
  it('com 6 qualquer peça da base pode sair e vai para a casa de saída do jogador 1 (casa 0)', () => {
    const game = new Ludo();
    expect(game.rollDice(1, 6).movablePieces).toEqual([0, 1, 2, 3]);
    const result = game.movePiece(1, 2);
    expect(result).toMatchObject({ changed: true, from: base(), to: track(0) });
    expect(game.getPiecePosition(1, 2)).toEqual(track(0));
  });

  it('a peça do jogador 2 sai na casa 26 e não anda as 6 casas do dado', () => {
    const game = new Ludo({ currentPlayer: 2 });
    game.rollDice(2, 6);
    expect(game.movePiece(2, 0).to).toEqual(track(26));
    expect(game.getPiecePosition(2, 0)).not.toEqual(track(32));
  });

  it('sem 6 nenhuma peça sai da base e a vez passa', () => {
    for (const value of NON_ENTRY_ROLLS) {
      const game = new Ludo();
      const result = game.rollDice(1, value);
      expect(result).toEqual({ changed: true, value, movablePieces: [], turnPassed: true });
      expect(game.getState().pieces[1]).toEqual([base(), base(), base(), base()]);
      expect(game.getCurrentPlayer()).toBe(2);
    }
  });

  it('com peça na pista e dado diferente de 6, só ela é movível; tentar mover peça da base é recusado', () => {
    const game = new Ludo({ positions: { 1: oneTrackPiece(10) } });
    expect(game.rollDice(1, 5).movablePieces).toEqual([0]);
    const before = game.getState();
    expect(game.movePiece(1, 1)).toEqual({ changed: false, reason: REASONS.INVALID_MOVE });
    expect(game.getState()).toEqual(before);
    expect(game.movePiece(1, 0).to).toEqual(track(15));
  });

  it('segunda peça pode sair para a casa de saída já ocupada por peça própria', () => {
    const game = new Ludo({ positions: { 1: oneTrackPiece(0) } });
    game.rollDice(1, 6);
    expect(game.movePiece(1, 1).captured).toEqual([]);
    expect(game.getPiecePosition(1, 0)).toEqual(track(0));
    expect(game.getPiecePosition(1, 1)).toEqual(track(0));
  });
});
