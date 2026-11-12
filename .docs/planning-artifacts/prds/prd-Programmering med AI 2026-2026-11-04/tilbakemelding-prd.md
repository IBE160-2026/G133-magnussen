# Tilbakemelding på PRD

| | |
|---|---|
| **Gruppe** | G133 – G133-magnussen |
| **PRD vurdert** | `.docs/planning-artifacts/prds/prd-Programmering med AI 2026-2026-11-04/prd.md` (status i frontmatter: final, sist endret 2026-11-09, commit 61ab6be) |
| **Dato** | 2026-11-12 |
| **Type** | Formativ tilbakemelding, ikke karakter |

## 1. Samlet inntrykk

Dette er en konkret og gjennomarbeidet PRD med en tydelig tese (kildesjekking som del av studieflyten), en reell målgruppe og ni FR-er som stort sett kan bli testtilfeller. Den største risikoen er at «Ubekreftet» bare fanger opp *manglende* kildeinformasjon, ikke *feil* kildeinformasjon, og at KI-delen (feil fra språkmodellen, kostnad, kjøring uten nøkkel) ikke er kravsatt ennå.

## 2. Dette fungerer godt

- **Tydelig, ærlig posisjonering.** §1 sier at «this is a focused workflow, not a claim that source-grounded generation is unique», og nevner Gemini Notebook og Quizlet. Det er en troverdig vision som ikke kunne limes inn i en annen PRD.
- **Konkret målgruppe og språkkrav.** §2 peker på fysioterapistudenter som lærer norske og latinske muskelnavn, og §5 sier at spørsmål om latinske termer skal ha latinsk svar. Det gir designet og testene noe å bygge på.
- **Ærlige avgrensninger.** FR-9 og §3 definerer sesjonsbegrepet presist, §6 har en nyttig Non-Goals-liste, og §1 og §4.4 sier tydelig at kildehenvisninger ikke garanterer faglig korrekthet.

## 3. Oversikt per dimensjon

| Dimensjon | Vurdering | Kort begrunnelse |
|---|---|---|
| Beslutningsklarhet | god | Valg er tatt (sidetall, grenser på 20 MB og 50 sider), men avveininger som «én side uten lesbar tekst stopper alt» er ikke begrunnet. |
| Substans | sterk | Innholdet er fortjent og produktspesifikt, uten pynte-personas eller boilerplate-NFR-er. |
| Strategisk sammenheng | god | Alle funksjoner tjener kildesjekking, men selve sjekken er svakere enn teksten lover (se 4.1). |
| Testbarhet | god | De fleste FR-er har målbare konsekvenser. FR-2 er uklar, og SM-2 mangler terskel. |
| Scope og avgrensning | god | Non-Goals og MVP-grenser er tydelige. Bildetunge lysbilder og feil fra språkmodellen er ikke omtalt. |
| Brukbarhet for neste fase | god | Faste ID-er (FR-1–9, SM-1–4) og en nyttig nøkkelbegreps-liste. Visning av kilden mangler for UX. |
| Formtilpasning | sterk | Ett UJ for én enkel flyt og en lett PRD passer produktet. |

## 4. Viktigste forbedringer

### 4.1 «Ubekreftet» fanger bare manglende, ikke feil kildeinformasjon
- **Alvorlighet:** høy
- **Hvor:** §3 «Unverified item — A summary point without a source page number…», FR-5–FR-8, motmåling i §8
- **Problem og hvorfor det betyr noe:** Hele tesen er at studenten kan stole på kildehenvisningene. Men en språkmodell kan oppgi et sidetall og et «utdrag» som ser riktige ut, og likevel er feil eller diktet opp. Med dagens definisjon får slike elementer ingen merking, og motmålingen sjekker kun at manglende kilde merkes. Briefen foreslo allerede en automatisk kontroll, men dette er ikke fulgt opp. Arkitektur og tester får dermed ikke et krav å bygge mot.
- **Forslag:** Legg til et FR, for eksempel: «Appen kontrollerer at hvert kildeutdrag finnes i teksten på oppgitt side. Finnes det ikke, merkes elementet «Ubekreftet». *Konsekvens:* en testfil der utdraget er endret til tekst som ikke står i PDF-en, gir «Ubekreftet».» Utvid definisjonen av *Unverified item* til å dekke både manglende og ikke-bekreftede henvisninger.

### 4.2 KI-kontroll, kostnad og kjøring uten nøkkel er ikke kravsatt
- **Alvorlighet:** høy
- **Hvor:** §5 «Uploaded data», FR-3 (kun uttrekksfeil), §9 «No unresolved user-facing product questions remain»
- **Problem og hvorfor det betyr noe:** Ingen krav sier hva studenten ser hvis språkmodellen svarer med feil format, avbryter eller er utilgjengelig. Det står heller ingenting om kostnad per opplasting, eller hvordan appen kan kjøres og testes uten gruppens API-nøkkel (demomodus eller lagrede svar). Briefen påpekte dette, og det er ikke fulgt opp. Uten dette kan ikke stories og tester for KI-delen skrives.
- **Forslag:** Legg til for eksempel: «Hvis genereringen mislykkes eller svaret ikke kan tolkes, viser appen en norsk feilmelding og ingen delvis ressurs. *Konsekvens:* med mock-svar som er ugyldige, vises feilmeldingen.» Og: «Appen kan startes i demomodus med en eksempel-PDF og lagrede svar uten API-nøkkel.» Sett en grense for hvor mange genereringer som kan kjøres per sesjon.

