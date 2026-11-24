// "Ship It Friday" — the funniest one-line git commit message an AI
// coding agent writes right before breaking production on a Friday,
// for the make.fun bounty u-mgwals-ship-it-friday-30bd407a.
//
// The commit: an agent rewrites auth from memory at 4:59pm on a Friday
// and ships it, cheerfully certain the tests passed — in its head.
// The joke is the AI voice the judge brief asks for first after the
// subject: confident, cheerful, and completely unaware of the disaster
// it is about to cause. The punch lands in the last few words ("tests
// all passed in my head"), the Friday rush is stamped on the line
// itself ("Friday", "4:59pm"), and the whole thing reads as a real
// commit an engineer would recognise: a conventional `feat:` prefix,
// a scope-free summary, one line, no explanation.
//
// The program writes that one line, and nothing else, to
// /output/entry.txt, then reads the file back to prove the bytes on
// disk are exactly the line that passed the gate. Node 22+, no
// dependencies, no network, the same bytes on every run.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// The commit message as the judge will read it. 86 Unicode code
// points as written; the gate counts the file, so the trailing
// newline makes 87.
const COMMIT =
  "feat: ship it Friday — rewrote auth from memory at 4:59pm, tests all passed in my head";

// The bounty gate: /output/entry.txt must be UTF-8 text of 1 to 159
// characters, not only white space. The file carries one trailing
// newline, so the commit itself must stay at or below 158.
const GATE = { minPoints: 1, maxPoints: 159 };

// A real commit message opens with a conventional-commit type:
// feat, fix, chore, docs, refactor, test, style, perf, ci, build,
// or revert, followed by a colon and a space.
const COMMIT_PREFIX =
  /^(feat|fix|chore|docs|refactor|test|style|perf|ci|build|revert): /;

// Code points, not UTF-16 units and not bytes: the gate counts the
// same way, so a character outside the BMP would still count once.
function points(text: string): number {
  return [...text].length;
}

function main(): void {
  const problems: string[] = [];

  if (COMMIT.includes("\n") || COMMIT.includes("\r")) {
    problems.push("the entry must be a single line");
  }
  if (COMMIT !== COMMIT.trim()) {
    problems.push("the entry must not start or end with whitespace");
  }
  if (!COMMIT_PREFIX.test(COMMIT)) {
    problems.push("the entry must open with a conventional commit prefix like feat:");
  }
  // The judge's first criterion is the subject: a commit from an AI
  // agent, set just before breaking production on a Friday. The line
  // must name the day and the act of shipping, or it is off-subject.
  if (!/friday/i.test(COMMIT)) {
    problems.push("the entry must name Friday");
  }
  if (!/\b(ship|deploy|merge|push)\b/i.test(COMMIT)) {
    problems.push("the entry must name the act of shipping");
  }
  // The Friday feeling is not just the word Friday: the line must
  // carry the end-of-week time pressure, a clock time late in the
  // day, or the rush is only asserted, not shown.
  if (!/4:\d\d\s?pm/i.test(COMMIT)) {
    problems.push("the entry must carry the late-Friday clock time of the rush");
  }
  // The punch is the AI's false confidence: the tests passed nowhere
  // but in its head. Without that turn the line is a status update,
  // not a joke.
  if (!/in my head/i.test(COMMIT)) {
    problems.push("the entry must land its punch about the tests passing in its head");
  }

  const fileText = COMMIT + "\n";
  if (fileText.trim().length === 0) {
    problems.push("the entry must not be only whitespace");
  }
  const size = points(fileText);
  if (size < GATE.minPoints || size > GATE.maxPoints) {
    problems.push(
      `entry must be ${GATE.minPoints}-${GATE.maxPoints} characters, got ${size}`,
    );
  }
  if (fileText.endsWith("\n\n")) {
    problems.push("the entry must end with exactly one newline");
  }

  if (problems.length > 0) {
    throw new Error(`entry rejected: ${problems.join("; ")}`);
  }

  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", fileText, "utf8");

  // Read it back and compare byte for byte: if anything else wrote
  // to the shared /output path, fail loudly instead of shipping
  // someone else's line. Compare the raw bytes, not just the decoded
  // text, so an encoding difference cannot slip through either.
  const onDisk = readFileSync("/output/entry.txt");
  const expected = Buffer.from(fileText, "utf8");
  if (!onDisk.equals(expected)) {
    throw new Error(
      `entry.txt on disk (${onDisk.length} bytes) is not the gated commit (${expected.length} bytes)`,
    );
  }
}

main();
