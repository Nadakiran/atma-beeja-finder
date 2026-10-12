"""Drik-style sidereal chart on Swiss Ephemeris, locked to JN Bhasin.

Swiss Ephemeris is the astronomical library used by observatory-style
(drik) panchanga software. Positions use the built-in Moshier ephemeris,
sidereal mode SE_SIDM_JN_BHASIN (8), whole-sign houses, and the mean node.
Lahiri is computed only so the screen can show the difference; it is not
applied to the chart.
"""

from __future__ import annotations

import threading
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import swisseph as swe
import tzfpy

_LOCK = threading.Lock()

SIGNS = [
    "Mesha",
    "Vrishabha",
    "Mithuna",
    "Karka",
    "Simha",
    "Kanya",
    "Tula",
    "Vrischika",
    "Dhanu",
    "Makara",
    "Kumbha",
    "Meena",
]

# Sign lord by sign index. Nodes never own a sign.
SIGN_LORD = [
    "mangala",
    "shukra",
    "budha",
    "chandra",
    "surya",
    "budha",
    "shukra",
    "mangala",
    "guru",
    "shani",
    "shani",
    "guru",
]

OWN = {
    "surya": {4},
    "chandra": {3},
    "mangala": {0, 7},
    "budha": {2, 5},
    "guru": {8, 11},
    "shukra": {1, 6},
    "shani": {9, 10},
}

EXALT = {
    "surya": 0,
    "chandra": 1,
    "mangala": 9,
    "budha": 5,
    "guru": 3,
    "shukra": 11,
    "shani": 6,
}

# Moolatrikona: sign index, start degree in sign, end degree in sign.
MOOL = {
    "surya": (4, 0, 20),
    "chandra": (1, 4, 30),
    "mangala": (0, 0, 12),
    "budha": (5, 16, 20),
    "guru": (8, 0, 10),
    "shukra": (6, 0, 15),
    "shani": (10, 0, 20),
}

FRIENDS = {
    "surya": {"chandra", "mangala", "guru"},
    "chandra": {"surya", "budha"},
    "mangala": {"surya", "chandra", "guru"},
    "budha": {"surya", "shukra"},
    "guru": {"surya", "chandra", "mangala"},
    "shukra": {"budha", "shani"},
    "shani": {"budha", "shukra"},
}

ENEMIES = {
    "surya": {"shukra", "shani"},
    "chandra": set(),
    "mangala": {"budha"},
    "budha": {"chandra"},
    "guru": {"budha", "shukra"},
    "shukra": {"surya", "chandra"},
    "shani": {"surya", "chandra", "mangala"},
}

# Classical single yogakaraka: owns both a kendra and a trikona.
YOGAKARAKA = {
    1: "shani",
    3: "mangala",
    4: "mangala",
    6: "shani",
    9: "shukra",
    10: "shukra",
}

BODIES = [
    ("surya", swe.SUN, "Surya"),
    ("chandra", swe.MOON, "Chandra"),
    ("mangala", swe.MARS, "Mangala"),
    ("budha", swe.MERCURY, "Budha"),
    ("guru", swe.JUPITER, "Guru"),
    ("shukra", swe.VENUS, "Shukra"),
    ("shani", swe.SATURN, "Shani"),
    ("rahu", None, "Rahu"),
]

VIM_LORDS = [
    "ketu",
    "shukra",
    "surya",
    "chandra",
    "mangala",
    "rahu",
    "guru",
    "shani",
    "budha",
]
VIM_YEARS = {
    "ketu": 7,
    "shukra": 20,
    "surya": 6,
    "chandra": 10,
    "mangala": 7,
    "rahu": 18,
    "guru": 16,
    "shani": 19,
    "budha": 17,
}

NAMES = {
    "surya": "Surya",
    "chandra": "Chandra",
    "mangala": "Mangala",
    "budha": "Budha",
    "guru": "Guru",
    "shukra": "Shukra",
    "shani": "Shani",
    "rahu": "Rahu",
    "ketu": "Ketu",
}


def _ang(a: float, b: float) -> float:
    d = abs(a - b) % 360.0
    return min(d, 360.0 - d)


def _dignity(pid: str, sign: int, deg: float) -> str:
    if pid in ("rahu", "ketu"):
        return "Node"
    if sign == (EXALT[pid] + 6) % 12:
        return "Debilitated"
    if sign == EXALT[pid]:
        return "Exalted"
    mool = MOOL[pid]
    if sign == mool[0] and mool[1] <= deg < mool[2]:
        return "Moolatrikona"
    if sign in OWN[pid]:
        return "Own sign"
    lord = SIGN_LORD[sign]
    if lord in FRIENDS[pid]:
        return "Friend's sign"
    if lord in ENEMIES[pid]:
        return "Enemy's sign"
    return "Neutral sign"