### 4.3 FR-2 er overlesset og tvetydig
- **Alvorlighet:** medium
- **Hvor:** FR-2 «only if it extracts readable text from every PDF page that contains selectable text»
- **Problem og hvorfor det betyr noe:** FR-2 blander tre ting: tekstuttrekk, filgrenser og en intern avklaring med leverandøren («Before implementation, the project confirms…»), som er en oppgave og ikke et krav. «Readable» er ikke definert. En side med bare bilde teller ikke med, så et lysbildesett med mange bildesider kan gi et resultat bygget på bare en brøkdel av sidene, uten at studenten får vite det. Én dårlig side stopper alt, og den avveiningen er ikke begrunnet.
- **Forslag:** Del opp: FR-2 «Filgrenser» (20 MB / 50 sider) og FR-3 «Tekstuttrekk». Definer «lesbar», for eksempel «minst 20 tegn per side». Legg til: «Sider uten uttrekkbar tekst listes for studenten før generering.» Flytt leverandørsjekken til §9 Open Questions.

### 4.4 SM-2 har ingen terskel, og motmålingen er ikke en motmåling
- **Alvorlighet:** medium
- **Hvor:** SM-2 «Record matches, mismatches, and missing references», «Counter-metric»
- **Problem og hvorfor det betyr noe:** Ifølge §8 består en test når *alle* utfall er oppfylt, men SM-2 forventer samtidig at det finnes avvik. Det er uklart når kildekvaliteten er god nok. Motmålingen gjentar bare et krav fra FR-5–8 og har ingen ID.
- **Forslag:** Sett en terskel: «For hver av 2–3 testfiler trekkes 20 elementer tilfeldig. Minst 90 % har utdrag som finnes på oppgitt side. Resten skal være merket «Ubekreftet».» En ekte motmåling kan være: «Antall genererte elementer må ikke økes på bekostning av andelen bekreftede.» Kall den SM-C1.

### 4.5 Hvordan studenten kontrollerer kilden er ikke beskrevet
- **Alvorlighet:** medium
- **Hvor:** §3 «PDF viewer page number(s)», §2.1 «Check generated study resources against the uploaded course material»
- **Problem og hvorfor det betyr noe:** PRD-en refererer til en «PDF viewer», men ingen FR sier at appen viser PDF-en eller hopper til en side. Kildesjekk er hovedpoenget, og UX-arbeidet trenger å vite om det er sidetall og utdrag som gjelder, eller om PDF-en vises ved siden av.
- **Forslag:** Velg og skriv inn: «Når studenten velger et sidetall, vises den siden fra PDF-en ved siden av ressursen.» Eller sett det i §6 som uttrykkelig utenfor MVP.

## 5. Mekaniske funn

- ID-er er sammenhengende (FR-1–9, SM-1–4, UJ-1), og SM-ene henviser til riktige FR-er. FR-ene sier ikke «realizes UJ-1».
- Seksjonen «Key Terms» fyller rollen som glossar, men «topic», «quiz» og «summary point» er ikke definert. «Study session»/«Study resource» skrives med og uten stor bokstav. FR-5–8 bruker «source page number(s)» i stedet for det definerte «Source reference».
- Én [ASSUMPTION] er indeksert i §10 (FR-2), men ingen `[ASSUMPTION: …]`-tagg står inline i FR-2, så indeksen går ikke opp mot teksten.
- Underspesifisert: hva «retake» betyr i FR-8 (samme spørsmål, nye spørsmål?), hva en «request» er i FR-7, og om et ekstra PDF-opplasting i samme sesjon er tillatt.

## 6. Før dere går videre

**Må avklares før UX, arkitektur og epics:**
- Hvordan «Ubekreftet» skal oppdage feil henvisning (4.1), og hva studenten ser når genereringen feiler (4.2).
- Hvordan studenten ser kilden (4.5).
- Om leverandøren klarer 50 sider og 20 MB. §9 sier «no unresolved questions», men det er det som er åpent.

**Kan vente:** terskler i SM-2, finpuss av glossar, og detaljer om retake og flashcard-«request».

**Oppfølging av briefen:** Delvis. Konkret målgruppe, ærlig sammenligning med eksisterende verktøy og testbare kriterier for kildehenvisning og uttrekksfeil er på plass. Demomodus, kostnadsplan og automatisk kontroll av at utdraget finnes på siden er ikke fulgt opp.

## 7. Refleksjonsspørsmål

1. Hvor mange av de ni FR-ene er skrevet av KI uten at dere har prøvd å bryte dem? Prøv å gi en tenkt språkmodell en PDF der den kan finne på et sidetall, og se om PRD-en fanger det opp.
2. FR-2 krever lesbar tekst fra *hver* side. Var dette et bevisst valg, eller noe dere godtok fra et KI-forslag? Hva skjer med en lysbildefil full av anatomibilder?

_Vurdert mot kvalitetsrubrikken i bmad-prd. Dette er veiledning, ikke sensur._
