import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function d(iso: string) {
  return new Date(iso + "T00:00:00.000Z");
}

async function main() {
  console.log("Clearing existing data…");
  await prisma.tourAssignment.deleteMany();
  await prisma.invoiceLineItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.serviceRecord.deleteMany();
  await prisma.document.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.request.deleteMany();
  await prisma.task.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.service.deleteMany();
  await prisma.insurer.deleteMany();

  console.log("Seeding Kostenträger…");
  const [aok, tk, barmer, dak, ikk, kkh] = await Promise.all([
    prisma.insurer.create({
      data: { name: "AOK Bayern", ik: "108310400", contactPerson: "Frau Merten", phone: "0800 / 265 080", billingMethod: "DTA_302" },
    }),
    prisma.insurer.create({
      data: { name: "Techniker Krankenkasse", ik: "101575519", contactPerson: "Herr Alsen", phone: "0800 / 285 850", billingMethod: "DTA_302" },
    }),
    prisma.insurer.create({
      data: { name: "BARMER", ik: "104940005", contactPerson: "Frau Kühne", phone: "0800 / 333 004", billingMethod: "PAPIER_POST" },
    }),
    prisma.insurer.create({
      data: { name: "DAK-Gesundheit", ik: "101570104", contactPerson: "Frau Roth", phone: "0800 / 325 032", billingMethod: "DTA_302" },
    }),
    prisma.insurer.create({
      data: { name: "IKK classic", ik: "107202793", contactPerson: "Herr Petzold", phone: "0800 / 455 545", billingMethod: "PAPIER_POST" },
    }),
    prisma.insurer.create({
      data: { name: "KKH", ik: "102171012", contactPerson: "Frau Blum", phone: "0800 / 554 545", billingMethod: "DTA_302" },
    }),
  ]);

  console.log("Seeding Leistungskatalog…");
  const [haushaltshilfe, einkauf, waesche, grundreinigung, begleitung, betreuung, demenz, fahrt] = await Promise.all([
    prisma.service.create({ data: { name: "Haushaltshilfe", category: "HAUSHALTSNAHE_DL", billingType: "KASSE_45B", priceCents: 3200, unit: "pro Stunde", icon: "ph ph-broom" } }),
    prisma.service.create({ data: { name: "Einkaufs- & Besorgungshilfe", category: "HAUSHALTSNAHE_DL", billingType: "KASSE_45B", priceCents: 3200, unit: "pro Stunde", icon: "ph ph-shopping-cart-simple" } }),
    prisma.service.create({ data: { name: "Wäscheservice", category: "HAUSHALTSNAHE_DL", billingType: "SELBSTZAHLER", priceCents: 2800, unit: "pro Stunde", icon: "ph ph-t-shirt" } }),
    prisma.service.create({ data: { name: "Grundreinigung", category: "HAUSHALTSNAHE_DL", billingType: "SELBSTZAHLER", priceCents: 3000, unit: "pro Stunde", icon: "ph ph-spray-bottle" } }),
    prisma.service.create({ data: { name: "Begleitung bei Terminen", category: "BETREUUNG_IM_ALLTAG", billingType: "KASSE_45B", priceCents: 3400, unit: "pro Stunde", icon: "ph ph-person-simple-walk" } }),
    prisma.service.create({ data: { name: "Betreuung im Alltag", category: "BETREUUNG_IM_ALLTAG", billingType: "KASSE_45B", priceCents: 3600, unit: "pro Stunde", icon: "ph ph-hand-heart" } }),
    prisma.service.create({ data: { name: "Demenzbetreuung", category: "BETREUUNG_IM_ALLTAG", billingType: "KASSE_45B", priceCents: 3800, unit: "pro Stunde", icon: "ph ph-brain" } }),
    prisma.service.create({ data: { name: "Fahrtpauschale", category: "SONSTIGES", billingType: "SELBSTZAHLER", priceCents: 850, unit: "pro Einsatz", icon: "ph ph-car" } }),
  ]);

  console.log("Seeding Mitarbeiter…");
  const [sabine, thomas, yasemin, markus, petra, ahmet] = await Promise.all([
    prisma.staff.create({ data: { firstName: "Sabine", lastName: "Wolf", area: "München Süd", phone: "0170 / 22 14 05", qualifications: ["Betreuungskraft §43b", "Erste Hilfe"], availabilityLabel: "Mo–Fr", weeklyCapacityHours: 32 } }),
    prisma.staff.create({ data: { firstName: "Thomas", lastName: "Berg", area: "München Ost", phone: "0171 / 88 03 76", qualifications: ["Pflegehelfer", "Führerschein B"], availabilityLabel: "Mo–Sa", weeklyCapacityHours: 34 } }),
    prisma.staff.create({ data: { firstName: "Yasemin", lastName: "Demir", area: "München Zentrum", phone: "0152 / 40 91 33", qualifications: ["Betreuungskraft §43b", "Demenz"], availabilityLabel: "Di–Sa", weeklyCapacityHours: 30 } }),
    prisma.staff.create({ data: { firstName: "Markus", lastName: "Lang", area: "Freising / Dachau", phone: "0160 / 55 71 20", qualifications: ["Hauswirtschaft", "Führerschein B"], availabilityLabel: "Mo–Fr", weeklyCapacityHours: 28 } }),
    prisma.staff.create({ data: { firstName: "Petra", lastName: "Frank", area: "München West", phone: "0176 / 31 08 44", qualifications: ["Betreuungskraft §43b"], availabilityLabel: "Mo–Do", weeklyCapacityHours: 24 } }),
    prisma.staff.create({ data: { firstName: "Ahmet", lastName: "Yildiz", area: "München Nord", phone: "0157 / 92 66 18", qualifications: ["Pflegehelfer", "Erste Hilfe"], availabilityLabel: "Mi–So", weeklyCapacityHours: 28 } }),
  ]);

  console.log("Seeding Kunden…");
  const ingrid = await prisma.customer.create({
    data: { firstName: "Ingrid", lastName: "Bauer", street: "Lindenstraße 4", postalCode: "81543", city: "München", district: "Sendling", phone: "089 / 44 21 88", birthDate: d("1948-03-14"), careLevel: 3, status: "AKTIV", customerSince: d("2024-03-01"), insurerId: aok.id },
  });
  const herbert = await prisma.customer.create({
    data: { firstName: "Herbert", lastName: "Klein", street: "Tegernseer Landstr. 88", postalCode: "81539", city: "München", district: "Giesing", phone: "089 / 62 30 14", birthDate: d("1941-11-02"), careLevel: 2, status: "AKTIV", customerSince: d("2023-01-01"), insurerId: tk.id },
  });
  const waltraud = await prisma.customer.create({
    data: { firstName: "Waltraud", lastName: "Simon", street: "Landsberger Str. 210", postalCode: "81241", city: "München", district: "Pasing", phone: "089 / 88 04 52", birthDate: d("1937-07-22"), careLevel: 4, status: "AKTIV", customerSince: d("2022-09-01"), insurerId: barmer.id },
  });
  const josef = await prisma.customer.create({
    data: { firstName: "Josef", lastName: "Wagner", street: "Erdinger Str. 15", postalCode: "85356", city: "Freising", phone: "08161 / 55 10", birthDate: d("1944-01-30"), careLevel: 2, status: "PAUSIERT", customerSince: d("2024-11-01"), insurerId: dak.id },
  });
  const erika = await prisma.customer.create({
    data: { firstName: "Erika", lastName: "Hoffmann", street: "Leopoldstraße 66", postalCode: "80802", city: "München", district: "Schwabing", phone: "089 / 33 76 90", birthDate: d("1946-05-09"), careLevel: 3, status: "AKTIV", customerSince: d("2025-02-01"), insurerId: aok.id },
  });
  const karlHeinz = await prisma.customer.create({
    data: { firstName: "Karl-Heinz", lastName: "Vogt", street: "Augsburger Str. 3", postalCode: "85221", city: "Dachau", phone: "08131 / 27 44", birthDate: d("1950-09-17"), careLevel: 1, status: "AKTIV", customerSince: d("2024-06-01"), insurerId: ikk.id },
  });
  const anneliese = await prisma.customer.create({
    data: { firstName: "Anneliese", lastName: "Richter", street: "Kirchenstraße 21", postalCode: "81675", city: "München", district: "Haidhausen", phone: "089 / 48 12 07", birthDate: d("1935-12-04"), careLevel: 5, status: "AKTIV", customerSince: d("2021-08-01"), insurerId: kkh.id },
  });
  const dieter = await prisma.customer.create({
    data: { firstName: "Dieter", lastName: "Schulz", street: "Bahnhofstraße 9", postalCode: "82110", city: "Germering", phone: "089 / 84 39 61", birthDate: d("1949-02-18"), careLevel: 2, status: "NEU", customerSince: d("2026-07-01"), insurerId: tk.id },
  });

  console.log("Seeding Angehörige & Kontakte…");
  await prisma.contact.createMany({
    data: [
      { customerId: ingrid.id, name: "Michael Bauer", role: "Sohn · Bevollmächtigter", phone: "0171 / 44 90 12" },
      { customerId: ingrid.id, name: "Dr. Sabine Roth", role: "Hausärztin", phone: "089 / 55 21 07" },
      { customerId: herbert.id, name: "Claudia Klein", role: "Tochter · Bevollmächtigte", phone: "0170 / 33 44 21" },
      { customerId: waltraud.id, name: "Peter Simon", role: "Sohn", phone: "0172 / 91 04 55" },
      { customerId: anneliese.id, name: "Dr. Frank Weiss", role: "Hausarzt", phone: "089 / 21 09 87" },
    ],
  });

  console.log("Seeding Leistungshistorie & Entlastungsbudget…");
  const history: { customerId: string; serviceId: string; staffId: string; date: Date; amountCents: number; billedToReliefBudget: boolean }[] = [
    { customerId: ingrid.id, serviceId: haushaltshilfe.id, staffId: sabine.id, date: d("2026-07-05"), amountCents: 4800, billedToReliefBudget: true },
    { customerId: ingrid.id, serviceId: begleitung.id, staffId: sabine.id, date: d("2026-07-03"), amountCents: 4200, billedToReliefBudget: true },
    { customerId: ingrid.id, serviceId: betreuung.id, staffId: yasemin.id, date: d("2026-06-28"), amountCents: 7200, billedToReliefBudget: true },
    { customerId: ingrid.id, serviceId: haushaltshilfe.id, staffId: sabine.id, date: d("2026-06-25"), amountCents: 6400, billedToReliefBudget: true },
    { customerId: ingrid.id, serviceId: waesche.id, staffId: markus.id, date: d("2026-06-20"), amountCents: 2800, billedToReliefBudget: false },

    { customerId: herbert.id, serviceId: begleitung.id, staffId: yasemin.id, date: d("2026-07-07"), amountCents: 12500, billedToReliefBudget: true },
    { customerId: herbert.id, serviceId: betreuung.id, staffId: yasemin.id, date: d("2026-06-18"), amountCents: 7200, billedToReliefBudget: true },

    { customerId: waltraud.id, serviceId: grundreinigung.id, staffId: markus.id, date: d("2026-07-02"), amountCents: 4500, billedToReliefBudget: false },
    { customerId: waltraud.id, serviceId: betreuung.id, staffId: yasemin.id, date: d("2026-06-14"), amountCents: 7200, billedToReliefBudget: true },

    { customerId: josef.id, serviceId: einkauf.id, staffId: thomas.id, date: d("2026-07-01"), amountCents: 11000, billedToReliefBudget: true },

    { customerId: erika.id, serviceId: betreuung.id, staffId: sabine.id, date: d("2026-07-06"), amountCents: 3000, billedToReliefBudget: true },
    { customerId: erika.id, serviceId: haushaltshilfe.id, staffId: sabine.id, date: d("2026-06-22"), amountCents: 6400, billedToReliefBudget: true },

    { customerId: karlHeinz.id, serviceId: begleitung.id, staffId: thomas.id, date: d("2026-07-04"), amountCents: 6200, billedToReliefBudget: true },

    { customerId: anneliese.id, serviceId: demenz.id, staffId: sabine.id, date: d("2026-07-07"), amountCents: 12500, billedToReliefBudget: true },
    { customerId: anneliese.id, serviceId: betreuung.id, staffId: yasemin.id, date: d("2026-06-30"), amountCents: 7200, billedToReliefBudget: true },
  ];
  await prisma.serviceRecord.createMany({ data: history });

  console.log("Seeding Angebote & Rechnungen…");
  await prisma.invoice.create({
    data: {
      number: "R-2026-0142", documentType: "RECHNUNG", status: "OFFEN", customerId: ingrid.id,
      issueDate: d("2026-07-05"), period: "Juni 2026", assignedToReliefBudget: true,
      lineItems: { create: [
        { serviceId: haushaltshilfe.id, description: "Haushaltshilfe", quantity: 6, unit: "Std", unitPriceCents: 3200, sortOrder: 0 },
        { serviceId: begleitung.id, description: "Begleitung bei Terminen", quantity: 2, unit: "Std", unitPriceCents: 3400, sortOrder: 1 },
        { serviceId: waesche.id, description: "Wäscheservice", quantity: 1, unit: "Std", unitPriceCents: 2800, sortOrder: 2 },
      ] },
    },
  });
  await prisma.invoice.create({
    data: {
      number: "R-2026-0141", documentType: "RECHNUNG", status: "BEZAHLT", customerId: herbert.id,
      issueDate: d("2026-07-04"), period: "Juni 2026", assignedToReliefBudget: true,
      lineItems: { create: [
        { serviceId: betreuung.id, description: "Betreuung im Alltag", quantity: 9, unit: "Std", unitPriceCents: 3600, sortOrder: 0 },
        { serviceId: fahrt.id, description: "Fahrtpauschale", quantity: 6, unit: "Einsatz", unitPriceCents: 850, sortOrder: 1 },
      ] },
    },
  });
  await prisma.invoice.create({
    data: {
      number: "A-2026-0056", documentType: "ANGEBOT", status: "VERSENDET", customerId: erika.id,
      issueDate: d("2026-07-03"), period: "Juli 2026", assignedToReliefBudget: false,
      lineItems: { create: [
        { serviceId: haushaltshilfe.id, description: "Haushaltshilfe", quantity: 16, unit: "Std", unitPriceCents: 3200, sortOrder: 0 },
      ] },
    },
  });
  await prisma.invoice.create({
    data: {
      number: "R-2026-0140", documentType: "RECHNUNG", status: "UEBERFAELLIG", customerId: waltraud.id,
      issueDate: d("2026-07-01"), period: "Juni 2026", assignedToReliefBudget: false,
      lineItems: { create: [
        { serviceId: grundreinigung.id, description: "Grundreinigung", quantity: 4, unit: "Std", unitPriceCents: 3000, sortOrder: 0 },
        { serviceId: waesche.id, description: "Wäscheservice", quantity: 3, unit: "Std", unitPriceCents: 2800, sortOrder: 1 },
      ] },
    },
  });
  await prisma.invoice.create({
    data: {
      number: "R-2026-0139", documentType: "RECHNUNG", status: "BEZAHLT", customerId: josef.id,
      issueDate: d("2026-06-30"), period: "Mai 2026", assignedToReliefBudget: true,
      lineItems: { create: [
        { serviceId: einkauf.id, description: "Einkaufs- & Besorgungshilfe", quantity: 6, unit: "Std", unitPriceCents: 3200, sortOrder: 0 },
        { serviceId: begleitung.id, description: "Begleitung bei Terminen", quantity: 4, unit: "Std", unitPriceCents: 3400, sortOrder: 1 },
      ] },
    },
  });
  await prisma.invoice.create({
    data: {
      number: "E-2026-0009", documentType: "RECHNUNG", status: "ENTWURF", customerId: dieter.id,
      issueDate: d("2026-07-08"), period: "Juli 2026", assignedToReliefBudget: true,
      lineItems: { create: [
        { serviceId: haushaltshilfe.id, description: "Haushaltshilfe", quantity: 3, unit: "Std", unitPriceCents: 3200, sortOrder: 0 },
      ] },
    },
  });

  console.log("Seeding Tourenplanung (heute)…");
  const today = d("2026-07-09");
  await prisma.tourAssignment.createMany({
    data: [
      { staffId: sabine.id, customerId: ingrid.id, serviceLabel: "Haushaltshilfe", date: today, startMinutes: 8 * 60, durationMinutes: 90 },
      { staffId: sabine.id, customerId: erika.id, serviceLabel: "Betreuung im Alltag", date: today, startMinutes: 10 * 60, durationMinutes: 120 },
      { staffId: sabine.id, customerId: anneliese.id, serviceLabel: "Demenzbetreuung", date: today, startMinutes: 13 * 60, durationMinutes: 120 },

      { staffId: thomas.id, customerId: josef.id, serviceLabel: "Einkaufshilfe", date: today, startMinutes: 8 * 60 + 30, durationMinutes: 60 },
      { staffId: thomas.id, customerId: karlHeinz.id, serviceLabel: "Begleitung", date: today, startMinutes: 11 * 60, durationMinutes: 90 },
      { staffId: thomas.id, customerId: dieter.id, serviceLabel: "Haushaltshilfe", date: today, startMinutes: 14 * 60, durationMinutes: 120 },

      { staffId: yasemin.id, customerId: waltraud.id, serviceLabel: "Betreuung im Alltag", date: today, startMinutes: 9 * 60, durationMinutes: 120 },
      { staffId: yasemin.id, customerId: herbert.id, serviceLabel: "Begleitung", date: today, startMinutes: 12 * 60, durationMinutes: 60 },
      { staffId: yasemin.id, customerId: anneliese.id, serviceLabel: "Betreuung", date: today, startMinutes: 14 * 60 + 30, durationMinutes: 90 },

      { staffId: markus.id, customerId: waltraud.id, serviceLabel: "Grundreinigung", date: today, startMinutes: 8 * 60, durationMinutes: 180 },
      { staffId: markus.id, customerId: dieter.id, serviceLabel: "Wäscheservice", date: today, startMinutes: 13 * 60, durationMinutes: 90 },
    ],
  });

  console.log("Seeding Aufgaben…");
  await prisma.task.createMany({
    data: [
      { text: "Abrechnung AOK Bayern für Juni einreichen", meta: "Fällig heute", priority: "HOCH", dueDate: d("2026-07-09"), done: false },
      { text: "Erstgespräch mit Fam. Schulz terminieren", meta: "Morgen · neue Anfrage", priority: "MITTEL", dueDate: d("2026-07-10"), done: false },
      { text: "Budget-Info an Frau Richter senden", meta: "Budget aufgebraucht", priority: "MITTEL", done: false },
      { text: "Dienstplan KW 29 finalisieren", meta: "Bis Freitag", priority: "NIEDRIG", dueDate: d("2026-07-10"), done: false },
      { text: "Qualifikationsnachweis M. Lang ablegen", meta: "Erledigt", priority: "NIEDRIG", done: true },
    ],
  });

  console.log("Seeding Anfragen…");
  await prisma.request.createMany({
    data: [
      { name: "Familie Schulz", info: "Germering · Haushaltshilfe", status: "NEU" },
      { name: "Herr Neumann", info: "München-Laim · Betreuung, PG 2", status: "NEU" },
      { name: "Frau Özdemir", info: "Dachau · Begleitung", status: "NEU" },
    ],
  });

  console.log("Fertig.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
