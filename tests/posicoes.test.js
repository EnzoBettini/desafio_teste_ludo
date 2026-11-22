const {
  progressToPosition,
  positionToProgress,
  PLAYERS,
  BASE_PROGRESS,
  GOAL_PROGRESS,
} = require('../src/ludo');
const { base, track, stretch, goal } = require('./fixtures/posicoes');

describe('mapeamento progresso ↔ posição', () => {
  it('jogador 1: progresso 0–50 é a própria casa da pista, 51–56 é a reta final, 57 é a meta', () => {
    expect(progressToPosition(1, -1)).toEqual(base());
    expect(progressToPosition(1, 0)).toEqual(track(0));
    expect(progressToPosition(1, 50)).toEqual(track(50));
    expect(progressToPosition(1, 51)).toEqual(stretch(1));
    expect(progressToPosition(1, 56)).toEqual(stretch(6));
    expect(progressToPosition(1, 57)).toEqual(goal());
  });

  it('jogador 2: sai na casa 26, passa da 51 para a 0 e deixa a pista na casa 24', () => {
    expect(progressToPosition(2, 0)).toEqual(track(26));
    expect(progressToPosition(2, 25)).toEqual(track(51));
    expect(progressToPosition(2, 26)).toEqual(track(0));
    expect(progressToPosition(2, 50)).toEqual(track(24));
    expect(progressToPosition(2, 51)).toEqual(stretch(1));
  });

  it('positionToProgress é o inverso de progressToPosition para os dois jogadores', () => {
    for (const player of PLAYERS) {
      for (let progress = BASE_PROGRESS; progress <= GOAL_PROGRESS; progress += 1) {
        expect(positionToProgress(player, progressToPosition(player, progress))).toBe(progress);
      }
    }
  });

  it('a casa anterior à própria saída nunca é visitada: J1 na 51 e J2 na 25 são posições inválidas', () => {
    expect(() => positionToProgress(1, track(51))).toThrow(RangeError);
    expect(() => positionToProgress(2, track(25))).toThrow(RangeError);
    expect(positionToProgress(2, track(51))).toBe(25);
    expect(positionToProgress(1, track(25))).toBe(25);
  });

  it('posições e progressos malformados lançam RangeError', () => {
    const invalidPositions = [
      stretch(0),
      stretch(7),
      track(52),
      track(-1),
      track(1.5),
      { zone: 'nowhere' },
      null,
    ];
    for (const position of invalidPositions) {
      expect(() => positionToProgress(1, position)).toThrow(RangeError);
    }
    expect(() => progressToPosition(1, -2)).toThrow(RangeError);
    expect(() => progressToPosition(1, 58)).toThrow(RangeError);
    expect(() => progressToPosition(1, 2.5)).toThrow(RangeError);
    expect(() => progressToPosition(3, 0)).toThrow(RangeError);
    expect(() => positionToProgress(0, base())).toThrow(RangeError);
  });
});
