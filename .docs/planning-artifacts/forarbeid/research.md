# Research for AI Study Buddy

Oppsummering skrevet 16. november 2026 av prosjektets tidligere undersøkelser og tekniske utprøving.

## Spørsmål

Hvordan kan generativ KI gjøre studentens eget kursmateriale om til nyttige læringsressurser som studenten enkelt kan kontrollere mot kilden?

## Produkt og kildekontroll

Product briefen nevner NotebookLM og Quizlet som eksisterende verktøy i samme område. Dette var en orientering om relevante produkter. Det ble ikke dokumentert en systematisk funksjonssammenligning eller brukerintervjuer. Prosjektets valg var å konsentrere MVP-en om ett kursdokument og gjøre kildekontroll tilgjengelig i samme arbeidsflate som studieressursen.

## Teknisk utprøving

| Undersøkelse | Resultat og betydning |
| --- | --- |
| Norsk demo-PDF med tre sider | Den medfølgende prøven lot oss teste de fire ressurstypene, kildelenkene og kjøring uten API-nøkkel. [Demo-PDF](../../../app/demo-anatomi-ai-study-buddy.pdf) |
| Pilot med en offentlig anatomi-PDF på 50 sider | PRD § 9 dokumenterer at 46 sider hadde nok uttrekkbar tekst, og at forespørslene brukte omtrent 10 960 inputtokens før systeminstruksjon og skjema. Seks genereringsforsøk i piloten fikk HTTP 503. Piloten ga derfor ingen måling av utdata eller kildekvalitet. [PRD § 9](../prds/prd-Programmering%20med%20AI%202026-2026-11-04/prd.md#9-pre-implementation-decisions) |
| Lokal forelesnings-PDF | Appen fant nok tekst på 13 av 15 sider. Flatt tekstuttrekk blandet kolonnene på side 13. Den kjørbare macOS-versjonen bevarer gruppene i dette konkrete testtilfellet. [Oppstartsveiledning](../../../app/README.md) |
| Innleveringstest av den kjørbare versjonen | Etter en rettelse viste kildepanelet bare den valgte PDF-siden. Flashcards og de to quizrundene ble også prøvd. [Testlogg](../../../app/TESTLOGG.md) |

## Hva som står igjen

Piloten med 50 sider og testen av den kjørbare appen er separate undersøkelser. Full generering ved appens øvre PDF-grenser, kostnad per studieøkt og faglig kvalitet på tvers av flere kursdokumenter er fortsatt åpne spørsmål.
