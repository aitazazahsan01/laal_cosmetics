import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

/**
 * Seed data.
 *
 * CONTENT DISCIPLINE — read before editing.
 * The SRS states: "Content will be supplied by LAAL... Do not write product claims
 * independently." Every string below is verbatim from LAAL's approved box artwork
 * (docs/brand/LAAL_Box_*.pdf). Fields LAAL has not supplied yet are left null on purpose so
 * the UI can show its "pending" treatment. Do not fill them with placeholder marketing copy,
 * efficacy claims, contraindications or prices.
 */

const prisma = new PrismaClient();

/** Identical on both boxes. */
const PATCH_TEST_NOTE =
  "For external use only. Patch test before first use. Avoid contact with eyes. Discontinue if irritation occurs. Keep out of reach of children. Store below 30°C, away from direct sunlight. Net content 30 ml e · Use within 6 months of opening.";

/** Identical directions on both boxes. */
const HOW_TO_USE_AM = [
  "Cleanse",
  "Apply 3–4 drops to damp skin",
  "Follow with moisturiser",
  "Use sunscreen daily",
];

const HOW_TO_USE_PM = [
  "Cleanse",
  "Apply 3–4 drops to damp skin",
  "Follow with moisturiser",
];

const products = [
  {
    slug: "niacinamide",
    name: "Niacinamide+",
    tagline: "Oil Control Serum",
    activesLine: "Niacinamide 5% · Zinc PCA 0.5%",
    descriptor: "For oily, congested and blemish-prone skin.",
    priceRs: null, // Pending — LAAL to supply.
    sizeMl: 30,
    stockQty: 50,
    shortDescription: null, // Pending — LAAL to supply.
    whatItDoes: null, // Pending — LAAL to supply.
    timelineByWeek: null, // Pending — LAAL to supply.
    whoFor: "Oily, congested and blemish-prone skin.",
    whoShouldWait: null, // Pending — contraindications are never invented.
    howToUseAM: JSON.stringify(HOW_TO_USE_AM),
    howToUsePM: JSON.stringify(HOW_TO_USE_PM),
    inciList:
      "Aqua, Niacinamide, Zinc PCA, Sodium PCA, Glycerin, Propylene Glycol, Hydroxyethylcellulose, Polysorbate, Acrylates Crosspolymer, Phenoxyethanol.",
    patchTestNote: PATCH_TEST_NOTE,
    faq: null, // Pending — LAAL to supply.
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
    priceRs: null, // Pending — LAAL to supply.
    sizeMl: 30,
    stockQty: 50,
    shortDescription: null, // Pending — LAAL to supply.
    whatItDoes: null, // Pending — LAAL to supply.
    timelineByWeek: null, // Pending — LAAL to supply.
    whoFor: "Dry, tight, sensitised and over-exfoliated skin.",
    whoShouldWait: null, // Pending — contraindications are never invented.
    howToUseAM: JSON.stringify(HOW_TO_USE_AM),
    howToUsePM: JSON.stringify(HOW_TO_USE_PM),
    inciList:
      "Aqua, Niacinamide, D-Panthenol, Sodium Hyaluronate, Tocopheryl Acetate, Pyridoxine, Amino Acids, Allantoin, Phenoxyethanol.",
    patchTestNote: PATCH_TEST_NOTE,
    faq: null, // Pending — LAAL to supply.
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

  // Singleton settings row. Fees and thresholds stay null until LAAL supplies them;
  // COD nationwide is a confirmed site mechanic from the SRS.
  await prisma.deliverySettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      standardFeeRs: null,
      freeDeliveryThresholdRs: null,
      codAvailable: true,
      codSurchargeRs: null,
      estimatedDaysMin: null,
      estimatedDaysMax: null,
      announcementBanner: null,
    },
    update: {},
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
