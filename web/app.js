import {
  CELLS, FILL, GRAHAS, LETTERS, NAKSHATRAS, OUTSIDE, SIGNS,
} from "./data.js";
import { assess, detectBase, padaOf, recommend, showYoga } from "./logic.js";

const state = {
  view: "find",
  step: "name",
  source: "name",
  base: null,
  test: null,
  mode: "essay",
  node: "mean",
  chart: null,
  birthSkipped: false,
  found: false,
  entryKey: "",
  name: "",
};

const STEP_COPY = {
  name: ["1. Give the name", "The beeja starts from the name you are called by. Only the first Sanskrit letter is counted."],
  birth: ["2. Birth details", "Optional. Skip this if the chart should not take part. If you enter a birth, the lagna lord is tested before the name letter’s square."],
  result: ["3. The beeja", "Counted from the letter you confirmed, then from the chart if you entered one."],
};

const $ = (id) => document.getElementById(id);
const PICK = ["अ","आ","इ","ई","उ","ऊ","ऋ","ॠ","ऌ","ॡ","ए","ऐ","ओ","औ","अं","अः","क","ख","ग","घ","ङ","च","छ","ज","झ","ञ","ट","ठ","ड","ढ","ण","त","थ","द","ध","न","प","फ","ब","भ","म","य","र","ल","व","श","ष","स","ह"];

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function dms(deg) {
  let x = Math.abs(deg);
  let d = Math.floor(x);
  let mFloat = (x - d) * 60;
  let m = Math.floor(mFloat);
  let s = Math.round((mFloat - m) * 60);
  if (s === 60) { s = 0; m += 1; }
  if (m === 60) { m = 0; d += 1; }
  return `${d}° ${String(m).padStart(2, "0")}′ ${String(s).padStart(2, "0")}″`;
}

function activeBase() {
  if (state.source === "nakshatra" && state.chart) {
    const moon = state.chart.bodies.find((b) => b.id === "chandra");
    const p = padaOf(moon.nakshatraIndex, moon.pada);
    return p?.pada.base || state.base;
  }
  return state.base;
}

function recNow() {
  const base = activeBase();
  if (!base) return null;
  return recommend(base, state.chart);
}

function setView(view) {
  state.view = view;
  document.querySelectorAll(".view").forEach((el) => el.hidden = el.id !== `view-${view}`);
  document.querySelectorAll("[data-act=nav]").forEach((btn) => {
    if (btn.dataset.view === view) btn.setAttribute("aria-current", "page");
    else btn.removeAttribute("aria-current");
  });
  if (view === "chakra") paintChakra();
  if (view === "beejas") paintBeejas();
  if (view === "find" && state.step === "result") {
    if (answerIsCurrent()) paintFind();
    else showUnfound();
  }
}

function setPressed(group, attr, value) {
  document.querySelectorAll(`[data-act=${group}]`).forEach((btn) => {
    btn.setAttribute("aria-selected", btn.dataset[attr] === value ? "true" : "false");
  });
}

function entryKey() {
  return [
    ($("name")?.value || "").trim(),
    state.base || "",
    state.source,
    $("date")?.value || "",
    $("time")?.value || "",
    $("lat")?.value || "",
    $("lon")?.value || "",
    ($("tz")?.value || "").trim(),
    $("unknown")?.checked ? "1" : "0",
    state.node,
    ($("place")?.value || "").trim(),
  ].join("|");
}

function markFound() {
  state.found = true;
  state.entryKey = entryKey();
}

function answerIsCurrent() {
  return state.found && state.entryKey === entryKey();
}

function clearAnswerDom() {
  if ($("hero")) $("hero").innerHTML = "";
  if ($("calc-steps")) $("calc-steps").innerHTML = "";
  if ($("find-side")) $("find-side").innerHTML = "";
}

function showUnfound() {
  clearAnswerDom();
  if (!$("hero")) return;
  $("hero").innerHTML = `<div class="card hero"><p class="eyebrow">No result yet</p><p>Press Find. This page calculates the name and birth that are on the form now. An earlier result is not kept.</p><div class="actions"><button class="btn" type="button" data-act="step" data-step="birth">Go to birth and Find</button></div></div>`;
}

function onEntryEdit() {
  if (!state.found) return;
  if (entryKey() === state.entryKey) return;
  state.found = false;
  state.chart = null;
  state.birthSkipped = false;
  clearAnswerDom();
  paintChart();
  paintChakra();
  paintBeejas();
  if (state.step === "result") showUnfound();
}

function setStep(step) {
  if ((step === "birth" || step === "result") && !state.base && !(state.source === "nakshatra" && state.chart)) {
    step = "name";
  }
  state.step = step;
  for (const id of ["name", "birth", "result"]) {
    const el = $(`step-${id}`);
    if (el) el.hidden = id !== step;
  }
  document.querySelectorAll("[data-act=step]").forEach((btn) => {
    if (btn.dataset.step === step) btn.setAttribute("aria-current", "step");
    else btn.removeAttribute("aria-current");
  });
  const copy = STEP_COPY[step];
  if (copy && $("find-title")) {
    $("find-title").textContent = copy[0];
    $("find-lede").textContent = copy[1];
  }
  if (step === "name") paintName();
  if (step === "result") {
    if (answerIsCurrent()) paintFind();
    else showUnfound();
  }
}

