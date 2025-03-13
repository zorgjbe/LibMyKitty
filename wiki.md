# LibMyKitty

### `initMyKitty`

The magic that brings your mod to life! `initMyKitty` is a wrapper around `bcModSdk.registerMod` that not only registers your mod but also tells My Kitty about your mod's name and version.</br>
Without this function, My Kitty wouldn't know about your mod and wouldn't be able to do anything with it. </br>So make sure to call this function at the beginning of your mod's code!

```ts
export const bcModSDK = initMyKitty({ name: "bondageKitties", fullName: "bondage kitties", version: "1.1.0" });
```

### `AtLogin`

Runs a function when the player is logged in.

```ts
AtLogin(callback: () => void)
```

### `sendModMessage`

Sends a custom message to the server with the specified type, data, and target player.

- `type` is used to say what message it is. Such as "attack".</br>
- `data` would be how much damage the attack did. Such as {damage: 100}</br>
- `target` is used to say who the message is going to. If not specified then it goes to every player.</br>

```ts
sendModMessage(type: string, data?: any, target?: number): void;
```

### `registerModListener`

Registers a listener for a specific message type. The listener function will be called whenever a message with the specified type is received.

- `type` is what it searches for, such as "attack"
- `message` in the listener function is the metadata, like who sent it and if it was just for you. (message.Sender, message.Target)
- `data` in the listener function is what is in the message, such as {damage: 100}

```ts
registerModListener(type: string, listener: (message, data) => void): void;
```

### `unregisterModListener`

Unregisters a listener for a specific message type.
unregisterModListener(type: string): void;

### `createModStorageManager`

Creates a new ModStorageManager instance with the specified default storage.

- `T` is the type of the mod storage.
- `defaultStorage` is the initial data for the storage.

```ts
const storageManager = createModStorageManager<T>(defaultStorage: T);
```

`storageManager` looks like this

```ts
defaultStorage: ModStorage;
save: lodash.DebouncedFunc<() => void>;
clear(): void;
sync(newData: PartialDeep<ModStorage>): void;
syncClients(target?: number): void;
syncCharacter(memberNumber: number, data: PartialDeep<...>): void;
```

The `storageManager.save()` function is debounced, meaning it will only trigger every 5 seconds if called repeatedly by default (adjustable via `SAVE_INTERVAL`). This function saves player data to the server and synchronizes it with other clients.

`storageManager.clear()` clears the storage for the main player. Use carefully.

`storageManager.sync(newData)` Like save but adds new data to the existing user's data. Useful when saving new settings. (might be redundant)

`storageManager.syncClients(target)` syncs the storage with one client. If target is undefined, it syncs with all clients.

`storageManager.syncCharacter(memberNumber, data)` locally synchronizes the data of another player in the room, allowing you to see their data.

### `CreateWebhook`

Adds an event listener for error events and sends error details to a specified webhook URL.

fileName is important that it is unique because if your file is named `index` then it will send errors from other mods that have index as their name.
webhookURL is the URL where the errors will be sent, this is only compatable with discord at the moment.
body is a function that takes an ErrorEvent and returns an object containing the error details to be sent.

```ts
CreateWebhook(fileName: string, webhookURL: string, body: WebhookChatBody | WebhookForumBody): void;
```

```ts
export type WebhookForumBody = (errorEvent: ErrorEvent) => {
  thread_name: string;
  username?: string;
  avatar_url?: string;
  content: string;
};

export type WebhookChatBody = (errorEvent: ErrorEvent) => {
  username?: string;
  avatar_url?: string;
  content: string;
};
```

If you want something quick then you can use `CreateForumTemplateBody(modVersion: string, modName: string)` for forums and `CreateChatTemplateBody(modVersion: string, modName: string)` for chats.

### `getCharacter`

Returns the character object for the specified identifier. If the identifier is not found, it returns undefined. Only works within rooms.

```ts
getCharacter(identifier: string | number | Character): Character | undefined
```

### `isAddonPlayer`

Returns true if the character is using your mod and false otherwise. It also checks if the version of the mod matches the version specified in the character's data. If no version is specified, it uses the version stored in the mod's data.

It is important that the Mod storage contains the property `version` otherwise this function will not work.

```ts
isAddonPlayer(character: Character, version = Player[MOD_NAME].version): boolean
```

### `waitFor` and `waitForElement`

These two functions are used to wait for something to happen before continuing.

`waitFor` takes a function that returns a boolean and an optional cancel function. It will keep calling the function until it returns true, or until the cancel function returns true. It will wait 10 milliseconds between each call.

`waitForElement` takes a CSS selector and optional options. It will wait until an element with that selector is found in the DOM. If the element is found, it will return the element. If the timeout is reached without finding the element, it will return false. The options object can have the following properties:

- `childCheck`: If true, the function will only return true if the element has children.
- `timeout`: The timeout in milliseconds. If not specified, it will default to 10000 milliseconds.

Example:

```ts
const element = await waitForElement("#myElement", { childCheck: true, timeout: 5000 });

if (element) {
  console.log("Element found!");
}
```

and

```ts
await waitFor(() => CurrentScreen === "ChatRoom");

console.log("In Chatroom");
```
