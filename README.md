# @manyducks.co/emitter

![bundle size](https://img.shields.io/bundlephobia/min/@manyducks.co/emitter)
![bundle size](https://img.shields.io/bundlephobia/minzip/@manyducks.co/emitter)

Emitter is a stripped down, modern event emitter with type safety for your custom events via TypeScript. Even if you don't use TypeScript, it's still a featherweight event emitter designed to work on the frontend or backend.

## Install

```
npm install @manyducks.co/emitter
```

## Use

```ts
import { Emitter } from "@manyducks.co/emitter";

// You provide an event map where keys are event names and
// values are tuples of arguments listener functions will receive.
type Events = {
  "counter:increment": [amount: number];
  "counter:decrement": [amount: number];
  "counter:reset": [];
};

const emitter = new Emitter<Events>();

let count = 0;

emitter.on("counter:increment", (amount) => {
  // Amount is typed as a number.
  count += amount;
});
emitter.on("counter:decrement", (amount) => {
  count -= amount;
});
emitter.on("counter:reset", () => {
  count = 0;
});

// This is valid.
emitter.emit("counter:increment", 1);

// But TypeScript will object to this:
emitter.emit("counter:increment", "five hundred and two");
//                                ~~~~~~~~~~~~~~~~~~~~~~
//          Argument of type 'string' is not assignable to parameter of type 'number'.

// And this:
emitter.emit("counter:increment", 1, 2, 3);
//                                   ~~~~
//          Expected 2 arguments, but got 4.
```

### Full API

```ts
emitter.on("eventName", listener);
// Adds a listener for a specific event.

emitter.off("eventName", listener);
// Removes a listener for a specific event.

emitter.once("eventName", listener);
// Adds a listener that will be removed after the next time it's called.

emitter.clear();
// Removes all listeners for all events.

emitter.emit("eventName", ...args);
// Emits an event, taking arguments to forward to listeners.

emitter.listeners("eventName");
// Returns the array of listeners for a specific event.
emitter.listeners("eventName").length;
emitter.listeners("eventName").unshift(listener);
// You can use this to do things like count and prepend listeners.

emitter.events();
// Returns an array of eventNames for all events with listeners.
```

Those are the methods. There are also a couple of special values for `eventName`.

```ts
emitter.on("*", (eventName, ...args) => {
  // Adds a listener that gets called for each and every emitted event.
});

emitter.on("error", (error, eventName, ...args) => {
  // Adds a listener that will receive any errors thrown within listeners.
  //
  // By default, errors that occur in listeners will be thrown by the `emit` function.
  // If there is at least one error listener then errors will be emitted instead.
});
```

## License

Emitter is provided under the MIT license.

---

🦆 [That's a lot of ducks.](https://www.manyducks.co)
