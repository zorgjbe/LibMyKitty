import { type UnverifiedServerChatRoomMessage, type AddonServerChatRoomMessage } from "@/types/types";
import { MOD_NAME } from "./storage";

export const HookPriority = {
  OBSERVE: 0,
  ADD_BEHAVIOR: 1,
  MODIFY_BEHAVIOR: 5,
  OVERRIDE_BEHAVIOR: 10,
  TOP: 100,
};

export function sendModMessage(type: string, data?: any, target?: number) {
  const ChatRoomMessage: UnverifiedServerChatRoomMessage = {
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
interface ModListener {
  callback: (message: AddonServerChatRoomMessage, data: any) => void;
  unregister(): void;
}
const modListneers = new Map<string, ModListener>();

export function registerModListener(type: string, callback: (message: AddonServerChatRoomMessage, data: any) => void): ModListener {
  const listener: ModListener = {
    callback,
    unregister() {
      modListneers.delete(type);
    },
  };
  modListneers.set(type, listener);
  return listener;
}
export function unregisterModListener(type: string) {
  modListneers.delete(type);
}
export function receivePacket(message: UnverifiedServerChatRoomMessage) {
  const received = isModMessage(message);
  if (!received) return;

  const type = message.Dictionary[0]!.type;
  const data = message.Dictionary[0]!.data;
  for (const [key, modListneer] of Object.entries(modListneers)) {
    if (key === type) {
      modListneer.callback(message, data);
    }
  }
}

export function isModMessage(message: UnverifiedServerChatRoomMessage): message is AddonServerChatRoomMessage {
  return (
    message?.Content === `${MOD_NAME}Msg` &&
    message.Sender &&
    message.Sender !== Player.MemberNumber &&
    message.Dictionary &&
    message.Dictionary[0]?.data &&
    message.Type === "Hidden"
  );
}
