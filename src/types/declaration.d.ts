interface ModStorage {
  version: string;
}
interface PlayerCharacter {
  BcBaseAddon: ModStorage;
}

interface Character {
  BcBaseAddon: ModStorage | undefined;
}
