/** Reference data for the Akathaha calculation and the chart labels.
 *
 * House letters are the standard akathaha whose first house is अ क थ ह.
 * That figure puts द in house 3 and ऐ in house 14, which is the worked
 * example in the Mantra Mahodadhi commentary on taranga 24.
 *
 * Varga devatas follow the Sharada Tilaka scheme: vowels with Sadashiva
 * and Surya; ka and ca with Brahma; retroflex and dental ta with Vishnu;
 * pa and ya with Shiva; the sha group with Rudra.
 * Letter-shakti names are the alphabet glosses of that same tradition.
 * Where a gloss was garbled or missing, the letter carries only its varga.
 */

export const FILL = [1, 3, 11, 9, 2, 4, 12, 10, 6, 8, 16, 14, 5, 7, 15, 13];

export const CELLS = [
  { n: 1, letters: ["अ", "क", "थ", "ह"] },
  { n: 2, letters: ["उ", "ङ", "प"] },
  { n: 3, letters: ["आ", "ख", "द"] },
  { n: 4, letters: ["ऊ", "च", "फ"] },
  { n: 5, letters: ["ओ", "ड", "व"] },
  { n: 6, letters: ["ऌ", "झ", "म"] },
  { n: 7, letters: ["औ", "ढ", "श"] },
  { n: 8, letters: ["ॡ", "ञ", "य"] },
  { n: 9, letters: ["ई", "घ", "न"] },
  { n: 10, letters: ["ॠ", "ज", "भ"] },
  { n: 11, letters: ["इ", "ग", "ध"] },
  { n: 12, letters: ["ऋ", "छ", "ब"] },
  { n: 13, letters: ["अः", "त", "स"] },
  { n: 14, letters: ["ऐ", "ठ", "ल"] },
  { n: 15, letters: ["अं", "ण", "ष"] },
  { n: 16, letters: ["ए", "ट", "र"] },
];

export const VARGAS = {
  vowel: { label: "Vowels", graha: "Surya", grahaId: "surya", devata: "Sadashiva" },
  ka: { label: "Ka-varga", graha: "Mangala", grahaId: "mangala", devata: "Brahma" },
  ca: { label: "Ca-varga", graha: "Shukra", grahaId: "shukra", devata: "Brahma" },
  tta: { label: "Ta-varga, retroflex", graha: "Budha", grahaId: "budha", devata: "Vishnu" },
  ta: { label: "Ta-varga, dental", graha: "Guru", grahaId: "guru", devata: "Vishnu" },
  pa: { label: "Pa-varga", graha: "Shani", grahaId: "shani", devata: "Shiva" },
  ya: { label: "Ya-varga", graha: "Chandra", grahaId: "chandra", devata: "Shiva" },
  sha: { label: "Sha-varga", graha: "Chandra", grahaId: "chandra", devata: "Rudra" },
};

/** Favoured bases named in the atma-bija working method: the vowels, and क ब भ म र व श स ह. ऌ is a vowel the same essays tell you not to use. */
export const PREFER = new Set(["अ", "आ", "इ", "ई", "उ", "ऊ", "ऋ", "ॠ", "ॡ", "ए", "ऐ", "ओ", "औ", "अं", "अः", "क", "ब", "भ", "म", "र", "व", "श", "स", "ह"]);

