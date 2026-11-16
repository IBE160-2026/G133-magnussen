# Design og UX

*Skrevet i etterkant 16. november 2026, basert på appkoden, utviklingsiterasjonene og innleveringstesten.*

En fysioterapistudent velger én PDF, trykker **Les PDF** og åpner en av fire studieressurser. Sammendraget vises først. Råteksten kan åpnes ved behov. Når studenten velger en sidelenke, vises den fysiske PDF-siden i kildepanelet ved siden av ressursen. Hele PDF-en kan åpnes i en egen fane.

**Hovedskjermen** har valg for PDF og generering, faner for studieressursene, og et kildepanel som oppdateres ved klikk på en sidelenke. Flashcards viser svaret og kildelenken sammen. Quizfasiten skiller mellom riktige, feil og ubesvarte svar. Omforsøk stokker samme sett, mens full pott i første runde gir et nytt sett i demoen.

| Situasjon | Det studenten ser |
|---|---|
| Lite uttrekkbar tekst | Appen viser antall brukbare sider og oppgir hvilke sider som ble utelatt. |
| Kildeutdraget kan ikke verifiseres | Utdraget vises med merket «Ubekreftet kildeutdrag». |
| Gemini-genereringen feiler | Appen viser en norsk feilmelding. PDF-sidene kan fortsatt åpnes. |

[Utviklingsiterasjoner](../forarbeid/iterasjoner.md) · [Hovedskjermens kode](../../../app/index.html) · [Innleveringstest](../../../app/TESTLOGG.md)
