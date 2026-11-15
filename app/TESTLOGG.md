# Innleveringstest av AI Study Buddy

| Testgrunnlag | Verdi |
| --- | --- |
| Dato | 15. november 2026 |
| Git-versjon | `b870e9f` på `main` |
| Oppsett | Ren kopi på macOS, lokal Node-server på port 4184 |
| Testfil | `app/demo-anatomi-ai-study-buddy.pdf` |
| Gemini | Demo uten API-nøkkel |

## Manuell test i nettleseren

| Flyt | Bekreftet resultat |
| --- | --- |
| Velg demo-PDF-en, trykk **Les PDF** og velg **Side 3** | Kildepanelet viste bare side 3. |
| Åpne **Flashcards** og velg **Vis svar** | Svaret og kildelenken ble vist. |
| Lever **Quiz** med feil eller ubesvarte spørsmål og prøv igjen | De samme spørsmålene kom i en annen rekkefølge. |
| Svar riktig på alle i første runde og velg **Start neste quiz** | Neste runde viste andre spørsmål. |

Kildevisningen ble testet på nytt etter at [PR #2](https://github.com/IBE160-2026/G133-magnussen/pull/2) ble flettet inn. Rettelsen viser et bilde av den valgte siden i kildepanelet og tilbyr hele PDF-en i en egen fane.
