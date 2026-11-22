const PLAYER_ONE = 1;
const PLAYER_TWO = 2;
const PLAYERS = Object.freeze([PLAYER_ONE, PLAYER_TWO]);

const PIECES_PER_PLAYER = 4;
const TRACK_LENGTH = 52;
const HOME_STRETCH_LENGTH = 6;

const START_SQUARES = Object.freeze({ [PLAYER_ONE]: 0, [PLAYER_TWO]: 26 });
const SAFE_SQUARES = Object.freeze([START_SQUARES[PLAYER_ONE], START_SQUARES[PLAYER_TWO]]);

const BASE_PROGRESS = -1;
const LAST_TRACK_PROGRESS = TRACK_LENGTH - 2;
const GOAL_PROGRESS = LAST_TRACK_PROGRESS + HOME_STRETCH_LENGTH + 1;

const DICE_MIN = 1;
const DICE_MAX = 6;
const ENTRY_ROLL = 6;
const EXTRA_TURN_ROLL = 6;

const ZONE_BASE = 'base';
const ZONE_TRACK = 'track';
const ZONE_HOME_STRETCH = 'homeStretch';
const ZONE_GOAL = 'goal';

const STATUS_PLAYING = 'playing';
const STATUS_FINISHED = 'finished';

const TURN_ROLL = 'roll';
const TURN_MOVE = 'move';

const REASONS = Object.freeze({
  GAME_OVER: 'game_over',
  NOT_YOUR_TURN: 'not_your_turn',
  MUST_ROLL: 'must_roll',
  MUST_MOVE: 'must_move',
  INVALID_MOVE: 'invalid_move',
});

function assertPlayer(player) {
  if (player !== PLAYER_ONE && player !== PLAYER_TWO) {
    throw new RangeError(`Invalid player: ${player}`);
  }
}

function assertPieceIndex(piece) {
  if (!Number.isInteger(piece) || piece < 0 || piece >= PIECES_PER_PLAYER) {
    throw new RangeError(`Invalid piece index: ${piece}`);
  }
}

function assertDiceValue(value) {
  if (!Number.isInteger(value) || value < DICE_MIN || value > DICE_MAX) {
    throw new RangeError(`Invalid dice value: ${value}`);
  }
}

function defaultDice() {
  return Math.floor(Math.random() * DICE_MAX) + DICE_MIN;
}

function opponentOf(player) {
  assertPlayer(player);
  return player === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE;
}

function isSafeSquare(square) {
  return SAFE_SQUARES.includes(square);
}

function isOnTrack(progress) {
  return progress >= 0 && progress <= LAST_TRACK_PROGRESS;
}

function trackSquare(player, progress) {
  return (START_SQUARES[player] + progress) % TRACK_LENGTH;
}

function progressToPosition(player, progress) {
  assertPlayer(player);
  if (!Number.isInteger(progress) || progress < BASE_PROGRESS || progress > GOAL_PROGRESS) {
    throw new RangeError(`Invalid progress: ${progress}`);
  }
  if (progress === BASE_PROGRESS) return { zone: ZONE_BASE };
  if (progress === GOAL_PROGRESS) return { zone: ZONE_GOAL };
  if (isOnTrack(progress)) return { zone: ZONE_TRACK, square: trackSquare(player, progress) };
  return { zone: ZONE_HOME_STRETCH, step: progress - LAST_TRACK_PROGRESS };
}

function trackProgress(player, square) {
  if (!Number.isInteger(square) || square < 0 || square >= TRACK_LENGTH) return null;
  const progress = (square - START_SQUARES[player] + TRACK_LENGTH) % TRACK_LENGTH;
  return isOnTrack(progress) ? progress : null;
}

function stretchProgress(step) {
  if (!Number.isInteger(step) || step < 1 || step > HOME_STRETCH_LENGTH) return null;
  return LAST_TRACK_PROGRESS + step;
}

