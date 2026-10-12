import {
  CELLS, FILL, GRAHAS, JOINED, LETTERS, NAKSHATRAS, OUTSIDE, PHALA, PREFER, SIGNS, VARGAS, VOWEL_BEEJA,
} from "./data.js";

const YOGA = ["Siddha", "Sadhya", "Susiddha", "Ari"];
const SHOW = { Siddha: "Siddha", Sadhya: "Sādhya", Susiddha: "Susiddha", Ari: "Ari" };

const cellByN = Object.fromEntries(CELLS.map((c) => [c.n, c]));
const letterCell = {};
for (const cell of CELLS) {
  const r = Math.floor((cell.n - 1) / 4);
  const c = (cell.n - 1) % 4;
  cell.r = r;
  cell.c = c;
  for (const L of cell.letters) letterCell[L] = cell.n;
}

const consonantPriority = ["क", "ब", "भ", "म", "र", "व", "श", "स", "ह", "ग", "द", "प", "य", "न", "त", "थ", "ध", "ज", "च", "छ", "झ", "ञ", "ट", "ठ", "ड", "ढ", "ण", "ख", "घ", "ङ", "फ", "ल", "ष"];

export function showYoga(name) {
  return SHOW[name] || name;
}

export function cellOf(letter) {
  const n = letterCell[letter];
  return n ? cellByN[n] : null;
}

export function cellAt(r, c) {
  const rr = ((r % 4) + 4) % 4;
  const cc = ((c % 4) + 4) % 4;
  return CELLS[rr * 4 + cc];
}

export function rowCol(fromLetter, toLetter) {
  const a = cellOf(fromLetter);
  const b = cellOf(toLetter);
  if (!a || !b) return null;
  const rd = (b.r - a.r + 4) % 4;
  const cd = (b.c - a.c + 4) % 4;
  return {
    row: YOGA[rd],
    col: YOGA[cd],
    rowStep: rd + 1,
    colStep: cd + 1,
    from: a.n,
    to: b.n,
  };
}

export function chatushka(fromLetter, toLetter) {
  const a = cellOf(fromLetter);
  const b = cellOf(toLetter);
  if (!a || !b) return null;
  const ia = FILL.indexOf(a.n);
  const ib = FILL.indexOf(b.n);
  const qa = Math.floor(ia / 4);
  const qb = Math.floor(ib / 4);
  const rel = (qb - qa + 4) % 4;
  const pos = ib % 4;
  const key = `${YOGA[rel]}-${YOGA[pos]}`;
  return {
    key,
    quartet: YOGA[rel],
    place: YOGA[pos],
    fromQuartet: qa + 1,
    toQuartet: ((qa + rel) % 4) + 1,
    placeIndex: pos + 1,
    fruit: PHALA[key],
  };
}

function mmClass(key) {
  if (key.includes("Ari")) return "avoid";
  if (key === "Sadhya-Sadhya") return "fruitless";
  if (["Siddha-Siddha", "Siddha-Susiddha", "Susiddha-Siddha", "Susiddha-Susiddha"].includes(key)) return "strong";
  return "work";
}

function essayClass(rc) {
  if (rc.row === "Ari" || rc.col === "Ari") return "avoid";
  if (rc.row === "Susiddha" && rc.col === "Susiddha") return "best";
  if (rc.row === "Sadhya" && rc.col === "Sadhya") return "second";
  return "open";
}

export function beejaForm(letter) {
  if (JOINED[letter]) {
    const [text, iast] = JOINED[letter];
    return {
      text,
      iast,
      kind: letter === "र" ? "agni" : "joined",
    };
  }
  if (VOWEL_BEEJA[letter]) {
    const [text, iast] = VOWEL_BEEJA[letter];
    return { text, iast, kind: "vowel" };
  }
  return null;
}

export function grahaOfLetter(letter) {
  return Object.values(GRAHAS).find((g) => g.consonant === letter) || null;
}

