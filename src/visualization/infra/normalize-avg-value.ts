export const normalizeAverageValue = (array: any[], value: number, field = 'count'): any[] => {
  if (value === 0) {
    return array;
  }

  const avg = array.reduce((partialSum, a) => partialSum + a[field], 0) / array.length;

  return array.filter(r => r[field] > (avg / value));
}
