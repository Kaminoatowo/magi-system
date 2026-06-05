export type MagiVerdict = "APPROVE" | "REJECT" | "CAUTION";
export type MagiStato = "CONSENSUS" | "MAJORITY" | "DEADLOCK";

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
