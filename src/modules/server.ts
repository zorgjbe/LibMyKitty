import { isInteger, isObject, isString } from "lodash";
import type { KittyModPrivate } from "@/main";

export interface KittyChatRoomMessage extends ServerChatRoomMessage {
  Content: `${string}`;
  Type: "Hidden";
  Data: any;
}

export function sendModMessage(this: KittyModPrivate, type: string, data?: any, target?: number) {
  const ChatRoomMessage: KittyChatRoomMessage = {
    Type: "Hidden",
    Content: `${this.name}${type}`,
    Sender: Player.MemberNumber,
    Target: target,
    Data: data,
  };
  ServerSend("ChatRoomChat", ChatRoomMessage);
}

export function receiveModMessage(this: KittyModPrivate, message: ServerChatRoomMessage) {
  const received = isModMessage(this.name, message);
  if (!received) return;

  const type = message.Content.substring(this.name.length)
  const data = message.Data;
  this.emitter.emit(type, data);
}

export function isModMessage(modName: string, message: unknown): message is KittyChatRoomMessage {
  return (
    isObject(message) && 
    "Type" in message && message.Type === "Hidden" &&
    "Content" in message && isString(message.Content) && message.Content.startsWith(modName) &&
    "Sender" in message && isInteger(message.Sender) && message.Sender !== Player.MemberNumber
  );
}