function paintName() {
  const typed = $("name")?.value || "";
  state.name = typed;
  const guess = detectBase(typed);
  const box = $("guess");
  const chosen = $("chosen");
  if (chosen) {
    chosen.innerHTML = state.base
      ? `Letter confirmed for the chakra: <span class="dev">${esc(state.base)}</span>`
      : "No letter confirmed yet.";
  }
  if (box) {
    if (!guess) {
      box.innerHTML = typed.trim()
        ? `<p class="small">This spelling did not match a Sanskrit sound. Tap the first letter below.</p>`
        : "";
    } else {
      const iast = LETTERS[guess]?.iast || guess;
      const same = state.base === guess;
      box.innerHTML = `<div class="choice">
        <div>
          <div class="small muted">First sound of this name</div>
          <div class="sound">${esc(guess)}</div>
          <div class="small">${esc(iast)}${same ? " · confirmed" : ""}</div>
        </div>
        <button type="button" class="btn" data-act="pick" data-letter="${esc(guess)}">${same ? "Confirmed" : `Use ${guess}`}</button>
      </div>`;
    }
  }
  const next = $("to-birth");
  if (next) next.disabled = !state.base;
  if ($("picker")) paintPicker();
  onEntryEdit();
}

function paintPicker() {
  const base = state.source === "name" ? state.base : activeBase();
  $("picker").innerHTML = PICK.map((L) => {
    const meta = LETTERS[L];
    return `<button type="button" data-act="pick" data-letter="${L}" aria-pressed="${base === L}" title="${esc(meta.iast)}">${L}</button>`;
  }).join("");
  $("outside").innerHTML = `<span>No house on this chakra</span>` + OUTSIDE.map((o) =>
    `<button type="button" class="letter-btn" data-act="pick" data-letter="${o.dev}" aria-pressed="${base === o.dev}">${o.dev}</button>`
  ).join("");
}

function worship(rec) {
  if (!rec) return "";
  if (rec.outside || rec.primary.bucket === "fallback") {
    return `<div class="worship"><strong>Worship.</strong> The working method uses <span class="dev">श्रीं</span> when a personal letter cannot be settled. The essays call it a fruition seed. <span class="dev">श</span> is ya-varga: devata Shiva, graha Chandra. Chandra’s own line already contains it: <span class="dev mantra">ॐ श्रां श्रीं श्रौं सः चन्द्राय नमः</span></div>`;
  }
  const a = rec.primary.assessed;
  const v = a.varga;
  const bits = [];
  bits.push(`${a.letter} is ${v.label}. Varga devata ${v.devata}. Varga graha ${v.graha}.`);
  if (a.meta.shakti) bits.push(`Shakti-name: ${a.meta.shakti}. ${a.meta.meaning}`);
  else bits.push(a.meta.meaning);
  if (rec.primary.chartPick) {
    const g = rec.primary.chartPick.graha;
    bits.push(`Because the ${rec.primary.chartPick.role.toLowerCase()} donated this letter, the worship line is ${g.deity}: <span class="dev">${esc(g.mantra)}</span>.`);
  } else if (a.graha) {
    const same = rec.primary.text === a.graha.beeja;
    bits.push(`${a.letter} is the opening letter of ${a.graha.name}’s seed <span class="dev">${a.graha.beeja}</span>, so the worship names ${a.graha.deity}. ${a.graha.name} in the birth chart was not the graha chosen.`);
    if (!same) bits.push(`The seed given is <span class="dev">${esc(rec.primary.text)}</span>, the chakra’s joining of ${a.letter} with रीं. It is not ${a.graha.name}’s own <span class="dev">${a.graha.beeja}</span>.`);
    bits.push(`The navagraha line is <span class="dev">${esc(a.graha.mantra)}</span>.`);
  }
  if (state.source === "nakshatra" && state.chart) {
    const moon = state.chart.bodies.find((b) => b.id === "chandra");
    const p = padaOf(moon.nakshatraIndex, moon.pada);
    if (p) bits.push(`Janma nakshatra ${p.nak.name} pada ${moon.pada}, syllable ${p.pada.syl}. Deity: ${p.nak.deity}.`);
  }
  return `<div class="worship"><strong>Worship.</strong> ${bits.join(" ")} <p class="mantra">${esc(rec.primary.text)} · your mantra · ${esc(rec.primary.text)}</p><p class="small muted">Sampuṭa leaves the mantra itself to the practice you already have.</p></div>`;
}

