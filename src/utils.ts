export const compose = <Z, Y, X>(
  f: (y: Y) => Z,
  g: (x: X) => Y)
  : ((x: X) => Z) =>
  (x: X) => f(g(x));

export const compose3 = <U, Z, Y, X>(
  f: (z: Z) => U,
  g: (y: Y) => Z,
  h: (x: X) => Y)
  : ((x: X) => U) =>
  compose(f, compose(g, h));

export const compose4 = <V, U, Z, Y, X>(
  f: (u: U) => V,
  g: (z: Z) => U,
  h: (y: Y) => Z,
  j: (x: X) => Y)
  : ((x: X) => V) =>
  compose(compose(f, g), compose(h, j));

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
