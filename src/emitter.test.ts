import { expect, test, vi } from "vitest";
import { Emitter } from "./emitter";

type Events = {
  "counter:increment": [amount: number];
  "counter:decrement": [amount: number];
  "counter:reset": [];
};

test("throws error if eventName is not string or symbol", () => {
  const emitter = new Emitter<Events>();
  expect(() => emitter.emit(5 as any)).toThrowError(
    "eventName should be a string or symbol"
  );
});

test("throws error if you try to emit wildcard", () => {
  const emitter = new Emitter<Events>();
  expect(() => emitter.emit("*" as any, "asdf")).toThrowError(
    "'*' is not an emittable event"
  );
});

test("on: registers listeners", () => {
  const emitter = new Emitter<Events>();

  let count = 0;

  const inc = vi.fn((amount: number) => {
    count += amount;
  });
  const dec = vi.fn((amount: number) => {
    count -= amount;
  });

  emitter.on("counter:increment", inc);
  emitter.on("counter:decrement", dec);

  emitter.emit("counter:increment", 5);
  emitter.emit("counter:decrement", 2);

  expect(count).toBe(3);
  expect(inc).toHaveBeenCalledOnce();
  expect(dec).toHaveBeenCalledOnce();
});

test("off: removes listeners", () => {
  const emitter = new Emitter<Events>();

  let count = 0;

  const inc = vi.fn((amount: number) => {
    count += amount;
  });

  emitter.on("counter:increment", inc);

  emitter.emit("counter:increment", 100);
  emitter.off("counter:increment", inc);
  emitter.emit("counter:increment", 12);

  expect(count).toBe(100);
  expect(inc).toHaveBeenCalledOnce();
});

test("once: listeners only run once", () => {
  const emitter = new Emitter<Events>();
  const inc = vi.fn((amount: number) => {});

  emitter.once("counter:increment", inc);

  emitter.emit("counter:increment", 1);
  emitter.emit("counter:increment", 1);

  expect(inc).toHaveBeenCalledOnce();
});

test("emit: returns true/false based on whether there were listeners", () => {
  const emitter = new Emitter<Events>();

  let count = 0;

  const inc = vi.fn((amount: number) => {
    count += amount;
  });

  emitter.on("counter:increment", inc);

  expect(emitter.emit("counter:increment", 1)).toBe(true);
  expect(emitter.emit("counter:decrement", 1)).toBe(false);
});

test("clear: clears all listeners", () => {
  const emitter = new Emitter<Events>();

  const inc = vi.fn((amount: number) => {});
  const dec = vi.fn((amount: number) => {});

  emitter.on("counter:increment", inc);
  emitter.on("counter:decrement", dec);

  emitter.clear();

  emitter.emit("counter:increment", 7);
  emitter.emit("counter:decrement", 2);

  expect(inc).not.toHaveBeenCalled();
  expect(dec).not.toHaveBeenCalled();
});

test("wildcard: handlers receive all events", () => {
  const emitter = new Emitter<Events>();

  const inc = vi.fn((amount: number) => {});
  const dec = vi.fn((amount: number) => {});

  emitter.on("counter:increment", inc);
  emitter.on("counter:decrement", dec);

  const wildcard = vi.fn();

  emitter.on("*", wildcard);

  emitter.emit("counter:increment", 1);
  emitter.emit("counter:decrement", 52);

  expect(wildcard).toHaveBeenCalledTimes(2);
  expect(wildcard).toHaveBeenCalledWith("counter:increment", 1);
  expect(wildcard).toHaveBeenCalledWith("counter:decrement", 52);
});

test("error: errors are thrown if there are no error handlers", () => {
  const emitter = new Emitter<Events>();
  const crash = vi.fn(() => {
    throw new Error("This is an error!");
  });

  emitter.on("counter:increment", crash);

  expect(() => emitter.emit("counter:increment", 1)).toThrowError(
    new Error("This is an error!")
  );
});

test("error: handlers are called when an error occurs", () => {
  const emitter = new Emitter<Events>();
  const crash = vi.fn(() => {
    throw new Error("This is an error!");
  });
  const handler = vi.fn();

  emitter.on("counter:increment", crash);
  emitter.on("error", handler);

  expect(() => emitter.emit("counter:increment", 1)).not.toThrowError();

  expect(handler).toHaveBeenCalledExactlyOnceWith(
    new Error("This is an error!"),
    "counter:increment",
    crash,
    1
  );
});
