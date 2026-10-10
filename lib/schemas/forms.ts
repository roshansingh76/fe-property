import { z } from "zod";

// ── Shared enums ───────────────────────────────────────────────────────────

export const landUnitSchema = z.enum(["bigha", "acre", "hectare", "sqft"] as const);
export const irrigationTypeSchema = z.enum([
  "tubewell", "canal", "rainfed", "drip", "solar_pump", "none",
] as const);

export const villageSchema = z.string().min(2, "Select a valid location");

// ── Sell Land Form ─────────────────────────────────────────────────────────

export const sellLandSchema = z.object({
  // Step 1 — Owner Details
  ownerName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must be under 60 characters")
    .regex(/^[a-zA-Z\u0900-\u097F\s.]+$/, "Enter a valid name"),

  whatsappNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),

  alternatePhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
    .optional()
    .or(z.literal("")),

  // Step 2 — Property Location
  villageName: villageSchema,

  customVillage: z
    .string()
    .max(50, "Village name too long")
    .optional(),

  tehsil: z
    .string()
    .min(2, "Tehsil is required")
    .default("Palia"),

  khasraNumber: z
    .string()
    .min(1, "Khasra number is required")
    .max(30, "Khasra number too long"),

  // Step 3 — Land Details
  landArea: z
    .number()
    .positive("Area must be greater than 0")
    .max(500, "Area seems too large — please verify"),

  landUnit: landUnitSchema,

  irrigationType: z
    .array(irrigationTypeSchema)
    .min(1, "Select at least one irrigation source"),

  roadFrontage: z
    .number()
    .min(0)
    .max(2000)
    .optional(),

  soilType: z
    .enum(["alluvial_loam", "clay", "sandy_loam", "black_cotton", "unknown"] as const)
    .optional(),

  electricityConnection: z.boolean().default(false),
  highwayTouch: z.boolean().default(false),
  canalTouch: z.boolean().default(false),

  // Step 4 — Pricing & Crop History
  expectedPrice: z
    .number()
    .positive("Price must be greater than 0")
    .max(999999999, "Price seems too high — please verify"),

  cropHistory: z
    .string()
    .max(200, "Keep crop history under 200 characters")
    .optional(),

  propertyDescription: z
    .string()
    .max(500, "Description must be under 500 characters")
    .optional(),

  // Step 5 — Documents & Media
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  photos: z.any().optional(),

  // Consent
  consentToContact: z
    .boolean()
    .refine((v) => v === true, "You must agree to be contacted"),
});

export type SellLandFormData = z.infer<typeof sellLandSchema>;

// ── Buyer Requirement Form ─────────────────────────────────────────────────

export const purposeSchema = z.enum([
  "farming",
  "resort_farmhouse",
  "commercial_warehouse",
  "investment",
  "residential",
] as const);

export const buyerRequirementSchema = z.object({
  buyerName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name too long"),

  whatsappNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),

  purpose: purposeSchema,

  minArea: z.number().positive("Must be greater than 0").optional(),
  maxArea: z.number().positive("Must be greater than 0").optional(),
  areaUnit: landUnitSchema.optional(),

  minBudget: z.number().min(0).optional(),
  maxBudget: z.number().positive("Budget must be positive").optional(),

  preferredVillages: z
    .array(villageSchema)
    .min(1, "Select at least one preferred village"),

  waterSourceRequired: z
    .enum(["tubewell", "canal", "any", "not_required"] as const)
    .optional()
    .default("any"),

  highwayTouchRequired: z.boolean().optional().default(false),
  immediateRegistryRequired: z.boolean().optional().default(false),

  additionalNotes: z
    .string()
    .max(300, "Notes must be under 300 characters")
    .optional(),
}).refine(
  (data) => {
    if (data.minArea !== undefined && data.maxArea !== undefined) {
      return data.maxArea >= data.minArea;
    }
    return true;
  },
  { message: "Maximum area must be ≥ minimum area", path: ["maxArea"] }
).refine(
  (data) => {
    if (data.minBudget !== undefined && data.maxBudget !== undefined) {
      return data.maxBudget >= data.minBudget;
    }
    return true;
  },
  { message: "Maximum budget must be ≥ minimum budget", path: ["maxBudget"] }
);

export type BuyerRequirementFormData = z.infer<typeof buyerRequirementSchema>;

// ── Search Filter Schema ───────────────────────────────────────────────────

export const searchFilterSchema = z.object({
  query: z.string().optional(),
  category: z
    .enum([
      "all",
      "sugarcane_farm",
      "paddy_wheat",
      "mango_orchard",
      "farmhouse_resort",
      "dairy_poultry",
      "highway_investment",
      "residential_plot",
      "commercial_land",
      "poplar_plantation",
      "fish_farm",
    ] as const)
    .default("all"),
  village: z.string().optional(),
  minArea: z.number().optional(),
  maxArea: z.number().optional(),
  areaUnit: landUnitSchema.optional(),
  minBudget: z.number().optional(),
  maxBudget: z.number().optional(),
  irrigationType: z.array(irrigationTypeSchema).optional(),
  highwayTouch: z.boolean().optional(),
  canalTouch: z.boolean().optional(),
  immediateRegistry: z.boolean().optional(),
  sellerType: z
    .enum(["all", "owner", "verified_broker", "direct_farmer"] as const)
    .default("all"),
  tab: z.enum(["buy_agri", "buy_residential", "sell"] as const).default("buy_agri"),
});

export type SearchFilterData = z.infer<typeof searchFilterSchema>;
