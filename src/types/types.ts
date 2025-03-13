export type PartialDeep<T> = {
  [P in keyof T]?: PartialDeep<T[P]>;
};

export interface AddonChatRoomMessage extends ServerChatRoomMessage {
  Content: `${string}`;
  Type: "Hidden";
  Data: any;
}

export interface MyKittyActivity {
  ID: string;
  Name: string;
  Image: string;
  OnClick?: (player: Character, group: AssetGroupItemName) => void;
  Target?: AssetGroupItemName[];
  TargetSelf?: AssetGroupItemName[];
  Criteria?: (player: Character) => boolean;
}
