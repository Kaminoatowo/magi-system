// Run: node --test lib/votes.test.mjs
// Pure JS mirror of tallyVotes (kept in sync with votes.ts) — no TS toolchain needed.
import { test } from "node:test";
import assert from "node:assert/strict";

function tallyVotes(verdicts) {
  const approval = verdicts.filter((v) => v === "APPROVE").length;
  const opposite = verdicts.filter((v) => v === "REJECT").length;
  const reservation = verdicts.filter((v) => v === "CAUTION").length;
  if (approval >= 2) return { approval, opposite, reservation, resultKanji: "可決", passed: true };
  if (opposite >= 2) return { approval, opposite, reservation, resultKanji: "否決", passed: false };
  return { approval, opposite, reservation, resultKanji: "判断保留", passed: null };
}

test("2 approve => passed", () => {
  assert.equal(tallyVotes(["APPROVE", "APPROVE", "REJECT"]).resultKanji, "可決");
});
test("2 reject => rejected", () => {
  assert.equal(tallyVotes(["REJECT", "REJECT", "CAUTION"]).resultKanji, "否決");
});
test("no majority => held", () => {
  const t = tallyVotes(["APPROVE", "REJECT", "CAUTION"]);
  assert.equal(t.resultKanji, "判断保留");
  assert.equal(t.passed, null);
});
