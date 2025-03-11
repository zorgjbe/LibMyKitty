import { AddonServerChatRoomMessage, ReceivedAddonServerChatRoomMessage } from "@/types/types";

export function isMessageRecived(message: AddonServerChatRoomMessage): message is ReceivedAddonServerChatRoomMessage {
  return (
    message?.Content === "BcBaseAddonMsg" &&
    message.Sender &&
    message.Sender !== Player.MemberNumber &&
    message.Dictionary &&
    message.Dictionary[0]?.data &&
    message.Type === "Hidden"
  );
}