def _combust(pid: str, lon: float, sun: float, retro: bool) -> bool:
    orbs = {
        "chandra": 12,
        "mangala": 17,
        "budha": 12 if retro else 14,
        "guru": 11,
        "shukra": 8 if retro else 10,
        "shani": 15,
    }
    if pid not in orbs:
        return False
    return _ang(lon, sun) <= orbs[pid]


def _screen(pid: str, body: dict) -> dict:
    """Dignity and house screen standing in for the essays' 'strong lagna lord'.

    Full shadbala is not computed. A planet passes when it is not debilitated,
    not combust, and is in a kendra, a trikona, its own sign, moolatrikona, or exaltation.
    """
    house = body["house"]
    dignity = body["dignity"]
    kendra = house in (1, 4, 7, 10)
    trikona = house in (1, 5, 9)
    strong_sign = dignity in ("Exalted", "Moolatrikona", "Own sign")
    debilitated = dignity == "Debilitated"
    combust = body["combust"]
    placed = kendra or trikona or strong_sign
    fit = (not debilitated) and (not combust) and placed
    reasons = []
    if debilitated:
        reasons.append(f"{NAMES[pid]} is debilitated.")
    else:
        dignity_phrase = {
            "Exalted": "is exalted",
            "Moolatrikona": "is in moolatrikona",
            "Own sign": "is in its own sign",
            "Friend's sign": "is in a friend's sign",
            "Neutral sign": "is in a neutral sign",
            "Enemy's sign": "is in an enemy's sign",
            "Node": "is a node",
        }[dignity]
        reasons.append(f"{NAMES[pid]} {dignity_phrase}.")
    if combust:
        reasons.append(f"{NAMES[pid]} is combust.")
    else:
        reasons.append(f"{NAMES[pid]} is not combust.")
    if kendra and trikona:
        reasons.append(f"{NAMES[pid]} is in house {house}, which is both a kendra and a trikona.")
    elif kendra:
        reasons.append(f"{NAMES[pid]} is in house {house}, a kendra.")
    elif trikona:
        reasons.append(f"{NAMES[pid]} is in house {house}, a trikona.")
    else:
        reasons.append(f"{NAMES[pid]} is in house {house}, neither a kendra nor a trikona.")
    if not placed and not debilitated:
        reasons.append("House and sign together are not strong enough for this screen.")
    reasons.append(
        "This is not a shadbala result. Neecha-bhanga is not applied."
        if not fit
        else "Passed the dignity and house screen. Shadbala is not computed."
    )
    return {
        "id": pid,
        "name": NAMES[pid],
        "fit": fit,
        "checks": {
            "debilitated": debilitated,
            "combust": combust,
            "kendra": kendra,
            "trikona": trikona,
            "ownOrExalted": strong_sign,
        },
        "reasons": reasons,
    }


def _nakshatra(lon: float) -> tuple[int, int]:
    span = 360.0 / 27.0
    # Keep a hair inside the span so an exact boundary does not spill.
    x = lon % 360.0
    if x >= 360.0 - 1e-9:
        x = 0.0
    nak = int(x / span) % 27
    into = x - nak * span
    pada = int(into / (span / 4.0)) + 1
    return nak, min(pada, 4)


