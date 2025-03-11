import { AddonServerChatRoomMessage } from "@/types/types";
import { bcModSDK } from "./bcModSdk";
import { receivePacket, sendServerMessage } from "./server";

export function initHooks() {
  bcModSDK.hookFunction("ChatRoomMessage", 1, (args, next) => {
    if (args[0].Content === "ServerEnter" && args[0].Sender === Player.MemberNumber) {
      sendServerMessage("syncJoin");
      return;
    }

    receivePacket(args[0] as AddonServerChatRoomMessage);
    return next(args);
  });
  bcModSDK.hookFunction("ChatRoomSync", 1, (args, next) => {
    sendServerMessage("syncCharacter"); // Tell everyone else to update their copy of our data, when we join a room.
    return next(args);
  });
}
