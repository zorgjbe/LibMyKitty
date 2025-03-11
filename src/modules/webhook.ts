// delete this if you don't need it

import { MOD_FILE_NAME, MOD_VERSION, MOD_WEBHOOK_URL } from "@/constants";
import bcModSdk from "bondage-club-mod-sdk";

const lastDetectedErrors: string[] = [];

window.addEventListener("error", async (e) => {
  console.error(e.filename);
  if (!e.filename.toLowerCase().includes(MOD_FILE_NAME) && !MOD_WEBHOOK_URL.includes("http")) return;
  const detectedError = `${e.message} at ${e.filename} ${e.lineno}`;
  if (lastDetectedErrors.includes(detectedError)) return;
  lastDetectedErrors.push(detectedError);
  const body = {
    username: `${Player.Name} ${Player.Nickname === "" ? "" : `aka ${Player.Nickname}`} (${Player.MemberNumber})`,
    thread_name: `BcBaseAddon ${MOD_VERSION} Error ${e.message}`.slice(0, 100), // for forums, put this in content for chats
    content: `
    error: ${detectedError}
\`\`\`
${e.error.stack}
\`\`\`
mods: ${bcModSdk
      .getModsInfo()
      .map((m) => m.name)
      .join(", ")}`,
  };
  await fetch(MOD_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
});
