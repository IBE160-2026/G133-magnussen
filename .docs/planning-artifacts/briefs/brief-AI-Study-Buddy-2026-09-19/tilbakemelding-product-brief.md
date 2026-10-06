# Tilbakemelding på product brief

| | |
|---|---|
| **Gruppe** | G133 – G133-magnussen |
| **Product brief** | `.docs/planning-artifacts/briefs/brief-AI-Study-Buddy-2026-09-19/brief.md` (commit `8d35ab4`). Briefen i repoets rot, `product-brief.md`, har fått egen tilbakemelding i `tilbakemelding-product-brief.md` i rotmappen. |
| **Tilbakemelding fra** | Faglærer i IBE160 (utarbeidet med KI-støtte) |
| **Dato** | 2026-10-06 |

## Samlet vurdering

- **Godt utgangspunkt med justeringer.** Gruppen kan gå videre og innarbeide punktene under.

Denne fila er en eldre versjon av `product-brief.md` i roten, ikke en alternativ idé. En sammenligning med `diff` viser at de to filene er like, bortsett fra første setning under «Success Criteria»:

- **Denne fila (eldre):** «… upload a supported PDF and produce **at least one** useful summary, flashcard set, quiz, **or** key-concept overview in a straightforward **session**.»
- **`product-brief.md` (gjeldende):** «… upload a supported PDF and generate summaries, flashcards, quiz questions, **and** key concepts in a straightforward **workflow**.»

Rotfila ble endret i commiten «Refine AI Study Buddy success criteria» (`bf26cec`, 21. september). Denne fila ble lagt inn senere, i «Add BMAD project files» (`8d35ab4`, 23. september), men med teksten fra før endringen. Den nyeste commiten inneholder altså den eldste formuleringen. Det er lett å bli forvirret av. Resten av vurderingen er derfor den samme som for rotfila. Den eneste forskjellen er at suksesskriteriet her er svakere: Det holder at appen lager *én* av de fire ressurstypene, og den må være «useful». Bestem at én brief er gjeldende, og fjern eller merk den andre. Begrunnelsen er sporbarhet fra brief til PRD (kriterium 1) og ryddighet i repoet (kriterium 7).

**Det som er bra:**

1. Briefen har en tydelig og faglig begrunnet vinkling: «source-grounded learning». Hvert generert element skal kobles til utdrag eller steder i den opplastede PDF-en, slik at studenten kan sjekke det. Det skiller prosjektet fra en generell chatbot. Forskningsspørsmålet om «useful and verifiable learning resources» gir en rød tråd.
2. Avgrensningen er realistisk for et individuelt prosjekt. MVP-en tar bare imot tekstbaserte PDF-er, og den har ikke skannede dokumenter, samarbeid, LMS-integrasjon, mobilapp eller karaktersetting.

**De viktigste endringene:**

1. Ha bare én gjeldende brief. Kriteriet her krever «at least one … or …». Kriteriet i rotfila krever alle fire ressurstypene. Lages PRD fra denne fila, blir kravet til MVP-en lavere enn det dere selv har bestemt.
2. Suksesskriteriene bygger mye på brukertilbakemeldinger, som «should indicate that the application saves time» og «improves students' confidence». Det er vanskelig å måle og teste innen fristen. Ordet «useful» i første setning kan heller ikke testes. Legg til konkrete, funksjonelle kriterier, særlig for kildehenvisningene.
3. Briefen er generell og kunne passet mange Study Buddy-prosjekter. Gjør den til deres egen med en konkret brukssituasjon, og beskriv hvordan sensor kan kjøre appen uten nøkkelen deres til språkmodellen.

## Vanskelighetsgrad og gjennomførbarhet

### Vurdert vanskelighetsgrad

- **Enkel**

**Sammenlignbart med:** 1) AI Study Buddy (enkel). Prosjektet er dette forslaget, med ekstra vekt på at innholdet skal kunne spores til kilden. Kildehenvisningene gjør det noe mer krevende enn grunnversjonen. Kriteriet i denne versjonen krever bare én ressurstype. Det trekker i retning av det aller enkleste og gir enda mindre å vise.

**Begrunnelse:**

