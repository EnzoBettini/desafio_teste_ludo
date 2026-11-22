const { Ludo, PLAYERS, PIECES_PER_PLAYER } = require('../src/ludo');
const { base, track, stretch, goal, allBase, lastPieceAt } = require('./fixtures/posicoes');

describe('estado inicial', () => {
  it('partida começa em andamento, na vez do jogador 1, aguardando rolagem', () => {
    const game = new Ludo();
    expect(game.getStatus()).toBe('playing');
    expect(game.getCurrentPlayer()).toBe(1);
    expect(game.getTurnPhase()).toBe('roll');
    expect(game.getLastRoll()).toBeNull();
    expect(game.getWinner()).toBeNull();
    expect(game.getMovablePieces()).toEqual([]);
  });

  it('todas as 4 peças de cada jogador começam na base', () => {
    const game = new Ludo();
    for (const player of PLAYERS) {
      for (let piece = 0; piece < PIECES_PER_PLAYER; piece += 1) {
        expect(game.getPiecePosition(player, piece)).toEqual(base());
      }
    }
  });

  it('getState devolve o snapshot completo da partida', () => {
    expect(new Ludo().getState()).toEqual({
      status: 'playing',
      currentPlayer: 1,
      turnPhase: 'roll',
      lastRoll: null,
      winner: null,
      movablePieces: [],
      pieces: { 1: allBase(), 2: allBase() },
    });
  });

  it('alterar o retorno de getState ou getPiecePosition não altera a partida', () => {
    const game = new Ludo();
    const state = game.getState();
    state.status = 'finished';
    state.pieces[1][0] = track(10);
    const position = game.getPiecePosition(2, 0);
    position.zone = 'goal';

    expect(game.getStatus()).toBe('playing');
    expect(game.getPiecePosition(1, 0)).toEqual(base());
    expect(game.getPiecePosition(2, 0)).toEqual(base());
  });

  it('construtor aceita jogador inicial e posições pré-montadas (jogador omitido fica na base)', () => {
    const game = new Ludo({
      currentPlayer: 2,
      positions: { 1: [track(10), base(), stretch(3), goal()] },
    });
    expect(game.getCurrentPlayer()).toBe(2);
    expect(game.getState().pieces).toEqual({
      1: [track(10), base(), stretch(3), goal()],
      2: allBase(),
    });
  });

  it('opções inválidas no construtor lançam erro', () => {
    expect(() => new Ludo({ currentPlayer: 3 })).toThrow(RangeError);
    expect(() => new Ludo({ dice: 4 })).toThrow(TypeError);
    expect(() => new Ludo({ positions: { 1: [base(), base(), base()] } })).toThrow(RangeError);
    expect(() => new Ludo({ positions: { 2: 'base' } })).toThrow(RangeError);
    expect(() => new Ludo({ positions: { 1: [track(51), base(), base(), base()] } })).toThrow(
      RangeError,
    );
  });

  it('estados impossíveis lançam erro; adversários juntos só em casa segura', () => {
    expect(() => new Ludo({ positions: { 1: [goal(), goal(), goal(), goal()] } })).toThrow(Error);
    expect(
      () =>
        new Ludo({
          positions: {
            1: [track(14), base(), base(), base()],
            2: [track(14), base(), base(), base()],
          },
        }),
    ).toThrow(Error);
    expect(
      () =>
        new Ludo({
          positions: {
            1: [track(26), track(0), base(), base()],
            2: [track(26), track(0), base(), base()],
          },
        }),
    ).not.toThrow();
    expect(() => new Ludo({ positions: { 2: lastPieceAt(stretch(6)) } })).not.toThrow();
  });
});
