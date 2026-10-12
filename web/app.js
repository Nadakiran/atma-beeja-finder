import {
  CELLS, FILL, GRAHAS, LETTERS, NAKSHATRAS, OUTSIDE, SIGNS,
} from "./data.js";
import { assess, detectBase, padaOf, recommend, showYoga } from "./logic.js";

const state = {
  view: "find",
  source: "name",
  base: null,
  test: null,
  mode: "essay",
  node: "mean",
  chart: null,
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
  if (view === "find") paintFind();
}

function setPressed(group, attr, value) {
  document.querySelectorAll(`[data-act=${group}]`).forEach((btn) => {
    btn.setAttribute("aria-selected", btn.dataset[attr] === value ? "true" : "false");
  });
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
    bits.push(`The same letter opens ${a.graha.name}’s seed <span class="dev">${a.graha.beeja}</span>. The navagraha line is <span class="dev">${esc(a.graha.mantra)}</span>.`);
  }
  if (state.source === "nakshatra" && state.chart) {
    const moon = state.chart.bodies.find((b) => b.id === "chandra");
    const p = padaOf(moon.nakshatraIndex, moon.pada);
    if (p) bits.push(`Janma nakshatra ${p.nak.name} pada ${moon.pada}, syllable ${p.pada.syl}. Deity: ${p.nak.deity}.`);
  }
  return `<div class="worship"><strong>Worship.</strong> ${bits.join(" ")} <p class="mantra">${esc(rec.primary.text)} · your mantra · ${esc(rec.primary.text)}</p><p class="small muted">Sampuṭa leaves the mantra itself to the practice you already have.</p></div>`;
}

function paintFind() {
  paintPicker();
  const rec = recNow();
  const hero = $("hero");
  const side = $("find-side");
  if (!rec) {
    hero.innerHTML = `<div class="card hero"><p class="eyebrow">Waiting for a letter</p><p class="lede" style="margin:0">Choose the first Sanskrit letter of the name you are called by. A birth chart can replace that letter with the Moon’s pada, or it can offer the lagna lord’s seed if the chakra allows it.</p></div>`;
    side.innerHTML = `<h3>What happens next</h3><p class="small">The third square, two rows down and two columns across, is preferred. A fourth row or column is refused. Mantra Mahodadhi’s chatushka count is applied as well, so an ari result is refused even when the rows look kind.</p><p class="small muted">Open Learn for the verses, the Devadatta count, and the Kumar count.</p>`;
    return;
  }
  const steps = [];
  if (state.source === "nakshatra" && state.chart) {
    const moon = state.chart.bodies.find((b) => b.id === "chandra");
    const p = padaOf(moon.nakshatraIndex, moon.pada);
    steps.push(`The reference letter is ${rec.base}, from ${p.nak.name} pada ${moon.pada} (${p.pada.syl}), the Moon’s janma syllable.${state.chart.time.timeUncertain ? " The time was unknown, so this pada is only the noon estimate." : ""}`);
  } else {
    steps.push(`The reference letter is ${rec.base}${state.name ? `, from the name “${state.name}”` : ""}. Only the base consonant or vowel is counted.`);
  }
  if (rec.home) {
    steps.push(`${rec.base} stands in house ${rec.home.n}: ${rec.home.letters.join(" ")}.`);
    steps.push(`The third square is house ${rec.third.n}: ${rec.third.letters.join(" ")}.`);
  }
  rec.notes.forEach((n) => steps.push(n));
  rec.rejected.forEach((r) => steps.push(r.reason));
  steps.push("Repeat it for a few days. If the mind is disturbed, stop, and take the next suitable seed or श्रीं. A guru is the one who gives it.");

  const thirdBest = (rec.groups?.best || []).filter((a) => a.cell?.n === rec.third?.n).slice(0, 4);
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
      <button class="btn-quiet" data-act="nav" data-view="chakra">Open the chakra</button>
    </div>
    <ol class="steps">${steps.map((s, i) => `<li><span>${i + 1}</span><div>${esc(s).replace(/&lt;span class=&quot;dev&quot;&gt;|&lt;\/span&gt;/g, "")}</div></li>`).join("")}</ol>
    ${worship(rec)}
  </div>`;
  // The step text was escaped, which is what we want; worship contains trusted markup built from our data.
  const chips = thirdBest.map((a) => `<span class="chip"><span class="dev">${a.form.text}</span> · ${a.letter} · house ${a.cell.n}</span>`).join("");
  const suit = (rec.groups?.suitable || []).slice(0, 6).map((a) => `<span class="chip"><span class="dev">${a.form.text}</span> · house ${a.cell.n}</span>`).join("");
  side.innerHTML = `<h3>In the third square</h3><div class="suggest">${chips || "<p class='small'>The third square is refused by the other count. See Beejas.</p>"}</div>
    <h3 style="margin-top:16px">Also suitable</h3><div class="suggest">${suit || "<p class='small muted'>None.</p>"}</div>
    <p class="small muted" style="margin-top:12px">${chartChip()}</p>`;
}

function chartChip() {
  if (!state.chart) return `No birth chart yet. The beeja above uses the letter alone. <button class="btn-quiet" data-act="nav" data-view="chart">Add a chart</button>`;
  const c = state.chart;
  const moon = c.bodies.find((b) => b.id === "chandra");
  const nak = NAKSHATRAS[moon.nakshatraIndex];
  return `Chart loaded. Lagna ${c.lagna.sign}. Moon ${nak.name} pada ${moon.pada}. Ayanamsha JN Bhasin ${dms(c.ayanamsha.degrees)}.`;
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
    <section class="band suit"><h2>Suitable</h2><p class="small">Allowed by both counts, and not the first square. The Kumar example’s म्रीं lives here when the letter is क.</p><div class="beeja-list">${suit}</div></section>
    <section class="band avoid"><h2>Not used</h2><p class="small">Fourth row or column, any ari pair, the fruitless sādhya–sādhya chatushka, and ऌ.</p><div class="beeja-list">${avoid}</div></section>`;
}

