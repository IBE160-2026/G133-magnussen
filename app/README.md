# AI Study Buddy

En lokal studieapp som bruker én PDF til sammendrag, nøkkelbegreper, flashcards og quiz med kildelenker. Denne versjonen krever macOS med PDFKit og Node.js 24. Den har ingen npm-avhengigheter.

## Start og prøv uten API-nøkkel

Kjør fra roten av repoet:

```sh
node app/server.mjs
```

Åpne http://127.0.0.1:4173. Velg `app/demo-anatomi-ai-study-buddy.pdf` med **Velg PDF**, la Gemini-valget stå av og trykk **Les PDF**. Den medfølgende PDF-en inneholder kilde- og lisensopplysninger. Den har ferdige studieressurser for å gjøre demoen kjørbar uten nett.

1. Bytt mellom **Sammendrag** og **Nøkkelbegreper**, og åpne en kilde.
2. Velg **Flashcards**, vis svaret og åpne kilden.
3. Velg **Quiz**. Lever med minst ett feil eller ubesvart spørsmål for å se fasiten. Prøv på nytt og kontroller at de samme spørsmålene har en annen rekkefølge. Ved full pott åpner **Start neste quiz** en runde med andre spørsmål.

Du kan velge en annen port med `PORT=4175 node app/server.mjs`.

## Generer med Gemini

Kopier `app/.env.example` til `app/.env.local` og fyll inn din egen `GEMINI_API_KEY` lokalt. Start deretter med:

```sh
node --env-file=app/.env.local app/server.mjs
```

Kryss av for **Lag studieressurser med Gemini** før du trykker **Les PDF**. PDF-filen behandles lokalt. Uttrekkbar tekst sendes til Gemini bare når valget er på. API-nøkkelen brukes på serveren. `GEMINI_MODEL` kan overstyre Gemini 3.5 Flash.

## Omfang og testgrunnlag

- Appen godtar én ulåst PDF på maksimalt 20 MB og 50 sider. Den oppgir hvilke sider som har lite uttrekkbar tekst.
- Kildelenker peker til fysisk PDF-side. Gemini-utdrag appen ikke finner på den siterte siden, vises som «Ubekreftet».
- Med den opprinnelige, lokale `Muskler.pdf` ble 13 av 15 sider brukt. Sidene 7 og 15 manglet uttrekkbar tekst. Side 13 beholdt de mobiliserende og stabiliserende musklene i separate grupper. Forelesnings-PDF-en følger ikke med repoet.
- Etter utprøving ble råtekst flyttet bak et eget valg og sammendraget satt først. Flashcards og quiz fikk selvstendige fagspørsmål. Quizfasiten viser riktig, feil og ubesvart med tekst og farge.
- Denne versjonen bruker en lokal Node-server og macOS PDFKit. Det avviker fra den planlagte Next.js/PDF.js-arkitekturen og begrenser kjøring til macOS.
