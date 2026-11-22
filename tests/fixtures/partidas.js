const { PLAYER_ONE, PLAYER_TWO } = require('../../src/ludo');
const { track, stretch, goal } = require('./posicoes');

const move = (player, roll, piece, to, captured = []) => ({ player, roll, piece, to, captured });
const pass = (player, roll) => ({ player, roll, piece: null });

function rushToGoal(piece) {
  const sixes = Array.from({ length: 8 }, (_, i) => move(PLAYER_ONE, 6, piece, track(6 * (i + 1))));
  return [
    move(PLAYER_ONE, 6, piece, track(0)),
    ...sixes,
    move(PLAYER_ONE, 6, piece, stretch(4)),
    move(PLAYER_ONE, 3, piece, goal()),
  ];
}

const OPENING_WITH_CAPTURE = [
  move(PLAYER_ONE, 6, 0, track(0)),
  move(PLAYER_ONE, 6, 0, track(6)),
  move(PLAYER_ONE, 2, 0, track(8)),
  move(PLAYER_TWO, 6, 0, track(26)),
  move(PLAYER_TWO, 4, 0, track(30)),
  move(PLAYER_ONE, 6, 0, track(14)),
  move(PLAYER_ONE, 6, 0, track(20)),
  move(PLAYER_ONE, 6, 0, track(26)),
  move(PLAYER_ONE, 4, 0, track(30), [{ player: PLAYER_TWO, piece: 0 }]),
  pass(PLAYER_TWO, 3),
  move(PLAYER_ONE, 6, 0, track(36)),
  move(PLAYER_ONE, 6, 0, track(42)),
  move(PLAYER_ONE, 6, 0, track(48)),
  move(PLAYER_ONE, 6, 0, stretch(4)),
  move(PLAYER_ONE, 3, 0, goal()),
];

const FULL_GAME = [
  ...OPENING_WITH_CAPTURE,
  pass(PLAYER_TWO, 5),
  ...rushToGoal(1),
  pass(PLAYER_TWO, 2),
  ...rushToGoal(2),
  pass(PLAYER_TWO, 1),
  ...rushToGoal(3),
];

const FULL_GAME_DICE = FULL_GAME.map((step) => step.roll);

const ENDGAME_DICE = [6, 3, 6, 2];

module.exports = {
  rushToGoal,
  OPENING_WITH_CAPTURE,
  FULL_GAME,
  FULL_GAME_DICE,
  ENDGAME_DICE,
};