def _place(lon: float, lagna_sign: int) -> dict:
    lon = lon % 360.0
    sign = int(lon // 30) % 12
    deg = lon - sign * 30
    nak, pada = _nakshatra(lon)
    return {
        "longitude": round(lon, 6),
        "signIndex": sign,
        "sign": SIGNS[sign],
        "degreeInSign": round(deg, 4),
        "nakshatraIndex": nak,
        "pada": pada,
        "house": (sign - lagna_sign) % 12 + 1,
    }


def compute_chart(
    year: int,
    month: int,
    day: int,
    hour: int,
    minute: int,
    second: int,
    latitude: float,
    longitude: float,
    tz_name: str | None,
    place: str | None,
    time_unknown: bool,
    node: str = "mean",
) -> dict:
    if tz_name:
        try:
            zone = ZoneInfo(tz_name)
        except ZoneInfoNotFoundError as exc:
            raise ValueError(f"Unknown timezone: {tz_name}") from exc
        resolved_tz = tz_name
    else:
        resolved_tz = tzfpy.get_tz(longitude, latitude)
        if not resolved_tz:
            raise ValueError("No timezone found for these coordinates. Enter one, such as Asia/Kolkata.")
        zone = ZoneInfo(resolved_tz)

    use_hour = 12 if time_unknown else hour
    use_minute = 0 if time_unknown else minute
    use_second = 0 if time_unknown else second
    try:
        local = datetime(year, month, day, use_hour, use_minute, use_second, tzinfo=zone)
    except ValueError as exc:
        raise ValueError("That date does not exist.") from exc

    ut = local.astimezone(timezone.utc)
    jd = swe.julday(
        ut.year,
        ut.month,
        ut.day,
        ut.hour + ut.minute / 60.0 + ut.second / 3600.0 + ut.microsecond / 3.6e12,
    )

    flags = swe.FLG_MOSEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED
    with _LOCK:
        swe.set_sid_mode(swe.SIDM_JN_BHASIN)
        ayan = float(swe.get_ayanamsa_ut(jd))
        try:
            _cusps, ascmc = swe.houses_ex(jd, latitude, longitude, b"W", swe.FLG_MOSEPH | swe.FLG_SIDEREAL)
        except swe.Error as exc:
            raise ValueError(
                "The ascendant could not be computed for this latitude. Use a place closer to the usual inhabited latitudes."
            ) from exc
        rahu_id = swe.TRUE_NODE if node == "true" else swe.MEAN_NODE
        raw = []
        for pid, body, _name in BODIES:
            xx, _ret = swe.calc_ut(jd, rahu_id if pid == "rahu" else body, flags)
            raw.append((pid, float(xx[0]), float(xx[3])))
        swe.set_sid_mode(swe.SIDM_LAHIRI)
        lahiri = float(swe.get_ayanamsa_ut(jd))
        swe.set_sid_mode(swe.SIDM_JN_BHASIN)

    lagna_lon = float(ascmc[0]) % 360.0
    lagna_sign = int(lagna_lon // 30) % 12
    lagna = _place(lagna_lon, lagna_sign)
    lagna["house"] = 1

    sun_lon = next(lon for pid, lon, _sp in raw if pid == "surya")
    bodies = []
    by_id = {}
    for pid, lon, speed in raw:
        retro = speed < 0
        placed = _place(lon, lagna_sign)
        placed.update(
            {
                "id": pid,
                "name": NAMES[pid],
                "speed": round(speed, 6),
                "retrograde": retro,
                "dignity": _dignity(pid, placed["signIndex"], placed["degreeInSign"]),
                "combust": _combust(pid, lon, sun_lon, retro),
            }
        )
        bodies.append(placed)
        by_id[pid] = placed

    rahu = by_id["rahu"]
    ketu_lon = (rahu["longitude"] + 180.0) % 360.0
    ketu = _place(ketu_lon, lagna_sign)
    ketu.update(
        {
            "id": "ketu",
            "name": "Ketu",
            "speed": rahu["speed"],
            "retrograde": True,
            "dignity": "Node",
            "combust": False,
        }
    )
    bodies.append(ketu)
    by_id["ketu"] = ketu

    lord_id = SIGN_LORD[lagna_sign]
    yog_id = YOGAKARAKA.get(lagna_sign)

    moon = by_id["chandra"]
    span = 360.0 / 27.0
    into = moon["longitude"] % span
    remaining = 1.0 - (into / span)
    dasha_lord = VIM_LORDS[moon["nakshatraIndex"] % 9]
    balance_years = remaining * VIM_YEARS[dasha_lord]
    balance_days = int(round(balance_years * 365.2425))
    years = balance_days // 365
    months = (balance_days % 365) // 30
    days = (balance_days % 365) % 30
    birth_civil = local.replace(tzinfo=None)
    dasha_end = birth_civil + timedelta(days=balance_days)

    caution = None
    if year < 1800 or year > 2200:
        caution = (
            "This built-in ephemeris is tightest between 1800 and 2200. "
            "Outside that span, treat the degrees as a close guide and check a full ephemeris."
        )

    return {
        "time": {
            "local": local.isoformat(),
            "utc": ut.isoformat(),
            "timezone": resolved_tz,
            "timeUncertain": time_unknown,
        },
        "place": {
            "latitude": latitude,
            "longitude": longitude,
            "label": place or "",
        },
        "ayanamsha": {
            "system": "JN Bhasin",
            "swissId": int(swe.SIDM_JN_BHASIN),
            "degrees": round(ayan, 6),
            "lahiriDegrees": round(lahiri, 6),
        },
        "node": "true" if node == "true" else "mean",
        "engine": "Swiss Ephemeris Moshier, sidereal JN Bhasin, whole-sign houses, "
        + ("true node" if node == "true" else "mean node"),
        "lagna": lagna,
        "bodies": bodies,
        "lagnaLord": _screen(lord_id, by_id[lord_id]),
        "yogakaraka": None if yog_id is None else _screen(yog_id, by_id[yog_id]),
        "yogakarakaNote": (
            "This lagna is one of Taurus, Cancer, Leo, Libra, Capricorn, Aquarius, which have a single yogakaraka."
            if yog_id
            else "This lagna has no single classical yogakaraka. The screen looks only at the lagna lord."
        ),
        "dasha": {
            "lord": dasha_lord,
            "name": NAMES[dasha_lord],
            "balanceYears": round(balance_years, 4),
            "years": years,
            "months": months,
            "days": days,
            "ends": dasha_end.date().isoformat(),
        },
        "caution": caution,
    }
