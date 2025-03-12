import { type ModSDKModAPI } from "bondage-club-mod-sdk";
import { HookPriority } from "./modules/server";

export function AddLoginHook(bcModSDK: ModSDKModAPI, callback: Function) {
  if (CurrentScreen == null || CurrentScreen === "Login") {
    bcModSDK.hookFunction("LoginResponse", HookPriority.OBSERVE, (args, next) => {
      next(args);
      const response = args[0];
      if (response === "InvalidNamePassword") return;
      const { Name, AccountName } = response;
      if (typeof Name === "string" && typeof AccountName === "string") callback();
    });
  } else callback();
}
