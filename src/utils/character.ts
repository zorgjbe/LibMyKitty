// https://github.com/FurryZoi/Littlish-Club/blob/ed3f0ce0533473b6c2505500198c67d812df6b17/src/utils/characters.ts#L1
// Thanks Zoi
export const getCharacter = (identifier: string | number | Character): Character | undefined => {
  if (!identifier) return;
  if (typeof identifier === "object") return identifier;
  return ChatRoomCharacter.find((Character) => {
    return Character.MemberNumber == identifier || Character.Name.toLowerCase() === identifier || Character.Nickname?.toLowerCase() === identifier;
  });
};

export const isBcBaseAddonPlayer = (character: Character, version = Player.BcBaseAddon.version): boolean => {
  return Boolean(character?.BcBaseAddon && character.BcBaseAddon.version === version);
};
