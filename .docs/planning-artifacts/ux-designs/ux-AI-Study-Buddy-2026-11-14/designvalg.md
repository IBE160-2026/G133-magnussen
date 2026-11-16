# Designvalg for AI Study Buddy

Vi valgte **Side ved side**, en av de fire lyseblå variantene i den senere Kildespor-runden. Studenten kan lese en studieressurs og åpne den siterte PDF-siden i samme arbeidsflate. Det gjør det lettere å kontrollere kildeutdrag og sammenligne informasjon som er fordelt på flere kolonner i originalen.

[Se «Side ved side» i den blå konseptrunden](concepts/kildespor-fire-bla-varianter.svg#konsept-2). De fire [tidlige konseptene](concepts/README.md) viser utforskingen som kom før denne runden. [UX-beskrivelsen](EXPERIENCE.md), [skjermskissen](screen-sketch.md) og [designbeskrivelsen](DESIGN.md) dokumenterer arbeidet med den tidlige prototypen. Designbeskrivelsens teal-palett tilhører den fasen. Den kjørbare appen bruker den senere lyseblå retningen.

## Fra design til app

| Behov | Løsning i den kjørbare appen |
| --- | --- |
| Sjekke et faglig poeng mot PDF-en | En kildeknapp åpner et bilde av den valgte siden i kildepanelet. Hele dokumentet kan åpnes i en egen fane. |
| Lese på ulike skjermstørrelser | Appen viser studieressurs og kilde ved siden av hverandre på bred skjerm, og plasserer kildepanelet under ressursene på smal skjerm. |
| Øve på fagstoffet | Flashcards viser svaret og kilden etter **Vis svar**. Quiz viser fasit og kilder etter levering. |
| Forstå quizresultatet | Fasiten bruker både tekst og farge for å vise riktige, feil og ubesvarte spørsmål. Omforsøk stokker spørsmålene. Full pott i første runde åpner et nytt sett. |

Ved innleveringstesten åpnet nettleseren først hele PDF-en fra en sidelenke. Etter rettelsen bekreftet brukeren at kildepanelet viste bare side 3. Testloggen for commit `b870e9f` dekker også flashcards og quiz. Oppsettet for smale skjermer er implementert i CSS. Full mobil- og tilgjengelighetstesting er ikke dokumentert i testloggen.

[Appkode](../../../../app/index.html) · [Testlogg](../../../../app/TESTLOGG.md) · [Rettelse av kildevisningen](https://github.com/IBE160-2026/G133-magnussen/pull/2)