export const GRAHAS = {
  surya: { name: "Surya", dev: "सूर्य", short: "Su", beeja: "ह्रां", iast: "hrāṁ", consonant: "ह", mantra: "ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः", deity: "Surya" },
  chandra: { name: "Chandra", dev: "चन्द्र", short: "Mo", beeja: "श्रां", iast: "śrāṁ", consonant: "श", mantra: "ॐ श्रां श्रीं श्रौं सः चन्द्राय नमः", deity: "Chandra" },
  mangala: { name: "Mangala", dev: "मंगल", short: "Ma", beeja: "क्रां", iast: "krāṁ", consonant: "क", mantra: "ॐ क्रां क्रीं क्रौं सः भौमाय नमः", deity: "Mangala" },
  budha: { name: "Budha", dev: "बुध", short: "Me", beeja: "ब्रां", iast: "brāṁ", consonant: "ब", mantra: "ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः", deity: "Budha" },
  guru: { name: "Guru", dev: "गुरु", short: "Ju", beeja: "ग्रां", iast: "grāṁ", consonant: "ग", mantra: "ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः", deity: "Brihaspati" },
  shukra: { name: "Shukra", dev: "शुक्र", short: "Ve", beeja: "द्रां", iast: "drāṁ", consonant: "द", mantra: "ॐ द्रां द्रीं द्रौं सः शुक्राय नमः", deity: "Shukra" },
  shani: { name: "Shani", dev: "शनि", short: "Sa", beeja: "प्रां", iast: "prāṁ", consonant: "प", mantra: "ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः", deity: "Shani" },
  rahu: { name: "Rahu", dev: "राहु", short: "Ra", beeja: "भ्रां", iast: "bhrāṁ", consonant: "भ", mantra: "ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः", deity: "Rahu" },
  ketu: { name: "Ketu", dev: "केतु", short: "Ke", beeja: "स्रां", iast: "srāṁ", consonant: "स", mantra: "ॐ स्रां स्रीं स्रौं सः केतवे नमः", deity: "Ketu" },
};

export const SIGNS = [
  { name: "Mesha", dev: "मेष" },
  { name: "Vrishabha", dev: "वृषभ" },
  { name: "Mithuna", dev: "मिथुन" },
  { name: "Karka", dev: "कर्क" },
  { name: "Simha", dev: "सिंह" },
  { name: "Kanya", dev: "कन्या" },
  { name: "Tula", dev: "तुला" },
  { name: "Vrischika", dev: "वृश्चिक" },
  { name: "Dhanu", dev: "धनु" },
  { name: "Makara", dev: "मकर" },
  { name: "Kumbha", dev: "कुम्भ" },
  { name: "Meena", dev: "मीन" },
];

/** Joining used by the atma-bija essays: the chosen consonant plus रीं, because र is taken as Agni and ईं as kamakala, with a bindu. र itself is already that fire letter, so its seed is रीं and is not stacked again. */
export const JOINED = {
  क: ["क्रीं", "krīṁ"], ख: ["ख्रीं", "khrīṁ"], ग: ["ग्रीं", "grīṁ"], घ: ["घ्रीं", "ghrīṁ"], ङ: ["ङ्रीं", "ṅrīṁ"],
  च: ["च्रीं", "crīṁ"], छ: ["छ्रीं", "chrīṁ"], ज: ["ज्रीं", "jrīṁ"], झ: ["झ्रीं", "jhrīṁ"], ञ: ["ञ्रीं", "ñrīṁ"],
  ट: ["ट्रीं", "ṭrīṁ"], ठ: ["ठ्रीं", "ṭhrīṁ"], ड: ["ड्रीं", "ḍrīṁ"], ढ: ["ढ्रीं", "ḍhrīṁ"], ण: ["ण्रीं", "ṇrīṁ"],
  त: ["त्रीं", "trīṁ"], थ: ["थ्रीं", "thrīṁ"], द: ["द्रीं", "drīṁ"], ध: ["ध्रीं", "dhrīṁ"], न: ["न्रीं", "nrīṁ"],
  प: ["प्रीं", "prīṁ"], फ: ["फ्रीं", "phrīṁ"], ब: ["ब्रीं", "brīṁ"], भ: ["भ्रीं", "bhrīṁ"], म: ["म्रीं", "mrīṁ"],
  य: ["य्रीं", "yrīṁ"], र: ["रीं", "rīṁ"], ल: ["ल्रीं", "lrīṁ"], व: ["व्रीं", "vrīṁ"], श: ["श्रीं", "śrīṁ"],
  ष: ["ष्रीं", "ṣrīṁ"], स: ["स्रीं", "srīṁ"], ह: ["ह्रीं", "hrīṁ"],
};

export const VOWEL_BEEJA = {
  अ: ["अं", "aṁ"], आ: ["आं", "āṁ"], इ: ["इं", "iṁ"], ई: ["ईं", "īṁ"], उ: ["उं", "uṁ"], ऊ: ["ऊं", "ūṁ"],
  ऋ: ["ऋं", "ṛṁ"], ॠ: ["ॠं", "ṝṁ"], ऌ: ["ऌं", "ḷṁ"], ॡ: ["ॡं", "ḹṁ"], ए: ["एं", "eṁ"], ऐ: ["ऐं", "aiṁ"],
  ओ: ["ओं", "oṁ"], औ: ["औं", "auṁ"], अं: ["अं", "aṁ"], अः: ["अः", "aḥ"],
};