export function assess(base, letter) {
  const meta = LETTERS[letter];
  const cell = cellOf(letter);
  const rc = rowCol(base, letter);
  const mm = chatushka(base, letter);
  const form = beejaForm(letter);
  const graha = grahaOfLetter(letter);
  const varga = VARGAS[meta.varga];
  let bucket = "suitable";
  const why = [];
  if (letter === "ऌ") {
    bucket = "avoid";
    why.push("The atma-bija essays say ऌ is not to be made into an atma beeja.");
  }
  const essay = essayClass(rc);
  const tantra = mmClass(mm.key);
  if (essay === "avoid") {
    bucket = "avoid";
    why.push(`Row ${rc.rowStep} is ${showYoga(rc.row)} and column ${rc.colStep} is ${showYoga(rc.col)}. The fourth row or the fourth column is not used.`);
  }
  if (tantra === "avoid") {
    bucket = "avoid";
    why.push(`Mantra Mahodadhi counts this as ${showYoga(mm.quartet)}–${showYoga(mm.place)}. ${mm.fruit}`);
  } else if (tantra === "fruitless") {
    bucket = "avoid";
    why.push("Mantra Mahodadhi calls the sādhya–sādhya chatushka fruitless.");
  }
  if (bucket !== "avoid") {
    if (essay === "best" || mm.key === "Susiddha-Susiddha") {
      bucket = "best";
      if (essay === "best") why.push("This is the third row and the third column, the square the atma-bija method calls most beneficial.");
      if (mm.key === "Susiddha-Susiddha") why.push("Mantra Mahodadhi calls susiddha–susiddha fruitful from the initiation itself.");
    } else {
      bucket = "suitable";
      if (essay === "second") why.push("This is the second row and the second column, the other square the essays call highly suitable.");
      else why.push(`Row ${showYoga(rc.row)}, column ${showYoga(rc.col)}. Allowed, and not the first square.`);
      why.push(`Chatushka result: ${showYoga(mm.quartet)}–${showYoga(mm.place)}. ${mm.fruit}`);
    }
  }
  let score = 0;
  if (bucket === "best") score += 100;
  if (essay === "best") score += 200;
  if (mm.key === "Susiddha-Susiddha") score += 120;
  if (tantra === "strong") score += 40;
  if (graha) score += 40;
  if (PREFER.has(letter) && !VOWEL_BEEJA[letter]) score += 30;
  if (VOWEL_BEEJA[letter] && letter !== "र") score -= 8;
  const pi = consonantPriority.indexOf(letter);
  if (pi >= 0) score += (consonantPriority.length - pi);
  return { letter, meta, cell, rc, mm, bucket, why, form, graha, varga, score };
}

export function recommend(base, chart) {
  if (!base) return null;
  if (OUTSIDE.some((o) => o.dev === base)) {
    const outside = OUTSIDE.find((o) => o.dev === base);
    return {
      base,
      outside,
      primary: {
        text: "श्रीं",
        iast: "śrīṁ",
        letter: "श",
        bucket: "fallback",
        lead: "graha-free",
        headline: "No house for this letter",
      },
      groups: { best: [], suitable: [], avoid: [] },
      notes: [
        `${base} has no house on the 49-letter akathaha. ${outside.note}`,
        "When a right beeja cannot be derived, the working method uses श्रीं.",
      ],
      third: null,
      rejected: [],
    };
  }
  const home = cellOf(base);
  const third = cellAt(home.r + 2, home.c + 2);
  const all = CELLS.flatMap((cell) => cell.letters.map((L) => assess(base, L)));
  const groups = {
    best: all.filter((a) => a.bucket === "best").sort((a, b) => b.score - a.score),
    suitable: all.filter((a) => a.bucket === "suitable").sort((a, b) => b.score - a.score),
    avoid: all.filter((a) => a.bucket === "avoid"),
  };

  const rejected = [];
  let chartPick = null;
  const usable = (id) => {
    const g = GRAHAS[id];
    const found = all.find((a) => a.letter === g.consonant);
    return { graha: g, assessed: found };
  };
  if (chart && !chart.time.timeUncertain) {
    const lord = chart.lagnaLord;
    if (lord.fit) {
      const hit = usable(lord.id);
      if (hit.assessed.bucket === "avoid") {
        rejected.push({ role: "Lagna lord", ...hit, reason: `${hit.graha.name} passed the strength screen, but ${hit.graha.consonant} falls in a house this chakra does not use.` });
      } else {
        chartPick = { role: "Lagna lord", ...hit };
      }
    } else {
      rejected.push({ role: "Lagna lord", graha: GRAHAS[lord.id], assessed: usable(lord.id).assessed, reason: `${GRAHAS[lord.id].name} did not pass the strength screen, so its seed is not the starting point.` });
    }
    if (!chartPick && chart.yogakaraka) {
      const yog = chart.yogakaraka;
      const hit = usable(yog.id);
      if (yog.fit && hit.assessed.bucket !== "avoid") chartPick = { role: "Yogakaraka", ...hit };
      else if (yog.fit && hit.assessed.bucket === "avoid") {
        rejected.push({ role: "Yogakaraka", ...hit, reason: `${hit.graha.name} is the yogakaraka and passed the strength screen, but ${hit.graha.consonant} is in a house the chakra does not use.` });
      } else if (!yog.fit) {
        rejected.push({ role: "Yogakaraka", graha: GRAHAS[yog.id], assessed: hit.assessed, reason: `${GRAHAS[yog.id].name} is the yogakaraka but did not pass the strength screen.` });
      }
    }
  }

  let winner = chartPick ? chartPick.assessed : (groups.best[0] || groups.suitable[0] || null);
  let lead = chartPick ? "chart" : "chakra";
  const notes = [];
  if (!winner) {
    return {
      base,
      home,
      third,
      groups,
      rejected,
      primary: { text: "श्रीं", iast: "śrīṁ", letter: "श", bucket: "fallback", lead: "fallback", headline: "Fallback beeja" },
      notes: ["No house both traditions will keep. The working method then uses श्रीं."],
    };
  }

  const form = winner.form;
  let text = form.text;
  let iast = form.iast;
  let headline = "Atma beeja";
  if (chartPick && winner.letter === chartPick.graha.consonant) {
    text = chartPick.graha.beeja;
    iast = chartPick.graha.iast;
    headline = `${chartPick.role}'s beeja`;
    notes.push(`${chartPick.graha.name} is the ${chartPick.role.toLowerCase()} and ${chartPick.graha.consonant} survives the chakra, so the primary seed is the graha beeja ${text}.`);
    notes.push(`The akathaha joining of the same letter is ${form.text}.`);
  } else {
    notes.push(`${winner.letter} in house ${winner.cell.n} gives ${text}.`);
    if (winner.graha) notes.push(`${winner.letter} is also the opening of ${winner.graha.name}'s own seed ${winner.graha.beeja}.`);
  }
  if (chart && chart.time.timeUncertain) {
    notes.push("The birth time was marked unknown, so the lagna is not used to choose the beeja.");
  }

  return {
    base,
    home,
    third,
    groups,
    rejected,
    notes,
    primary: {
      text,
      iast,
      letter: winner.letter,
      bucket: winner.bucket,
      lead,
      headline,
      assessed: winner,
      graha: winner.graha,
      joined: form,
      chartPick,
    },
  };
}

