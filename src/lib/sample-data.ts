// Entirely fictional sample company used for demos. No real people or data.
type SampleItem = { kind: string; title: string; body: string; cadence?: string; quote?: string; src: number; mentions?: number };
type SampleInput = { kind: "voice" | "text" | "chat" | "file"; title: string; language: string; original: string; english: string; daysAgo: number };
type SampleRole = {
  title: string;
  holder: string;
  successor?: string;
  status: "active" | "leaving";
  inputs: SampleInput[];
  items: SampleItem[];
  links: [number, number][];
  changes: { item: number; title: string; body: string; reason: string; src: number }[];
};

export function buildSample(): { company: string; departments: { name: string; roles: SampleRole[] }[] } {
  const accounts: SampleRole = {
    title: "Accounts Lead",
    holder: "Anitha Menon",
    successor: "Faizal K.",
    status: "leaving",
    inputs: [
      {
        kind: "voice",
        title: "Voice note · Vendor invoice approval",
        language: "ml",
        original:
          "ഇന്ന് Rajan Traders-ന്റെ invoice approve ചെയ്തു. ₹50,000-ൽ കൂടുതൽ ഉള്ള payment ആണെങ്കിൽ Suresh sir-ന്റെ approval വേണം. അതിനു മുൻപ് GST number Tally-യിൽ ഉള്ളതുമായി match ചെയ്യുന്നുണ്ടോ എന്ന് നോക്കണം, ഇല്ലെങ്കിൽ input credit പോകും.",
        english:
          "Approved Rajan Traders' invoice today. Any payment above ₹50,000 needs Suresh sir's approval. Before that, check the vendor's GST number matches the one in Tally, otherwise we lose input tax credit.",
        daysAgo: 1,
      },
      {
        kind: "voice",
        title: "Voice note · Month-end GST",
        language: "ml",
        original:
          "മാസം 10-ആം തീയതിക്ക് മുൻപ് GSTR-1 file ചെയ്യണം. Sales register 5-ആം തീയതിക്ക് മുൻപ് auditor Priya madam-ന് അയക്കും. GST portal-ൽ OTP Suresh sir-ന്റെ phone-ലേക്കാണ് വരുന്നത്, അതുകൊണ്ട് രാവിലെ തന്നെ പറയണം.",
        english:
          "GSTR-1 must be filed before the 10th of every month. I send the sales register to the auditor, Priya madam, before the 5th. The GST portal OTP goes to Suresh sir's phone, so tell him in the morning.",
        daysAgo: 4,
      },
      {
        kind: "chat",
        title: "WhatsApp export · Packaging vendor",
        language: "mixed",
        original:
          "Anitha: Malabar Packaging delivery eppozhum late aanu. Ee maasam muthal Cochin Box Co. il ninnu order cheyyam, payment terms 30 days.\nSuresh: Ok, go ahead.",
        english:
          "Anitha: Malabar Packaging deliveries are always late. From this month we will order from Cochin Box Co., payment terms 30 days.\nSuresh: OK, go ahead.",
        daysAgo: 0,
      },
      {
        kind: "text",
        title: "Typed note · Onam month",
        language: "en",
        original:
          "Onam week: most vendors close for 4-5 days. Clear all pending vendor payments and salary advances in the week before Onam or people get upset.",
        english:
          "Onam week: most vendors close for 4-5 days. Clear all pending vendor payments and salary advances in the week before Onam or people get upset.",
        daysAgo: 9,
      },
      {
        kind: "voice",
        title: "Voice note · Bank reconciliation",
        language: "ml",
        original: "എല്ലാ വെള്ളിയാഴ്ചയും Federal Bank statement Tally-യുമായി reconcile ചെയ്യും. Cheque bounce ആയാൽ Joseph-നെ വിളിച്ചു പറയണം.",
        english: "Every Friday I reconcile the Federal Bank statement with Tally. If a cheque bounces, call Joseph and inform him.",
        daysAgo: 13,
      },
    ],
    items: [
      { kind: "responsibility", title: "Vendor payments & invoice approval", body: "Checks, approves and pays all vendor invoices for packaging, freight and raw spice purchases.", src: 0, mentions: 3 },
      { kind: "responsibility", title: "Monthly GST compliance", body: "Owns GSTR-1 filing and coordinates with the external auditor every month.", src: 1, mentions: 2 },
      { kind: "recurring_task", title: "File GSTR-1", body: "File GSTR-1 on the GST portal. OTP goes to the MD's phone, so warn him in the morning.", cadence: "Monthly, before the 10th", quote: "മാസം 10-ആം തീയതിക്ക് മുൻപ് GSTR-1 file ചെയ്യണം", src: 1 },
      { kind: "recurring_task", title: "Send sales register to auditor", body: "Export the sales register from Tally and email it to the auditor.", cadence: "Monthly, by the 5th", src: 1 },
      { kind: "recurring_task", title: "Bank reconciliation", body: "Reconcile the Federal Bank statement with Tally.", cadence: "Weekly, Friday", src: 4 },
      { kind: "decision", title: "Payments above ₹50,000 need MD approval", body: "Any single vendor payment above ₹50,000 must be approved by Suresh Nair before release. Why: keeps control over large cash outflows.", quote: "₹50,000-ൽ കൂടുതൽ ഉള്ള payment ആണെങ്കിൽ Suresh sir-ന്റെ approval വേണം", src: 0, mentions: 2 },
      { kind: "decision", title: "Verify vendor GSTIN against Tally before approving", body: "Match the GST number on the invoice with the vendor master in Tally. Why: a mismatch means the input tax credit is lost.", quote: "GST number Tally-യിൽ ഉള്ളതുമായി match ചെയ്യുന്നുണ്ടോ എന്ന് നോക്കണം", src: 0 },
      { kind: "contact", title: "Suresh Nair: Managing Director", body: "Approves payments above ₹50,000. GST portal OTP comes to his phone.", src: 0, mentions: 3 },
      { kind: "contact", title: "Priya Varma: External auditor", body: "Receives the sales register by the 5th each month; ask her about GST notices.", src: 1 },
      { kind: "contact", title: "Malabar Packaging: Packaging vendor", body: "Supplies cartons and pouches. Payment terms 15 days.", src: 0 },
      { kind: "contact", title: "Joseph: Bank relationship manager", body: "Federal Bank contact; call him when a cheque bounces.", src: 4 },
      { kind: "tool", title: "Tally Prime", body: "Accounting, vendor master, GST reports and sales register.", src: 0, mentions: 4 },
      { kind: "tool", title: "GST portal", body: "Used for GSTR-1 filing. Login needs the MD's OTP.", src: 1 },
      { kind: "edge_case", title: "Onam week closures", body: "Most vendors close 4-5 days during Onam. Clear pending vendor payments and salary advances the week before.", src: 3 },
    ],
    links: [
      [0, 5], [0, 6], [5, 7], [6, 11], [1, 2], [2, 12], [2, 7], [1, 3], [3, 8], [3, 11], [4, 11], [4, 10], [0, 9], [13, 0],
    ],
    changes: [
      {
        item: 9,
        title: "Cochin Box Co.: Packaging vendor",
        body: "Replaces Malabar Packaging from this month due to repeated late deliveries. Payment terms 30 days.",
        reason: "WhatsApp chat says packaging orders are moving from Malabar Packaging to Cochin Box Co.",
        src: 2,
      },
    ],
  };

  const sales: SampleRole = {
    title: "Export Sales Executive",
    holder: "Rohit Sharma",
    status: "active",
    inputs: [
      {
        kind: "voice",
        title: "Voice note · Dubai buyer follow-up",
        language: "hi",
        original:
          "आज Dubai buyer Al Noor Foods को follow-up किया। Sample भेजने से पहले FSSAI certificate और spice board registration की copy attach करनी होती है। Gulfood fair का registration नवंबर के अंत तक करना है।",
        english:
          "Followed up with the Dubai buyer Al Noor Foods today. Before sending samples, attach the FSSAI certificate and Spices Board registration copy. Gulfood fair registration must be done by the end of November.",
        daysAgo: 2,
      },
      {
        kind: "text",
        title: "Typed note · Discounts & freight",
        language: "en",
        original:
          "If a buyer asks for more than 8% discount, check with Suresh before quoting. Freight quotes always come from Joseph at Seabird Logistics: get them in writing before sending the proforma.",
        english:
          "If a buyer asks for more than 8% discount, check with Suresh before quoting. Freight quotes always come from Joseph at Seabird Logistics: get them in writing before sending the proforma.",
        daysAgo: 6,
      },
    ],
    items: [
      { kind: "responsibility", title: "Gulf export buyer relationships", body: "Owns follow-ups, samples and quotations for Gulf buyers.", src: 0 },
      { kind: "decision", title: "Discounts above 8% need MD sign-off", body: "Check with Suresh before quoting more than 8% discount. Why: margins on cardamom are thin.", src: 1 },
      { kind: "recurring_task", title: "Register for Gulfood fair", body: "Complete exhibitor registration.", cadence: "Yearly, by end of November", src: 0 },
      { kind: "contact", title: "Al Noor Foods: Dubai buyer", body: "Key Gulf buyer; needs FSSAI and Spices Board documents with every sample.", src: 0 },
      { kind: "contact", title: "Joseph: Seabird Logistics", body: "Gives freight quotes; always get them in writing.", src: 1 },
      { kind: "edge_case", title: "Samples without compliance documents get held", body: "Attach FSSAI certificate and Spices Board registration with every export sample.", quote: "Sample भेजने से पहले FSSAI certificate ... attach करनी होती है", src: 0 },
    ],
    links: [[0, 3], [3, 5], [0, 1], [0, 4]],
    changes: [],
  };

  return {
    company: "Kerala Spices Traders (Sample)",
    departments: [
      { name: "Finance", roles: [accounts] },
      { name: "Marketing & Sales", roles: [sales] },
    ],
  };
}
