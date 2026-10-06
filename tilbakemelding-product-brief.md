# Tilbakemelding på product brief

| | |
|---|---|
| **Gruppe** | G133 – G133-magnussen |
| **Product brief** | `product-brief.md` (commit `bf26cec`) |
| **Tilbakemelding fra** | Faglærer i IBE160 (utarbeidet med KI-støtte) |
| **Dato** | 2026-10-06 |

## Samlet vurdering

- **Godt utgangspunkt med justeringer.** Gruppen kan gå videre og innarbeide punktene under.

Vi har vurdert `product-brief.md` i repoets rot. Det er den versjonen som ble oppdatert i commiten «Refine AI Study Buddy success criteria». Repoet har også en kopi i `.docs/planning-artifacts/briefs/brief-AI-Study-Buddy-2026-09-19/brief.md`, men den har den eldre formuleringen av suksesskriteriet («at least one useful summary, flashcard set, quiz, or key-concept overview»). Bestem hvilken fil som er gjeldende, og hold bare den ene oppdatert. Ellers kan PRD-en bygges på feil versjon.

**Det som er bra:**

1. Briefen har en tydelig og faglig begrunnet vinkling: «source-grounded learning». Hvert generert element skal kobles til utdrag eller steder i den opplastede PDF-en, slik at studenten kan sjekke det. Det skiller prosjektet fra en generell chatbot, og forskningsspørsmålet om «useful and verifiable learning resources» gir en rød tråd.
2. Avgrensningen er realistisk for et individuelt prosjekt. Bare tekstbaserte PDF-er, og ingen skannede dokumenter, samarbeid, LMS-integrasjon, mobilapp eller vurdering i MVP.

**De viktigste endringene:**

1. Suksesskriteriene bygger mye på brukertilbakemeldinger («should indicate that the application saves time», «improves students' confidence»). Det er vanskelig å måle og teste innen fristen. Legg til konkrete, funksjonelle kriterier, særlig for kildehenvisningene.
2. Briefen er generell og kunne passet mange Study Buddy-prosjekter. Gjør den til deres egen med en konkret brukssituasjon, for eksempel en student i et bestemt fag med en bestemt type lysbilder, og med eksempler på hva en god kildehenvisning ser ut som.
3. Beskriv hvordan sensor kan kjøre appen uten deres nøkkel til språkmodellen, og hvordan kostnaden holdes nede under utvikling.

## Vanskelighetsgrad og gjennomførbarhet

### Vurdert vanskelighetsgrad

- **Enkel**

**Sammenlignbart med:** 1) AI Study Buddy (enkel). Prosjektet er dette forslaget, med ekstra vekt på sporbarhet til kilden. Kildehenvisningene gjør det noe mer krevende enn grunnversjonen.

**Begrunnelse:**

| Faktor | Nivå (lav / middels / høy) | Kommentar |
|---|---|---|
| Domenelogikk – hvor mange og hvor kompliserte regler og beregninger må stemme? | lav | Få regler. Hovedlogikken er å koble generert innhold til riktig sted i dokumentet. |
| Datamodell – antall entiteter og relasjoner mellom dem | lav | Dokument (med sider eller utdrag), sammendrag, flashcards, quizspørsmål og nøkkelbegreper, hver med kildehenvisning. |
| Brukere, roller og innlogging | lav | Én bruker. Det er uklart om innlogging trengs. «Own documents» kan løses uten kontoer i v1. |
| KI-funksjonalitet i appen, f.eks. kall til språkmodell, prompts i koden og håndtering av usikre svar | middels | Fire typer generering med kildehenvisning. Å få språkmodellen til å oppgi riktige sider eller utdrag pålitelig er den viktigste utfordringen. |
| Integrasjoner og eksterne tjenester, f.eks. API-er, betaling og e-post | middels | Ett språkmodell-API. Ikke valgt ennå. |
| Sanntid, samtidighet eller flere brukere som påvirker hverandre | lav | Ingen. |
| Filhåndtering, f.eks. opplasting, PDF-lesing og eksport | middels | Opplasting og tekstuttrekk fra PDF med sidetall. Lysbilder har ofte lite eller rotete tekst. |
| Sikkerhet og personvern | lav | Studentens eget kursmateriale. Vær bevisst på opphavsrett hvis eksempelfiler skal ligge i det offentlige repoet. |

**Hva vanskelighetsgraden betyr for dere:**

