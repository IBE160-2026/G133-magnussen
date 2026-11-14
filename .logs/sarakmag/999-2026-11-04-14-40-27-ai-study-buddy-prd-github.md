# AI Study Buddy PRD til GitHub

## 2026-11-04 kl. 14:40 — sarakmag

### Oppgave
Brukeren ba om å sende den oppdaterte AI Study Buddy PRD-en til GitHub og presiserte at arbeidet må følge BMAD.

### Plan
- Følg BMAD PRD-oppsettet og før de siste avklaringene i PRD-ens memlog.
- Commit PRD-en med memloggen og push til GitHub.

### Resultat
PRD-en og BMAD-memloggen ble lagt til i commit `f2baefa` og pushet til `origin/main`. PRD-statusen står fortsatt som `draft`.

### Åpne punkter
- Bekreft i arkitekturarbeidet at valgt språkmodell kan håndtere PDF-er på opptil 50 sider og 20 MB. Juster grensene før implementering hvis den ikke kan det.
- Undersøk hvor lenge valgt språkmodell-leverandør lagrer opplastede PDF-er og generert innhold.

## 2026-11-14 kl. 16:23 — sarakmag

### Oppgave
Fortsett PRD-gjennomgangen med en teknisk prøve av PDF-grensene og sidevis tekstuttrekk før arkitektur og kostnadsgrense låses.

### Plan
- Undersøk om repoet har implementert app- eller leverandørflyt.
- Prøv filstørrelse, sidetall, lokalt tekstuttrekk og 20-tegnsterskelen.
- Dokumenter hva prøven viser og hva som fortsatt krever en ekte app-/leverandørintegrasjon.

### Resultat
Repoet inneholder foreløpig ikke appkode eller Gemini-integrasjon, og ingen `GEMINI_API_KEY` er konfigurert. Lokale gyldige PDF-fixtures viste 50 sider ved nøyaktig 20 000 000 byte og 20 000 001 byte, samt en 51-siders PDF. I en midlertidig proof of concept ble 19 ikke-whitespace-tegn avvist, 20 akseptert og whitespace alene avvist. Demo-PDF-en ble lest som tre brukbare sider med 868–1 070 ikke-whitespace-tegn per side. Ingen provider-kall ble gjort. Fixture-filene ble slettet etter prøven. PRD §9 dokumenterer resultatene og begrensningene. PRD-endringen er ikke committet.

### Åpne punkter
- Kjør appens faktiske grense- og uttrekksflyt med en representativ, tillatt 40–50-siders kurs-PDF, inkludert sider under terskelen.
- Mål Gemini-tokenbruk for fire ressursforespørsler og åtte forespørsler per sesjon, og fastsett kostnadsgrensen etter faktisk måling.
- Leverandørens publiserte rammer og lagringsvilkår er dokumentert i PRD §9; bekreft at valgt integrasjon følger disse vilkårene i arkitektur/implementasjon.

## 2026-11-09 kl. 10:57 — sarakmag

### Oppgave
Brukeren bekreftet at PRD-innholdet er ferdig. Fullfør BMAD-finaliseringen.

### Plan
- Avstem PRD-en mot produktbriefen og BMAD-malen.
- Sett PRD-status til `final`, oppdater datoen og loggfør finaliseringen i BMAD-memloggen.

### Resultat
PRD-statusen ble endret fra `draft` til `final`, og `updated` satt til 2026-11-09. Avstemmingen fant at kildehenvisninger på alle fire ressurstypene er en tilsiktet videreutvikling av briefen. Endringen ble committet i `61ab6be`.

### Åpne punkter
- Bekreft i arkitekturarbeidet at valgt språkmodell kan håndtere PDF-er på opptil 50 sider og 20 MB. Juster grensene før implementering hvis den ikke kan det.
- Undersøk hvor lenge valgt språkmodell-leverandør lagrer opplastede PDF-er og generert innhold.
