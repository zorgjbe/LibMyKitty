import { createMod, type KittyChatRoomMessage } from "libmykitty";
import { FULL_MOD_NAME, MOD_NAME, VERSION } from "../constants";

type ModStorage = {
  bongos: number;
  version: string;
};
const DEFAULT_STORAGE = {
  version: VERSION,
  bongos: 0,
};
const mod = createMod(
  {
    fullName: FULL_MOD_NAME,
    version: VERSION,
    name: MOD_NAME,
  },
  { syncCharacters: true, activities: true, defaultSettings: DEFAULT_STORAGE }
);

mod.atLogin(init);

declare module "libmykitty" {
  interface KittyModEvents {
    blah: [];
  }
  interface KittyModEvents {
    foo: { num: number };
  }
}

function init() {
  mod.registerListener("foo", (data, { num }) => {
    console.log(data + "foo");
  });

  mod.sendModMessage("foo", { num: 1 });
}
declare module "libmykitty" {
  interface KittyModEvents {
    pats: { isHeadPat: boolean };
  }
}

mod.registerListener("pats", (message, { isHeadPat }) => {
  if (isHeadPat) {
    console.log("AWOOOGAH!");
  }
  console.log("awooo!");
});

function sendPats() {
  mod.sendModMessage("pats", { isHeadPat: true });
}
(<any>window).sendPats = sendPats;
