import { type AddonChatRoomMessage } from "@/types/types";
import { MOD_NAME, type StorageModel } from "./storage";
import { isInteger, isObject, isString } from "lodash";
export interface Events {
  syncCharacter: StorageModel;
  syncJoin: StorageModel;
}
export const HookPriority = {
  OBSERVE: 0,
  ADD_BEHAVIOR: 1,
  MODIFY_BEHAVIOR: 5,
  OVERRIDE_BEHAVIOR: 10,
  TOP: 100,
};

export function sendModEvent<T extends keyof Events>(type: T, data?: Events[T], target?: number) {
  const ChatRoomMessage: AddonChatRoomMessage = {
    Type: "Hidden",
    Content: `${MOD_NAME}${type}`,
    Sender: Player.MemberNumber,
    Target: target,
    Data: data,
  };
  ServerSend("ChatRoomChat", ChatRoomMessage);
}

type EventListeners = {
  [K in keyof Events]: (message: AddonChatRoomMessage, data: Events[K]) => void;
};

const modListeners = new Map<keyof Events, EventListeners[keyof Events]>();

export function registerModListener<T extends keyof Events>(type: T, callback: EventListeners[T]) {
  modListeners.set(type, callback);
}

export function unregisterModListener<T extends keyof Events>(type: T) {
  modListeners.delete(type);
}

export function receivePacket(message: ServerChatRoomMessage) {
  const received = isModMessage(message);
  if (!received) return;

  const type = message.Content.substring(MOD_NAME.length)
  const data = message.Data;
  for (const [key, modListener] of [...modListeners]) {
    if (key === type) {
      modListener(message, data);
    }
  }
}

export function isModMessage(message: unknown): message is AddonChatRoomMessage {
  return (
    isObject(message) && 
    "Type" in message && message.Type === "Hidden" &&
    "Content" in message && isString(message.Content) && message.Content.startsWith(MOD_NAME) &&
    "Sender" in message && isInteger(message.Sender) && message.Sender !== Player.MemberNumber
  );
}
