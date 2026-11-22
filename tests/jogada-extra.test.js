const { Ludo } = require('../src/ludo');
const { track, stretch, goal, oneTrackPiece, lastPieceAt } = require('./fixtures/posicoes');

describe('jogada extra com 6', () => {
  it('mover com 6 dá nova rolagem ao mesmo jogador', () => {
    const game = new Ludo({ positions: { 1: oneTrackPiece(10) } });
    game.rollDice(1, 6);
    expect(game.movePiece(1, 0)).toMatchObject({ to: track(16), extraTurn: true });
    expect(game.getCurrentPlayer()).toBe(1);
    expect(game.getTurnPhase()).toBe('roll');
  });

  it('sair da base com 6 também dá jogada extra', () => {
    const game = new Ludo();
    game.rollDice(1, 6);
    expect(game.movePiece(1, 0).extraTurn).toBe(true);
    expect(game.getCurrentPlayer()).toBe(1);
  });

  it('valor diferente de 6 passa a vez ao adversário', () => {
    const game = new Ludo({ positions: { 1: oneTrackPiece(10) } });
    game.rollDice(1, 5);
    expect(game.movePiece(1, 0).extraTurn).toBe(false);
    expect(game.getCurrentPlayer()).toBe(2);
    expect(game.getTurnPhase()).toBe('roll');
  });

  it('não há limite de 6 seguidos: a vez só passa quando sai outro valor', () => {
    const game = new Ludo();
    for (let i = 0; i < 4; i += 1) {
      game.rollDice(1, 6);
      expect(game.movePiece(1, 0).extraTurn).toBe(true);
      expect(game.getCurrentPlayer()).toBe(1);
    }
    expect(game.getPiecePosition(1, 0)).toEqual(track(18));
    game.rollDice(1, 2);
    game.movePiece(1, 0);
    expect(game.getCurrentPlayer()).toBe(2);
  });

  it('6 sem nenhum movimento possível não dá jogada extra: a vez passa', () => {
    const game = new Ludo({ positions: { 1: lastPieceAt(stretch(3)) } });
    expect(game.rollDice(1, 6)).toMatchObject({ movablePieces: [], turnPassed: true });
    expect(game.getCurrentPlayer()).toBe(2);
  });

  it('movimento vencedor com 6 encerra a partida sem jogada extra', () => {
    const game = new Ludo({ positions: { 1: lastPieceAt(stretch(1)) } });
    game.rollDice(1, 6);
    expect(game.movePiece(1, 3)).toMatchObject({ to: goal(), extraTurn: false, winner: 1 });
    expect(game.getStatus()).toBe('finished');
  });
});
