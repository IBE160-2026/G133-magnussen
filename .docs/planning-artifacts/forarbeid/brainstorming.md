# Brainstorming for AI Study Buddy

Oppsummering skrevet 16. november 2026 med utgangspunkt i den eksisterende product briefen, PRD-en og det som kom frem under utprøving. Alternativene nedenfor er hentet fra prosjektets beskrevne omfang og senere iterasjoner.

## Problem og målgruppe

En fysioterapistudent som øver til anatomieksamen, må lære norske og latinske navn, plassering og funksjon. Å lage øvingsmateriell av egne forelesnings-PDF-er tar tid. Studenter trenger også en enkel måte å sjekke at et generert svar bygger på kursmaterialet.

## Ideer og avgrensninger

| Idé | Beslutning og begrunnelse |
| --- | --- |
| Sammendrag og nøkkelbegreper | Med i MVP. Sammendraget samler hovedpoeng etter tema, mens begrepene gir korte forklaringer. |
| Flashcards og quiz | Med i MVP. Kortene støtter aktiv gjenkalling, og quizen gir fasit og en ny runde ved full pott. |
| Kildelenker og kildeutdrag | Med i MVP. Studenten skal kunne sjekke et svar eller sammendragspunkt mot den aktuelle PDF-siden. |
| Flere PDF-er, skannede dokumenter og samarbeid | Utsatt. Én tekstbasert PDF og én student per økt gir et avgrenset omfang å implementere og teste. |

## Ideer som ble konkretisert under utprøving

- Råtekst fra et lysbilde ga lite studiestøtte. Sammendraget fikk forklarende avsnitt, og kildevisningen beholdt de to kolonnene på det aktuelle anatomilysbildet.
- Spørsmål om hvilken kolonne et navn står i, ble erstattet med selvstendige fagspørsmål. Sidelenker hører hjemme i fasiten.
- Kildepanelet ble endret til å vise bare den valgte siden. Brukeren bekreftet resultatet i en ren kopi av appen.

Grunnlag: [Product brief](../../../product-brief.md), [PRD](../prds/prd-Programmering%20med%20AI%202026-2026-11-04/prd.md), [rettelse av kildevisningen](https://github.com/IBE160-2026/G133-magnussen/pull/2) og [testlogg](../../../app/TESTLOGG.md).
