import { receiveModMessage, sendModMessage } from "@/modules/server";
import bcModSdk, { type ModSDKModAPI, type ModSDKModInfo, type ModSDKModOptions } from "bondage-club-mod-sdk";
import { setupActivities } from "./modules/activities";
import { setupStorage, type KittyStorage, type KittyStoragePrivate } from "@/modules/storage";
import { waitFor } from "./utils/general";
import { Emitter, type ReservedOrUserEventNames, type ReservedOrUserListener } from "@socket.io/component-emitter";
import type { KittyEventListener, KittyEventsEmitter, KittyModEvents } from "./modules/events";

export const HookPriority = {
  OBSERVE: 0,
  ADD_BEHAVIOR: 1,
  MODIFY_BEHAVIOR: 5,
  OVERRIDE_BEHAVIOR: 10,
  TOP: 100,
};

export type KittySDKModApi = ModSDKModAPI & {
  atLogin(callback: () => void): Promise<void>,
  sendModMessage(type: string, data?: any, target?: number): void,
  registerListener<Ev extends ReservedOrUserEventNames<{}, KittyModEvents>>(
    ev: Ev,
    listener: ReservedOrUserListener<{}, KittyModEvents, Ev>): void;
};

export interface KittyModPrivate {
  mod: KittySDKModApi;
  name: string,
  version: string,
  options: KittySDKModOptions,
  emitter: KittyEventsEmitter,
  storage?: KittyStoragePrivate,
}

export interface KittySDKModOptions extends ModSDKModOptions {
  activities?: boolean;
  syncCharacters?: boolean;
  defaultSettings?: KittySDKSettings;
  storage?: KittyStorage;
}

export interface KittySDKSettings {
  version: string;
}

export function createMod(modInfo: ModSDKModInfo, options?: KittySDKModOptions): KittySDKModApi {
  const sdk = bcModSdk.registerMod(modInfo, options);
  const pubMod: KittySDKModApi = Object.assign(sdk, {
    async atLogin(callback: () => void): Promise<void> {
      await waitFor(() => Player.CharacterID !== "");
      callback();
    },
    sendModMessage: sendModMessage,
    registerListener<Ev extends ReservedOrUserEventNames<{}, KittyModEvents>>(
      ev: Ev,
      listener: ReservedOrUserListener<{}, KittyModEvents, Ev>
    ): void {
      mod.emitter.on(ev, listener);
    }
  });

  pubMod.sendModMessage = pubMod.sendModMessage.bind(pubMod);
  pubMod.sendModMessage = pubMod.sendModMessage.bind(pubMod);

  const emitter = new Emitter<KittyModEvents, KittyModEvents, {}>();
  const mod: KittyModPrivate = {
    mod: pubMod,
    name: modInfo.name,
    version: modInfo.version,
    options: options ?? {},
    emitter,
  }

  sdk.hookFunction("ChatRoomMessage", 1, (args, next) => {
    const [data] = args;
    receiveModMessage.bind(mod)(data);
    return next(args);
  });
  if (options?.activities) setupActivities(mod);
  if (options?.defaultSettings) {
    setupStorage(mod, options.defaultSettings);
  }
  return pubMod;
}