| Faktor | Nivå (lav / middels / høy) | Kommentar |
|---|---|---|
| Domenelogikk – hvor mange og hvor kompliserte regler og beregninger må stemme? | Lav | Appen har få regler. Hovedlogikken er å koble generert innhold til riktig sted i dokumentet. |
| Datamodell – antall entiteter og relasjoner mellom dem | Lav | Datamodellen har dokument (med sider eller utdrag), sammendrag, flashcards, quizspørsmål og nøkkelbegreper. Hvert element har en kildehenvisning. |
| Brukere, roller og innlogging | Lav | Appen har én bruker. Det er uklart om den trenger innlogging. «Own documents» kan løses uten kontoer i v1. |
| KI-funksjonalitet i appen, f.eks. kall til språkmodell, prompts i koden og håndtering av usikre svar | Middels | Appen har fire typer generering med kildehenvisning. Den viktigste utfordringen er å få språkmodellen til å oppgi riktige sider eller utdrag hver gang. |
| Integrasjoner og eksterne tjenester, f.eks. API-er, betaling og e-post | Middels | Appen bruker ett API til en språkmodell, men dere har ikke valgt hvilket ennå. |
| Sanntid, samtidighet eller flere brukere som påvirker hverandre | Lav | Ingen. Appen har én bruker og sine egne dokumenter. |
| Filhåndtering, f.eks. opplasting, PDF-lesing og eksport | Middels | Appen skal ta imot PDF-er og hente ut teksten med sidetall. Lysbilder har ofte lite tekst, eller teksten kommer ut i feil rekkefølge. |
| Sikkerhet og personvern | Lav | Innholdet er studentens eget kursmateriale. Tenk på opphavsrett hvis eksempelfiler skal ligge i det offentlige repoet. |

**Hva vanskelighetsgraden betyr for dere:**

- _Enkel:_ Et enkelt prosjekt gir stor sjanse for å bli ferdig. Vanskelighetsgraden inngår likevel i vurderingen, så for å nå helt opp må dere vise mer i gjennomføringen. Det betyr særlig et gjennomarbeidet design, grundig testing, en tydelig dokumentert prosess og en README som virker. Kildesporingen er det naturlige stedet å vise kvalitet, for eksempel med en tydelig visning der generert innhold og kilde står side ved side, og med tester som viser at henvisningene stemmer. Bruk derfor kriteriet med alle fire ressurstypene, ikke kravet om «at least one» i denne fila.

### Gjennomførbarhet med BMAD og Claude Code

Dere skal planlegge med BMAD (product brief → PRD → arkitektur → epics og stories) og implementere med Claude Code. Vurderingen under tar hensyn til at det må være tid til hele denne flyten, og til testing, retting og README til slutt.

| Spørsmål | Vurdering (OK / risiko / stor risiko) | Kommentar |
|---|---|---|
| **Tid og omfang** – kan v1 realistisk bli ferdig og stabil i løpet av semesteret, med tid til flere iterasjoner? | OK | Omfanget er realistisk for én person. Fire genereringstyper og kildevisning passer. Med bare én ressurstype, som denne versjonen tillater, blir omfanget for lite. |
| **BMAD-flyten** – er briefen konkret nok til at PRD, arkitektur og stories kan lages uten store hull, og blir det overkommelig mange stories? | Risiko | Funksjonene er tydelige nok for en PRD. Men det finnes to briefer med ulike krav til MVP-en, og BMAD-mappen inneholder den eldre av dem. Presiser også hva «source references or excerpts» betyr: sidetall, sitat eller markering i dokumentet. |
| **Egnet for Claude Code** – bruker løsningen en vanlig, godt dokumentert teknologistakk som Claude Code håndterer godt, eller krever den nisjeteknologi, spesialmaskinvare eller mye manuell konfigurasjon? | OK | En webapp som henter ut tekst fra PDF og kaller en språkmodell, passer godt for Claude Code. `.gitignore` er satt opp for både Node og Python. |
| **Kontroll på KI-ens arbeid** – kan gruppen selv avgjøre om koden gjør det riktige? Krever domenet kunnskap gruppen ikke har, f.eks. avanserte beregninger eller fagregler, så er det vanskelig å kvalitetssikre. | OK | Bruk testdokumenter fra et fag dere kjenner. Da kan dere selv sjekke om sammendragene og henvisningene stemmer. |
| **Testbarhet** – finnes det tydelige regler og forventede resultater som tester kan skrives mot? | Risiko | Opplastingen, tekstuttrekket og flyten kan testes automatisk. En automatisk test kan også sjekke at sitert utdrag faktisk finnes på oppgitt side. Kvaliteten på KI-svarene må ellers vurderes manuelt med et fast testsett. Ordet «useful» i denne versjonen gir ingen fasit å teste mot. |
| **Kjørbar for sensor** – kan appen kjøres lokalt etter README, uten gruppens nøkler, betalte kontoer eller egen infrastruktur? | Risiko | Briefen sier ikke noe om dette. Planlegg en demomodus med en eksempel-PDF og lagrede svar. |
| **Avhengigheter og kostnader** – krever løsningen betalte API-er, f.eks. språkmodeller, og finnes det en plan for kostnad, testmodus eller mock-data? | Risiko | Lange PDF-er gir store prompter. Velg modell med tanke på kostnaden, og bruk mock-svar i utviklingen og i testene. |

