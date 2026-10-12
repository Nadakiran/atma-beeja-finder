from server.chart import compute_chart

c = compute_chart(1990, 8, 15, 10, 30, 0, 28.6139, 77.2090, "Asia/Kolkata", "New Delhi", False)
assert c["lagna"]["sign"] == "Kanya", c["lagna"]
assert c["bodies"][0]["sign"] == "Karka", c["bodies"][0]
assert c["ayanamsha"]["system"] == "JN Bhasin"
assert c["ayanamsha"]["swissId"] == 8
assert c["lagnaLord"]["id"] == "budha"
assert c["lagnaLord"]["fit"] is False
assert c["shadbala"]["planets"]["budha"]["meets"] is True
print(
    "chart ok",
    c["lagna"]["sign"],
    c["bodies"][0]["sign"],
    round(c["ayanamsha"]["degrees"], 3),
    c["lagnaLord"]["id"],
    c["shadbala"]["planets"]["budha"]["virupas"],
)
