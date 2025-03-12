import { type AddonServerChatRoomMessage, type PartialDeep } from "@/types/types";
import { debounce, merge } from "lodash";
import { packetListeners, receivePacket, sendServerMessage } from "./server";
import { getCharacter } from "@/utils/character";
import { type ModSDKModAPI } from "bondage-club-mod-sdk";

export const SAVE_INTERVAL = 5000;
export let MOD_NAME: string;
export let MOD_VERSION: string;
export let BC_SDK: ModSDKModAPI;

export function initMyKitty(modName: string, modVersion: string, bcModSDK: ModSDKModAPI) {
  MOD_NAME = modName;
  BC_SDK = bcModSDK;
  MOD_VERSION = modVersion;
}

/**
 * BCStorage is a module responsible for managing the player's Data.
 *
 * It provides methods to initialize, save, clear, and synchronize data both locally
 * and with the server. The data is compressed and decompressed using LZString for
 * efficient storage and transfer.
 */
export function CreateModStorageManager<StorageType>(defaultStorage: StorageType) {
  const BCStorage = {
    defaultStorage: defaultStorage,

    /** Initializes the modStorage with data from the player's extension settings.*/
    init() {
      packetListeners["syncCharacter"] = (message, data) => {
        BCStorage.syncCharacter(message.Sender, data);
      };
      packetListeners["syncJoin"] = (message, data) => {
        // @ts-ignore
        sendServerMessage("syncCharacter", Player[MOD_NAME], message.Sender);
      };
      BC_SDK.hookFunction("ChatRoomMessage", 1, (args, next) => {
        if (args[0].Content === "ServerEnter" && args[0].Sender === Player.MemberNumber) {
          sendServerMessage("syncJoin");
          return;
        }
        receivePacket(args[0] as AddonServerChatRoomMessage);
        return next(args);
      });
      BC_SDK.hookFunction("ChatRoomSync", 1, (args, next) => {
        sendServerMessage("syncCharacter"); // Tell everyone else to update their copy of our data, when we join a room.
        return next(args);
      });

      const storedData = Player.ExtensionSettings[MOD_NAME];
      const decompressedData = storedData ? LZString.decompressFromBase64(storedData) : null;
      const parsedData = decompressedData ? JSON.parse(decompressedData) : defaultStorage;

      // @ts-ignore
      Player[MOD_NAME] = merge(defaultStorage, parsedData);
    },

    /** Saves the current data to the player's extension settings, debounced to run at SAVE_INTERVAL. */
    save: debounce(() => {
      // @ts-ignore
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
    sync(newData: PartialDeep<StorageType>) {
      // @ts-ignore
      Player[MOD_NAME] = merge(defaultStorage, Player[MOD_NAME], newData ?? {});
      BCStorage.save();
    },

    /** Sends a sync message to the server to update clients with the current data. */
    syncClients(target?: number) {
      // @ts-ignore
      sendServerMessage("syncCharacter", Player[MOD_NAME], target);
    },

    /** Syncs a specific character's data with the provided data. */
    syncCharacter(memberNumber: number, data: PartialDeep<StorageType>) {
      const otherCharacter = getCharacter(memberNumber);
      if (!otherCharacter) return;
      // @ts-ignore
      otherCharacter[MOD_NAME] = merge(defaultStorage, otherCharacter[MOD_NAME], data);
    },
  };
  return BCStorage;
}
