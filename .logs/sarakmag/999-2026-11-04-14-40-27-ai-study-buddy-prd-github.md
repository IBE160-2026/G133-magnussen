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

## 2026-11-14 kl. 16:58 — sarakmag

### Oppgave
Fortsett PRD-gjennomgangen med en teknisk prøve av PDF-grensene, sidevis tekstuttrekk og Gemini-tokenbruk før arkitektur og kostnadsgrense låses. Finn en brukbar, åpent lisensiert 50-siders anatomikilde.

### Plan
- Undersøk om repoet har implementert app- eller leverandørflyt.
- Prøv filstørrelse, sidetall, lokalt tekstuttrekk og 20-tegnsterskelen.
- Finn og kontroller en CC BY 4.0-test-PDF, og mål Gemini-tokenbruk uten å vise eller logge API-nøkkelen.
- Dokumenter hva prøven viser og hva som fortsatt krever en ekte app-/leverandørintegrasjon.

### Resultat
Repoet inneholder foreløpig ikke appkode eller Gemini-integrasjon. Lokale gyldige PDF-fixtures viste 50 sider ved nøyaktig 20 000 000 byte og 20 000 001 byte, samt en 51-siders PDF. I en midlertidig proof of concept ble 19 ikke-whitespace-tegn avvist, 20 akseptert og whitespace alene avvist. Demo-PDF-en ble lest som tre brukbare sider med 868–1 070 ikke-whitespace-tegn per side. Deretter ble en 50-siders, 431 902-byte anatomiprøve fra Virginia Tech Publishing laget fra *Applied Human Anatomy* (CC BY 4.0); 46 sider bestod FR-3-terskelen og fire ble ekskludert. Gemini `countTokens` målte 10 959–10 960 input-tokens per ressursforespørsel inkludert dokumenttekst og typeprompt, men ekskluderte systeminstruksjon og strukturert skjema. Seks `generateContent`-forsøk på Free Tier returnerte HTTP 503; ingen resultater eller output-tokens ble målt, og flere forsøk ble stoppet. Free Tier-vilkårene om produktforbedring og et foreløpig prisestimat er dokumentert i PRD §9. Test-PDF-en er visuelt kontrollert og klar i `output/pdf/`. Midlertidige grensefiler og renderingbilder ble ryddet bort. PRD-endringen og test-PDF-en er ikke committet.

### Åpne punkter
- Implementer appens faktiske grense- og uttrekksflyt og kjør den med den nye anatomiprøven og senere gruppens tillatte kurs-PDF.
- Gjenta de fire ressursforespørslene og mål faktisk output/source-verifisering når Gemini-generering er tilgjengelig; fastsett deretter kostnadsgrensen.
- Avgjør i arkitekturen om MVP må bruke betalt Gemini-tier fordi Free Tier kan bruke prompts og svar til produktforbedring; kontroller også Files API-sletting hvis den brukes.

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
