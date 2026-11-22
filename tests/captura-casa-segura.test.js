const { Ludo, isSafeSquare } = require('../src/ludo');
const { base, track, allBase, oneTrackPiece } = require('./fixtures/posicoes');

describe('captura', () => {
  it('parar em casa com peça adversária manda essa peça de volta para a base', () => {
    const game = new Ludo({ positions: { 1: oneTrackPiece(10), 2: oneTrackPiece(14) } });
    game.rollDice(1, 4);
    const result = game.movePiece(1, 0);
    expect(result.captured).toEqual([{ player: 2, piece: 0 }]);
    expect(result.extraTurn).toBe(false);
    expect(game.getPiecePosition(1, 0)).toEqual(track(14));
    expect(game.getPiecePosition(2, 0)).toEqual(base());
    expect(game.getCurrentPlayer()).toBe(2);
  });

  it('todas as peças adversárias da casa são capturadas de uma vez', () => {
    const game = new Ludo({
      positions: { 1: oneTrackPiece(10), 2: [track(14), base(), track(14), track(40)] },
    });
    game.rollDice(1, 4);
    expect(game.movePiece(1, 0).captured).toEqual([
      { player: 2, piece: 0 },
      { player: 2, piece: 2 },
    ]);
    expect(game.getState().pieces[2]).toEqual([base(), base(), base(), track(40)]);
  });

  it('passar por cima de peça adversária não captura', () => {
    const game = new Ludo({ positions: { 1: oneTrackPiece(10), 2: oneTrackPiece(12) } });
    game.rollDice(1, 4);
    expect(game.movePiece(1, 0).captured).toEqual([]);
    expect(game.getPiecePosition(2, 0)).toEqual(track(12));
  });

  it('jogador 2 também captura, inclusive depois de dar a volta na pista', () => {
    const game = new Ludo({
      currentPlayer: 2,
      positions: { 1: oneTrackPiece(2), 2: oneTrackPiece(50) },
    });
    game.rollDice(2, 4);
    expect(game.movePiece(2, 0)).toMatchObject({
      to: track(2),
      captured: [{ player: 1, piece: 0 }],
    });
    expect(game.getPiecePosition(1, 0)).toEqual(base());
  });

  it('peça capturada só volta para a pista com 6', () => {
    const game = new Ludo({ positions: { 1: oneTrackPiece(10), 2: oneTrackPiece(14) } });
    game.rollDice(1, 4);
    game.movePiece(1, 0);
    expect(game.rollDice(2, 5)).toMatchObject({ movablePieces: [], turnPassed: true });
    game.rollDice(1, 1);
    game.movePiece(1, 0);
    expect(game.rollDice(2, 6).movablePieces).toEqual([0, 1, 2, 3]);
    expect(game.movePiece(2, 0).to).toEqual(track(26));
  });
});

describe('casas seguras', () => {
  it('as casas seguras são exatamente as saídas 0 e 26', () => {
    expect(isSafeSquare(0)).toBe(true);
    expect(isSafeSquare(26)).toBe(true);
    for (const square of [1, 13, 25, 27, 39, 51]) {
      expect(isSafeSquare(square)).toBe(false);
    }
  });

  it('parar na saída do adversário não captura: as peças coexistem', () => {
    const game = new Ludo({ positions: { 1: oneTrackPiece(22), 2: oneTrackPiece(26) } });
    game.rollDice(1, 4);
    expect(game.movePiece(1, 0).captured).toEqual([]);
    expect(game.getPiecePosition(1, 0)).toEqual(track(26));
    expect(game.getPiecePosition(2, 0)).toEqual(track(26));
  });

  it('sair da base na própria saída não captura a peça adversária que está lá', () => {
    const game = new Ludo({ positions: { 1: allBase(), 2: oneTrackPiece(0) } });
    game.rollDice(1, 6);
    expect(game.movePiece(1, 0).captured).toEqual([]);
    expect(game.getPiecePosition(1, 0)).toEqual(track(0));
    expect(game.getPiecePosition(2, 0)).toEqual(track(0));
  });
});