- _Enkel:_ Et enkelt prosjekt gir stor sjanse for å bli ferdig. Vanskelighetsgraden inngår likevel i vurderingen, så for å nå helt opp må dere vise mer i gjennomføringen. Det betyr særlig et gjennomarbeidet design, grundig testing, en tydelig dokumentert prosess og en README som virker. Kildesporingen er det naturlige stedet å vise kvalitet: en tydelig side-ved-side-visning og tester som viser at henvisningene stemmer.

### Gjennomførbarhet med BMAD og Claude Code

Dere skal planlegge med BMAD (product brief → PRD → arkitektur → epics og stories) og implementere med Claude Code. Vurderingen under tar hensyn til at det må være tid til hele denne flyten, og til testing, retting og README til slutt.

| Spørsmål | Vurdering (OK / risiko / stor risiko) | Kommentar |
|---|---|---|
| **Tid og omfang** – kan v1 realistisk bli ferdig og stabil i løpet av semesteret, med tid til flere iterasjoner? | OK | Realistisk for én person. Fire genereringstyper og kildevisning er et passende omfang. |
| **BMAD-flyten** – er briefen konkret nok til at PRD, arkitektur og stories kan lages uten store hull, og blir det overkommelig mange stories? | OK | Funksjonene er tydelige nok for PRD. Presiser hva «source references or excerpts» betyr konkret (sidetall, sitat eller markering i dokumentet). |
| **Egnet for Claude Code** – bruker løsningen en vanlig, godt dokumentert teknologistakk som Claude Code håndterer godt, eller krever den nisjeteknologi, spesialmaskinvare eller mye manuell konfigurasjon? | OK | En webapp med PDF-uttrekk og LLM-kall er godt egnet. |
| **Kontroll på KI-ens arbeid** – kan gruppen selv avgjøre om koden gjør det riktige? Krever domenet kunnskap gruppen ikke har, f.eks. avanserte beregninger eller fagregler, så er det vanskelig å kvalitetssikre. | OK | Med testdokumenter fra et fag dere kjenner kan dere selv sjekke om sammendrag og henvisninger stemmer. |
| **Testbarhet** – finnes det tydelige regler og forventede resultater som tester kan skrives mot? | risiko | Opplasting, tekstuttrekk og flyten kan testes automatisk. At henvisningene peker riktig, kan sjekkes automatisk ved å kontrollere at sitert utdrag faktisk finnes på oppgitt side. KI-kvaliteten må ellers vurderes manuelt med et fast testsett. |
| **Kjørbar for sensor** – kan appen kjøres lokalt etter README, uten gruppens nøkler, betalte kontoer eller egen infrastruktur? | risiko | Ikke omtalt. Planlegg en demomodus med en eksempel-PDF og lagrede svar. |
| **Avhengigheter og kostnader** – krever løsningen betalte API-er, f.eks. språkmodeller, og finnes det en plan for kostnad, testmodus eller mock-data? | risiko | Lange PDF-er gir store prompter. Velg modell med kostnad i tankene, og bruk mock-svar i utvikling og tester. |

**Konklusjon om gjennomførbarhet:**

- **Gjennomførbart som beskrevet.**

**Forslag til justering av omfang eller vanskelighetsgrad:**

1. Gjør kildesporingen til en testbar funksjon. Hvert generert element får sidetall og et kort sitat, og appen kontrollerer selv at sitatet finnes på oppgitt side. Elementer som ikke kan verifiseres, merkes tydelig. Det styrker både kvaliteten og vanskelighetsgraden.
2. Når kjernen virker, vurder én utvidelse som gir mer å vise, for eksempel en enkel øvingsmodus for flashcards med «kan / kan ikke», eller lagring av studiesett per dokument.

## Hvorfor product brief er viktig for mappen

Product brief er utgangspunktet for PRD, arkitektur, stories og til slutt koden. Del 1 av mappen vurderes blant annet på om sensor kan følge en sporbar vei fra plan til ferdig app. Den vurderes også på om appen gjør det dere har beskrevet, om den er testet, om den er godt designet, og om den kan kjøres etter README. Et uklart, for stort eller for lite brief gjør alt dette vanskeligere senere. Det er mye enklere å rette nå enn sent i semesteret.

## 1. Gjennomgang av briefens deler

