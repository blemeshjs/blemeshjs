/* eslint-disable */
export function createProxy<
  TInternal extends object,
  TPublic extends object,
  TAllowedMethods extends readonly (keyof TInternal)[],
  TAllowedProps extends readonly (keyof TInternal)[],
>(
  node: TInternal,
  api: TPublic,
  allowedMethods: TAllowedMethods,
  allowedProps: TAllowedProps,
): TPublic & Pick<TInternal, TAllowedMethods[number]> & Pick<TInternal, TAllowedProps[number]> {
  return new Proxy(api as any, {
    get(target, prop, receiver) {
      if (typeof prop === "symbol") {
        return Reflect.get(target, prop, receiver);
      }

      // 1. Class API
      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }

      const value = (node as any)[prop];

      // 2. Methods
      if (typeof value === "function") {
        if (allowedMethods.includes(prop as any)) {
          return value.bind(node);
        }
        throw new Error(`Method ${String(prop)} not allowed`);
      }

      // 3. Properties
      if (allowedProps.includes(prop as any)) {
        return value;
      }

      throw new Error(`Property ${String(prop)} not allowed`);
    },
  }) as any;
}

export function keysOf<T>() {
  return <K extends readonly (keyof T)[]>(keys: K) => keys;
}