export const PHALA = {
  "Siddha-Siddha": "Fructifies in the time the mantra's own rule already sets.",
  "Siddha-Sadhya": "Fructifies with twice the japa.",
  "Siddha-Susiddha": "Fructifies with half the japa.",
  "Siddha-Ari": "Not used. Mantra Mahodadhi says this result harms kinsmen.",
  "Sadhya-Siddha": "Fructifies with twice the japa.",
  "Sadhya-Sadhya": "Not used. Mantra Mahodadhi calls this fruitless.",
  "Sadhya-Susiddha": "Fructifies with twice the japa.",
  "Sadhya-Ari": "Not used. Mantra Mahodadhi says this result harms the gotra.",
  "Susiddha-Siddha": "Fructifies with half the japa.",
  "Susiddha-Sadhya": "Fructifies with twice the japa.",
  "Susiddha-Susiddha": "Fructifies from the initiation itself.",
  "Susiddha-Ari": "Not used. Mantra Mahodadhi says this result harms the family.",
  "Ari-Siddha": "Not used. Mantra Mahodadhi says this result harms sons.",
  "Ari-Sadhya": "Not used. Mantra Mahodadhi says this result harms daughters.",
  "Ari-Susiddha": "Not used. Mantra Mahodadhi says this result harms the spouse.",
  "Ari-Ari": "Not used. Mantra Mahodadhi says this result harms the practitioner.",
};

