import { AtLogin, CreateModStorageManager, initMyKitty, registerModListener, type Events } from "libmykitty";
import { FULL_MOD_NAME, MOD_NAME, VERSION } from "../constants";

type ModStorage = {
  bongos: number;
  version: string;
};
const DEFAULT_STORAGE = {
  bongos: 0,
  version: VERSION,
};
export const bcModSDK = initMyKitty({
  fullName: FULL_MOD_NAME,
  version: VERSION,
  name: MOD_NAME,
});

AtLogin(init);
interface MyEvents extends Events {
  foo: { num: number };
}

function init() {
  const storageManager = CreateModStorageManager<ModStorage>(DEFAULT_STORAGE);
  (<any>window).storageManager = storageManager;

  registerModListener<MyEvents>("foo", (message, data) => {
    console.log(data.num);
  });
}

(<any>window).sendPats = sendPats;
