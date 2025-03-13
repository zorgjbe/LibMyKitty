# Webhooks

A webhook is a type of URL endpoint that allows you to send data to another service or application. In this case it is used to send error details to a discord webhook. You need to have a discord webhook set up for this to work.

### `CreateWebhook`

Adds an event listener for error events and sends error details to a specified webhook URL.

fileName is important that it is unique because if your file is named `index` then it will send errors from other mods that have index as their name.
webhookURL is the URL where the errors will be sent, this is only compatable with discord at the moment.
body is a function that takes an ErrorEvent and returns an object containing the error details to be sent.

```ts
CreateWebhook(fileName: string, webhookURL: string, body: WebhookChatBody | WebhookForumBody): void;
```

```ts
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
```

If you want something quick then you can use `CreateForumTemplateBody(modVersion: string, modName: string)` for forums and `CreateChatTemplateBody(modVersion: string, modName: string)` for chats.