export const LETTERS = {
  अ: { iast: "a", varga: "vowel", shakti: "Nivritti", meaning: "A return to quiet. Rest from outward activity." },
  आ: { iast: "ā", varga: "vowel", shakti: "Rechika", meaning: "What empties and cleanses." },
  इ: { iast: "i", varga: "vowel", shakti: "Saprathishtha", meaning: "Presence turned inward." },
  ई: { iast: "ī", varga: "vowel", shakti: "Mochika", meaning: "What sets free. The essays call the bindu-form ईं kamakala when it is joined into a beeja." },
  उ: { iast: "u", varga: "vowel", shakti: "Vidya", meaning: "Knowledge." },
  ऊ: { iast: "ū", varga: "vowel", shakti: "Para", meaning: "The far, the transcendent." },
  ऋ: { iast: "ṛ", varga: "vowel", shakti: "Shanti", meaning: "Peace, the settling of the three kinds of suffering." },
  ॠ: { iast: "ṝ", varga: "vowel", shakti: "Indhika", meaning: "What kindles and shines." },
  ऌ: { iast: "ḷ", varga: "vowel", shakti: "Sukshma", meaning: "The subtle. The atma-bija essays still say not to build an atma beeja on ऌ." },
  ॡ: { iast: "ḹ", varga: "vowel", shakti: "", meaning: "The long vocalic L. A vowel, so its varga devata is Sadashiva and its graha is Surya." },
  ए: { iast: "e", varga: "vowel", shakti: "Sukshmamrita", meaning: "A fine nectar." },
  ऐ: { iast: "ai", varga: "vowel", shakti: "Jnanamrita", meaning: "The nectar of knowledge." },
  ओ: { iast: "o", varga: "vowel", shakti: "Apyayini", meaning: "What nourishes and makes whole." },
  औ: { iast: "au", varga: "vowel", shakti: "Vyapini", meaning: "What pervades." },
  अं: { iast: "aṁ", varga: "vowel", shakti: "Ananta", meaning: "The boundless." },
  अः: { iast: "aḥ", varga: "vowel", shakti: "", meaning: "Visarga, the released breath. Counted here with the vowels. One Sharada tabulation places visarga beside the lunar semivowels instead." },
  क: { iast: "ka", varga: "ka", shakti: "Srishti", meaning: "Creation, a beginning." },
  ख: { iast: "kha", varga: "ka", shakti: "Vriddhi", meaning: "Growth." },
  ग: { iast: "ga", varga: "ka", shakti: "Smriti", meaning: "Memory, and the tradition that is remembered. Also the opening letter of Guru's seed ग्रां." },
  घ: { iast: "gha", varga: "ka", shakti: "Medha", meaning: "Retentive intelligence." },
  ङ: { iast: "ṅa", varga: "ka", shakti: "Kanti", meaning: "Splendor." },
  च: { iast: "ca", varga: "ca", shakti: "Lakshmi", meaning: "Fortune, mark, radiance." },
  छ: { iast: "cha", varga: "ca", shakti: "Dhriti", meaning: "Steadiness." },
  ज: { iast: "ja", varga: "ca", shakti: "Sthira", meaning: "Firmness." },
  झ: { iast: "jha", varga: "ca", shakti: "Sthiti", meaning: "Continuance, the middle state between arising and dissolving." },
  ञ: { iast: "ña", varga: "ca", shakti: "Siddhi", meaning: "Accomplishment." },
  ट: { iast: "ṭa", varga: "tta", shakti: "Jara", meaning: "Aging." },
  ठ: { iast: "ṭha", varga: "tta", shakti: "Palini", meaning: "Protection." },
  ड: { iast: "ḍa", varga: "tta", shakti: "Shanti", meaning: "Peace." },
  ढ: { iast: "ḍha", varga: "tta", shakti: "Ishvari", meaning: "Sovereignty." },
  ण: { iast: "ṇa", varga: "tta", shakti: "Rati", meaning: "Delight." },
  त: { iast: "ta", varga: "ta", shakti: "Kama", meaning: "Desire." },
  थ: { iast: "tha", varga: "ta", shakti: "Varada", meaning: "The boon-giver." },
  द: { iast: "da", varga: "ta", shakti: "Ahladini", meaning: "What gladdens. Also the opening letter of Shukra's seed द्रां." },
  ध: { iast: "dha", varga: "ta", shakti: "Priti", meaning: "Gladness, affection." },
  न: { iast: "na", varga: "ta", shakti: "Dirgha", meaning: "What endures." },
  प: { iast: "pa", varga: "pa", shakti: "", meaning: "Pa-varga. Varga devata Shiva, varga graha Shani. Opening letter of Shani's seed प्रां." },
  फ: { iast: "pha", varga: "pa", shakti: "", meaning: "Pa-varga. Varga devata Shiva, varga graha Shani." },
  ब: { iast: "ba", varga: "pa", shakti: "", meaning: "Pa-varga, and one of the consonants the atma-bija essays name as a good base. Opening letter of Budha's seed ब्रां." },
  भ: { iast: "bha", varga: "pa", shakti: "", meaning: "Pa-varga, and one of the consonants the essays name as a good base. Opening letter of Rahu's seed भ्रां." },
  म: { iast: "ma", varga: "pa", shakti: "", meaning: "Pa-varga, and one of the consonants the essays name as a good base. In the published Kumar example the guru keeps म and sets ऌ aside." },
  य: { iast: "ya", varga: "ya", shakti: "", meaning: "Ya-varga. Varga devata Shiva, varga graha Chandra." },
  र: { iast: "ra", varga: "ya", shakti: "", meaning: "Ya-varga. The essays treat र as an Agni letter and build रीं from it together with ईं." },
  व: { iast: "va", varga: "ya", shakti: "", meaning: "Ya-varga, and one of the consonants the essays name as a good base. Varga devata Shiva, varga graha Chandra." },
  श: { iast: "śa", varga: "ya", shakti: "", meaning: "Ya-varga in this tabulation, with Shiva and Chandra. Opening letter of Chandra's seed श्रां. Joined with रीं it becomes श्रीं, which is also the fallback beeja." },
  ष: { iast: "ṣa", varga: "sha", shakti: "Pita", meaning: "Sha-varga. The gloss name is Pita. Varga devata Rudra, varga graha Chandra." },
  स: { iast: "sa", varga: "sha", shakti: "Asita", meaning: "Detachment. Sha-varga, Rudra, Chandra. Opening letter of Ketu's seed स्रां." },
  ह: { iast: "ha", varga: "sha", shakti: "Ananta", meaning: "The boundless. Sha-varga, Rudra, Chandra. Opening letter of Surya's seed ह्रां." },
  ल: { iast: "la", varga: "sha", shakti: "Aruna", meaning: "The red of dawn. Grouped here with the sha letters under Rudra and Chandra." },
};

