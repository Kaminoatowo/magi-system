import { MagiVerdict } from "./types";

// Kanji labels for each unit verdict, faithful to the NGE MAGI display.
export const VERDICT_KANJI: Record<MagiVerdict, string> = {
  APPROVE: "賛成", // approval
  REJECT: "反対", // opposition
  CAUTION: "判断保留", // reservation
};

export interface VoteTally {
  approval: number;
  opposite: number;
  reservation: number;
  // Final result kanji: 可決 passed / 否決 rejected / 判断保留 held
  resultKanji: string;
  passed: boolean | null; // null = held
}

// ponytail: plain 2/3 majority. Tie/no-majority => held. Upgrade only if the
// moderator ever needs weighted votes.
export function tallyVotes(verdicts: MagiVerdict[]): VoteTally {
  const approval = verdicts.filter((v) => v === "APPROVE").length;
  const opposite = verdicts.filter((v) => v === "REJECT").length;
  const reservation = verdicts.filter((v) => v === "CAUTION").length;

  let resultKanji = "判断保留";
  let passed: boolean | null = null;
  if (approval >= 2) {
    resultKanji = "可決";
    passed = true;
  } else if (opposite >= 2) {
    resultKanji = "否決";
    passed = false;
  }

  return { approval, opposite, reservation, resultKanji, passed };
}

// Result code shown in the CODE panel, by outcome strength:
// 200 net positive (3-0), 250 majority positive (2), 350 majority negative (2),
// 400 net negative (3-0). null when there is no clear approve/reject majority.
export function resultCode(t: VoteTally): number | null {
  if (t.approval === 3) return 200;
  if (t.approval === 2) return 250;
  if (t.opposite === 3) return 400;
  if (t.opposite === 2) return 350;
  return null;
}
