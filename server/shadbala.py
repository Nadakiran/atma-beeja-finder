"""Shadbala for the seven grahas, from Brihat Parashara Hora Shastra chapter 27.

Positions stay on the caller’s ayanamsha. The six balas are sthana, dig, kala,
cheshta, naisargika, and drik. One rupa is 60 virupas. Rahu and Ketu are not
given a shadbala.

The required pindas are 390, 360, 300, 420, 390, 330, and 300 virupas for
Surya through Shani. A graha meets shadbala when its total reaches that pinda.
Neecha-bhanga is not applied. Bhava bala is a later account and is not part
of this total.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import swisseph as swe

PLANETS = ["surya", "chandra", "mangala", "budha", "guru", "shukra", "shani"]

SWE_ID = {
    "surya": swe.SUN,
    "chandra": swe.MOON,
    "mangala": swe.MARS,
    "budha": swe.MERCURY,
    "guru": swe.JUPITER,
    "shukra": swe.VENUS,
    "shani": swe.SATURN,
}

NAMES = {
    "surya": "Surya",
    "chandra": "Chandra",
    "mangala": "Mangala",
    "budha": "Budha",
    "guru": "Guru",
    "shukra": "Shukra",
    "shani": "Shani",
}

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

# Deep debilitation, sidereal longitude. Exaltation is 180° from this point.
DEBIL = {
    "surya": 190.0,
    "chandra": 213.0,
    "mangala": 118.0,
    "budha": 345.0,
    "guru": 275.0,
    "shukra": 177.0,
    "shani": 20.0,
}

EXALT_SIGN = {
    "surya": 0,
    "chandra": 1,
    "mangala": 9,
    "budha": 5,
    "guru": 3,
    "shukra": 11,
    "shani": 6,
}

# Moolatrikona in the rashi chart only: sign, start degree, end degree.
MOOL = {
    "surya": (4, 0.0, 20.0),
    "chandra": (1, 4.0, 30.0),
    "mangala": (0, 0.0, 12.0),
    "budha": (5, 16.0, 20.0),
    "guru": (8, 0.0, 10.0),
    "shukra": (6, 0.0, 15.0),
    "shani": (10, 0.0, 20.0),
}

OWN = {
    "surya": {4},
    "chandra": {3},
    "mangala": {0, 7},
    "budha": {2, 5},
    "guru": {8, 11},
    "shukra": {1, 6},
    "shani": {9, 10},
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

REQUIRED = {
    "surya": 390.0,
    "chandra": 360.0,
    "mangala": 300.0,
    "budha": 420.0,
    "guru": 390.0,
    "shukra": 330.0,
    "shani": 300.0,
}

NAISARGIKA = {
    "shani": 60.0 / 7.0,
    "mangala": 120.0 / 7.0,
    "budha": 180.0 / 7.0,
    "guru": 240.0 / 7.0,
    "shukra": 300.0 / 7.0,
    "chandra": 360.0 / 7.0,
    "surya": 60.0,
}

# Sunday through Saturday.
VARA = ["surya", "chandra", "mangala", "budha", "guru", "shukra", "shani"]
# Planetary hours. The first hour of a weekday belongs to that weekday’s lord.
HORA = ["surya", "shukra", "budha", "chandra", "shani", "guru", "mangala"]

OBLIQUITY = 23.0 + 27.0 / 60.0


def _norm(deg: float) -> float:
    return deg % 360.0


def _sep(a: float, b: float) -> float:
    d = abs(a - b) % 360.0
    return min(d, 360.0 - d)


def _reduce180(deg: float) -> float:
    x = _norm(deg)
    return 360.0 - x if x > 180.0 else x


def _midpoint(a: float, b: float) -> float:
    """Midpoint along the shorter arc. Adding the raw numbers fails across 0°."""
    diff = (b - a) % 360.0
    if diff > 180.0:
        diff -= 360.0
    return _norm(a + diff / 2.0)


def _r(value: float, places: int = 4) -> float:
    return round(float(value), places)


def uchcha_bala(pid: str, lon: float) -> float:
    """Virupas. 60 at deep exaltation, 0 at deep debilitation."""
    return _reduce180(lon - DEBIL[pid]) / 3.0


def _natural(pid: str, other: str) -> str:
    if other in FRIENDS[pid]:
        return "friend"
    if other in ENEMIES[pid]:
        return "enemy"
    return "neutral"


def _temporary_friend(sign: int, other_sign: int) -> bool:
    """Houses 2, 3, 4, 10, 11, 12 from the graha are temporary friends."""
    dist = (other_sign - sign) % 12
    return dist in (1, 2, 3, 9, 10, 11)


def _compound_points(pid: str, sign: int, other: str, rashis: dict[str, int]) -> tuple[float, str]:
    natural = _natural(pid, other)
    temporary = _temporary_friend(sign, rashis[other])
    if natural == "friend" and temporary:
        return 22.5, "great friend"
    if natural == "friend" and not temporary:
        return 15.0, "friend"
    if natural == "neutral" and temporary:
        return 15.0, "friend"
    if natural == "neutral" and not temporary:
        return 7.5, "neutral"
    if natural == "enemy" and temporary:
        return 7.5, "neutral"
    return 3.75, "enemy"


def _hora_sign(sign: int, deg: float) -> int:
    first = deg < 15.0
    odd = sign % 2 == 0
    if odd:
        return 4 if first else 3
    return 3 if first else 4


def _drekkana_sign(sign: int, deg: float) -> int:
    part = min(int(deg / 10.0), 2)
    return (sign + (0, 4, 8)[part]) % 12


def _saptamsha_sign(sign: int, deg: float) -> int:
    part = min(int(deg / (30.0 / 7.0)), 6)
    start = sign if sign % 2 == 0 else (sign + 6) % 12
    return (start + part) % 12


def _navamsha_sign(sign: int, deg: float) -> int:
    part = min(int(deg / (30.0 / 9.0)), 8)
    start = (0, 9, 6, 3)[sign % 4]
    return (start + part) % 12


def _dwadasamsha_sign(sign: int, deg: float) -> int:
    part = min(int(deg / 2.5), 11)
    return (sign + part) % 12


def _trimshamsha_sign(sign: int, deg: float) -> int:
    if sign % 2 == 0:
        bounds = ((5.0, 0), (10.0, 10), (18.0, 8), (25.0, 2), (30.0, 6))
    else:
        bounds = ((5.0, 1), (12.0, 5), (20.0, 11), (25.0, 9), (30.0, 7))
    for limit, idx in bounds:
        if deg < limit or limit == 30.0:
            return idx
    return bounds[-1][1]


def _varga_signs(sign: int, deg: float) -> dict[str, int]:
    return {
        "Rashi": sign,
        "Hora": _hora_sign(sign, deg),
        "Drekkana": _drekkana_sign(sign, deg),
        "Saptamsha": _saptamsha_sign(sign, deg),
        "Navamsha": _navamsha_sign(sign, deg),
        "Dwadasamsha": _dwadasamsha_sign(sign, deg),
        "Trimshamsha": _trimshamsha_sign(sign, deg),
    }


def _saptavargaja(pid: str, sign: int, deg: float, rashis: dict[str, int]) -> tuple[float, list[dict]]:
    rows = []
    total = 0.0
    for name, vsign in _varga_signs(sign, deg).items():
        lord = SIGN_LORD[vsign]
        if name == "Rashi":
            mool = MOOL[pid]
            if vsign == mool[0] and mool[1] <= deg < mool[2]:
                points, because = 45.0, "moolatrikona"
            elif vsign in OWN[pid]:
                points, because = 30.0, "own sign"
            elif vsign == (EXALT_SIGN[pid] + 6) % 12:
                points, because = 1.875, "debilitation"
            else:
                points, because = _compound_points(pid, sign, lord, rashis)
        elif vsign in OWN[pid]:
            points, because = 30.0, "own sign"
        elif vsign == (EXALT_SIGN[pid] + 6) % 12:
            points, because = 1.875, "debilitation"
        else:
            points, because = _compound_points(pid, sign, lord, rashis)
        total += points
        rows.append(
            {
                "varga": name,
                "sign": SIGNS[vsign],
                "points": points,
                "because": because,
            }
        )
    return total, rows


def _ojhayugma(pid: str, sign: int, deg: float) -> tuple[float, float]:
    """Moon and Venus want even signs. The others want odd signs. Rashi and navamsha."""
    feminine = pid in ("chandra", "shukra")

    def one(idx: int) -> float:
        even = idx % 2 == 1
        return 15.0 if even == feminine else 0.0

    rashi = one(sign)
    nav = one(_navamsha_sign(sign, deg))
    return rashi, nav


def _kendradi(house: int) -> float:
    if house in (1, 4, 7, 10):
        return 60.0
    if house in (2, 5, 8, 11):
        return 30.0
    return 15.0


def _drekkana_bala(pid: str, deg: float) -> float:
    part = min(int(deg / 10.0), 2)
    if pid in ("surya", "mangala", "guru"):
        return 15.0 if part == 0 else 0.0
    if pid in ("budha", "shani"):
        return 15.0 if part == 1 else 0.0
    return 15.0 if part == 2 else 0.0


def _aspect_value(sep: float) -> float:
    """Ordinary drishti in virupas for a forward separation of 0–360°."""
    if sep < 30.0 or sep > 300.0:
        return 0.0
    if sep <= 60.0:
        return (sep - 30.0) / 2.0
    if sep <= 90.0:
        return (sep - 60.0) + 15.0
    if sep <= 120.0:
        return (120.0 - sep) / 2.0 + 30.0
    if sep <= 150.0:
        return 150.0 - sep
    if sep <= 180.0:
        return (sep - 150.0) * 2.0
    return (300.0 - sep) / 2.0


def _special_aspect(pid: str, sep: float) -> float:
    if pid == "mangala" and (90.0 <= sep <= 120.0 or 210.0 <= sep <= 240.0):
        return 15.0
    if pid == "guru" and (120.0 <= sep <= 150.0 or 240.0 <= sep <= 270.0):
        return 30.0
    if pid == "shani" and (60.0 <= sep <= 90.0 or 270.0 <= sep <= 300.0):
        return 45.0
    return 0.0


def _ayana(pid: str, decl: float) -> float:
    """(23°27′ ± kranti) scaled to virupas. Surya’s result is doubled."""
    north = decl >= 0.0
    if pid == "budha":
        plus = True
    elif pid in ("chandra", "shani"):
        plus = not north
    else:
        plus = north
    base = OBLIQUITY + abs(decl) if plus else OBLIQUITY - abs(decl)
    value = base * (60.0 / (2.0 * OBLIQUITY))
    if pid == "surya":
        value *= 2.0
    # Past the old 23°27′ limit the difference would go negative. Ayana then contributes nothing.
    return max(0.0, value)


def _sun_lon(jd: float) -> float:
    xx, _ret = swe.calc_ut(jd, swe.SUN, swe.FLG_MOSEPH | swe.FLG_SIDEREAL)
    return float(xx[0]) % 360.0


def _previous_ingress(jd: float, target: float) -> float:
    """Last time the sidereal Sun reached `target` at or before `jd`."""
    passed = (_sun_lon(jd) - target) % 360.0
    guess = jd - passed / 0.985
    lo = guess - 5.0
    hi = min(jd, guess + 5.0)

    def passed_deg(t: float) -> float:
        return (_sun_lon(t) - target) % 360.0

    for _ in range(12):
        if passed_deg(lo) < 180.0:
            lo -= 5.0
        else:
            break
    for _ in range(12):
        if hi < jd and passed_deg(hi) > 180.0:
            hi = min(jd, hi + 5.0)
        else:
            break
    for _ in range(56):
        mid = (lo + hi) / 2.0
        if passed_deg(mid) < 180.0:
            hi = mid
        else:
            lo = mid
    return hi


def _event(jd: float, rsmi: int, longitude: float, latitude: float) -> float | None:
    try:
        res, tret = swe.rise_trans(
            jd,
            swe.SUN,
            rsmi,
            (longitude, latitude, 0.0),
            0.0,
            0.0,
            swe.FLG_MOSEPH,
        )
    except swe.Error:
        return None
    if res < 0:
        return None
    return float(tret[0])


def _sunrises(jd: float, longitude: float, latitude: float) -> tuple[float | None, float | None, float | None]:
    """Sunrise that opened this vara, the next sunrise, and the sunset of this daytime."""
    rsmi = swe.CALC_RISE | swe.BIT_HINDU_RISING
    set_flag = swe.CALC_SET | swe.BIT_HINDU_RISING
    nxt = _event(jd, rsmi, longitude, latitude)
    if nxt is None:
        return None, None, None
    prev = _event(nxt - 1.2, rsmi, longitude, latitude)
    if prev is None:
        return None, None, None
    if prev > jd:
        earlier = _event(prev - 1.2, rsmi, longitude, latitude)
        if earlier is not None:
            nxt = prev
            prev = earlier
    sunset = _event(prev, set_flag, longitude, latitude)
    if sunset is not None and sunset < prev:
        sunset = _event(prev + 0.01, set_flag, longitude, latitude)
    return prev, nxt, sunset


def _utc(jd: float) -> datetime:
    year, month, day, hour = swe.revjul(jd, swe.GREG_CAL)
    return datetime(year, month, day, tzinfo=timezone.utc) + timedelta(seconds=round(hour * 3600.0))


def _local_sunday0(jd: float, zone) -> int:
    return (_utc(jd).astimezone(zone).weekday() + 1) % 7


def _iso(jd: float, zone) -> str:
    return _utc(jd).astimezone(zone).isoformat(timespec="minutes")


def _natonnata(jd: float, armc: float) -> dict[str, float]:
    xx, _ret = swe.calc_ut(jd, swe.SUN, swe.FLG_MOSEPH | swe.FLG_EQUATORIAL)
    ra = float(xx[0])
    hour_angle = _norm(armc - ra)
    hours_from_midnight = _norm(hour_angle + 180.0) / 15.0
    ghatis = hours_from_midnight * 2.5
    unnata = min(ghatis, 60.0 - ghatis)
    nata_bala = 2.0 * (30.0 - unnata)
    unnata_bala = 60.0 - nata_bala
    return {
        "surya": unnata_bala,
        "guru": unnata_bala,
        "shukra": unnata_bala,
        "chandra": nata_bala,
        "mangala": nata_bala,
        "shani": nata_bala,
        "budha": 60.0,
    }


def _mean_sun_sidereal(jd: float, ayanamsha: float) -> float:
    elements = swe.get_orbital_elements(jd + swe.deltat(jd), swe.EARTH, swe.FLG_MOSEPH)
    return _norm(float(elements[9]) + 180.0 - ayanamsha)


def _mean_sidereal(jd: float, pid: str, ayanamsha: float) -> float:
    elements = swe.get_orbital_elements(jd + swe.deltat(jd), SWE_ID[pid], swe.FLG_MOSEPH)
    return _norm(float(elements[9]) - ayanamsha)


def _cheshta(pid: str, true_lon: float, mean_sun: float, mean_planet: float, ayana: float, paksha: float) -> float:
    if pid == "surya":
        return ayana
    if pid == "chandra":
        return paksha
    if pid in ("budha", "shukra"):
        mean_l = mean_sun
        seeghra = mean_planet
    else:
        mean_l = mean_planet
        seeghra = mean_sun
    average = _midpoint(mean_l, true_lon)
    return _reduce180(seeghra - average) / 3.0


def compute(
    jd: float,
    latitude: float,
    longitude: float,
    lagna_lon: float,
    ayanamsha: float,
    armc: float,
    zone,
    planets: dict[str, dict],
    lock,
    time_unknown: bool = False,
) -> dict:
    """All seven grahas. `planets` maps id to longitude, signIndex, degreeInSign, house."""
    with lock:
        swe.set_sid_mode(swe.SIDM_JN_BHASIN)
        decl = {}
        lat = {}
        disc = {}
        for pid, body in SWE_ID.items():
            equ, _ret = swe.calc_ut(jd, body, swe.FLG_MOSEPH | swe.FLG_EQUATORIAL)
            ecl, _ret = swe.calc_ut(jd, body, swe.FLG_MOSEPH)
            pheno = swe.pheno_ut(jd, body, swe.FLG_MOSEPH)
            decl[pid] = float(equ[1])
            lat[pid] = float(ecl[1])
            disc[pid] = float(pheno[3])
        nat = _natonnata(jd, armc)
        mean_sun = _mean_sun_sidereal(jd, ayanamsha)
        mean_planet = {pid: _mean_sidereal(jd, pid, ayanamsha) for pid in PLANETS if pid != "surya"}
        sunrise, next_sunrise, sunset = _sunrises(jd, longitude, latitude)
        if sunrise is not None:
            vara_index = _local_sunday0(sunrise, zone)
            abda_jd = _previous_ingress(jd, 0.0)
            sun_sign = int(planets["surya"]["longitude"] // 30) % 12
            masa_jd = _previous_ingress(jd, sun_sign * 30.0)
            abda = VARA[_local_sunday0(_sunrises(abda_jd, longitude, latitude)[0] or abda_jd, zone)]
            masa_rise = _sunrises(masa_jd, longitude, latitude)[0]
            masa = VARA[_local_sunday0(masa_rise or masa_jd, zone)]
        else:
            vara_index = _local_sunday0(jd, zone)
            abda = VARA[vara_index]
            masa = SIGN_LORD[int(planets["surya"]["longitude"] // 30) % 12]
            abda_jd = masa_jd = None

    vara = VARA[vara_index]
    caution = None
    if sunrise is None or next_sunrise is None or sunset is None:
        caution = "Sunrise could not be fixed at this latitude, so the day, hour, and third-of-day lords use the clock weekday instead."
        hora = vara
        tribhaga = "guru"
        day = False
    else:
        span = (next_sunrise - sunrise) / 24.0
        hora_index = int((jd - sunrise) / span) if span > 0 else 0
        hora_index = min(max(hora_index, 0), 23)
        start = HORA.index(vara)
        hora = HORA[(start + hora_index) % 7]
        if sunrise <= jd < sunset:
            day = True
            part = (jd - sunrise) / (sunset - sunrise) if sunset > sunrise else 0.0
            tribhaga = ("budha", "surya", "shani")[min(int(part * 3.0), 2)]
        else:
            day = False
            night_start, night_end = sunset, next_sunrise
            part = 0.0 if night_end <= night_start else (jd - night_start) / (night_end - night_start)
            if part < 0:
                part = 0.0
            tribhaga = ("chandra", "shukra", "mangala")[min(int(part * 3.0), 2)]

    rashis = {pid: int(planets[pid]["signIndex"]) for pid in PLANETS}
    lons = {pid: float(planets[pid]["longitude"]) % 360.0 for pid in PLANETS}

    moon_from_sun = _norm(lons["chandra"] - lons["surya"])
    paksha_arc = moon_from_sun if moon_from_sun <= 180.0 else 360.0 - moon_from_sun
    benefic_paksha = paksha_arc / 3.0
    malefic_paksha = 60.0 - benefic_paksha
    moon_benefic = 90.0 <= moon_from_sun <= 270.0

    yuddha = {pid: 0.0 for pid in PLANETS}
    yuddha_note = {pid: "" for pid in PLANETS}
    starry = ["mangala", "budha", "guru", "shukra", "shani"]
    for i, left in enumerate(starry):
        for right in starry[i + 1 :]:
            gap = _sep(lons[left], lons[right])
            if gap >= 1.0:
                continue
            if lat[left] > lat[right] or (lat[left] == lat[right] and disc[left] >= disc[right]):
                winner, loser = left, right
            else:
                winner, loser = right, left
            vir = gap * 60.0
            yuddha[winner] += vir
            yuddha[loser] -= vir
            yuddha_note[winner] = f"in war with {NAMES[loser]}, ahead by {vir:.1f} virupas"
            yuddha_note[loser] = f"in war with {NAMES[winner]}, behind by {vir:.1f} virupas"

    dig_zero = {
        "surya": _norm(lagna_lon + 90.0),
        "mangala": _norm(lagna_lon + 90.0),
        "guru": _norm(lagna_lon + 180.0),
        "budha": _norm(lagna_lon + 180.0),
        "shukra": _norm(lagna_lon + 270.0),
        "chandra": _norm(lagna_lon + 270.0),
        "shani": _norm(lagna_lon),
    }

    records = {}
    for pid in PLANETS:
        lon = lons[pid]
        sign = rashis[pid]
        deg = float(planets[pid]["degreeInSign"])
        house = int(planets[pid]["house"])
        uchcha = uchcha_bala(pid, lon)
        sapta, sapta_rows = _saptavargaja(pid, sign, deg, rashis)
        oja_r, oja_n = _ojhayugma(pid, sign, deg)
        kendra = _kendradi(house)
        drekkana = _drekkana_bala(pid, deg)
        sthana = uchcha + sapta + oja_r + oja_n + kendra + drekkana
        dig = _reduce180(lon - dig_zero[pid]) / 3.0
        paksha = benefic_paksha if pid in ("chandra", "budha", "guru", "shukra") else malefic_paksha
        tri = 60.0 if (pid == tribhaga or pid == "guru") else 0.0
        abda_v = 15.0 if pid == abda else 0.0
        masa_v = 30.0 if pid == masa else 0.0
        vara_v = 45.0 if pid == vara else 0.0
        hora_v = 60.0 if pid == hora else 0.0
        ayana = _ayana(pid, decl[pid])
        kala = nat[pid] + paksha + tri + abda_v + masa_v + vara_v + hora_v + ayana + yuddha[pid]
        cheshta = _cheshta(pid, lon, mean_sun, mean_planet.get(pid, mean_sun), ayana, paksha)
        nais = NAISARGIKA[pid]
        records[pid] = {
            "uchcha": uchcha,
            "saptavargaja": sapta,
            "saptavarga": sapta_rows,
            "ojhayugmaRashi": oja_r,
            "ojhayugmaNavamsha": oja_n,
            "kendradi": kendra,
            "drekkana": drekkana,
            "sthana": sthana,
            "dig": dig,
            "natonnata": nat[pid],
            "paksha": paksha,
            "tribhaga": tri,
            "abda": abda_v,
            "masa": masa_v,
            "vara": vara_v,
            "hora": hora_v,
            "ayana": ayana,
            "yuddha": yuddha[pid],
            "yuddhaNote": yuddha_note[pid],
            "kala": kala,
            "cheshta": cheshta,
            "naisargika": nais,
        }

    # Drik uses the finished aspect values. Jupiter and Mercury are added whole.
    # Other benefics add a quarter. Malefics subtract a quarter.
    for dst in PLANETS:
        received = 0.0
        for src in PLANETS:
            if src == dst:
                continue
            sep = _norm(lons[dst] - lons[src])
            value = _aspect_value(sep) + _special_aspect(src, sep)
            if value == 0.0:
                continue
            if src in ("guru", "budha"):
                received += value
            elif src in ("surya", "mangala", "shani") or (src == "chandra" and not moon_benefic):
                received -= value / 4.0
            else:
                received += value / 4.0
        records[dst]["drik"] = received

    out = {}
    for pid, row in records.items():
        total = row["sthana"] + row["dig"] + row["kala"] + row["cheshta"] + row["naisargika"] + row["drik"]
        required = REQUIRED[pid]
        out[pid] = {
            "id": pid,
            "name": NAMES[pid],
            "sthana": {
                "uchcha": _r(row["uchcha"], 2),
                "saptavargaja": _r(row["saptavargaja"], 2),
                "vargas": [
                    {**item, "points": _r(item["points"], 3)}
                    for item in row["saptavarga"]
                ],
                "ojhayugma": _r(row["ojhayugmaRashi"] + row["ojhayugmaNavamsha"], 2),
                "kendradi": _r(row["kendradi"], 2),
                "drekkana": _r(row["drekkana"], 2),
                "total": _r(row["sthana"], 2),
            },
            "dig": _r(row["dig"], 2),
            "kala": {
                "natonnata": _r(row["natonnata"], 2),
                "paksha": _r(row["paksha"], 2),
                "tribhaga": _r(row["tribhaga"], 2),
                "abda": _r(row["abda"], 2),
                "masa": _r(row["masa"], 2),
                "vara": _r(row["vara"], 2),
                "hora": _r(row["hora"], 2),
                "ayana": _r(row["ayana"], 2),
                "yuddha": _r(row["yuddha"], 2),
                "yuddhaNote": row["yuddhaNote"],
                "total": _r(row["kala"], 2),
            },
            "cheshta": _r(row["cheshta"], 2),
            "naisargika": _r(row["naisargika"], 2),
            "drik": _r(row["drik"], 2),
            "virupas": _r(total, 2),
            "rupas": _r(total / 60.0, 2),
            "required": required,
            "requiredRupas": _r(required / 60.0, 2),
            "meets": total + 1e-6 >= required,
        }

    if time_unknown and caution is None:
        caution = "The birth time was taken as noon, so the day, hour, and house parts of shadbala are not the birth’s own."

    return {
        "order": PLANETS,
        "planets": out,
        "lords": {
            "abda": NAMES[abda],
            "abdaId": abda,
            "masa": NAMES[masa],
            "masaId": masa,
            "vara": NAMES[vara],
            "varaId": vara,
            "hora": NAMES[hora],
            "horaId": hora,
            "tribhaga": NAMES[tribhaga],
            "tribhagaId": tribhaga,
            "day": day if sunrise is not None else None,
            "sunrise": _iso(sunrise, zone) if sunrise is not None else None,
            "sunset": _iso(sunset, zone) if sunset is not None else None,
        },
        "moonBenefic": moon_benefic,
        "caution": caution,
    }