export const OUTSIDE = [
  { dev: "ळ", iast: "ḻa", note: "The working 49-letter akathaha gives this letter no house." },
  { dev: "क्ष", iast: "kṣa", note: "No house in the 49-letter figure. The Rudrayamala says the alphabet runs through क्ष; this particular chart stops before it." },
  { dev: "ज्ञ", iast: "jña", note: "No house in the 49-letter figure." },
];

const P = (syl, iast, base, sign) => ({ syl, iast, base, sign });

/** Pada syllables from the namakarana / Avakahada set used by drik panchangas.
 *  Shravana is खी खू खे खो here. Some panchangas use जु जे जो घ instead.
 *  Deities follow Varahamihira, Brihat Samhita 98. Lords follow the Vimshottari order.
 */
export const NAKSHATRAS = [
  { name: "Ashvini", dev: "अश्विनी", lord: "Ketu", deity: "the Ashvini Kumaras", padas: [P("चू", "cū", "च", 0), P("चे", "ce", "च", 0), P("चो", "co", "च", 0), P("ला", "lā", "ल", 0)] },
  { name: "Bharani", dev: "भरणी", lord: "Shukra", deity: "Yama", padas: [P("ली", "lī", "ल", 0), P("लू", "lū", "ल", 0), P("ले", "le", "ल", 0), P("लो", "lo", "ल", 0)] },
  { name: "Krittika", dev: "कृत्तिका", lord: "Surya", deity: "Agni", padas: [P("अ", "a", "अ", 0), P("ई", "ī", "ई", 1), P("उ", "u", "उ", 1), P("ए", "e", "ए", 1)] },
  { name: "Rohini", dev: "रोहिणी", lord: "Chandra", deity: "Brahma Prajapati", padas: [P("ओ", "o", "ओ", 1), P("वा", "vā", "व", 1), P("वी", "vī", "व", 1), P("वू", "vū", "व", 1)] },
  { name: "Mrigashira", dev: "मृगशिरा", lord: "Mangala", deity: "Soma", padas: [P("वे", "ve", "व", 1), P("वो", "vo", "व", 1), P("का", "kā", "क", 2), P("की", "kī", "क", 2)] },
  { name: "Ardra", dev: "आर्द्रा", lord: "Rahu", deity: "Rudra", padas: [P("कू", "kū", "क", 2), P("घ", "gha", "घ", 2), P("ङ", "ṅa", "ङ", 2), P("छ", "cha", "छ", 2)] },
  { name: "Punarvasu", dev: "पुनर्वसु", lord: "Guru", deity: "Aditi", padas: [P("के", "ke", "क", 2), P("को", "ko", "क", 2), P("हा", "hā", "ह", 2), P("ही", "hī", "ह", 3)] },
  { name: "Pushya", dev: "पुष्य", lord: "Shani", deity: "Brihaspati", padas: [P("हू", "hū", "ह", 3), P("हे", "he", "ह", 3), P("हो", "ho", "ह", 3), P("डा", "ḍā", "ड", 3)] },
  { name: "Ashlesha", dev: "आश्लेषा", lord: "Budha", deity: "the Nagas", padas: [P("डी", "ḍī", "ड", 3), P("डू", "ḍū", "ड", 3), P("डे", "ḍe", "ड", 3), P("डो", "ḍo", "ड", 3)] },
  { name: "Magha", dev: "मघा", lord: "Ketu", deity: "the Pitris", padas: [P("मा", "mā", "म", 4), P("मी", "mī", "म", 4), P("मू", "mū", "म", 4), P("मे", "me", "म", 4)] },
  { name: "Purva Phalguni", dev: "पूर्व फल्गुनी", lord: "Shukra", deity: "Bhaga", padas: [P("मो", "mo", "म", 4), P("टा", "ṭā", "ट", 4), P("टी", "ṭī", "ट", 4), P("टू", "ṭū", "ट", 4)] },
  { name: "Uttara Phalguni", dev: "उत्तर फल्गुनी", lord: "Surya", deity: "Aryaman", padas: [P("टे", "ṭe", "ट", 4), P("टो", "ṭo", "ट", 5), P("पा", "pā", "प", 5), P("पी", "pī", "प", 5)] },
  { name: "Hasta", dev: "हस्त", lord: "Chandra", deity: "Savitr", padas: [P("पू", "pū", "प", 5), P("ष", "ṣa", "ष", 5), P("ण", "ṇa", "ण", 5), P("ठ", "ṭha", "ठ", 5)] },
  { name: "Chitra", dev: "चित्रा", lord: "Mangala", deity: "Tvashta", padas: [P("पे", "pe", "प", 5), P("पो", "po", "प", 5), P("रा", "rā", "र", 6), P("री", "rī", "र", 6)] },
  { name: "Svati", dev: "स्वाती", lord: "Rahu", deity: "Vayu", padas: [P("रू", "rū", "र", 6), P("रे", "re", "र", 6), P("रो", "ro", "र", 6), P("ता", "tā", "त", 6)] },
  { name: "Vishakha", dev: "विशाखा", lord: "Guru", deity: "Indra and Agni", padas: [P("ती", "tī", "त", 6), P("तू", "tū", "त", 6), P("ते", "te", "त", 6), P("तो", "to", "त", 7)] },
  { name: "Anuradha", dev: "अनुराधा", lord: "Shani", deity: "Mitra", padas: [P("ना", "nā", "न", 7), P("नी", "nī", "न", 7), P("नू", "nū", "न", 7), P("ने", "ne", "न", 7)] },
  { name: "Jyeshtha", dev: "ज्येष्ठा", lord: "Budha", deity: "Indra", padas: [P("नो", "no", "न", 7), P("या", "yā", "य", 7), P("यी", "yī", "य", 7), P("यू", "yū", "य", 7)] },
  { name: "Mula", dev: "मूल", lord: "Ketu", deity: "Nirriti", padas: [P("ये", "ye", "य", 8), P("यो", "yo", "य", 8), P("भा", "bhā", "भ", 8), P("भी", "bhī", "भ", 8)] },
  { name: "Purva Ashadha", dev: "पूर्वाषाढा", lord: "Shukra", deity: "Apah, the waters", padas: [P("भू", "bhū", "भ", 8), P("धा", "dhā", "ध", 8), P("फा", "phā", "फ", 8), P("ढा", "ḍhā", "ढ", 8)] },
  { name: "Uttara Ashadha", dev: "उत्तराषाढा", lord: "Surya", deity: "the Vishvedevas", padas: [P("भे", "bhe", "भ", 8), P("भो", "bho", "भ", 9), P("जा", "jā", "ज", 9), P("जी", "jī", "ज", 9)] },
  { name: "Shravana", dev: "श्रवण", lord: "Chandra", deity: "Vishnu", padas: [P("खी", "khī", "ख", 9), P("खू", "khū", "ख", 9), P("खे", "khe", "ख", 9), P("खो", "kho", "ख", 9)] },
  { name: "Dhanishtha", dev: "धनिष्ठा", lord: "Mangala", deity: "the Vasus", padas: [P("गा", "gā", "ग", 9), P("गी", "gī", "ग", 9), P("गू", "gū", "ग", 10), P("गे", "ge", "ग", 10)] },
  { name: "Shatabhisha", dev: "शतभिषा", lord: "Rahu", deity: "Varuna", padas: [P("गो", "go", "ग", 10), P("सा", "sā", "स", 10), P("सी", "sī", "स", 10), P("सू", "sū", "स", 10)] },
  { name: "Purva Bhadrapada", dev: "पूर्व भाद्रपदा", lord: "Guru", deity: "Aja Ekapada", padas: [P("से", "se", "स", 10), P("सो", "so", "स", 10), P("दा", "dā", "द", 10), P("दी", "dī", "द", 11)] },
  { name: "Uttara Bhadrapada", dev: "उत्तर भाद्रपदा", lord: "Shani", deity: "Ahirbudhnya", padas: [P("दू", "dū", "द", 11), P("थ", "tha", "थ", 11), P("झ", "jha", "झ", 11), P("ञ", "ña", "ञ", 11)] },
  { name: "Revati", dev: "रेवती", lord: "Budha", deity: "Pushan", padas: [P("दे", "de", "द", 11), P("दो", "do", "द", 11), P("चा", "cā", "च", 11), P("ची", "cī", "च", 11)] },
];

export const GRAHA_NAME = Object.fromEntries(Object.entries(GRAHAS).map(([id, g]) => [id, g.name]));
