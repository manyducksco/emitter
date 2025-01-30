/**
 * A mapping of event names to handler function arguments.
 */
export type EventMap = {
  [eventName: string | symbol]: [...args: any[]];
};

/**
 * Events emitted by the Emitter itself in special cases.
 */
export type BuiltInEvents = {
  error: [
    error: unknown,
    eventName: string | symbol,
    listener: (...args: any[]) => any,
    ...args: any[]
  ];
};

export class Emitter<Events extends EventMap> {
  protected _listeners = new Map<keyof Events, ((...args: any[]) => any)[]>();
  protected _wildcardListeners: ((...args: any[]) => any)[] = [];

  /**
   * Internal emit logic; allows emitting built-in events and handles listener errors.
   */
  protected _emit<Name extends keyof (Events & BuiltInEvents)>(
    eventName: Name,
    ...args: any[]
  ): boolean {
    const listeners = this._listeners.get(eventName);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(...args);
        } catch (err) {
          if (this._listeners.get("error")?.length)
            this._emit("error", err, eventName, listener, ...args);
          else throw err;
        }
      }
    }
    for (const listener of this._wildcardListeners) {
      try {
        listener(eventName, ...args);
      } catch (err) {
        if (this._listeners.get("error")?.length)
          this._emit("error", err, eventName, listener, ...args);
        else throw err;
      }
    }
    return (listeners?.length ?? 0 + this._wildcardListeners.length) > 0;
  }

  /**
   * Synchronously calls each of the listeners for `eventName` in the order they were added, passing the supplied arguments to each.
   * Returns `true` if the event had listeners and `false` otherwise.
   *
   * @param eventName - The name of an event.
   * @param args - Arguments to pass to listener functions.
   */
  emit<Name extends keyof Exclude<Events, keyof BuiltInEvents>>(
    eventName: Name,
    ...args: Events[Name]
  ): boolean {
    if (typeof eventName !== "string" && !(eventName instanceof Symbol))
      throw new TypeError(`Emitter: eventName should be a string or symbol.`);
    if (eventName === "*")
      throw new Error(`Emitter: '*' is not an emittable event.`);

    return this._emit(eventName as any, ...args);
  }

  /**
   * Adds a `listener` function to be called when `eventName` is emitted.
   *
   * @param eventName - An event name to listen for.
   * @param listener - A function to receive the event.
   */
  on<Name extends keyof (Events & BuiltInEvents)>(
    eventName: Name,
    listener: (...args: (Events & BuiltInEvents)[Name]) => void
  ): this;

  /**
   * Adds a `listener` function to be called when any event is emitted.
   * The listener receives the event name followed by the usual arguments.
   * Wildcard listeners run after those for specific events.
   *
   * @param eventName - `*` is shorthand for "anything".
   * @param listener - A function to receive the event.
   */
  on(
    eventName: "*",
    listener: (eventName: string | symbol, ...args: any[]) => void
  ): this;

  on(eventName: string | symbol, listener: (...args: any[]) => void): this {
    if (eventName === "*") {
      this._wildcardListeners.push(listener);
      return this;
    }

    if (!this._listeners.has(eventName)) {
      this._listeners.set(eventName, []);
    }
    this._listeners.get(eventName)?.push(listener);
    return this;
  }

  /**
   * Removes a `listener` function, preventing it being called for any future events.
   *
   * @param eventName - An event name.
   * @param listener - A callback to remove.
   */
  off<Name extends keyof (Events & BuiltInEvents)>(
    eventName: Name,
    listener: (...args: (Events & BuiltInEvents)[Name]) => void
  ): this;

  /**
   * Removes a `listener` callback, preventing it being called for any future events.
   * Only removes listeners that were added with `emitter.on("*", listener)`.
   * Listeners for specific events must be removed individually.
   *
   * @param eventName - `*` is shorthand for "anything".
   * @param listener - A callback to receive the event.
   */
  off(
    eventName: "*",
    listener: (eventName: string | symbol, ...args: any[]) => void
  ): this;

  off(eventName: string | symbol, listener: (...args: any[]) => void): this {
    if (eventName === "*") {
      this._wildcardListeners.splice(this._wildcardListeners.indexOf(listener));
      return this;
    }

    const listeners = this._listeners.get(eventName);
    if (listeners) listeners.splice(listeners.indexOf(listener), 1);
    return this;
  }

  /**
   * Adds a `listener` function to be called the next time `event` is emitted.
   * The listener receives the event name followed by the usual arguments.
   * The listener is removed after being called once.
   *
   * @param eventName - An event name to listen for.
   * @param listener - A function to receive the event.
   */
  once<Name extends keyof (Events & BuiltInEvents)>(
    eventName: Name,
    listener: (...args: (Events & BuiltInEvents)[Name]) => void
  ): this;

  /**
   * Adds a `listener` function to be called the next time any event is emitted.
   * The listener is removed after being called once.
   * Wildcard listeners run after those for specific events.
   *
   * @param eventName - `*` is shorthand for "anything".
   * @param listener - A function to receive the event.
   */
  once(
    eventName: "*",
    listener: (eventName: string | symbol, ...args: any[]) => void
  ): this;

  once(eventName: string | symbol, listener: (...args: any[]) => void): this {
    return this.on(
      eventName,
      (...args) => (listener(...args), this.off(eventName, listener))
    );
  }

  /**
   * Removes all listeners.
   */
  clear() {
    this._listeners.clear();
    this._wildcardListeners = [];
  }
}
