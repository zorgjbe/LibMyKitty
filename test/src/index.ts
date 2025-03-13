import { AtLogin, CreateModStorageManager, initMyKitty, registerModListener, sendModEvent, type AddonServerChatRoomMessage } from "libmykitty";
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

declare module "libmykitty" {
  interface Events {
    foo: { num: number };
  }
}

function init() {
  const storageManager = CreateModStorageManager<ModStorage>(DEFAULT_STORAGE);
  (<any>window).storageManager = storageManager;

  registerModListener("foo", (data, { num }) => {
    console.log(data + "foo");
  });

  sendModEvent("foo", { num: 1 });
}
declare module "libmykitty" {
  interface Events {
    pats: { isHeadPat: boolean };
  }
}

registerModListener("pats", (message: AddonServerChatRoomMessage, { isHeadPat }) => {
  if (isHeadPat) {
    console.log("AWOOOGAH!");
  }
  console.log("awooo!");
});

function sendPats() {
  sendModEvent("pats", { isHeadPat: true });
}
(<any>window).sendPats = sendPats;
