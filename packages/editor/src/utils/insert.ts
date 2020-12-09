export const insert = <T>(
  arr: Array<T>,
  index: number,
  newItem: T,
) => [
  // part of the array before the specified index
  ...arr.slice(0, index),
  // inserted item
  newItem,
  // part of the array after the specified index
  ...arr.slice(index),
];

export const insertArray = <T>(
  arr: Array<T>,
  index: number,
  newItems: Array<T>,
) => [
  ...arr.slice(0, index),
  ...newItems,
  ...arr.slice(index),
];