function planetsIn(signIndex) {
  return state.chart.bodies.filter((b) => b.signIndex === signIndex);
}

function paintChart() {
  const out = $("chart-out");
  const c = state.chart;
  if (!c) {
    out.innerHTML = "";
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
        <p class="small muted">Signs stay fixed. The lagna sign is marked. The small number is the house, counted from the lagna.</p>
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
        <p class="small muted">Houses stay fixed. House 1 is the top diamond. Signs move.</p>
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
      <h3 style="margin-top:12px">Vimshottari at birth</h3>
      <p class="small">${esc(c.dasha.name)} mahadasha, about ${c.dasha.years} years ${c.dasha.months} months ${c.dasha.days} days left, ending near ${esc(c.dasha.ends)}. This is the opening balance only.</p>
      <div class="actions">
        <button class="btn secondary" data-act="use-janma">Use the janma letter ${esc(pada.base)} for the beeja</button>
      </div>
    </div>`;
  paintFind();
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
    if (!$("tz").value.trim()) $("tz").value = data.time.timezone;
    paintChart();
  } catch (e) {
    err.hidden = false;
    err.textContent = e.message || "The chart could not be computed.";
  } finally {
    btn.disabled = false;
    btn.textContent = "Calculate chart";
  }
}

function applyGuess() {
  const guess = detectBase($("name").value);
  const box = $("guess");
  state.name = $("name").value;
  if (!guess) { box.innerHTML = ""; return; }
  const known = LETTERS[guess] || OUTSIDE.find((o) => o.dev === guess);
  const label = known?.iast || guess;
  box.innerHTML = `<button type="button" class="btn-quiet" data-act="pick" data-letter="${guess}">Use suggested ${guess} <span class="muted">(${esc(label)})</span></button>`;
}

function onClick(e) {
  const btn = e.target.closest("[data-act]");
  if (!btn) return;
  const act = btn.dataset.act;
  if (act === "nav") setView(btn.dataset.view);
  if (act === "source") {
    state.source = btn.dataset.source;
    setPressed("source", "source", state.source);
    if (state.source === "nakshatra" && !state.chart) setView("chart");
    paintFind();
    paintChakra();
    paintBeejas();
  }
  if (act === "pick" || act === "adopt") {
    state.base = btn.dataset.letter;
    state.source = "name";
    setPressed("source", "source", "name");
    paintFind();
    paintChakra();
    paintBeejas();
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
  }
  if (act === "copy") {
    const text = btn.dataset.copy;
    navigator.clipboard?.writeText(text).then(() => {
      const old = btn.textContent;
      btn.textContent = "Copied";
      setTimeout(() => { btn.textContent = old; }, 900);
    }).catch(() => {});
  }
  if (act === "preset" && btn.dataset.preset === "kumar") {
    $("name").value = "Kumar";
    state.name = "Kumar";
    state.base = "क";
    state.source = "name";
    setPressed("source", "source", "name");
    setView("find");
    paintFind();
  }
  if (act === "preset" && btn.dataset.preset === "devadatta") {
    $("name").value = "Devadatta";
    state.name = "Devadatta";
    state.base = "द";
    state.test = "ऐ";
    state.source = "name";
    state.mode = "tantra";
    setPressed("source", "source", "name");
    setPressed("mode", "mode", "tantra");
    setView("chakra");
    paintChakra();
    paintFind();
  }
  if (act === "place") {
    const row = $("places")._rows?.[Number(btn.dataset.i)];
    if (!row) return;
    $("place").value = [row.name, row.admin1, row.country].filter(Boolean).join(", ");
    $("lat").value = row.latitude;
    $("lon").value = row.longitude;
    $("tz").value = row.timezone || "";
    $("places").innerHTML = "";
  }
  if (act === "use-janma") {
    state.source = "nakshatra";
    setPressed("source", "source", "nakshatra");
    setView("find");
    paintFind();
    paintChakra();
    paintBeejas();
  }
}

function fillSample() {
  $("place").value = "New Delhi, Delhi, India";
  $("lat").value = "28.6139";
  $("lon").value = "77.2090";
  $("tz").value = "Asia/Kolkata";
  $("date").value = "1990-08-15";
  $("time").value = "10:30";
  $("unknown").checked = false;
  $("time").disabled = false;
}

let placeTimer;
function bind() {
  document.body.addEventListener("click", onClick);
  $("name").addEventListener("input", applyGuess);
  $("place").addEventListener("input", () => {
    clearTimeout(placeTimer);
    placeTimer = setTimeout(() => searchPlaces($("place").value), 280);
  });
  $("calc").addEventListener("click", calculate);
  $("sample").addEventListener("click", fillSample);
  $("unknown").addEventListener("change", () => { $("time").disabled = $("unknown").checked; });
  buildChakra();
  paintPicker();
  paintFind();
  paintChakra();
}

bind();