function walkthrough(rec) {
  const items = [];
  const push = (title, html) => items.push({ title, html });

  if (state.source === "nakshatra" && state.chart) {
    const moon = state.chart.bodies.find((b) => b.id === "chandra");
    const p = padaOf(moon.nakshatraIndex, moon.pada);
    push(
      "The Moon’s syllable is the letter",
      `<p>Each nakshatra is 13°20′, and each of its four padas is 3°20′. The Moon is in ${esc(p.nak.name)}, pada ${moon.pada}, syllable ${esc(p.pada.syl)}. The base of that syllable is ${esc(rec.base)}. Mantra Mahodadhi 24.2 allows this janma name in place of the called name.${state.chart.time.timeUncertain ? " The birth time was unknown, so this pada is the noon position." : ""}</p>`
    );
  } else {
    const guessed = state.name ? detectBase(state.name) : null;
    const named = !state.name
      ? `The confirmed letter is ${esc(rec.base)}.`
      : guessed && guessed !== rec.base
        ? `The spelling “${esc(state.name)}” suggests ${esc(guessed)}. The letter you confirmed is ${esc(rec.base)}, so that is the letter counted.`
        : `From “${esc(state.name)}”, the first sound kept is ${esc(rec.base)}. A vowel after that sound is dropped.`;
    push("The name becomes one letter", `<p>${named}</p>`);
  }

  if (rec.outside) {
    push(
      "This letter has no house",
      `<p>${esc(rec.base)} is outside the 49-letter akathaha. ${esc(rec.outside.note)} The working method then uses श्रीं, the joining of श with रीं.</p>`
    );
  } else if (rec.home && rec.third) {
    const row = rec.home.r + 1;
    const col = rec.home.c + 1;
    push(
      "The letter is placed on the sixteen houses",
      `<p>The houses are numbered left to right, top to bottom. ${esc(rec.base)} stands in house ${rec.home.n}, which is row ${row}, column ${col}. The letters that share this house are ${rec.home.letters.map(esc).join(" ")}. Every letter in one house shares one result.</p>`
    );
    const letters = rec.third.letters.map((L) => {
      const a = assess(rec.base, L);
      const word = a.bucket === "avoid" ? "not used" : a.bucket === "best" ? "best" : "suitable";
      return `${esc(L)} → ${esc(a.form.text)} (${word})`;
    }).join("; ");
    push(
      "Two steps down and two across",
      `<p>From row ${row}, column ${col}, add 2 to the row and 2 to the column. The grid wraps after 4. That square is house ${rec.third.n}: ${rec.third.letters.map(esc).join(" ")}. This is the square the atma-bija method prefers. Its letters count as ${letters}.</p>`
    );
  }

  if (rec.outside) {
    push(
      state.chart ? "The chart cannot move this letter" : "Birth does not change this letter",
      state.chart
        ? `<p>${esc(rec.base)} has no house on the chakra, so the lagna lord is not tested against it. The seed remains श्रीं.</p>`
        : `<p>Whether or not a birth is entered, this letter has no house, so the seed is श्रीं.</p>`
    );
  } else if (!state.chart) {
    push(
      "Birth was skipped",
      `<p>No birth was entered, so the lagna lord and the yogakaraka are not tested. The seed stays with the name letter and the square just counted.</p>`
    );
  } else if (state.chart.time.timeUncertain) {
    push(
      "The birth time was unknown",
      `<p>Noon was used so the Moon could be placed. The lagna of an unknown time is not allowed to choose the seed. The name letter keeps the decision.</p>`
    );
  } else {
    const c = state.chart;
    const asLines = (rows) => rows.map((r) => `<p>${esc(r)}</p>`).join("");
    const lordBits = asLines(c.lagnaLord.reasons || []);
    let yog = `<p>${esc(c.yogakarakaNote)}</p>`;
    if (c.yogakaraka) yog += asLines(c.yogakaraka.reasons || []);
    const refused = asLines((rec.rejected || []).map((r) => r.reason));
    push(
      "The lagna lord is asked first",
      `<p>Only the name and the birth on the form are used${state.name ? `: “${esc(state.name)}”` : ""}, ${esc(c.time.local)}, ${esc(c.place.label || `${c.place.latitude}, ${c.place.longitude}`)}. Lagna is ${esc(c.lagna.sign)} ${dms(c.lagna.degreeInSign)}. Its lord is tested before any letter in the third square. A lord is kept only when its shadbala reaches the required pinda, it is not debilitated, not combust, and it stands in a kendra, a trikona, or its own, moolatrikona, or exalted sign, and when its consonant is not refused by the chakra. The house is the count of signs from that lagna to the graha’s sign.</p>
       ${lordBits}
       ${yog}
       ${refused}`
    );
  }

  if (rec.primary?.assessed) {
    const a = rec.primary.assessed;
    const paras = [];
    if (rec.primary.chartPick) {
      const g = rec.primary.chartPick.graha;
      paras.push(`${esc(g.name)} is the ${esc(rec.primary.chartPick.role.toLowerCase())} and passed the strength screen. ${esc(g.consonant)} is kept by the chakra, so the chart gives ${esc(g.name)}’s own seed ${esc(g.beeja)}.`);
      if (g.beeja !== a.form.text) {
        paras.push(`Joined only by the chakra, the same letter would be ${esc(a.form.text)}. The seed is ${esc(g.beeja)} because a graha that passes is used in its own form.`);
      }
    } else if (rec.primary.bucket !== "fallback") {
      if (state.chart && !state.chart.time.timeUncertain && !rec.outside) {
        const yog = state.chart.yogakaraka
          ? "The yogakaraka did not give a letter either."
          : "This lagna has no single yogakaraka, so no second graha is asked.";
        paras.push(`The chart does not give the seed. ${yog} The choice returns to the square counted above.`);
      }
      if (rec.third && a.cell.n !== rec.third.n) {
        paras.push(`No letter in the third square survived both counts, so the next letter kept is ${esc(a.letter)} in house ${a.cell.n}.`);
      }
      const rivals = [...(rec.groups.best || []), ...(rec.groups.suitable || [])]
        .filter((x) => x.cell?.n === a.cell.n && x.letter !== a.letter);
      if (rivals.length) {
        paras.push(`The same house also holds ${rivals.map((x) => `${esc(x.letter)}, which would make ${esc(x.form.text)}`).join("; ")}. ${esc(a.letter)} is the one kept.`);
      }
      if (a.graha) {
        paras.push(`${esc(a.letter)} is kept ahead of the others because it is the opening letter of ${esc(a.graha.name)}. ${esc(a.graha.name)} the planet was not selected from the horoscope. The name appears only because ${esc(a.letter)} begins ${esc(a.graha.beeja)}.`);
      }
      if (a.form.kind === "vowel") {
        paras.push(`A vowel is kept with a bindu, so ${esc(a.letter)} becomes ${esc(a.form.text)}.`);
      } else {
        paras.push(`${esc(a.letter)} is joined to रीं. र is Agni and ईं is kāmakalā, so the seed is ${esc(a.form.text)}.`);
        if (a.graha && a.graha.beeja !== a.form.text) {
          paras.push(`That is why ${esc(a.form.text)} is given, and not ${esc(a.graha.name)}’s own seed ${esc(a.graha.beeja)}.`);
        }
      }
      paras.push(`Row ${a.rc.rowStep} is ${esc(showYoga(a.rc.row))}, column ${a.rc.colStep} is ${esc(showYoga(a.rc.col))}. The chatushka reads ${esc(showYoga(a.mm.quartet))}–${esc(showYoga(a.mm.place))}.`);
    }
    if (paras.length) {
      push(rec.primary.chartPick ? "Why this graha gives the seed" : "Why this seed is given", paras.map((p) => `<p>${p}</p>`).join(""));
    }
  } else if (rec.primary?.bucket === "fallback") {
    push(
      "The fallback seed",
      `<p>No personal letter could be settled, so the working method uses श्रीं.</p>`
    );
  }

  push(
    "How to hold it",
    `<p>Repeat the seed for a few days. If the mind is disturbed, stop, and take the next suitable seed or श्रीं. A guru is the one who gives it. Letters in a fourth row or column, and any ari result, are left unused. Those lists are on Beejas.</p>`
  );
  return items;
}

