// A little helper that takes an array of nested items + key and normalizes it.
export const normalize = <T>(arr: T[] = [], k: string) => {
  const ids: string[] = [];
  const byId = arr.reduce<Record<string, T>>((prev, curr) => {
    prev[curr[k]] = curr;
    ids.push(curr[k]);
    return prev;
  }, {});
  return { ids, byId };
};
