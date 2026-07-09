# Alltagshilfe Manager UI-Design

_Started 2026-07-09 10:34 UTC_

---

## User

Entwirf das UI-Design für eine moderne SaaS-Webanwendung namens „Alltagshilfe Manager" — eine Verwaltungssoftware für Anbieter von Alltags- und Entlastungsleistungen (haushaltsnahe Dienstleistungen, Betreuung im Alltag nach § 45a/§ 45b SGB XI). Zielgruppe sind kleine bis mittlere Pflege- und Betreuungsdienste in Deutschland, die ihre Kunden, Abrechnung mit Kranken-/Pflegekassen und Einsatzplanung an einem Ort steuern wollen.
Nutzerprofil: Büroleitung und Disponenten mit wenig Zeit, oft nicht besonders technikaffin. Die Oberfläche muss aufgeräumt, selbsterklärend und effizient sein — schnelle Wege zu den häufigsten Aktionen.
Zu gestaltende Bereiche (als navigierbares Dashboard mit Seitenleiste):

Dashboard / Startseite – Kennzahlen-Kacheln (offene Rechnungen, anstehende Touren heute, verfügbares Entlastungsbudget der Kunden, neue Anfragen), Wochenübersicht und Aufgabenliste.
Kunden-CRM – Listenansicht + Detailseite pro Kunde: Stammdaten, Pflegegrad, zugeordnete Pflegekasse, Angehörige/Kontakte, verbrauchtes und verbleibendes Entlastungsbudget (125 €/Monat), Leistungshistorie, hinterlegte Dokumente.
Krankenkassen-/Kostenträger-CRM – Verwaltung der Kranken- und Pflegekassen: Institutionskennzeichen (IK), Ansprechpartner, Abrechnungswege, zugeordnete Kunden.
Leistungskatalog – Anlegen und Verwalten von Leistungen (z. B. Haushaltshilfe, Begleitung, Betreuung) mit Bezeichnung, Leistungskomplex/Kategorie, Preis/Stundensatz, Einheit und Zuordnung zur Abrechnungsart (Selbstzahler vs. Kasse).
Angebote & Rechnungen – Editor zum Erstellen von Angeboten und Rechnungen aus Leistungspositionen, mit Kundenauswahl, automatischer Summenberechnung, Status (Entwurf, versendet, bezahlt, offen) und einer Vorschau des fertigen Dokuments.
Mitarbeiterverwaltung – Anlegen von Mitarbeitern mit Qualifikationen, Verfügbarkeiten/Arbeitszeiten, Einsatzgebiet und Kontaktdaten.
Tourenplanung – Kalender-/Zeitschienen-Ansicht, in der Einsätze (Kunde + Leistung + Zeitfenster) Mitarbeitern zugewiesen werden. Idealerweise Drag-&-Drop-Optik, Tages-/Wochenansicht und eine kleine Kartenintegration zur Routenübersicht.

## Assistant

Ich baue das gerne auf. Bevor ich starte, ein paar kurze Fragen, damit die Richtung stimmt — die Antworten sparen später viele Korrekturschleifen.

_[tool: questions_v2]_

## User

Questions answered:
- fidelity: Hi-Fi Design — fertig gestaltete, klickbare Oberfläche mit echtem Look
- scope_first: Dashboard / Startseite, Entscheide du
- aesthetic: Ruhig & klinisch — viel Weißraum, dezente Akzente, ähnlich moderner Praxissoftware
- color: Grün — Fürsorge, Gesundheit, freundlich
- variations: Nein — eine gute, konsistente Richtung reicht
- density: Ausgewogen
- language: Komplett Deutsch

## Assistant

Klar — Hi-Fi, ruhig-klinisch, Grün, Deutsch, ausgewogene Dichte, eine konsistente Richtung. Ich baue alle sieben Bereiche als ein navigierbares Dashboard mit Seitenleiste.

Zuerst das System, das ich durchziehe:
- **Farbe:** gedämpftes Pflege-Grün `#2E7D63` als einziger Akzent, kühl-neutrale Grautöne, sehr helle Flächen. Status dezent (Bernstein/Rot/Blau nur als kleine Pills).
- **Typo:** Public Sans (UI) + IBM Plex Mono (IK-Nummern, Rechnungsnummern, Zahlen).
- **Icons:** Phosphor (feine Linien, professionell, keine gemalten SVGs).
- **Layout:** helle Seitenleiste, ruhiger Topbar, 12px-Karten, viel Weißraum.

_[tool: update_todos]_

Jetzt baue ich die komplette Anwendung in einem Design Component.

_[tool: dc_write]_

Let me check it renders cleanly across screens.

_[tool: show_html]_

_[tool: show_html]_

Dashboard renders cleanly. Let me verify the other screens quickly.

_[tool: multi_screenshot]_

Alles funktioniert. Ein UX-Detail: der Kunden-Menüpunkt sollte zuerst die Liste zeigen, nicht direkt ein Detail.

_[tool: dc_js_str_replace]_

_[tool: update_todos]_

Fertig — der **Alltagshilfe Manager** steht als vollständig navigierbares Hi-Fi-Dashboard.

_[tool: ready_for_verification]_

Alle sieben Bereiche sind angelegt und über die Seitenleiste anklickbar:

- **Dashboard** – KPI-Kacheln, Wochenübersicht, Touren heute, abhakbare Aufgaben, neue Anfragen
- **Kunden-CRM** – Liste → Detailseite mit Entlastungsbudget (125 €), Pflegekasse, Kontakten, Leistungshistorie, Dokumenten
- **Kostenträger** – Kassen mit IK-Nummern, Ansprechpartnern, Abrechnungswegen
- **Leistungskatalog** – Leistungen mit Kategorie, Preis, Abrechnungsart
- **Angebote & Rechnungen** – Liste + echte Dokumentvorschau (inkl. §45b-Hinweis, USt-Befreiung)
- **Mitarbeiter** – Karten mit Qualifikationen, Auslastung, Verfügbarkeit
- **Tourenplanung** – Tages-Zeitschiene pro Mitarbeiter + Kartenplatzhalter

Ruhig-klinisch, Grün als einziger Akzent, Public Sans + IBM Plex Mono für Zahlen/IK. Über die Tweaks kannst du die **Akzentfarbe** und ein **helles/dunkles Sidebar-Thema** umschalten.

Klickbar sind: alle Menüpunkte, Kundenzeilen (→ Detail), Rechnungen (→ Vorschau) und die Aufgaben-Häkchen. Sag einfach Bescheid, welchen Bereich ich als Nächstes vertiefen soll (z. B. echtes Drag-&-Drop in der Tourenplanung oder den Rechnungs-Editor).

