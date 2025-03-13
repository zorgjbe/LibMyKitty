import { type UnverifiedServerChatRoomMessage, type PartialDeep, type AddonServerChatRoomMessage } from "@/types/types";
import { debounce, merge } from "lodash";
import { receivePacket, registerModListener, sendModMessage } from "./server";
import { getCharacter } from "@/utils/character";
import bcModSdk, { type ModSDKModAPI, type ModSDKModInfo, type ModSDKModOptions } from "bondage-club-mod-sdk";
import { EnableActivities } from "./activities";

export interface StorageModel {
  version: string;
}

export const SAVE_INTERVAL = 5000;
export let MOD_NAME: string;
export let MOD_VERSION: string;
export let BC_SDK: ModSDKModAPI;
export let OPTIONS = { activites: false, syncCharacters: false };

export function initMyKitty(modInfo: ModSDKModInfo, options?: ModSDKModOptions & typeof OPTIONS): ModSDKModAPI {
  BC_SDK = bcModSdk.registerMod(modInfo, options);
  MOD_NAME = modInfo.name;
  MOD_VERSION = modInfo.version;
  OPTIONS = merge(OPTIONS, options);
  BC_SDK.hookFunction("ChatRoomMessage", 1, (args, next) => {
    receivePacket(args[0] as UnverifiedServerChatRoomMessage);
    return next(args);
  });
  if (options?.activites) EnableActivities();
  return BC_SDK;
}

/**
 * CreateModStorageManager is a module responsible for managing the player's Data.
 *
 * It provides methods to initialize, save, clear, and synchronize data both locally
 * and with the server. The data is compressed and decompressed using LZString for
 * efficient storage and transfer.
 */

export function CreateModStorageManager<T extends StorageModel>(defaultStorage: T) {
  if (OPTIONS.syncCharacters) {
    registerModListener("syncCharacter", (message, data) => {
      BCStorage.syncCharacter(message.Sender, data);
    });
    registerModListener("syncJoin", (message, data) => {
      sendModMessage("syncCharacter", Player[MOD_NAME], message.Sender);
    });
    BC_SDK.hookFunction("ChatRoomMessage", 1, (args, next) => {
      if (args[0].Content === "ServerEnter" && args[0].Sender === Player.MemberNumber) {
        sendModMessage("syncJoin");
        return;
      }
      receivePacket(args[0] as UnverifiedServerChatRoomMessage);
      return next(args);
    });
    BC_SDK.hookFunction("ChatRoomSync", 1, (args, next) => {
      sendModMessage("syncCharacter"); // Tell everyone else to update their copy of our data, when we join a room.
      return next(args);
    });
  }
  const storedData = Player.ExtensionSettings[MOD_NAME];
  const decompressedData = storedData ? LZString.decompressFromBase64(storedData) : null;
  const parsedData = decompressedData ? JSON.parse(decompressedData) : defaultStorage;

  Player[MOD_NAME] = merge(defaultStorage, parsedData);
  const BCStorage = {
    defaultStorage: defaultStorage,
    /** Saves the current data to the player's extension settings, debounced to run at SAVE_INTERVAL. */
    save: debounce(() => {
      const compressed = LZString.compressToBase64(JSON.stringify(Player[MOD_NAME]));
      Player.ExtensionSettings[MOD_NAME] = compressed;
      ServerPlayerExtensionSettingsSync(MOD_NAME);
      BCStorage.syncClients();
    }, SAVE_INTERVAL),

    /** Clears the data in the player's extension settings. */
    clear() {
      Player.ExtensionSettings[MOD_NAME] = "N4XyA==="; // Empty object compressed
      ServerPlayerExtensionSettingsSync(MOD_NAME);
    },

    /** Merges and saves new data into the player's server data. */
    sync(newData: PartialDeep<StorageModel>) {
      Player[MOD_NAME] = merge(defaultStorage, Player[MOD_NAME], newData ?? {});
      BCStorage.save();
    },

    /** Sends a sync message to the server to update clients with the current data. */
    syncClients(target?: number) {
      sendModMessage("syncCharacter", Player[MOD_NAME], target);
    },

    /** Syncs a specific character's data with the provided data. */
    syncCharacter(memberNumber: number, data: PartialDeep<StorageModel>) {
      const otherCharacter = getCharacter(memberNumber);
      if (!otherCharacter) return;
      otherCharacter[MOD_NAME] = merge(defaultStorage, otherCharacter[MOD_NAME], data);
    },
  };
  return BCStorage;
}