**Konklusjon om gjennomførbarhet:**

- **Gjennomførbart som beskrevet.**

**Forslag til justering av omfang eller vanskelighetsgrad:**

1. Gjør kildesporingen til en funksjon som kan testes. Hvert generert element får sidetall og et kort sitat, og appen kontrollerer selv at sitatet finnes på oppgitt side. Elementer som ikke kan verifiseres, merkes tydelig. Det gir bedre kvalitet og gjør prosjektet mer krevende.
2. Hold fast ved alle fire ressurstypene som krav til MVP-en, slik rotfila sier. Når kjernen virker, kan dere vurdere én utvidelse som gir mer å vise. Det kan være en enkel øvingsmodus for flashcards med «kan / kan ikke», eller lagring av studiesett per dokument.

## Hvorfor product brief er viktig for mappen

Product brief er utgangspunktet for PRD, arkitektur, stories og til slutt koden. Del 1 av mappen vurderes blant annet på om sensor kan følge en sporbar vei fra plan til ferdig app. Den vurderes også på om appen gjør det dere har beskrevet, om den er testet, om den er godt designet, og om den kan kjøres etter README. Et uklart, for stort eller for lite brief gjør alt dette vanskeligere senere. Det er mye enklere å rette nå enn sent i semesteret.

## 1. Gjennomgang av briefens deler

| Del av brief | Status | Kommentar |
|---|---|---|
| Executive Summary – er det klart hva appen er, og hvilket problem den løser? | OK | Det er klart hva appen gjør: Studenten laster opp tekstbaserte PDF-er og får sammendrag, flashcards, quiz og nøkkelbegreper som kan spores til kilden. Teksten er lik den i rotfila. |
| The Problem – er problemet konkret, med reelle situasjoner og brukere? | Juster | Problemet er riktig, men generelt beskrevet. Legg til en konkret situasjon, for eksempel et fag med mange lysbilder før eksamen. Fortell også hva som gikk galt med en generell chatbot. |
| The Solution – beskriver løsningen brukeropplevelsen, ikke bare teknologi? | OK | Teksten beskriver hva brukeren opplever og hvordan innholdet sammenlignes med kilden, uten teknologidetaljer. |
| What Makes This Different – er vurderingen ærlig og realistisk? | Juster | Kildeforankring er et godt poeng, men flere eksisterende verktøy gjør noe lignende, for eksempel NotebookLM og Quizlet. Nevn dem, og forklar hva dere gjør annerledes. |
| Who This Serves – er primærbrukerne tydelige, og vet vi hva de trenger? | Juster | «Higher-education students who work with text-heavy course material» er bredt. Beskriv én konkret primærbruker og brukssituasjon. |
| Success Criteria – kan kriteriene faktisk sjekkes eller testes? | Juster | Dette er den eneste delen som skiller seg fra rotfila, og den er svakere. Det holder at appen lager «at least one» av ressurstypene, og «useful» kan ikke testes. Andre avsnitt bygger på tilbakemeldinger fra brukere. Bruk formuleringen fra rotfila, og legg til testbare kriterier. Eksempler: «For en testfil på 20 sider lager appen alle fire ressurstypene», «hvert flashcard og quizspørsmål viser sidetall og et utdrag som finnes på den siden» og «svar uten gyldig kildehenvisning merkes tydelig». |
| Scope – er det klart hva som er med i første versjon, og hva som ikke er det? | OK | Det er tydelig hva som er med og ikke med, og valgene er godt begrunnet. Scope nevner alle fire ressurstypene. Det stemmer med rotfila, men ikke med kravet om «at least one» i denne fila. |
| Vision – henger visjonen sammen med resten uten å blåse opp omfanget? | OK | Visjonen holder fast ved åpenhet og gjør ikke v1 større. |