export function padaOf(nakIndex, pada) {
  const nak = NAKSHATRAS[nakIndex];
  if (!nak) return null;
  const p = nak.padas[pada - 1];
  return { nak, pada: p, sign: SIGNS[p.sign] };
}

const LATIN = [
  ["ksh", "क्ष"], ["kṣ", "क्ष"], ["jna", "ज्ञ"], ["gya", "ज्ञ"], ["jñ", "ज्ञ"],
  ["kh", "ख"], ["gh", "घ"], ["ṅ", "ङ"], ["ng", "ङ"],
  ["chh", "छ"], ["cha", "च"], ["ch", "च"], ["jh", "झ"], ["j", "ज"],
  ["ṭh", "ठ"], ["ṭ", "ट"], ["ḍh", "ढ"], ["ḍ", "ड"],
  ["th", "थ"], ["dh", "ध"], ["ph", "फ"], ["bh", "भ"],
  ["ś", "श"], ["sh", "श"], ["ṣ", "ष"],
  ["aa", "आ"], ["ā", "आ"], ["ai", "ऐ"], ["au", "औ"],
  ["ee", "ई"], ["ī", "ई"], ["oo", "ऊ"], ["ū", "ऊ"],
  ["ṛ", "ऋ"], ["ri", "ऋ"], ["ṝ", "ॠ"],
  ["ḷ", "ऌ"], ["ḹ", "ॡ"],
  ["e", "ए"], ["o", "ओ"], ["a", "अ"], ["i", "इ"], ["u", "उ"],
  ["k", "क"], ["g", "ग"], ["c", "च"], ["t", "त"], ["d", "द"], ["p", "प"],
  ["b", "ब"], ["m", "म"], ["y", "य"], ["r", "र"], ["l", "ल"], ["v", "व"], ["w", "व"],
  ["s", "स"], ["h", "ह"], ["n", "न"],
];

const DEV_HEADS = Object.keys(LETTERS).concat(OUTSIDE.map((o) => o.dev)).sort((a, b) => b.length - a.length);

export function detectBase(name) {
  const t = (name || "").trim();
  if (!t) return null;
  for (const h of DEV_HEADS) if (t.startsWith(h)) return h;
  const s = t.toLowerCase().normalize("NFC");
  for (const [lat, dev] of LATIN) if (s.startsWith(lat)) return dev;
  return null;
}

export { CELLS, FILL, GRAHAS, LETTERS, NAKSHATRAS, OUTSIDE, PHALA, SIGNS, VARGAS, YOGA };
