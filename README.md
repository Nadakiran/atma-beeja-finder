# Atma Beeja

A calculator for the sixteen-house Akathaha chakra and a sidereal birth chart.

The chart is drawn with the Swiss Ephemeris (the astronomical library behind drik panchangas), locked to the JN Bhasin ayanamsha, in both South Indian and North Indian figures. The beeja is chosen from the called name or the Moon’s janma syllable, tested on the chakra, and, when the chart allows it, taken from the lagna lord or the yogakaraka.

It is a study tool. A beeja is traditionally received from a guru.

## Run locally

```bash
pip install -r requirements.txt
PYTHONPATH=. uvicorn server.main:app --reload
```

Open http://127.0.0.1:8000.

## What the two counts are

- **Chatushka.** Rudrayamala patala 5 and Mantra Mahodadhi taranga 24. Houses are filled in the order 1, 3, 11, 9, 2, 4, 12, 10, 6, 8, 16, 14, 5, 7, 15, 13, then read in fours as siddha, sādhya, susiddha, ari.
- **Row and column.** The working method for an atma beeja on the same figure: the third row and third column is the best square, and the fourth is not used.

The Learn tab in the app walks through both, including the Devadatta and Kumar examples, the sixteen results, the graha seeds, and the limits of the strength screen (it is not shadbala).
