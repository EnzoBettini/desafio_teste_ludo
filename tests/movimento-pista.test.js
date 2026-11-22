const { Ludo } = require('../src/ludo');
const { base, track, stretch, goal, oneTrackPiece } = require('./fixtures/posicoes');

describe('movimento na pista', () => {
  it('peça avança exatamente o valor do dado no sentido crescente', () => {
    const game = new Ludo({ positions: { 1: oneTrackPiece(10) } });
    game.rollDice(1, 4);
    expect(game.movePiece(1, 0)).toMatchObject({ changed: true, from: track(10), to: track(14) });
    expect(game.getPiecePosition(1, 0)).toEqual(track(14));
  });

  it('volta circular: jogador 2 na casa 49 com 5 vai para a casa 2', () => {
    const game = new Ludo({ currentPlayer: 2, positions: { 2: oneTrackPiece(49) } });
    game.rollDice(2, 5);
    expect(game.movePiece(2, 0).to).toEqual(track(2));
  });

  it('volta circular: da casa 51 com 1 a peça do jogador 2 vai para a casa 0', () => {
    const game = new Ludo({ currentPlayer: 2, positions: { 2: oneTrackPiece(51) } });
    game.rollDice(2, 1);
    expect(game.movePiece(2, 0).to).toEqual(track(0));
  });

  it('jogador 1 não dá segunda volta: da casa 48 com 4 entra na reta final (step 2)', () => {
    const game = new Ludo({ positions: { 1: oneTrackPiece(48) } });
    game.rollDice(1, 4);
    expect(game.movePiece(1, 0).to).toEqual(stretch(2));
  });

  it('peças do mesmo jogador podem ocupar a mesma casa', () => {
    const game = new Ludo({ positions: { 1: [track(10), track(13), base(), base()] } });
    game.rollDice(1, 3);
    expect(game.movePiece(1, 0).captured).toEqual([]);
    expect(game.getPiecePosition(1, 0)).toEqual(track(13));
    expect(game.getPiecePosition(1, 1)).toEqual(track(13));
  });

  it('movablePieces lista só as peças com movimento válido para o valor rolado', () => {
    const game = new Ludo({ positions: { 1: [track(10), goal(), stretch(5), base()] } });
    expect(game.rollDice(1, 3).movablePieces).toEqual([0]);
    expect(game.getMovablePieces()).toEqual([0]);
    expect(game.getTurnPhase()).toBe('move');
  });
});