function positionToProgress(player, position) {
  assertPlayer(player);
  const zone = position ? position.zone : undefined;
  let progress = null;
  if (zone === ZONE_BASE) progress = BASE_PROGRESS;
  if (zone === ZONE_GOAL) progress = GOAL_PROGRESS;
  if (zone === ZONE_TRACK) progress = trackProgress(player, position.square);
  if (zone === ZONE_HOME_STRETCH) progress = stretchProgress(position.step);
  if (progress === null) {
    throw new RangeError(`Invalid position for player ${player}: ${JSON.stringify(position)}`);
  }
  return progress;
}

function canMove(progress, roll) {
  if (progress === GOAL_PROGRESS) return false;
  if (progress === BASE_PROGRESS) return roll === ENTRY_ROLL;
  return progress + roll <= GOAL_PROGRESS;
}

function targetProgress(progress, roll) {
  return progress === BASE_PROGRESS ? 0 : progress + roll;
}

function buildPlayerProgress(player, positions) {
  if (positions === undefined) {
    return Array(PIECES_PER_PLAYER).fill(BASE_PROGRESS);
  }
  if (!Array.isArray(positions) || positions.length !== PIECES_PER_PLAYER) {
    throw new RangeError(`Player ${player} must have exactly ${PIECES_PER_PLAYER} positions`);
  }
  const progress = positions.map((position) => positionToProgress(player, position));
  if (progress.every((p) => p === GOAL_PROGRESS)) {
    throw new Error(`Player ${player} cannot start with all pieces in goal`);
  }
  return progress;
}

class Ludo {
  constructor(options = {}) {
    const { dice = defaultDice, positions = {}, currentPlayer = PLAYER_ONE } = options;
    if (typeof dice !== 'function') {
      throw new TypeError('dice must be a function');
    }
    assertPlayer(currentPlayer);

    this._dice = dice;
    this._status = STATUS_PLAYING;
    this._currentPlayer = currentPlayer;
    this._turnPhase = TURN_ROLL;
    this._lastRoll = null;
    this._winner = null;
    this._progress = {
      [PLAYER_ONE]: buildPlayerProgress(PLAYER_ONE, positions[PLAYER_ONE]),
      [PLAYER_TWO]: buildPlayerProgress(PLAYER_TWO, positions[PLAYER_TWO]),
    };
    this._assertNoOpponentsSharingUnsafeSquare();
  }

  getStatus() {
    return this._status;
  }

  getCurrentPlayer() {
    return this._currentPlayer;
  }

  getTurnPhase() {
    return this._status === STATUS_FINISHED ? null : this._turnPhase;
  }

  getLastRoll() {
    return this._lastRoll;
  }

  getWinner() {
    return this._winner;
  }

  getPiecePosition(player, piece) {
    assertPlayer(player);
    assertPieceIndex(piece);
    return progressToPosition(player, this._progress[player][piece]);
  }

  getMovablePieces() {
    if (this.getTurnPhase() !== TURN_MOVE) return [];
    return this._movablePiecesFor(this._currentPlayer, this._lastRoll);
  }

  getState() {
    const pieces = {};
    for (const player of PLAYERS) {
      pieces[player] = this._progress[player].map((p) => progressToPosition(player, p));
    }
    return {
      status: this._status,
      currentPlayer: this._currentPlayer,
      turnPhase: this.getTurnPhase(),
      lastRoll: this._lastRoll,
      winner: this._winner,
      movablePieces: this.getMovablePieces(),
      pieces,
    };
  }

  rollDice(player, value) {
    assertPlayer(player);
    if (value !== undefined) assertDiceValue(value);

    const refusal = this._refuse(player, TURN_ROLL);
    if (refusal) return refusal;

    const rolled = value === undefined ? this._rollInjectedDice() : value;
    this._lastRoll = rolled;
    const movablePieces = this._movablePiecesFor(player, rolled);
    const turnPassed = movablePieces.length === 0;
    if (turnPassed) {
      this._passTurn();
    } else {
      this._turnPhase = TURN_MOVE;
    }
    return { changed: true, value: rolled, movablePieces, turnPassed };
  }

