# Gemini token-based cost reservations

## 2026-11-18 kl. 15:21 — sarakmag

### Oppgave

Implementerte den godkjente spesifikasjonen for tokenbaserte Gemini-kostnadsreservasjoner i worktreet, uten å endre produktbriefen eller gjøre live Gemini-/Redis-kall.

### Plan

- Les og følg den godkjente spesifikasjonen som eneste kravkilde.
- Eksponer ett forberedt genereringspayload og tell hele forespørselen før Redis-reservering.
- Legg til konservativ pris- og mikro-US-dollarberegning for støttede modeller.
- Behold eksisterende Redis-nøkler og atomiske budsjetteller.
- Mock all provider-/Redis-kommunikasjon i tester, oppdater dokumentasjon og valider bygg/tester.

### Resultat

- Endret `api/study.mjs`, `app/gemini-summary.mjs`, `app/gemini-cost.mjs`, API-/summary-testene, README, env-eksempel og testloggen.
- Implementerte full payload-tokentelling, safe integer-mikro-US-dollaravrunding oppover, reservering før generering, fail-close for ustøttede modeller/telling og Norsk 503-melding.
- Bevarte Redis-nøklene `study:session:<budgetId>:<session>` og `study:budget:<budgetId>` samt åtteforespørselgrensen.
- `npm test`: 15 tester passerte.
- `npm run build`: passerte.
- Node syntaxkontroller for `api/study.mjs`, `app/gemini-summary.mjs` og `app/gemini-cost.mjs`: passerte.
- Ingen live Gemini-, nettverks- eller betalt provideroppkall ble gjort.

### Åpne punkter

Ingen.
