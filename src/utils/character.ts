// https://github.com/FurryZoi/Littlish-Club/blob/ed3f0ce0533473b6c2505500198c67d812df6b17/src/utils/characters.ts#L1

import { isObject } from "lodash";

// Thanks Zoi
export function getCharacter(identifier: string | number | Character): Character | undefined {
  if (!identifier) return;
  if (isObject(identifier)) return identifier;
  return ChatRoomCharacter.find((character) => {
    return character.MemberNumber === identifier || character.Name.toLowerCase() === identifier || character.Nickname?.toLowerCase() === identifier;
  });
}

// export function isAddonPlayer(character: Character, version = getStorage(Player)?.version): boolean {
//   return Boolean(getStorage(character)?.version === version);
// }
