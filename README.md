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

let count: number = 0;

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
// adds a listener for a specific event

emitter.off("eventName", listener);
// removes a listener for a specific event

emitter.once("eventName", listener);
// adds a listener that will be called once and then removed

emitter.clear();
// removes all listeners for all events

emitter.emit("eventName", ...args);
// emits an event, taking arguments to forward to handlers

emitter.listeners("eventName");
// returns the array of listeners for a specific event

emitter.listeners("eventName").length;
emitter.listeners("eventName").unshift(listener);
// You can use this to do things like count and prepend listeners

emitter.events();
// returns an array of eventNames for all events with listeners

emitter.events().reduce((map, eventName) => {
  map[eventName] = emitter.listeners("eventName").length;
  return map;
}, {});
```

Those are the methods. There are also a couple of special values for `eventName`.

```ts
emitter.on("*", (eventName, ...args) => {
  // adds a listener that gets called for each and every emitted event
});

emitter.on("error", (error, eventName, ...args) => {
  // adds a handler that will receive any errors thrown within any other handler.
});
```

## License

Emitter is provided under the MIT license.

---

🦆 [That's a lot of ducks.](https://www.manyducks.co)
