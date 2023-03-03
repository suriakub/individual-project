export const roundNumber = (num: number, nDecimalPlaces: number) => {
  const roundFactor = Math.pow(10, nDecimalPlaces);
  return Math.round((num + Number.EPSILON) * roundFactor) / roundFactor;
};
