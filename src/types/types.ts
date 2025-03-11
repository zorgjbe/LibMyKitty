export type PartialDeep<T> = {
  [P in keyof T]?: PartialDeep<T[P]>;
};

export interface AddonServerChatRoomMessage extends ServerChatRoomMessageBase {
  Target?: number;
  Content: ServerChatRoomMessageContentType;
  Type: ServerChatRoomMessageType;
  Dictionary?: {
    type: string;
    data?: any;
  }[];
  Timeout?: number;
}

export interface ReceivedAddonServerChatRoomMessage extends ServerChatRoomMessageBase {
  Target?: number;
  Content: "BcBaseAddonMsg";
  Type: "Hidden";
  Dictionary: {
    type: string;
    data?: any;
  }[];
  Timeout?: number;
  Sender: number;
}
