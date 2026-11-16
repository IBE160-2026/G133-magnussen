# Utviklingsiterasjoner for AI Study Buddy

Oppsummert 16. november 2026 fra designarbeidet og testingen av appen.

## Iterasjoner fra idé til testet løsning

| Første forsøk | Tilbakemelding eller observasjon | Endring |
| --- | --- | --- |
| Fem visuelle konsepter, deretter fire blå varianter | Den rolige, blå retningen ble foretrukket. | Vi valgte **Side ved side** for å kunne lese en studieressurs og sjekke PDF-kilden samtidig. |
| Sammendraget viste råtekst og slo sammen to kolonner fra et anatomilysbilde. | Muskelnavnene mistet tilhørigheten sin, og teksten hang dårlig sammen. | Vi ga sammendraget forklarende temaer og beholdt **Mobiliserende** og **Stabiliserende** som separate grupper i testeksemplet. |
| Flashcards spurte hvilken kolonne et muskelnavn sto i. | Spørsmålet krevde at studenten så lysbildet, og testet lite faglig forståelse. | Vi skrev om kortene til selvstendige fagspørsmål og plasserte sidelenken sammen med svaret. |
| Quizen viste en enkel fasit og lot studenten prøve samme rekkefølge igjen. | Studenten ønsket tydelig skille mellom riktig og feil, og nye spørsmål ved full pott. | Fasiten merker riktig, feil og ubesvart. Ved omforsøk stokkes samme spørsmålssett. Full pott i første runde åpner et nytt sett. |
| Et klikk på en kilde kunne åpne hele PDF-en i panelet. | Ved innleveringstesten viste nettleseren dokumentet i stedet for bare den valgte siden. | Panelet viser nå bare det valgte lysbildet. Vi prøvde rettelsen fra en ren kopi av `main`. |

Grunnlag: [rettelse av kildevisningen](https://github.com/IBE160-2026/G133-magnussen/pull/2) og [testlogg](../../../app/TESTLOGG.md).
