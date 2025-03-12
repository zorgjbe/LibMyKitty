${{\color{HotPink}\Large{\textsf{LibMyKitty}}}}$

It gives you a quick setup, so you don't have to start completely from scratch.
Think of it like an outline, it's there to help you get started a little faster... and a little more **erotically**.
It's a great way to get building your own addon.

### Start

```ts
npm install libmykitty bondage-club-mod-sdk
npm install bc-stubs --save-dev
// or
yarn add libmykitty bondage-club-mod-sdk
yarn add -D bc-stubs
// or
pnpm add libmykitty bondage-club-mod-sdk
pnpm add -D bc-stubs
```

#### Step 1 - Initialize before login

This gives my kitty the information about your mod name and your version so it can quickstart the features it provides such as storage and sending data between players.

```ts
export const bcModSDK = bcModSdk.registerMod({
  name: "bondageKitties",
  fullName: FULL_MOD_NAME,
  version: VERSION,
  repository: "https...",
});

initMyKitty("bondageKitties", "1.0.0", bcModSDK);
```

#### Step 2 - Login

This makes init execute when the user logs in. This is very useful because it makes sure `Player` is always defined.

```ts
AddLoginHook(bcModSDK, init);

function init() {}
```

#### Step 3 - Storage

This sets up the storage for your mod. It automatically syncs the mod data between players.
It can be accessed through `Player[MOD_NAME]`
Storage doesn't get automatically updated when you change something in `Player[MOD_NAME]` to do that you'll have to call `storageManager.save()`

```ts
type ModStorage = {
  bongos: number;
  version: string;
};

const DEFAULT_STORAGE = {
  bongos: 0,
  version: VERSION,
};
function init() {
  const storageManager = CreateModStorageManager<ModStorage>(DEFAULT_STORAGE);
  storageManager.init();
}
```
