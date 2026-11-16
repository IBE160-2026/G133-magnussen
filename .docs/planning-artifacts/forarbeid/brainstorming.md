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

## Iterasjoner fra idé til testet løsning

| Første forsøk | Tilbakemelding eller observasjon | Endring |
| --- | --- | --- |
| Fem visuelle konsepter, deretter fire blå varianter | Den rolige, blå retningen ble foretrukket. | Vi valgte **Side ved side** for å kunne lese en studieressurs og sjekke PDF-kilden samtidig. |
| Sammendraget viste råtekst og slo sammen to kolonner fra et anatomilysbilde. | Muskelnavnene mistet tilhørigheten sin, og teksten hang dårlig sammen. | Vi ga sammendraget forklarende temaer og beholdt **Mobiliserende** og **Stabiliserende** som separate grupper i testeksemplet. |
| Flashcards spurte hvilken kolonne et muskelnavn sto i. | Spørsmålet krevde at studenten så lysbildet, og testet lite faglig forståelse. | Vi skrev om kortene til selvstendige fagspørsmål og plasserte sidelenken sammen med svaret. |
| Quizen viste en enkel fasit og lot studenten prøve samme rekkefølge igjen. | Studenten ønsket tydelig skille mellom riktig og feil, og nye spørsmål ved full pott. | Fasiten merker riktig, feil og ubesvart. Ved omforsøk stokkes samme spørsmålssett. Full pott i første runde åpner et nytt sett. |
| Et klikk på en kilde kunne åpne hele PDF-en i panelet. | Ved innleveringstesten viste nettleseren dokumentet i stedet for bare den valgte siden. | Panelet viser nå bare det valgte lysbildet. Vi prøvde rettelsen fra en ren kopi av `main`. |

Grunnlag: [Product brief](../../../product-brief.md), [PRD](../prds/prd-Programmering%20med%20AI%202026-2026-11-04/prd.md), [rettelse av kildevisningen](https://github.com/IBE160-2026/G133-magnussen/pull/2) og [testlogg](../../../app/TESTLOGG.md).
