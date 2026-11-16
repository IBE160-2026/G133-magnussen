# Arkitektur for AI Study Buddy

*Skrevet i etterkant 16. november 2026, basert på appkoden, README og innleveringstesten.*

| Del | Teknologivalg og ansvar |
|---|---|
| Nettleser | HTML, CSS og JavaScript i `app/index.html` håndterer opplasting, visning av ressurser, øving og kildepanelet. |
| Lokal server | Node.js 24 med innebygd HTTP-server serverer grensesnittet på loopback og behandler forespørsler om PDF-uttrekk og sidebilder. Appen har ingen npm-avhengigheter. |
| PDF-behandling | macOS PDFKit via `osascript` leser tekst per side og rendrer en valgt side som PNG. Denne avhengigheten forklarer kravet om macOS. |
| Generering | Demo-PDF-en gjenkjennes med filhash og får lagrede JSON-ressurser. Ved valgt Gemini-generering sendes uttrekkbar tekst fra brukbare sider til leverandøren. Nøkkelen leses på serveren. Kildeutdrag kontrolleres mot teksten på angitt side. |
| Lagring | MVP-en bruker ingen database. Demoressursene ligger i JSON-filer i repoet. Aktiv fil, ressurser og svar holdes i nettleserens økt. Serveren sletter midlertidige PDF-filer og sidebilder etter forespørselen. Dette dekker MVP-omfanget med én PDF og uten lagret studiehistorikk. |

PDF-en går fra nettleseren til den lokale serveren for uttrekk. Serveren returnerer sidetekst og eventuelle studieressurser som JSON. Ved kildeklikk sender nettleseren PDF-en til serveren for å få et bilde av akkurat den valgte siden.

Den leverte løsningen bruker lokal Node og PDFKit. Appens README dokumenterer avviket fra planlagt Next.js/PDF.js. Begrensningene på åtte liveforespørsler og prosjektets kostnadstak er krav i PRD-en som ikke håndheves i serverkoden. Leverandørens datalagring og appens liveflyt med representativ maksimalfil gjenstår å dokumentere.

[Oppstart og teknologivalg](../../../app/README.md) · [Server](../../../app/server.mjs) · [Gemini og kildekontroll](../../../app/gemini-summary.mjs)
