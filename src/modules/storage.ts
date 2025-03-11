import { MOD_VERSION } from "@/constants";
import { AddonServerChatRoomMessage, PartialDeep } from "@/types/types";
import { debounce, merge } from "lodash";
import { receivePacket, sendServerMessage } from "./server";
import { getCharacter } from "@/utils/character";
import { bcModSDK } from "./bcModSdk";

export let modStorage: ModStorage;
const defaultStorage = {
  version: MOD_VERSION,
};
export function initStorage(): void {
  const storedData = Player.ExtensionSettings.BcBaseAddon;
  const decompressedData = storedData ? LZString.decompressFromBase64(storedData) : null;
  const parsedData = decompressedData ? JSON.parse(decompressedData) : defaultStorage;

  modStorage = merge(defaultStorage, parsedData);
}
export const clearStorage = () => {
  Player.ExtensionSettings.BcBaseAddon = "N4XyA==="; // Empty object compressed
  ServerPlayerExtensionSettingsSync("BcBaseAddon");
};

export function syncStorage(newData: PartialDeep<ModStorage>) {
  Player.BcBaseAddon = merge(Player.BcBaseAddon || defaultStorage, newData);
  saveStorage();
}

export const saveStorage = debounce(() => {
  const compressed = LZString.compressToBase64(JSON.stringify(Player.BcBaseAddon));
  Player.ExtensionSettings.BcBaseAddon = compressed;
  ServerPlayerExtensionSettingsSync("BcBaseAddon");
  syncClients();
}, 1000);

export function syncClients(target?: number) {
  sendServerMessage("syncCharacter", Player.BcBaseAddon, target);
}

export function syncCharacter(memberNumber: number, data: PartialDeep<ModStorage>) {
  const otherCharacter = getCharacter(memberNumber);
  if (!otherCharacter) return;

  otherCharacter["BcBaseAddon"] = merge(otherCharacter["BcBaseAddon"] || defaultStorage, data);
}
