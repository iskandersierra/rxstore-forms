export const compose = <T, U, V>(
  f: (u: U) => T,
  g: (v: V) => U)
  : ((v: V) => T) =>
  (v: V) =>
    f(g(v));

export const assignIfExists = (
  to: any, source: any, name: string,
  coerce?: (value: any) => any) => {
  if ((source as Object).hasOwnProperty(name)) {
    const value = source[name];
    to[name] = coerce ? coerce(value) : value;
  }
};

export const flatten = (arr: any[], deep: boolean = true) => {
  let result: any[] = [];
  function flattenAux(array: any[], depth: number) {
    if (depth === 0) {
      result.push(...array);
    } else {
      array.forEach(element => {
        if (Array.isArray(element)) {
          flattenAux(element, depth - 1);
        } else {
          result.push(element);
        }
      });
    }
  }
  flattenAux(arr, deep ? -1 : 1);
  return result;
};
