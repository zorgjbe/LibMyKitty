import { AddonServerChatRoomMessage, ReceivedAddonServerChatRoomMessage } from "@/types/types";
import { syncCharacter, syncStorage } from "./storage";
import { isMessageRecived } from "@/utils/server";

export function sendServerMessage(type: string, data?: any, target?: number) {
  const ChatRoomMessage: AddonServerChatRoomMessage = {
    Type: "Hidden",
    Content: "BcBaseAddonMsg",
    Sender: Player.MemberNumber,
    Target: target,
    Dictionary: [
      {
        type: type,
        data: data,
      },
    ],
  };
  ServerSend("ChatRoomChat", ChatRoomMessage as ServerChatRoomMessage);
}

export function receivePacket(message: AddonServerChatRoomMessage) {
  const received = isMessageRecived(message);
  if (!received) return;

  const type = message.Dictionary[0]!.type;
  const data = message.Dictionary[0]!.data;
  switch (type) {
    // to make every BcBaseAddon user have the "BcBaseAddon" set on their character
    case "syncCharacter": {
      syncCharacter(message.Sender, data);
      break;
    }
    // to sync when someone joins
    case "syncJoin": {
      sendServerMessage("syncCharacter", Player.BcBaseAddon, message.Sender);
      break;
    }
  }
}