| Del av brief | Status | Kommentar |
|---|---|---|
| Executive Summary – er det klart hva appen er, og hvilket problem den løser? | OK | Klart: last opp tekstbaserte PDF-er og få sammendrag, flashcards, quiz og nøkkelbegreper med kildesporing. |
| The Problem – er problemet konkret, med reelle situasjoner og brukere? | Juster | Problemet er riktig, men generelt beskrevet. Legg til en konkret situasjon, for eksempel et bestemt fag med mange lysbilder før eksamen, og hva som gikk galt med en generell chatbot. |
| The Solution – beskriver løsningen brukeropplevelsen, ikke bare teknologi? | OK | Beskriver brukeropplevelsen og sammenligningen med kilden uten teknologidetaljer. |
| What Makes This Different – er vurderingen ærlig og realistisk? | Juster | Kildeforankring er et godt poeng, men flere eksisterende verktøy (for eksempel NotebookLM og Quizlet) gjør noe lignende. Nevn dem, og forklar hva dere gjør annerledes. |
| Who This Serves – er primærbrukerne tydelige, og vet vi hva de trenger? | Juster | «Higher-education students who work with text-heavy course material» er bredt. Beskriv én konkret primærbruker og brukssituasjon. |
| Success Criteria – kan kriteriene faktisk sjekkes eller testes? | Juster | Første avsnitt kan delvis sjekkes, men andre avsnitt bygger på brukerfeedback. Legg til kriterier som «for en testfil på 20 sider genereres alle fire ressurstyper», «hvert flashcard og quizspørsmål viser sidetall og et utdrag som finnes på den siden», «en skannet PDF uten tekst gir en forståelig feilmelding» og «svar uten gyldig kildehenvisning merkes tydelig». |
| Scope – er det klart hva som er med i første versjon, og hva som ikke er det? | OK | Tydelig hva som er inne og ute, med god begrunnelse. |
| Vision – henger visjonen sammen med resten uten å blåse opp omfanget? | OK | Visjonen holder fast ved åpenhet og blåser ikke opp v1. |

## 2. Utgangspunkt for del 1 av mappen

Punktene følger kriteriene i sensorveiledningen for del 1. Vektene i parentes viser hvor mye hvert kriterium teller i del 1.

| Kriterium i del 1 | Hva briefen bør legge til rette for | Status | Kommentar |
|---|---|---|---|
| **1. Prosess og KI-styring** (30 %) | Brief som er presis nok til at PRD og stories kan bygges direkte på den, slik at krav kan spores fra brief til kode. | Juster | Det er bra at suksesskriteriene er justert i en egen commit. Rydd opp i de to ulike versjonene av briefen, slik at sporbarheten blir entydig. |
| **2. Funksjonalitet og omfang** (20 %) | Realistisk omfang for gruppen og semesteret: en tydelig kjerneflyt som kan bli ferdig og stabil, og nok innhold til å vise reell funksjonalitet. | OK | Tydelig kjerneflyt (last opp → generer → sjekk mot kilde) med passende omfang. |
| **3. Kvalitetssikring og testing** (15 %) | Suksesskriterier og funksjoner som er konkrete nok til å bli testtilfeller. | Juster | Kildesporingen kan testes godt, men det må komme fram i suksesskriteriene. Lag et fast testsett med 2–3 PDF-er. |
| **4. Design og brukeropplevelse** (10 %) | Tydelige brukere og brukssituasjoner som designet kan bygges rundt, gjerne med de viktigste skjermbildene eller flytene skissert. | Juster | Skisser hvordan generert innhold og kilde vises sammen, for eksempel side ved side. Det er appens viktigste skjermbilde. |
| **5. Kodekvalitet og arkitektur** (10 %) | Teknologivalg som er begrunnet og ikke mer komplekse enn appen trenger. | OK | Ingen teknologi er låst. Hold PDF-uttrekk, LLM-kall og kildekontroll i hver sin modul. |
| **6. README og kjørbarhet** (10 %) | Løsning som andre kan kjøre lokalt uten betalte kontoer, og uten tilgang til gruppens egne tjenester og nøkler. | Juster | Planlegg demomodus eller mock-svar uten nøkkel, og legg ved en eksempel-PDF dere har lov til å publisere. |
| **7. Ryddighet i repoet** (5 %) | En plan for hvor hemmeligheter, testdata og dokumentasjon skal ligge. | Juster | Én gjeldende brief, testfiler i egen mappe og API-nøkkel i `.env` som ikke committes. |

## 3. Neste steg for gruppen

1. Velg én gjeldende brief (rot eller `.docs/…`), og slett eller synkroniser den andre.
2. Legg til funksjonelle, testbare suksesskriterier for kildesporingen, og flytt brukerfeedback til en egen evalueringsdel.
3. Gjør briefen mer konkret med en tydelig primærbruker og brukssituasjon, beskriv demomodus for sensor, og gå videre til PRD.

Oppdater product brief i repoet når dere har gjort endringene, slik at historikken viser hvordan planen utviklet seg. Det er en del av prosessen sensor ser etter.
