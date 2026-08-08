import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

/**
 * Seed data.
 *
 * CONTENT DISCIPLINE — read before editing.
 * The SRS states: "Content will be supplied by LAAL... Do not write product claims
 * independently." Every string below is verbatim from LAAL's approved box artwork
 * (docs/brand/LAAL_Box_*.pdf) or from docs/brand/LAAL_Website_Content_Pack.pdf. Fields LAAL
 * has not supplied yet are left null on purpose so the UI can show its "pending" treatment.
 * Do not fill them with placeholder marketing copy, efficacy claims, contraindications or
 * prices.
 */

const prisma = new PrismaClient();

/** Identical on both boxes. */
const PATCH_TEST_NOTE =
  "For external use only. Patch test before first use. Avoid contact with eyes. Discontinue if irritation occurs. Keep out of reach of children. Store below 30°C, away from direct sunlight. Net content 30 ml e · Use within 6 months of opening.";

/** Shared FAQ, content pack §7 — identical on both product pages. */
const FAQ = [
  {
    question: "Can I use both serums?",
    answer:
      "Yes. Niacinamide+ first, Hyaluronic+ about a minute later. Or split them — one in the morning, one at night.",
  },
  {
    question: "Will this purge my skin?",
    answer:
      "No. Niacinamide has no mechanism that speeds up cell turnover, so there is nothing to purge. Breaking out means the formula does not suit you — stop and message us.",
  },
  {
    question: "Can I use it with retinol or acids?",
    answer:
      "Hyaluronic+ yes, and it will make them easier to tolerate. Niacinamide+ on alternate nights, or at the opposite end of the day.",
  },
  {
    question: "Is it safe in pregnancy?",
    answer:
      "Topical niacinamide, panthenol and hyaluronic acid at cosmetic concentrations are generally considered low risk. Confirm with your clinician before starting anything new.",
  },
  {
    question: "How soon will I see a difference?",
    answer:
      "Oiliness in 2–4 weeks. Fewer new blemishes in 4–8. Marks and pores in 8–12. Anyone promising three days is selling you something else.",
  },
  {
    question: "Can I wear it under makeup?",
    answer: "Yes. Give it about sixty seconds to absorb, then moisturiser, then base.",
  },
  {
    question: "Does it work on men's skin?",
    answer:
      "Yes, and often faster. Higher baseline sebum output means the change in oiliness is usually more visible.",
  },
  {
    question: "It stings. What now?",
    answer:
      "Stop. Use Hyaluronic+ alone for two weeks until the barrier settles, then reintroduce Niacinamide+ every third night. If stinging returns, it is not the product for you.",
  },
  {
    question: "Around my eyes?",
    answer: "Keep it off the immediate eye area and the lid margin. The orbital bone outward is fine.",
  },
  {
    question: "Do I still need sunscreen?",
    answer:
      "Always. Neither serum causes photosensitivity, but pigmentation and marks will not fade while the sun keeps re-triggering them.",
  },
  {
    question: "My skin is oily but flaky.",
    answer:
      "That is dehydration, not dryness, and it is the most common presentation we see. Use both serums.",
  },
  {
    question: "How long does a bottle last?",
    answer: "At 3–4 drops twice daily, six to eight weeks.",
  },
];

