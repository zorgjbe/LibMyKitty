# Events & Listeners

This section provides an overview of the events and listeners utilized in My Kitty, detailing their usage and enumerating the predefined events available within the system.
These events are used to control the behavior of your mod and the interactions between players. You can't send any data to yourself directly.

Functions:

- registerModListener
- unregisterModListener
- sendModEvent

List of built-in events:

If the setting `syncCharacters` is enabled, then

- `syncCharacter` and `syncJoin` gets added to the list of events

---

Example of creating a new event type

```ts
declare module "libmykitty" {
  interface Events {
    deliver: { cookies: number };
  }
}

registerModListener("deliver", (message, { cookies }) => {
  console.log(`${message.Sender} delivered ${cookies} cookies`);
});

sendModEvent("deliver", { cookies: 10 });

// Output: {my memberNumber} delivered 10 cookies, to every user in the room except yourself
```

### `sendModEvent`

Sends a custom message to the server with the specified type, data, and target player.

- `type` is what it is to label the message as, such as "deliver"</br>
- `data` is the data to send, such as `{ cookies: 10 }`, you can only send data that you specified in the `Events` interface</br>
- `target` is used to say who the message is going to. If not specified then it goes to every player.</br>

```ts
// for simplicity this is not the real typing
sendModEvent(type: string, data?: Record<string, any>, target?: number)
```

### `registerModListener`

Registers a listener for a specific message type. The listener function will be called whenever a message with the specified type is received.

- `type` is what it searches for, such as "deliver"
- `message` in the listener function is the metadata, like who sent it and if it was just for you. (message.Sender, message.Target)
- `data` in the listener function is what is in the message, such as {cookies: 10}

```ts
// for simplicity this is not the real typing
registerModListener(type: string, listener: (message, data) => void): void;
```

### `unregisterModListener`

Unregisters a listener for a specific message type.

```ts
unregisterModListener(type: string): void;
```
