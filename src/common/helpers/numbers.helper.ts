/**
 * @param value
 */
export const floatToInt = (value) =>
  parseInt((parseFloat(parseFloat(value).toFixed(2)) * 100).toString());
