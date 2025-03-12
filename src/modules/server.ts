import { type AddonServerChatRoomMessage, type ReceivedAddonServerChatRoomMessage } from "@/types/types";
import { MOD_NAME } from "./storage";

export const HookPriority = {
  OBSERVE: 0,
  ADD_BEHAVIOR: 1,
  MODIFY_BEHAVIOR: 5,
  OVERRIDE_BEHAVIOR: 10,
  TOP: 100,
};

export function sendServerMessage(type: string, data?: any, target?: number) {
  const ChatRoomMessage: AddonServerChatRoomMessage = {
    Type: "Hidden",
    Content: `${MOD_NAME}Msg`,
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

export const packetListeners: Record<string, (message: ReceivedAddonServerChatRoomMessage, data: any) => void> = {};
export function receivePacket(message: AddonServerChatRoomMessage) {
  const received = isMessageRecived(message);
  if (!received) return;

  const type = message.Dictionary[0]!.type;
  const data = message.Dictionary[0]!.data;
  for (const [key, callback] of Object.entries(packetListeners)) {
    if (key === type) {
      callback(message, data);
    }
  }
}

export function isMessageRecived(message: AddonServerChatRoomMessage): message is ReceivedAddonServerChatRoomMessage {
  return (
    message?.Content === `${MOD_NAME}Msg` &&
    message.Sender &&
    message.Sender !== Player.MemberNumber &&
    message.Dictionary &&
    message.Dictionary[0]?.data &&
    message.Type === "Hidden"
  );
}
