import { MOD_NAME, MOD_Repository, MOD_VERSION } from "@/constants";
import bcModSdk from "bondage-club-mod-sdk";
import { AddonServerChatRoomMessage } from "@/types/types";

export const bcModSDK = bcModSdk.registerMod({
  name: "BcBaseAddon",
  fullName: MOD_NAME,
  version: MOD_VERSION,
  repository: MOD_Repository,
});
