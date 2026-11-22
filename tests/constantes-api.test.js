const ludo = require('../src/ludo');

describe('constantes e API', () => {
  it('2 jogadores, 4 peças cada, pista de 52 casas e reta final de 6', () => {
    expect(ludo.PLAYER_ONE).toBe(1);
    expect(ludo.PLAYER_TWO).toBe(2);
    expect(ludo.PLAYERS).toEqual([1, 2]);
    expect(ludo.PIECES_PER_PLAYER).toBe(4);
    expect(ludo.TRACK_LENGTH).toBe(52);
    expect(ludo.HOME_STRETCH_LENGTH).toBe(6);
  });

  it('saídas em lados opostos (0 e 26), que são as casas seguras', () => {
    expect(ludo.START_SQUARES).toEqual({ 1: 0, 2: 26 });
    expect(ludo.SAFE_SQUARES).toEqual([0, 26]);
  });

  it('marcos de progresso: base -1, última casa da pista 50, meta 57', () => {
    expect(ludo.BASE_PROGRESS).toBe(-1);
    expect(ludo.LAST_TRACK_PROGRESS).toBe(50);
    expect(ludo.GOAL_PROGRESS).toBe(57);
  });

  it('dado de 1 a 6; 6 para sair da base e 6 para jogada extra', () => {
    expect(ludo.DICE_MIN).toBe(1);
    expect(ludo.DICE_MAX).toBe(6);
    expect(ludo.ENTRY_ROLL).toBe(6);
    expect(ludo.EXTRA_TURN_ROLL).toBe(6);
  });

  it('zonas, status, fases do turno e motivos de recusa', () => {
    expect([ludo.ZONE_BASE, ludo.ZONE_TRACK, ludo.ZONE_HOME_STRETCH, ludo.ZONE_GOAL]).toEqual([
      'base',
      'track',
      'homeStretch',
      'goal',
    ]);
    expect([ludo.STATUS_PLAYING, ludo.STATUS_FINISHED]).toEqual(['playing', 'finished']);
    expect([ludo.TURN_ROLL, ludo.TURN_MOVE]).toEqual(['roll', 'move']);
    expect(ludo.REASONS).toEqual({
      GAME_OVER: 'game_over',
      NOT_YOUR_TURN: 'not_your_turn',
      MUST_ROLL: 'must_roll',
      MUST_MOVE: 'must_move',
      INVALID_MOVE: 'invalid_move',
    });
  });

  it('exporta a classe Ludo e os helpers puros', () => {
    expect(typeof ludo.Ludo).toBe('function');
    expect(typeof ludo.progressToPosition).toBe('function');
    expect(typeof ludo.positionToProgress).toBe('function');
    expect(typeof ludo.isSafeSquare).toBe('function');
    expect(typeof ludo.opponentOf).toBe('function');
  });

  it('opponentOf alterna 1 ↔ 2 e lança RangeError para jogador inexistente', () => {
    expect(ludo.opponentOf(1)).toBe(2);
    expect(ludo.opponentOf(2)).toBe(1);
    expect(() => ludo.opponentOf(3)).toThrow(RangeError);
  });
});
