"""Shadbala on the Delhi sample, plus the fixed points of the strength chapter."""

from server.chart import compute_chart
from server.shadbala import NAISARGIKA, REQUIRED, uchcha_bala

c = compute_chart(1990, 8, 15, 10, 30, 0, 28.6139, 77.2090, "Asia/Kolkata", "New Delhi", False)
s = c["shadbala"]
assert s["order"] == ["surya", "chandra", "mangala", "budha", "guru", "shukra", "shani"]
assert set(s["planets"]) == set(s["order"])
assert "rahu" not in s["planets"]

for pid, need in REQUIRED.items():
    p = s["planets"][pid]
    assert p["required"] == need
    parts = (
        p["sthana"]["total"]
        + p["dig"]
        + p["kala"]["total"]
        + p["cheshta"]
        + p["naisargika"]
        + p["drik"]
    )
    assert abs(parts - p["virupas"]) < 0.05, (pid, parts, p["virupas"])
    assert 0 <= p["dig"] <= 60
    assert 0 <= p["sthana"]["uchcha"] <= 60
    assert p["kala"]["ayana"] >= 0
    assert p["meets"] is (p["virupas"] + 1e-6 >= need)

sun = s["planets"]["surya"]
moon = s["planets"]["chandra"]
budha = s["planets"]["budha"]
assert sun["cheshta"] == sun["kala"]["ayana"]
assert moon["cheshta"] == moon["kala"]["paksha"]
assert budha["kala"]["natonnata"] == 60
assert abs(sun["naisargika"] - 60) < 0.01
assert abs(budha["naisargika"] - NAISARGIKA["budha"]) < 0.02

# Wednesday 15 Aug 1990. Sunrise is that morning, so the weekday lord is Budha.
assert s["lords"]["varaId"] == "budha"
assert s["lords"]["sunrise"].startswith("1990-08-15T05:")
assert s["lords"]["day"] is True
# 10:30 is just into the second third of this day, whose lord is Surya.
assert s["lords"]["tribhagaId"] == "surya"

# Budha clears the shadbala pinda and still fails the house test, so the beeja is not his.
assert budha["meets"] is True
assert c["lagnaLord"]["id"] == "budha"
assert c["lagnaLord"]["checks"]["shadbala"] is True
assert c["lagnaLord"]["fit"] is False

unknown = compute_chart(1990, 8, 15, 10, 30, 0, 28.6139, 77.2090, "Asia/Kolkata", "New Delhi", True)
assert unknown["lagnaLord"]["fit"] is False
assert unknown["shadbala"]["caution"]

night = compute_chart(1990, 8, 15, 2, 0, 0, 28.6139, 77.2090, "Asia/Kolkata", "New Delhi", False)
assert night["shadbala"]["lords"]["day"] is False
assert night["shadbala"]["planets"]["surya"]["virupas"] > 0

assert uchcha_bala("surya", 10) == 60
assert uchcha_bala("surya", 190) == 0
assert uchcha_bala("chandra", 33) == 60

print("shadbala ok", {pid: s["planets"][pid]["virupas"] for pid in s["order"]})