function paintFind() {
  const rec = recNow();
  const hero = $("hero");
  const side = $("find-side");
  const stepsBox = $("calc-steps");
  if (!hero || !side) return;
  if (!rec) {
    hero.innerHTML = "";
    if (stepsBox) stepsBox.innerHTML = "";
    side.innerHTML = "";
    return;
  }
  const steps = walkthrough(rec);
  hero.innerHTML = `<div class="card hero">
    <div class="hero-top">
      <div>
        <p class="eyebrow">${esc(rec.primary.headline)}</p>
        <div class="beeja">${esc(rec.primary.text)}</div>
        <p class="iast">${esc(rec.primary.iast)}</p>
      </div>
    </div>
    <div class="actions">
      <button class="btn" data-act="copy" data-copy="${esc(rec.primary.text)}">Copy seed</button>
      <button class="btn secondary" data-act="copy" data-copy="ॐ ${esc(rec.primary.text)}">Copy ॐ ${esc(rec.primary.text)}</button>
      <button class="btn-quiet" data-act="nav" data-view="chakra">See it on the chakra</button>
      <button class="btn-quiet" data-act="nav" data-view="beejas">Best and not used</button>
    </div>
    ${worship(rec)}
  </div>`;
  if (stepsBox) {
    stepsBox.innerHTML = `<h2>How this beeja was counted</h2><ol class="steps">${steps.map((s, i) =>
      `<li><span>${i + 1}</span><div><strong>${esc(s.title)}</strong>${s.html}</div></li>`
    ).join("")}</ol>
    <div class="actions">
      <button class="btn-quiet" type="button" data-act="step" data-step="name">Change the name</button>
      <button class="btn-quiet" type="button" data-act="step" data-step="birth">Change the birth</button>
    </div>`;
  }
  const thirdLetters = rec.third ? rec.third.letters.map((L) => assess(rec.base, L)).filter((a) => a.bucket !== "avoid") : [];
  const chips = thirdLetters.map((a) => `<span class="chip"><span class="dev">${esc(a.form.text)}</span> · ${esc(a.letter)} · house ${a.cell.n}</span>`).join("");
  const suit = (rec.groups?.suitable || []).slice(0, 6).map((a) => `<span class="chip"><span class="dev">${esc(a.form.text)}</span> · house ${a.cell.n}</span>`).join("");
  side.innerHTML = `<h3>Letters the third square still allows</h3><div class="suggest">${chips || "<p class='small'>None of that square survived both counts.</p>"}</div>
    <h3 style="margin-top:16px">Other suitable seeds</h3><div class="suggest">${suit || "<p class='small muted'>None.</p>"}</div>
    <p class="small muted" style="margin-top:12px">${chartChip()}</p>`;
}

function chartChip() {
  if (!state.chart) {
    return `Birth was skipped, so this seed comes from the letter alone. <button class="btn-quiet" type="button" data-act="step" data-step="birth">Add birth details</button>`;
  }
  const c = state.chart;
  const moon = c.bodies.find((b) => b.id === "chandra");
  const nak = NAKSHATRAS[moon.nakshatraIndex];
  const pada = padaOf(moon.nakshatraIndex, moon.pada);
  const alt = state.source === "nakshatra"
    ? (state.base ? `<button class="btn-quiet" type="button" data-act="use-name">Use the name letter ${esc(state.base)} instead</button>` : "")
    : `<button class="btn-quiet" type="button" data-act="use-janma">Use the Moon’s syllable ${esc(pada.pada.base)} instead</button>`;
  return `Chart included. Lagna ${esc(c.lagna.sign)}. Moon ${esc(nak.name)} pada ${moon.pada}. Ayanamsha JN Bhasin ${dms(c.ayanamsha.degrees)}. <button class="btn-quiet" type="button" data-act="nav" data-view="chart">Open the chart</button> ${alt}`;
}

function cellTone(base, cell) {
  if (!base || !cellOfSafe(base)) return "";
  const sample = cell.letters.find((L) => L !== "ऌ") || cell.letters[0];
  const a = assess(base, sample);
  if (state.mode === "tantra") {
    if (a.mm.key.includes("Ari") || a.mm.key === "Sadhya-Sadhya") return "avoid";
    if (["Siddha-Siddha", "Siddha-Susiddha", "Susiddha-Siddha", "Susiddha-Susiddha"].includes(a.mm.key)) return "best";
    return "suitable";
  }
  if (a.rc.row === "Ari" || a.rc.col === "Ari") return "avoid";
  if (a.rc.row === "Susiddha" && a.rc.col === "Susiddha") return "best";
  return "suitable";
}

