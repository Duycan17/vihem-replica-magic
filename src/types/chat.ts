export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: Date;
}

export interface ChatEngine {
  sendMessage: (message: string, history: ChatMessage[]) => Promise<string>;
}
