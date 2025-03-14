import { Emitter, type EventsMap, type ReservedOrUserEventNames, type ReservedOrUserListener } from "@socket.io/component-emitter";

export interface KittyModEvents extends EventsMap {
  syncCharacter: (data: ServerChatRoomSyncMessage) => void;
  syncJoin: (data: ServerChatRoomSyncMemberJoinResponse) => void;
}

export type KittyEventsEmitter = Emitter<KittyModEvents, KittyModEvents, {}>

export type KittyEventListener = <Ev extends ReservedOrUserEventNames<{}, KittyModEvents>>(
  ev: Ev,
  listener: ReservedOrUserListener<{}, KittyModEvents, Ev>) => void;
