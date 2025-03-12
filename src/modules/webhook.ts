import bcModSdk from "bondage-club-mod-sdk";
const lastDetectedErrors: string[] = [];
export type WebhookForumBody = (errorEvent: ErrorEvent) => {
  thread_name: string;
  username?: string;
  avatar_url?: string;
  content: string;
};

export type WebhookChatBody = (errorEvent: ErrorEvent) => {
  username?: string;
  avatar_url?: string;
  content: string;
};

/**
 * Adds an event listener for error events and sends error details to a specified webhook URL.
 *
 * @param fileName - The name of the file to filter error events by. Only errors from this file will be considered. Though there are some exceptions.
 * @param webhookURL - The URL of the webhook to which the error details will be sent.
 * @param body - A function that takes an ErrorEvent and returns an object containing the error details to be sent.
 */
export function CreateWebhook(fileName: string, webhookURL: string, body: WebhookChatBody | WebhookForumBody) {
  window.addEventListener("error", async (e) => {
    console.error(e.filename);
    if (!e.filename.toLowerCase().includes(fileName) && !webhookURL.includes("http")) return;
    const detectedError = `${e.message} at ${e.filename} ${e.lineno}`;
    if (lastDetectedErrors.includes(detectedError)) return;
    lastDetectedErrors.push(detectedError);
    await fetch(webhookURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body(e)),
    });
  });
}

/**
 * Creates a forum template body for webhook payloads.
 * Use this function if you want a quick and straightforward way
 * to format error details for forum posts.
 */
export function CreateForumTemplateBody(modVersion: string, modName: string): WebhookForumBody {
  return (errorEvent: ErrorEvent) => {
    return {
      username: `${Player.Name} ${Player.Nickname === "" ? "" : `aka ${Player.Nickname}`} (${Player.MemberNumber})`,
      thread_name: `${modName} ${modVersion} Error ${errorEvent.message}`.slice(0, 100),
      content: `
  error: ${errorEvent.error} at 
\`\`\`
${errorEvent.message} at ${errorEvent.filename} ${errorEvent.lineno}
\`\`\`
mods: ${bcModSdk
        .getModsInfo()
        .map((m) => m.name)
        .join(", ")}`,
    };
  };
}

/**
 * Creates a chat template body for webhook payloads.
 * Use this function if you want a quick and straightforward way
 * to format error details for chat messages.
 */
export function CreateChatTemplateBody(modVersion: string, modName: string): WebhookChatBody {
  return (errorEvent: ErrorEvent) => {
    return {
      username: `${Player.Name} ${Player.Nickname === "" ? "" : `aka ${Player.Nickname}`} (${Player.MemberNumber})`,
      content: `
      ## ${modName} ${modVersion} Error ${errorEvent.message}
      error: ${errorEvent.error} at 
    \`\`\`
    ${errorEvent.message} at ${errorEvent.filename} ${errorEvent.lineno}
    \`\`\`
    mods: ${bcModSdk
      .getModsInfo()
      .map((m) => m.name)
      .join(", ")}`,
    };
  };
}
