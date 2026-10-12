from server.chart import _place, compute_chart

c = compute_chart(1990, 8, 15, 10, 30, 0, 28.6139, 77.2090, "Asia/Kolkata", "New Delhi", False)
assert c["lagna"]["sign"] == "Kanya", c["lagna"]
assert c["bodies"][0]["sign"] == "Karka", c["bodies"][0]
assert c["ayanamsha"]["system"] == "JN Bhasin"
assert c["ayanamsha"]["swissId"] == 8
assert c["lagnaLord"]["id"] == "budha"
assert c["lagnaLord"]["fit"] is False
budha = next(b for b in c["bodies"] if b["id"] == "budha")
assert budha["sign"] == "Simha" and budha["house"] == 12
assert any("From the Kanya lagna, Simha is the 12th house." in r for r in c["lagnaLord"]["reasons"])
# The next sign from Mithuna is house 2. The sign before it is house 12.
assert _place(91, 2)["sign"] == "Karka" and _place(91, 2)["house"] == 2
assert _place(31, 2)["sign"] == "Vrishabha" and _place(31, 2)["house"] == 12
assert c["shadbala"]["planets"]["budha"]["meets"] is True
print(
    "chart ok",
    c["lagna"]["sign"],
    c["bodies"][0]["sign"],
    round(c["ayanamsha"]["degrees"], 3),
    c["lagnaLord"]["id"],
    c["shadbala"]["planets"]["budha"]["virupas"],
)