const products = [
  {
    slug: "niacinamide",
    name: "Niacinamide+",
    tagline: "Oil Control Serum",
    activesLine: "Niacinamide 5% · Zinc PCA 0.5%",
    descriptor: "For oily, congested and blemish-prone skin.",
    priceRs: 1784,
    listPriceRs: 2099,
    sizeMl: 30,
    stockQty: 50,
    shortDescription:
      "A lightweight water-based serum for skin that is oily, congested, blemish-prone, or carrying the marks that blemishes leave behind. Two actives, two different mechanisms, both aimed at the same problem.",
    whatItDoes: JSON.stringify([
      "Reduces oil at the source. Niacinamide suppresses the synthesis of fatty acids and wax esters inside the sebaceous gland. Zinc PCA works on a separate pathway, inhibiting 5-alpha-reductase — the enzyme that drives androgen-linked oil production. Two mechanisms, not one repeated.",
      "Calms the inflammation behind blemishes. Niacinamide dampens the inflammatory signalling that turns a blocked pore into a red, painful one. Zinc PCA adds bacteriostatic activity against Cutibacterium acnes — without the resistance concerns of topical antibiotics.",
      "Strengthens the skin barrier. Niacinamide increases your skin's own production of ceramides and barrier lipids, reducing water loss and reactivity. This is why oily skin on niacinamide usually becomes less sensitive over time, not more.",
      "Fades the marks blemishes leave behind. Niacinamide interrupts the transfer of pigment from melanocytes to surface skin cells, so brown or red marks left after a spot heals fade faster and more evenly. No bleaching, no pigment-cell damage.",
    ]),
    timelineByWeek: JSON.stringify([
      { label: "Week 1–2", text: "Skin feels more hydrated and slightly smoother. Nothing dramatic. This is normal." },
      { label: "Week 2–4", text: "Redness around active blemishes settles. Midday shine starts to reduce." },
      { label: "Week 4–8", text: "Visible reduction in oiliness. Fewer new inflamed blemishes appearing." },
      { label: "Week 8–12", text: "Pores look less obvious. Post-blemish marks visibly lighter and more even." },
    ]),
    whoFor:
      "Oily skin · combination skin · blemish-prone skin · post-blemish marks · enlarged-looking pores · skin under humidity stress · men, whose higher baseline sebum output makes this formula particularly well suited",
    whoShouldWait:
      "Known niacinamide sensitivity · rosacea-prone or highly reactive skin · a damaged barrier or broken skin · anyone on prescription acne treatment · severe, cystic or nodular acne, which needs a dermatologist · pregnancy and breastfeeding, check with your clinician · children under 12",
    howToUseAM: JSON.stringify([
      "Cleanse, pat until barely damp",
      "Apply 3–4 drops, avoiding the eye area",
      "Follow with moisturiser",
      "Broad-spectrum SPF 30 or higher",
    ]),
    howToUsePM: JSON.stringify([
      "Cleanse, pat until barely damp",
      "Apply 3–4 drops",
      "Follow with moisturiser",
      "Reactive skin: every third night for two weeks, then increase to twice daily",
    ]),
    inciList:
      "Aqua (water), Niacinamide, Zinc PCA, Sodium PCA, Glycerin (vegetable), Propylene Glycol, Hydroxyethylcellulose, Polysorbate, Acrylates Crosspolymer, Phenoxyethanol.",
    patchTestNote: PATCH_TEST_NOTE,
    faq: JSON.stringify(FAQ),
    imageUrls: JSON.stringify([
      "/brand/niacinamide-1.png",
      "/brand/niacinamide-2.png",
      "/brand/niacinamide-3.png",
      "/brand/niacinamide-4.png",
      "/brand/niacinamide-5.png",
      "/brand/niacinamide-6.png",
    ]),
    pairsWithSlug: "hyaluronic",
    sortOrder: 1,
    isActive: true,
  },
  {
    slug: "hyaluronic",
    name: "Hyaluronic+",
    tagline: "Barrier Repair Serum",
    activesLine: "Hyaluronic Acid · B5 · Vitamin E · B3",
    descriptor: "For dry, tight, sensitised and over-exfoliated skin.",
    priceRs: 1784,
    listPriceRs: 2099,
    sizeMl: 30,
    stockQty: 50,
    shortDescription:
      "A calm, multi-vitamin serum for skin that is dry, tight, stressed, over-exfoliated, or simply worn out by weather and actives. Where Niacinamide+ treats, Hyaluronic+ repairs.",
    whatItDoes: JSON.stringify([
      "Rebuilds a barrier that is not holding water. Skin that feels tight after cleansing, stings when products go on, or looks dull and flaky is losing water through a damaged surface. Hyaluronic acid and panthenol draw and hold water at the surface; niacinamide increases the skin's own barrier lipid production so it stays there.",
      "Calms skin that has been pushed too hard. Over-exfoliation, harsh cleansers, strong actives used too often, sun, wind and air conditioning all leave skin reactive. Allantoin and panthenol are among the most reliable soothing agents in cosmetic formulation, and the vitamin E ester adds antioxidant support.",
      "Makes stronger actives tolerable. The most common reason people abandon an effective routine is irritation. A barrier serum used alongside a treatment serum is the difference between stopping in week two and still using it in month three.",
    ]),
    timelineByWeek: JSON.stringify([
      { label: "First use", text: "Immediate relief of tightness. Skin feels comfortable rather than coated." },
      { label: "Week 1–2", text: "Measurable improvement in hydration. Flaking and rough patches settle." },
      { label: "Week 2–4", text: "Redness and reactivity reduce. Products that used to sting stop stinging." },
      { label: "Week 4–8", text: "Barrier function stabilises. Skin holds moisture through the day." },
    ]),
    whoFor:
      "Dry and dehydrated skin · sensitised or over-exfoliated skin · anyone starting a treatment routine · air-conditioned and centrally heated environments · post-sun and post-wind exposure · sensitive skin that reacts to most products · all skin types, including oily — oily skin can still be dehydrated, and often is",
    whoShouldWait:
      "Known sensitivity to any listed ingredient · broken skin, open lesions or infected areas · diagnosed inflammatory skin disease in an active flare · pregnancy and breastfeeding, check with your clinician · children under 12 · if you want oil control, this is not that product — Niacinamide+ is",
    howToUseAM: JSON.stringify([
      "Cleanse, pat until barely damp",
      "Apply 3–4 drops",
      "Follow with moisturiser",
      "SPF 30 or higher",
    ]),
    howToUsePM: JSON.stringify([
      "Cleanse, pat until barely damp",
      "Apply 3–4 drops",
      "Follow with moisturiser",
      "With Niacinamide+: apply that first, wait about a minute, then this",
    ]),
    inciList:
      "Aqua (water), Niacinamide, D-Panthenol (Provitamin B5), Sodium Hyaluronate (Hyaluronic Acid), Tocopheryl Acetate (Vitamin E), Pyridoxine (Vitamin B6), Amino Acids, Allantoin, Phenoxyethanol.",
    patchTestNote: PATCH_TEST_NOTE,
    faq: JSON.stringify(FAQ),
    imageUrls: JSON.stringify([
      "/brand/hyaluronic-1.png",
      "/brand/hyaluronic-2.png",
      "/brand/hyaluronic-3.png",
    ]),
    pairsWithSlug: "niacinamide",
    sortOrder: 2,
    isActive: true,
  },
];

