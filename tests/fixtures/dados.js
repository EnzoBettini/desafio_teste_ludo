function createDiceSequence(values) {
  let index = 0;
  const dice = () => {
    if (index >= values.length) {
      throw new Error('Dice sequence exhausted');
    }
    const value = values[index];
    index += 1;
    return value;
  };
  dice.remaining = () => values.length - index;
  return dice;
}

const NON_ENTRY_ROLLS = [1, 2, 3, 4, 5];

module.exports = {
  createDiceSequence,
  NON_ENTRY_ROLLS,
};
