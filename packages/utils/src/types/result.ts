export type Result<T, E extends Error> = Success<T, E> | Failure<T, E>;

export class Success<T, E extends Error> {
  readonly isSuccess = true;
  readonly isFailure = false;
  constructor(public readonly value: T) {}

  map<U>(fn: (val: T) => U): Result<U, E> {
    try {
      return new Success(fn(this.value));
    } catch (e) {
      return new Failure(e as E);
    }
  }

  mapError<F extends Error>(_fn: (err: E) => F): Result<T, F> {
    return new Success(this.value);
  }

  flatMap<U>(fn: (val: T) => Result<U, E>): Result<U, E> {
    try {
      return fn(this.value);
    } catch (e) {
      return new Failure(e as E);
    }
  }

  getOrThrow(): T {
    return this.value;
  }
}

export class Failure<T, E extends Error> {
  readonly isSuccess = false;
  readonly isFailure = true;
  constructor(public readonly error: E) {}

  map<U>(_fn: (val: T) => U): Result<U, E> {
    return new Failure(this.error);
  }

  mapError<F extends Error>(fn: (err: E) => F): Failure<T, F> {
    return new Failure(fn(this.error));
  }

  flatMap<U>(_fn: (val: T) => Result<U, E>): Failure<U, E> {
    return new Failure(this.error);
  }

  getOrThrow(): T {
    throw this.error;
  }
}

export const Result = {
  success<T, E extends Error = Error>(value: T): Success<T, E> {
    return new Success<T, E>(value);
  },

  failure<T = never, E extends Error = Error>(error: E): Failure<T, E> {
    return new Failure<T, E>(error);
  },

  try<T>(fn: () => T): Result<T, Error> {
    try {
      return Result.success(fn());
    } catch (e) {
      return Result.failure(e as Error);
    }
  },

  async tryAsync<T>(fn: () => Promise<T>): Promise<Result<T, Error>> {
    try {
      const value = await fn();
      return Result.success(value);
    } catch (e) {
      return Result.failure(e as Error);
    }
  },
};
