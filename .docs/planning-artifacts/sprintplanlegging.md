# Sprintplanlegging og leveranserekkefølge

*Retrospektiv oversikt skrevet 16. november 2026 fra commits, PR-er og testlogg.*

| Dato | Rekkefølge | Spor |
|---|---|---|
| 14. nov. | Oppdaterte PRD etter faglærers tilbakemelding og dokumenterte pilotene for PDF-grenser og tekstuttrekk. | [`3fc0bae`](https://github.com/IBE160-2026/G133-magnussen/commit/3fc0bae) |
| 15. nov. | Leverte kjørbar MVP med demoflyt, studieressurser og kildevisning. | [PR #1](https://github.com/IBE160-2026/G133-magnussen/pull/1) |
| 15. nov. | Rettet kildepanelet til å vise den valgte PDF-siden. | [PR #2](https://github.com/IBE160-2026/G133-magnussen/pull/2) |
| 15. nov. | Prøvde demoen fra ren kopi av `main` og dokumenterte kildevisning, flashcards og quiz. | [PR #3](https://github.com/IBE160-2026/G133-magnussen/pull/3) · [Testlogg](../../app/TESTLOGG.md) |
| 16. nov. | Samlet idégrunnlag, research, utviklingsiterasjoner og README-lenker. | [PR #4](https://github.com/IBE160-2026/G133-magnussen/pull/4) |

## Foreslått rekkefølge for gjenstående validering

1. Prøv dokumentgrenser og sider med lite tekst gjennom appens opplastingsflyt. Loggfør hvilke PDF-er og versjoner som ble brukt.
2. Prøv feilaktige kildeutdrag og mislykket generering. Registrer utfall mot FR-10 og FR-13.
3. Mål tokenbruk på en representativ maksimalfil og avklar leverandørens datalagring. Bruk målingene som grunnlag for kostnadstak og test begge grensene for livegenerering når de er implementert.