function buildChakra() {
  $("chakra").innerHTML = CELLS.map((cell) => {
    const fill = FILL.indexOf(cell.n) + 1;
    const letters = cell.letters.map((L) =>
      `<button type="button" class="letter-btn" data-act="test" data-letter="${L}" aria-pressed="false">${L}</button>`
    ).join("");
    return `<div class="cell" data-cell="${cell.n}">
      <div class="cell-top"><span>House ${cell.n}</span><span>fill ${fill}</span></div>
      <div class="letters">${letters}</div>
      <div class="tag" data-tag="${cell.n}"></div>
    </div>`;
  }).join("");
}

function paintChakra() {
  const base = activeBase();
  const rec = base ? recommend(base, state.chart) : null;
  document.querySelectorAll(".cell").forEach((el) => {
    const n = Number(el.dataset.cell);
    const cell = CELLS[n - 1];
    el.classList.remove("best", "suitable", "avoid", "mine", "third");
    const tone = base ? cellTone(base, cell) : "";
    if (tone) el.classList.add(tone);
    if (rec?.home?.n === n) el.classList.add("mine");
    if (rec?.third?.n === n) el.classList.add("third");
    const tag = el.querySelector(".tag");
    if (!base || !cellOfSafe(base)) {
      tag.textContent = cell.letters.map((L) => LETTERS[L]?.iast || "").join(" · ");
      return;
    }
    const sample = cell.letters.find((L) => L !== "ऌ") || cell.letters[0];
    const a = assess(base, sample);
    tag.textContent = state.mode === "tantra"
      ? `${showYoga(a.mm.quartet)}–${showYoga(a.mm.place)}`
      : `Row ${showYoga(a.rc.row)} · column ${showYoga(a.rc.col)}`;
  });
  document.querySelectorAll("[data-act=test]").forEach((btn) => {
    btn.setAttribute("aria-pressed", btn.dataset.letter === state.test ? "true" : "false");
  });
  paintDetail();
}

function cellOfSafe(letter) {
  return CELLS.find((c) => c.letters.includes(letter));
}

function paintDetail() {
  const box = $("chakra-detail");
  const base = activeBase();
  if (!state.test) {
    box.innerHTML = `<div class="card"><p class="small muted">Tap a letter in the grid to see both counts against ${base ? esc(base) : "your letter"}.</p></div>`;
    return;
  }
  if (!base || !cellOfSafe(base)) {
    box.innerHTML = `<div class="card"><p>Choose your own letter on Find first. You tapped ${esc(state.test)}.</p></div>`;
    return;
  }
  if (!LETTERS[state.test]) {
    box.innerHTML = `<div class="card"><p>${esc(state.test)} has no house.</p></div>`;
    return;
  }
  const a = assess(base, state.test);
  const g = a.graha;
  box.innerHTML = `<div class="card">
    <p class="eyebrow">Testing ${esc(state.test)} against ${esc(base)}</p>
    <div class="beeja" style="font-size:64px">${esc(a.form.text)}</div>
    <p>${esc(a.form.iast)} · house ${a.cell.n} · ${esc(a.bucket === "avoid" ? "Not used" : a.bucket === "best" ? "Best" : "Suitable")}</p>
    <p><strong>Row and column.</strong> Row ${a.rc.rowStep} ${showYoga(a.rc.row)}, column ${a.rc.colStep} ${showYoga(a.rc.col)}.</p>
    <p><strong>Chatushka.</strong> ${showYoga(a.mm.quartet)}–${showYoga(a.mm.place)}. ${esc(a.mm.fruit)}</p>
    <p>${esc(a.meta.meaning)} Varga devata ${esc(a.varga.devata)}, varga graha ${esc(a.varga.graha)}.${g ? ` Navagraha seed <span class="dev">${g.beeja}</span>, ${esc(g.deity)}.` : ""}</p>
    <div class="actions"><button class="btn secondary" data-act="adopt" data-letter="${esc(state.test)}">Use ${esc(state.test)} as my letter</button></div>
  </div>`;
}

function beeCard(a) {
  const g = a.graha;
  return `<article class="bee-card">
    <div><div class="seed">${esc(a.form.text)}</div><div class="small muted">${esc(a.form.iast)}</div></div>
    <div>
      <p><strong class="dev">${esc(a.letter)}</strong> · house ${a.cell.n} · ${esc(a.varga.devata)} · ${esc(a.varga.graha)}</p>
      <p class="small">Row ${showYoga(a.rc.row)}, column ${showYoga(a.rc.col)}. Chatushka ${showYoga(a.mm.quartet)}–${showYoga(a.mm.place)}.</p>
      <p class="small">${esc(a.meta.shakti ? a.meta.shakti + ". " : "")}${esc(a.meta.meaning)}</p>
      ${g ? `<p class="small">Worship line: <span class="dev">${esc(g.mantra)}</span></p>` : ""}
    </div>
  </article>`;
}

function paintBeejas() {
  const rec = recNow();
  const box = $("beeja-lists");
  if (!rec || rec.outside) {
    box.innerHTML = `<div class="card"><p>${rec?.outside ? esc(rec.outside.note) + " The fallback is श्रीं." : "Choose a letter on Find. The lists are the 49 houses measured from that letter."}</p></div>`;
    return;
  }
  const best = rec.groups.best.map(beeCard).join("") || `<p class="small">No letter is in the best square without an ari or a fruitless count.</p>`;
  const suit = rec.groups.suitable.map(beeCard).join("") || `<p class="small">None.</p>`;
  const avoid = rec.groups.avoid.map(beeCard).join("");
  box.innerHTML = `
    <section class="band best"><h2>Best possible</h2><p class="small">Third row and third column, or susiddha–susiddha, and not refused by the other count.</p><div class="beeja-list">${best}</div></section>
    <section class="band suit"><h2>Suitable</h2><p class="small">Allowed by both counts, and not the best square.</p><div class="beeja-list">${suit}</div></section>
    <section class="band avoid"><h2>Not used</h2><p class="small">Fourth row or column, any ari pair, the fruitless sādhya–sādhya chatushka, and ऌ.</p><div class="beeja-list">${avoid}</div></section>`;
}

