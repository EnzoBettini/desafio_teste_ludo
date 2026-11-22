const {
  ZONE_BASE,
  ZONE_TRACK,
  ZONE_HOME_STRETCH,
  ZONE_GOAL,
  PLAYER_ONE,
  PLAYER_TWO,
} = require('../../src/ludo');

const base = () => ({ zone: ZONE_BASE });
const track = (square) => ({ zone: ZONE_TRACK, square });
const stretch = (step) => ({ zone: ZONE_HOME_STRETCH, step });
const goal = () => ({ zone: ZONE_GOAL });

const allBase = () => [base(), base(), base(), base()];

const oneTrackPiece = (square) => [track(square), base(), base(), base()];

const lastPieceAt = (position) => [goal(), goal(), goal(), position];

const endgameRace = () => ({
  [PLAYER_ONE]: lastPieceAt(track(49)),
  [PLAYER_TWO]: lastPieceAt(stretch(2)),
});

const playerOneNeedsTwo = () => ({
  [PLAYER_ONE]: lastPieceAt(stretch(5)),
  [PLAYER_TWO]: allBase(),
});

module.exports = {
  base,
  track,
  stretch,
  goal,
  allBase,
  oneTrackPiece,
  lastPieceAt,
  endgameRace,
  playerOneNeedsTwo,
};
