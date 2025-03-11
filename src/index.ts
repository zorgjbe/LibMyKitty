import { HookPriority } from "./constants";
import { bcModSDK } from "./modules/bcModSdk";
import { initStorage } from "./modules/storage";

const init = async () => {
  initStorage();
};
if (CurrentScreen == null || CurrentScreen === "Login") {
  bcModSDK.hookFunction("LoginResponse", HookPriority.OBSERVE, (args, next) => {
    next(args);
    const response = args[0];
    if (response === "InvalidNamePassword") return;
    const { Name, AccountName } = response;
    if (typeof Name === "string" && typeof AccountName === "string") init();
  });
} else init();