function planetsIn(signIndex) {
  return state.chart.bodies.filter((b) => b.signIndex === signIndex);
}

function paintChart() {
  const out = $("chart-out");
  const c = state.chart;
  if (!c) {
    out.innerHTML = `<div class="card"><p>No birth chart yet. Enter the birth on Find, step 2, or skip that step and the beeja is taken from the name letter alone.</p><div class="actions"><button class="btn" type="button" data-act="go-birth">Enter birth details</button></div></div>`;
    return;
  }
  const moon = c.bodies.find((b) => b.id === "chandra");
  const nak = NAKSHATRAS[moon.nakshatraIndex];
  const pada = nak.padas[moon.pada - 1];
  const lagnaSign = c.lagna.signIndex;
  const siOrder = [
    [11, 1, 1], [0, 1, 2], [1, 1, 3], [2, 1, 4],
    [10, 2, 1], [3, 2, 4],
    [9, 3, 1], [4, 3, 4],
    [8, 4, 1], [7, 4, 2], [6, 4, 3], [5, 4, 4],
  ];
  const cells = siOrder.map(([sign, row, col]) => {
    const house = (sign - lagnaSign + 12) % 12 + 1;
    const ps = planetsIn(sign).map((b) => {
      const g = GRAHAS[b.id];
      return `<b class="${b.retrograde ? "retro" : ""}" title="${esc(b.name)}">${g.short}${b.retrograde ? "ᴿ" : ""}</b>`;
    }).join("");
    return `<div class="si-cell ${sign === lagnaSign ? "lagna" : ""}" style="grid-row:${row};grid-column:${col}">
      <div class="si-head"><span class="dev">${SIGNS[sign].dev}</span><span>${house}</span></div>
      <div class="si-planets">${ps}</div>
    </div>`;
  }).join("");
  const north = northSvg(c);
  const rows = [lagnaRow(c), ...c.bodies.map(bodyRow)].join("");
  const lord = c.lagnaLord;
  const yog = c.yogakaraka;
  out.innerHTML = `
    <div class="charts">
      <div class="card">
        <h2>South Indian</h2>
        <p class="small muted">Signs stay fixed. The lagna sign is marked. The number in each box is the house, counted sign by sign from that lagna. The next sign is house 2.</p>
        <div class="si">
          ${cells}
          <div class="si-center">
            <div>
              <strong>${esc(c.place.label || "Chart")}</strong>
              <p class="small">Lagna ${esc(c.lagna.sign)} ${dms(c.lagna.degreeInSign)}</p>
              <p class="small">Moon ${esc(nak.dev)} ${moon.pada} · <span class="dev">${esc(pada.syl)}</span></p>
              <p class="small">JN Bhasin ${dms(c.ayanamsha.degrees)}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="card">
        <h2>North Indian</h2>
        <p class="small muted">Houses stay fixed. House 1 is the top diamond, then anticlockwise, so house 2 is the upper left. The sign name is written in the house it occupies for this birth.</p>
        ${north}
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <h2>Grahas</h2>
      <p class="small muted">${esc(c.engine)}. Lahiri at this moment is ${dms(c.ayanamsha.lahiriDegrees)}, ${dms(Math.abs(c.ayanamsha.lahiriDegrees - c.ayanamsha.degrees))} ${c.ayanamsha.lahiriDegrees > c.ayanamsha.degrees ? "greater" : "smaller"} than JN Bhasin. Local time ${esc(c.time.local)} · ${esc(c.time.timezone)}.</p>
      ${c.time.timeUncertain ? `<p class="warn">Time was unknown, so this lagna must not choose the beeja. The Moon’s pada is only a noon estimate.</p>` : ""}
      ${c.caution ? `<p class="warn">${esc(c.caution)}</p>` : ""}
      <div class="table-wrap"><table>
        <thead><tr><th>Graha</th><th>Sign</th><th>Degree</th><th>Nakshatra</th><th>Pada</th><th>House</th><th>Dignity</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
      <h3 style="margin-top:16px">Lagna lord · ${esc(lord.name)} · ${lord.fit ? "passed the screen" : "did not pass"}</h3>
      <ul class="checks">${lord.reasons.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
      <h3 style="margin-top:12px">${yog ? `Yogakaraka · ${esc(yog.name)} · ${yog.fit ? "passed the screen" : "did not pass"}` : "No single yogakaraka"}</h3>
      <p class="small">${esc(c.yogakarakaNote)}</p>
      ${yog ? `<ul class="checks">${yog.reasons.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>` : ""}
      ${shadbalaCard(c)}
      <h3 style="margin-top:12px">Vimshottari at birth</h3>
      <p class="small">${esc(c.dasha.name)} mahadasha, about ${c.dasha.years} years ${c.dasha.months} months ${c.dasha.days} days left, ending near ${esc(c.dasha.ends)}. This is the opening balance only.</p>
      <div class="actions">
        <button class="btn secondary" data-act="use-janma">Use the janma letter ${esc(pada.base)} for the beeja</button>
      </div>
    </div>`;
}

function shadbalaCard(c) {
  const s = c.shadbala;
  if (!s) return "";
  const n = (v) => Number(v).toFixed(1);
  const rows = s.order.map((id) => {
    const p = s.planets[id];
    return `<tr>
      <td>${esc(p.name)}</td>
      <td>${n(p.sthana.total)}</td>
      <td>${n(p.dig)}</td>
      <td>${n(p.kala.total)}</td>
      <td>${n(p.cheshta)}</td>
      <td>${n(p.naisargika)}</td>
      <td>${n(p.drik)}</td>
      <td>${n(p.virupas)}</td>
      <td>${n(p.required)}</td>
      <td>${p.meets ? "Meets it" : "Short"}</td>
    </tr>`;
  }).join("");
  const parts = s.order.map((id) => {
    const p = s.planets[id];
    const vargas = p.sthana.vargas.map((v) => `${v.varga} ${v.sign} ${v.points} (${v.because})`).join("; ");
    const k = p.kala;
    const yuddha = k.yuddhaNote ? ` ${k.yuddhaNote}.` : "";
    return `<details>
      <summary>${esc(p.name)} · ${n(p.virupas)} virupas · ${p.meets ? "meets" : "short of"} ${n(p.required)}</summary>
      <p class="parts">Sthana ${n(p.sthana.total)}: uchcha ${n(p.sthana.uchcha)}, saptavargaja ${n(p.sthana.saptavargaja)}, odd/even ${n(p.sthana.ojhayugma)}, kendra ${n(p.sthana.kendradi)}, drekkana ${n(p.sthana.drekkana)}. ${esc(vargas)}.</p>
      <p class="parts">Dig ${n(p.dig)}. Kala ${n(k.total)}: natonnata ${n(k.natonnata)}, paksha ${n(k.paksha)}, tribhaga ${n(k.tribhaga)}, year ${n(k.abda)}, month ${n(k.masa)}, weekday ${n(k.vara)}, hour ${n(k.hora)}, ayana ${n(k.ayana)}, war ${n(k.yuddha)}.${esc(yuddha)} Cheshta ${n(p.cheshta)}. Naisargika ${n(p.naisargika)}. Drik ${n(p.drik)}.</p>
    </details>`;
  }).join("");
  const L = s.lords;
  return `<div class="shadbala">
    <h3>Shadbala</h3>
    <p class="small muted">Six strengths in virupas. 60 virupas make 1 rupa. A graha meets the chapter’s requirement when the total reaches its pinda. The beeja still also asks for a sound house, no combustion, and no debilitation.</p>
    <p class="small">Sunrise ${esc(L.sunrise || "—")}, sunset ${esc(L.sunset || "—")}. Weekday lord ${esc(L.vara)}. Hour lord ${esc(L.hora)}. Month lord ${esc(L.masa)}, from the Sun’s entry into its present sign. Year lord ${esc(L.abda)}, from the Sun’s entry into Mesha. This third of the ${L.day ? "day" : "night"} belongs to ${esc(L.tribhaga)}. Guru receives that strength at every hour.</p>
    ${s.caution ? `<p class="warn">${esc(s.caution)}</p>` : ""}
    <div class="table-wrap"><table class="bala">
      <thead><tr><th>Graha</th><th>Sthana</th><th>Dig</th><th>Kala</th><th>Cheshta</th><th>Naisargika</th><th>Drik</th><th>Total</th><th>Required</th><th>Result</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    ${parts}
  </div>`;
}

function lagnaRow(c) {
  const nak = NAKSHATRAS[c.lagna.nakshatraIndex];
  return `<tr><td>Lagna</td><td class="dev">${SIGNS[c.lagna.signIndex].dev} ${esc(c.lagna.sign)}</td><td>${dms(c.lagna.degreeInSign)}</td><td>${esc(nak.name)}</td><td>${c.lagna.pada}</td><td>1</td><td>—</td><td></td></tr>`;
}

function bodyRow(b) {
  const nak = NAKSHATRAS[b.nakshatraIndex];
  const g = GRAHAS[b.id];
  return `<tr><td>${esc(g.dev)} ${esc(b.name)}</td><td>${esc(b.sign)}</td><td>${dms(b.degreeInSign)}</td><td>${esc(nak.name)}</td><td>${b.pada}</td><td>${b.house}</td><td>${esc(b.dignity)}</td><td>${b.retrograde ? "R" : ""}${b.combust ? " combust" : ""}</td></tr>`;
}

function northSvg(c) {
  const spots = {
    1: [200, 78], 2: [100, 40], 3: [46, 108], 4: [86, 200],
    5: [46, 292], 6: [100, 360], 7: [200, 330], 8: [300, 360],
    9: [354, 292], 10: [314, 200], 11: [354, 108], 12: [300, 40],
  };
  const texts = Object.entries(spots).map(([house, [x, y]]) => {
    const h = Number(house);
    const sign = (c.lagna.signIndex + h - 1) % 12;
    const names = c.bodies.filter((b) => b.house === h).map((b) => GRAHAS[b.id].short + (b.retrograde ? "R" : "")).join(" ");
    return `<text x="${x}" y="${y}" text-anchor="middle" font-size="11">${h} ${SIGNS[sign].dev}</text>
      <text x="${x}" y="${y + 16}" text-anchor="middle" font-size="12">${esc(names)}</text>`;
  }).join("");
  return `<svg class="north" viewBox="0 0 400 400" role="img" aria-label="North Indian chart">
    <rect x="8" y="8" width="384" height="384" fill="#fbf8f3" stroke="#d8d2c8"/>
    <line x1="8" y1="8" x2="392" y2="392" stroke="#d8d2c8"/>
    <line x1="392" y1="8" x2="8" y2="392" stroke="#d8d2c8"/>
    <polygon points="200,8 392,200 200,392 8,200" fill="none" stroke="#c4b8a8"/>
    ${texts}
  </svg>`;
}

async function searchPlaces(q) {
  const box = $("places");
  if (q.trim().length < 2) { box.innerHTML = ""; return; }
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en&format=json`);
    const data = await res.json();
    const rows = data.results || [];
    box.innerHTML = rows.map((r, i) => {
      const label = [r.name, r.admin1, r.country].filter(Boolean).join(", ");
      return `<button type="button" data-act="place" data-i="${i}">${esc(label)} · ${r.latitude.toFixed(2)}, ${r.longitude.toFixed(2)}</button>`;
    }).join("") || `<p class="small muted">No place under that spelling. Enter latitude and longitude.</p>`;
    box._rows = rows;
  } catch {
    box.innerHTML = `<p class="small muted">Place search did not answer. Enter latitude, longitude, and timezone.</p>`;
  }
}

async function calculate() {
  const err = $("chart-error");
  err.hidden = true;
  const date = $("date").value;
  const lat = Number($("lat").value);
  const lon = Number($("lon").value);
  if (!date || Number.isNaN(lat) || Number.isNaN(lon)) {
    err.hidden = false;
    err.textContent = "Enter a date, a latitude, and a longitude.";
    return;
  }
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = ($("time").value || "12:00").split(":").map(Number);
  const btn = $("calc");
  btn.disabled = true;
  btn.textContent = "Calculating…";
  try {
    const res = await fetch("/api/chart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        year, month, day, hour, minute, second: 0,
        latitude: lat, longitude: lon,
        timezone: $("tz").value.trim() || null,
        place: $("place").value.trim(),
        timeUnknown: $("unknown").checked,
        node: state.node,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      const detail = typeof data.detail === "string" ? data.detail : "The chart could not be computed.";
      throw new Error(detail);
    }
    state.chart = data;
    state.birthSkipped = false;
    state.source = "name";
    if (!$("tz").value.trim()) $("tz").value = data.time.timezone;
    markFound();
    paintChart();
    setView("find");
    setStep("result");
  } catch (e) {
    err.hidden = false;
    err.textContent = e.message || "The chart could not be computed.";
  } finally {
    btn.disabled = false;
    btn.textContent = "Find";
  }
}

function onClick(e) {
  const btn = e.target.closest("[data-act]");
  if (!btn) return;
  const act = btn.dataset.act;
  if (act === "nav") setView(btn.dataset.view);
  if (act === "step") {
    const next = btn.dataset.step;
    if ((next === "birth" || next === "result") && !state.base && !(state.source === "nakshatra" && state.chart)) return;
    setView("find");
    setStep(next);
  }
  if (act === "skip-birth") {
    state.chart = null;
    state.birthSkipped = true;
    state.source = "name";
    markFound();
    paintChart();
    setView("find");
    setStep("result");
  }
  if (act === "go-birth") {
    setView("find");
    setStep(state.base ? "birth" : "name");
  }
  if (act === "source") {
    state.source = btn.dataset.source;
    setPressed("source", "source", state.source);
    onEntryEdit();
    paintChakra();
    paintBeejas();
  }
  if (act === "pick" || act === "adopt") {
    state.base = btn.dataset.letter;
    state.source = "name";
    paintName();
    paintChakra();
    paintBeejas();
    if (state.step === "result" && !answerIsCurrent()) showUnfound();
  }
  if (act === "test") {
    state.test = btn.dataset.letter;
    paintChakra();
  }
  if (act === "mode") {
    state.mode = btn.dataset.mode;
    setPressed("mode", "mode", state.mode);
    paintChakra();
  }
  if (act === "node") {
    state.node = btn.dataset.node;
    setPressed("node", "node", state.node);
    onEntryEdit();
  }
  if (act === "copy") {
    const text = btn.dataset.copy;
    navigator.clipboard?.writeText(text).then(() => {
      const old = btn.textContent;
      btn.textContent = "Copied";
      setTimeout(() => { btn.textContent = old; }, 900);
    }).catch(() => {});
  }
  if (act === "use-janma") {
    if (!state.chart) return;
    state.source = "nakshatra";
    markFound();
    setView("find");
    setStep("result");
    paintChakra();
    paintBeejas();
  }
  if (act === "use-name") {
    state.source = "name";
    markFound();
    setView("find");
    setStep("result");
    paintChakra();
    paintBeejas();
  }
  if (act === "place") {
    const row = $("places")._rows?.[Number(btn.dataset.i)];
    if (!row) return;
    $("place").value = [row.name, row.admin1, row.country].filter(Boolean).join(", ");
    $("lat").value = row.latitude;
    $("lon").value = row.longitude;
    $("tz").value = row.timezone || "";
    $("places").innerHTML = "";
    onEntryEdit();
  }
}

let placeTimer;
function bind() {
  document.body.addEventListener("click", onClick);
  $("name").addEventListener("input", paintName);
  const edit = () => onEntryEdit();
  ["date", "time", "lat", "lon", "tz"].forEach((id) => $(id).addEventListener("input", edit));
  $("place").addEventListener("input", () => {
    onEntryEdit();
    clearTimeout(placeTimer);
    placeTimer = setTimeout(() => searchPlaces($("place").value), 280);
  });
  $("calc").addEventListener("click", calculate);
  $("unknown").addEventListener("change", () => {
    $("time").disabled = $("unknown").checked;
    onEntryEdit();
  });
  buildChakra();
  paintName();
  paintChakra();
  setStep("name");
}

bind();
