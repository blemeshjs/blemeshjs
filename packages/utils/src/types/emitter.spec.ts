import { describe, expect, it } from "vitest";
import { BindableTinyEmitter } from "./emitter.js";
import { Mixin } from "ts-mixer";

interface Events {
  foo(x: number): void;
  bar(msg: string): void;
}

class Handler {
  fooCalls: number[] = [];
  barCalls: string[] = [];

  foo(x: number) {
    this.fooCalls.push(x);
  }
  bar(msg: string) {
    this.barCalls.push(msg);
  }
}

describe("BindableTinyEmitter", () => {
  it("binds handler methods and emits events", () => {
    const emitter = new BindableTinyEmitter<Events>();
    const handler = new Handler();

    emitter.bindAllEvents(handler);

    emitter.emit("foo", 42);
    emitter.emit("bar", "hello");

    expect(handler.fooCalls).toEqual([42]);
    expect(handler.barCalls).toEqual(["hello"]);
  });

  it("unbinds handler methods", () => {
    const emitter = new BindableTinyEmitter<Events>();
    const handler = new Handler();

    const off = emitter.bindAllEvents(handler);

    emitter.emit("foo", 1);
    off(); // unbind

    emitter.emit("foo", 2);
    expect(handler.fooCalls).toEqual([1]);
  });

  it("listen and off works for single event", () => {
    const emitter = new BindableTinyEmitter<Events>();
    const calls: number[] = [];
    const off = emitter.on("foo", (x) => calls.push(x));
    emitter.emit("foo", 5);
    off();
    emitter.emit("foo", 6);
    expect(calls).toEqual([5]);
  });

  it("once works", () => {
    const emitter = new BindableTinyEmitter<Events>();
    const calls: number[] = [];
    emitter.once("foo", (x) => calls.push(x));
    emitter.emit("foo", 5);
    emitter.emit("foo", 6);
    expect(calls).toEqual([5]);
  });

  it("listen and off works without listener", () => {
    const emitter = new BindableTinyEmitter<Events>();
    const calls: number[] = [];
    emitter.on("foo", (x) => calls.push(x));
    emitter.emit("foo", 5);
    emitter.off("foo");
    emitter.emit("foo", 6);
    expect(calls).toEqual([5]);
  });
});

describe("BindableTinyEmitter.bind supports plain objects", () => {
  it("binds function properties on plain objects", () => {
    const emitter = new BindableTinyEmitter<Events>();
    const handler = {
      fooCalls: [] as number[],
      barCalls: [] as string[],
      foo(x: number) {
        this.fooCalls.push(x);
      },
      bar(msg: string) {
        this.barCalls.push(msg);
      },
    };

    emitter.bindAllEvents(handler);

    emitter.emit("foo", 123);
    emitter.emit("bar", "hello");

    expect(handler.fooCalls).toEqual([123]);
    expect(handler.barCalls).toEqual(["hello"]);
  });
});

describe("BindableTinyEmitter.bind inheritance", () => {
  it("inheritance with Mixin", () => {
    type Ev = {
      add(x: number): void;
    };
    class RN extends BindableTinyEmitter<Ev> {
      static $instance: RN | null = null;
      arr: number[] = [];
      private constructor() {
        super();
      }
      public static get instance() {
        if (this.$instance === null) this.$instance = new RN();
        return this.$instance;
      }
      public add(x: number) {
        this.arr.push(x);
        this.emit("add", x);
      }
      public sum() {
        return this.arr.reduce((a, b) => a + b, 0);
      }
    }
    class Bearer extends BindableTinyEmitter<Ev> implements Partial<Ev> {
      sum = 0;
      protected rn!: RN;

      public constructor(rn: RN) {
        super();
        this.rn = rn;
      }

      add() {
        this.sum = this.rn.sum();
      }
    }
    class Other {}
    class Sub extends Mixin(Bearer, Other) {
      public constructor(rn: RN) {
        super(rn);
        rn.bindAllEvents(this);
      }
    }
    const rn = RN.instance;
    const bearer = new Sub(rn);
    const bearer2 = new Sub(rn);
    rn.add(1);

    expect(bearer.sum).toBe(rn.sum());
    expect(bearer2.sum).toBe(rn.sum());
    rn.unbindAllEvents(bearer);
    rn.add(2);
    expect(bearer.sum).toBe(1);
    expect(bearer2.sum).toBe(rn.sum());
  });
});

describe("unbindAllEvents removes handlers when handler object is removed from array", () => {
  it("should not call handlers after unbindAllEvents is called", () => {
    const emitter = new BindableTinyEmitter<Events>();
    let calls: number[] = [];

    class Handler {
      foo(x: number) {
        calls.push(x);
      }
      bar() {}
    }

    const arr: Handler[] = [new Handler()];
    emitter.bindAllEvents(arr[0]);

    emitter.emit("foo", 1);
    expect(calls).toEqual([1]);

    // Unbind all events for the handler
    emitter.unbindAllEvents(arr[0]);
    calls = [];
    emitter.emit("foo", 2);

    // Handler should not be called after unbinding
    expect(calls).toEqual([]);
  });
});
