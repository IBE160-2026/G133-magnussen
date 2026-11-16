# Epics og brukerhistorier

*Rekonstruert 16. november 2026 fra PRD, appkode og innleveringstest.*

| Epic | Brukerhistorie | Krav | Akseptansekriterium og status |
|---|---|---|---|
| PDF og tekstuttrekk | Som student vil jeg åpne én PDF og vite hvilke sider appen kan bruke. | FR-1–3 | En ulåst PDF på inntil 20 MB og 50 sider kan åpnes. Sider med for lite tekst oppgis, og studenten kan velge å fortsette eller avbryte før generering. Åpning av demoen er testet. Grensene er prøvd i en teknisk pilot omtalt i PRD-en. Valget før generering mangler i appflyten. |
| Studieressurser og øving | Som student vil jeg bytte mellom sammendrag og nøkkelbegreper for å få oversikt. | FR-4–6 | Begge ressursene kan åpnes for samme PDF og viser kildeinformasjon. Innleveringstesten dokumenterer et kildeklikk. |
| Studieressurser og øving | Som student vil jeg øve med flashcards og quiz og få tilbakemelding. | FR-7–8 | Åpning av et kort viser svar og kildelenke. Omforsøk etter feil eller ubesvart bruker samme spørsmål i ny rekkefølge. Begge handlingene er dokumentert i testloggen. |
| Studieressurser og øving | Som student vil jeg avslutte en økt slik at filen og svarene ikke gjenopprettes. | FR-9 | Etter avslutning eller oppdatering må PDF-en velges på nytt. Full sjekk av øktavslutning er ikke dokumentert i innleveringstesten. |
| Kildekontroll | Som student vil jeg åpne den siterte siden og se når et utdrag ikke kan verifiseres. | FR-10–11 | «Side 3» viser bare side 3 i panelet. Et utdrag som mangler på sitert side merkes «Ubekreftet». Sideklikket er testet. Negativ test av utdrag gjenstår i testloggen. |
| Generering og demo | Som student vil jeg prøve appen uten nøkkel og få en forståelig melding hvis livegenerering feiler. | FR-13–14 | Demoen fungerer med lagrede ressurser. Ved leverandørfeil vises en norsk feilmelding. Demo er testet. Leverandørfeil er ikke dekket i innleveringstesten. |
| Generering og demo | Som student vil jeg få beskjed når grensen for livegenerering er nådd. | FR-12, PRD §5 | Etter åtte forsøk, eller når neste forsøk ville overskride kostnadstaket, stoppes forespørselen før leverandørkallet. Grensene gjenstår i appen. |

[PRD](prds/prd-Programmering%20med%20AI%202026-2026-11-04/prd.md) · [Innleveringstest](../../app/TESTLOGG.md)
