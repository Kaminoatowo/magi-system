export type MagiVerdict = "APPROVE" | "REJECT" | "CAUTION";
export type MagiStato = "CONSENSUS" | "MAJORITY" | "DEADLOCK";
export type MagiProvider = "anthropic" | "openai" | "custom";

export interface UnitResponse {
  sintesi: string;
  verdetto: MagiVerdict;
}

export interface ModeratorResponse {
  stato: MagiStato;
  verdetto_finale: string;
  nota: string;
}

export interface MagiFullResponse {
  query: string;
  melchior: UnitResponse;
  balthasar: UnitResponse;
  casper: UnitResponse;
  moderator: ModeratorResponse;
}

export interface ChatMessage {
  role: "user" | "magi";
  content: string | MagiFullResponse;
  timestamp: Date;
}

export interface MagiUnitConfig {
  nome: string;
  ambito: string;
  descrizione: string;
}

export interface MagiTripletConfig {
  attiva: boolean;
  melchior: MagiUnitConfig;
  balthasar: MagiUnitConfig;
  casper: MagiUnitConfig;
}

export interface MagiUnit {
  id: "unit_1" | "unit_2" | "unit_3";
  name: string;
  role: string;
  color: "blue" | "green" | "amber";
  systemPrompt: string;
}

export interface MagiTriplet {
  id: string;
  name: string;
  description: string;
  domain: "general" | "science" | "law" | "daily";
  units: [MagiUnit, MagiUnit, MagiUnit];
}

export interface MagiSession {
  id: string;
  tripletId: string;
  tripletName: string;
  startedAt: string;
  queries: number;
  lastQuery: string;
  messages: ChatMessage[];
}

export interface MagiSettings {
  provider: MagiProvider;
  anthropicKey: string;
  openaiKey: string;
  /** Base URL of a custom OpenAI-compatible endpoint (Ollama, llama.cpp, OpenRouter, …). */
  customBaseUrl: string;
  /** Model name to use against the custom endpoint. */
  customModel: string;
  /** Optional API key for the custom endpoint (empty for key-less local servers). */
  customKey: string;
  triplet?: MagiTripletConfig;
  activeTripletId: string;
}
