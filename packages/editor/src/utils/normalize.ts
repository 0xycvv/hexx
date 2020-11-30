// A little helper that takes an array of nested items + key and normalizes it.
export const normalize = (arr = [], k) => {
  const ids = [];
  const byId = arr.reduce((prev, curr) => {
    prev[curr[k]] = curr;
    ids.push(curr[k]);
    return prev;
  }, {});
  return { ids, byId };
};