## 2. Utgangspunkt for del 1 av mappen

Punktene følger kriteriene i sensorveiledningen for del 1. Vektene i parentes viser hvor mye hvert kriterium teller i del 1.

| Kriterium i del 1 | Hva briefen bør legge til rette for | Status | Kommentar |
|---|---|---|---|
| **1. Prosess og KI-styring** (30 %) | Brief som er presis nok til at PRD og stories kan bygges direkte på den, slik at krav kan spores fra brief til kode. | Juster | Det er bra at suksesskriteriet ble justert i en egen commit. Men BMAD-mappen inneholder versjonen fra før justeringen. BMAD-verktøyene leter etter planleggingsdokumenter der, og da kan en PRD lett bygges på det svakere kravet. Bestem én gjeldende brief, slik at kravene blir entydige å spore. |
| **2. Funksjonalitet og omfang** (20 %) | Realistisk omfang for gruppen og semesteret: en tydelig kjerneflyt som kan bli ferdig og stabil, og nok innhold til å vise reell funksjonalitet. | Juster | Kjerneflyten er tydelig: last opp → generer → sjekk mot kilden. Men kravet om «at least one» ressurstype gir for lite å vise. Bruk kravet om alle fire. |
| **3. Kvalitetssikring og testing** (15 %) | Suksesskriterier og funksjoner som er konkrete nok til å bli testtilfeller. | Juster | Kildesporingen kan testes godt, men det må gå fram av suksesskriteriene. Lag et fast testsett med 2–3 PDF-er. |
| **4. Design og brukeropplevelse** (10 %) | Tydelige brukere og brukssituasjoner som designet kan bygges rundt, gjerne med de viktigste skjermbildene eller flytene skissert. | Juster | Skissér hvordan generert innhold og kilde vises sammen, for eksempel side ved side. Det er appens viktigste skjermbilde. |
| **5. Kodekvalitet og arkitektur** (10 %) | Teknologivalg som er begrunnet og ikke mer komplekse enn appen trenger. | OK | Dere har ikke låst noen teknologi ennå. Hold uttrekket fra PDF, kallene til språkmodellen og kontrollen av kildene i hver sin modul. |
| **6. README og kjørbarhet** (10 %) | Løsning som andre kan kjøre lokalt uten betalte kontoer, og uten tilgang til gruppens egne tjenester og nøkler. | Juster | Planlegg en demomodus eller mock-svar uten nøkkel. Legg ved en eksempel-PDF dere har lov til å publisere. README beskriver ennå ikke prosjektet og lenker ikke til briefen. |
| **7. Ryddighet i repoet** (5 %) | En plan for hvor hemmeligheter, testdata og dokumentasjon skal ligge. | Juster | To nesten like briefer på ulike steder er en «gammel versjon» av den typen sensor ser etter. `.docs/` er satt opp som BMADs mappe for utdata i `_bmad/config.toml`, men den er skjult i mange filutforskere. Samle planleggingsdokumentene på ett tydelig sted og lenk til dem fra README, legg testfiler i en egen mappe og hold API-nøkkelen i `.env`. `.gitignore` holder allerede `.env` utenfor repoet. |

## 3. Neste steg for gruppen

1. Velg én gjeldende brief. Enten oppdaterer dere denne fila med suksesskriteriet fra `product-brief.md` og sletter rotfila, eller så sletter dere denne fila og lar BMAD bruke rotfila. Sørg for at den neste PRD-en bygger på kravet om alle fire ressurstypene.
2. Legg til funksjonelle suksesskriterier for kildesporingen som kan testes. Flytt tilbakemeldinger fra brukere til en egen evalueringsdel.
3. Gjør briefen mer konkret med en tydelig primærbruker og brukssituasjon. Beskriv demomodusen for sensor, og lenk til den gjeldende briefen fra README. Gå deretter videre til PRD.

Oppdater product brief i repoet når dere har gjort endringene, slik at historikken viser hvordan planen utviklet seg. Det er en del av prosessen sensor ser etter.
