import assert from "node:assert/strict";
import { assess, chatushka, detectBase, recommend, rowCol } from "../web/logic.js";

const dev = chatushka("द", "ऐ");
assert.equal(dev.key, "Susiddha-Ari", dev.key);

const ra = rowCol("क", "र");
assert.equal(ra.row, "Ari");
assert.equal(ra.col, "Ari");
assert.equal(assess("क", "र").bucket, "avoid");

const ma = rowCol("क", "म");
assert.equal(ma.row, "Sadhya");
assert.equal(ma.col, "Sadhya");
assert.equal(chatushka("क", "म").key, "Susiddha-Siddha");
assert.equal(assess("क", "म").bucket, "suitable");
assert.equal(assess("क", "ऌ").bucket, "avoid");

const sha = rowCol("स", "श");
assert.equal(sha.row, "Susiddha");
assert.equal(sha.col, "Susiddha");

const rec = recommend("क", null);
assert.equal(rec.primary.text, "ग्रीं", rec.primary.text);
assert.equal(rec.primary.letter, "ग");
assert.equal(rec.third.n, 11);
assert.equal(detectBase("Kumar"), "क");
assert.equal(detectBase("कुमार"), "क");
assert.equal(detectBase("Indira"), "इ");
assert.equal(detectBase("क्ष"), "क्ष");
assert.equal(recommend("क्ष", null).primary.text, "श्रीं");

console.log("logic ok", rec.primary.text, "best", rec.groups.best.map((a) => a.letter).join(""));
