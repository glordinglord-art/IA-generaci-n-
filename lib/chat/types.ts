export type Language = "es" | "en";

export type ConversationMessage = {
  role: "user" | "assistant";
  text: string;
};
