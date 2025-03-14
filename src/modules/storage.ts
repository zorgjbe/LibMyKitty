import { type PartialDeep } from "@/types/types";
import { merge, throttle } from "lodash";
import { getCharacter } from "@/utils/character";
import { sendModMessage } from "./server";
import type { KittyModPrivate } from "@/main";

export interface StorageModel {
  version: string;
}

const SAVE_INTERVAL = 5000;

export interface KittyStorage {
  save(): void,
  reset(): void,
  clear(): void,
}

export interface KittyStoragePrivate {
  getStorage(character: Character): StorageModel | undefined;
  setStorage(character: Character, data: StorageModel): void;
  loadStorage(): void;
  syncClients(target?: number): void;
  sync(newData: PartialDeep<StorageModel>): void;
  syncCharacter(memberNumber: number, data: PartialDeep<StorageModel>): void;
}

/**
 * CreateModStorageManager is a module responsible for managing the player's Data.
 *
 * It provides methods to initialize, save, clear, and synchronize data both locally
 * and with the server. The data is compressed and decompressed using LZString for
 * efficient storage and transfer.
 */
export function setupStorage<T extends StorageModel>(mod: KittyModPrivate, defaultStorage: T) {
  const priv: KittyStoragePrivate = {
    getStorage(character: Character): StorageModel | undefined {
      // @ts-expect-error 
      return character[mod.name];
    },

    setStorage(character: Character, data: StorageModel): void {
      // @ts-expect-error
      character[mod.name] = data;
    },

    loadStorage() {
      const storedData = Player.ExtensionSettings[mod.name];
      const decompressedData = storedData ? LZString.decompressFromBase64(storedData) : null;
      const parsedData = decompressedData ? JSON.parse(decompressedData) : defaultStorage;
      
      this.setStorage(Player, merge(defaultStorage, parsedData));
    },

    /** Sends a sync message to the server to update clients with the current data. */
    syncClients(target?: number) {
      sendModMessage.bind(mod)("syncCharacter", this.getStorage(Player), target);
    },

    /** Merges and saves new data into the player's server data. */
    sync(newData: PartialDeep<StorageModel>) {
      this.setStorage(Player, merge(defaultStorage, this.getStorage(Player), newData ?? {}));
      storage.save();
    },

    /** Syncs a specific character's data with the provided data. */
    syncCharacter(memberNumber: number, data: PartialDeep<StorageModel>) {
      const otherCharacter = getCharacter(memberNumber);
      if (!otherCharacter) return;
      this.setStorage(otherCharacter, merge(defaultStorage, this.getStorage(otherCharacter), data));
    },
  }
  mod.storage = priv;
  
  priv.loadStorage();

  if (mod.options.syncCharacters) {
    mod.emitter.on('syncCharacter', (data) => {
      // priv.syncCharacter(data.SourceMemberNumber, data.Character);
    })

    mod.emitter.on("syncJoin", (data) => {
      sendModMessage.bind(mod)("syncCharacter", priv.getStorage(Player), data.SourceMemberNumber);
    })

    mod.mod.hookFunction("ChatRoomSyncMemberJoin", 1, (args, next) => {
      const [data] = args;
      mod.emitter.emit("syncJoin", data);
      return next(args);
    })

    mod.mod.hookFunction("ChatRoomSync", 1, (args, next) => {
      const [data] = args;
      // Tell everyone else to update their copy of our data, when we join a room.
      mod.emitter.emit("syncCharacter", data);
      return next(args);
    });
  }

  const storage: KittyStorage = {
    /** Saves the current data to the player's extension settings, debounced to run at SAVE_INTERVAL. */
    save: throttle(() => {
      const compressed = LZString.compressToBase64(JSON.stringify(priv.getStorage(Player)));
      Player.ExtensionSettings[mod.name] = compressed;
      ServerPlayerExtensionSettingsSync(mod.name);
      priv.syncClients();
    }, SAVE_INTERVAL),

    /** Reset the data in the player's extension settings to their default */
    reset() {
      priv.setStorage(Player, defaultStorage);
      this.save();
    },

    /** Clears the data in the player's extension settings. */
    clear() {
      Player.ExtensionSettings[mod.name] = "N4XyA==="; // Empty object compressed
      ServerPlayerExtensionSettingsSync(mod.name);
    },
  };

  return storage;
}