  movePiece(player, piece) {
    assertPlayer(player);
    assertPieceIndex(piece);

    const refusal = this._refuse(player, TURN_MOVE);
    if (refusal) return refusal;

    const roll = this._lastRoll;
    const current = this._progress[player][piece];
    if (!canMove(current, roll)) {
      return { changed: false, reason: REASONS.INVALID_MOVE };
    }

    const next = targetProgress(current, roll);
    this._progress[player][piece] = next;
    const captured = this._captureAt(player, next);
    const from = progressToPosition(player, current);
    const to = progressToPosition(player, next);

    if (this._progress[player].every((p) => p === GOAL_PROGRESS)) {
      this._status = STATUS_FINISHED;
      this._winner = player;
      return { changed: true, from, to, captured, extraTurn: false, winner: player };
    }

    const extraTurn = roll === EXTRA_TURN_ROLL;
    if (extraTurn) {
      this._turnPhase = TURN_ROLL;
    } else {
      this._passTurn();
    }
    return { changed: true, from, to, captured, extraTurn, winner: null };
  }

  _refuse(player, expectedPhase) {
    if (this._status === STATUS_FINISHED) {
      return { changed: false, reason: REASONS.GAME_OVER };
    }
    if (player !== this._currentPlayer) {
      return { changed: false, reason: REASONS.NOT_YOUR_TURN };
    }
    if (this._turnPhase !== expectedPhase) {
      const reason = expectedPhase === TURN_ROLL ? REASONS.MUST_MOVE : REASONS.MUST_ROLL;
      return { changed: false, reason };
    }
    return null;
  }

  _rollInjectedDice() {
    const value = this._dice();
    assertDiceValue(value);
    return value;
  }

  _movablePiecesFor(player, roll) {
    const movable = [];
    this._progress[player].forEach((progress, index) => {
      if (canMove(progress, roll)) movable.push(index);
    });
    return movable;
  }

  _passTurn() {
    this._currentPlayer = opponentOf(this._currentPlayer);
    this._turnPhase = TURN_ROLL;
  }

  _captureAt(player, progress) {
    if (!isOnTrack(progress)) return [];
    const square = trackSquare(player, progress);
    if (isSafeSquare(square)) return [];

    const opponent = opponentOf(player);
    const captured = [];
    this._progress[opponent].forEach((opponentProgress, index) => {
      if (isOnTrack(opponentProgress) && trackSquare(opponent, opponentProgress) === square) {
        this._progress[opponent][index] = BASE_PROGRESS;
        captured.push({ player: opponent, piece: index });
      }
    });
    return captured;
  }

  _assertNoOpponentsSharingUnsafeSquare() {
    const squaresOf = (player) =>
      this._progress[player].filter(isOnTrack).map((p) => trackSquare(player, p));
    const playerTwoSquares = new Set(squaresOf(PLAYER_TWO));
    for (const square of squaresOf(PLAYER_ONE)) {
      if (!isSafeSquare(square) && playerTwoSquares.has(square)) {
        throw new Error(`Opponent pieces cannot share unsafe square ${square}`);
      }
    }
  }
}

module.exports = {
  PLAYER_ONE,
  PLAYER_TWO,
  PLAYERS,
  PIECES_PER_PLAYER,
  TRACK_LENGTH,
  HOME_STRETCH_LENGTH,
  START_SQUARES,
  SAFE_SQUARES,
  BASE_PROGRESS,
  LAST_TRACK_PROGRESS,
  GOAL_PROGRESS,
  DICE_MIN,
  DICE_MAX,
  ENTRY_ROLL,
  EXTRA_TURN_ROLL,
  ZONE_BASE,
  ZONE_TRACK,
  ZONE_HOME_STRETCH,
  ZONE_GOAL,
  STATUS_PLAYING,
  STATUS_FINISHED,
  TURN_ROLL,
  TURN_MOVE,
  REASONS,
  Ludo,
  opponentOf,
  isSafeSquare,
  progressToPosition,
  positionToProgress,
};