async function main() {
  for (const product of products) {
    const { slug, ...rest } = product;
    await prisma.product.upsert({
      where: { slug },
      create: { slug, ...rest },
      update: rest,
    });
    console.log(`  ✓ product: ${product.name} (${slug})`);
  }

  // Singleton settings row — real values from the LAAL Website Content Pack §2.
  // announcementBanner is still not supplied and stays null.
  await prisma.deliverySettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      standardFeeRs: 250,
      freeDeliveryThresholdRs: 2500,
      codAvailable: true,
      codSurchargeRs: 200,
      estimatedDaysMin: 3,
      estimatedDaysMax: 5,
      announcementBanner: null,
    },
    update: {
      standardFeeRs: 250,
      freeDeliveryThresholdRs: 2500,
      codAvailable: true,
      codSurchargeRs: 200,
      estimatedDaysMin: 3,
      estimatedDaysMax: 5,
      announcementBanner: null,
    },
  });
  console.log("  ✓ delivery settings (singleton)");

  await seedAdmins();

  // No discount codes, stockist enquiries or orders are seeded: none of that data exists
  // yet and none of it should be invented.
}

/**
 * Seeds the two staff accounts from environment variables.
 *
 * Credentials are never hardcoded here and never committed — real values live in the
 * gitignored .env, with placeholders in .env.example. Passwords are bcrypt-hashed before
 * they touch the database and are never printed, not even at debug level.
 *
 * Re-running the seed updates the name/role and re-hashes the password from env, so
 * rotating a password is just an .env edit plus `npm run db:seed`.
 */
async function seedAdmins() {
  const specs = [1, 2].map((n) => ({
    email: process.env[`ADMIN_${n}_EMAIL`]?.trim().toLowerCase(),
    name: process.env[`ADMIN_${n}_NAME`]?.trim(),
    password: process.env[`ADMIN_${n}_PASSWORD`],
    role: process.env[`ADMIN_${n}_ROLE`]?.trim() || "ADMIN",
    slot: n,
  }));

  for (const spec of specs) {
    if (!spec.email || !spec.password) {
      console.warn(
        `  ! admin ${spec.slot}: ADMIN_${spec.slot}_EMAIL / ADMIN_${spec.slot}_PASSWORD not set — skipped`,
      );
      continue;
    }
    if (spec.password.length < 10) {
      console.warn(
        `  ! admin ${spec.slot}: password is shorter than 10 characters — skipped`,
      );
      continue;
    }

    const passwordHash = await bcrypt.hash(spec.password, 12);

    await prisma.adminUser.upsert({
      where: { email: spec.email },
      create: {
        email: spec.email,
        name: spec.name || spec.email,
        passwordHash,
        role: spec.role,
        isActive: true,
      },
      update: {
        name: spec.name || spec.email,
        passwordHash,
        role: spec.role,
        isActive: true,
      },
    });

    // Email and role only — never the password.
    console.log(`  ✓ admin: ${spec.email} (${spec.role})`);
  }
}

main()
  .then(async () => {
    console.log("Seed complete.");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
