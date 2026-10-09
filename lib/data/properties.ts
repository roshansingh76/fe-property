// Rich mock property data for Palia Kalan, Lakhimpur Kheri, UP

export type LandUnit = "bigha" | "acre" | "hectare" | "sqft";
export type IrrigationType = "tubewell" | "canal" | "rainfed" | "drip" | "solar_pump";
export type SoilType = "alluvial_loam" | "clay" | "sandy_loam" | "black_cotton";
export type SellerType = "owner" | "verified_broker" | "direct_farmer";
export type PropertyCategory =
  | "sugarcane_farm"
  | "paddy_wheat"
  | "mango_orchard"
  | "farmhouse_resort"
  | "dairy_poultry"
  | "highway_investment"
  | "residential_plot"
  | "commercial_land"
  | "poplar_plantation"
  | "fish_farm";

export interface PropertyBadge {
  label: string;
  variant: "verified" | "registry" | "khatauni" | "owner" | "featured" | "new";
}

export interface AgriProperty {
  id: string;
  title: string;
  slug: string;
  category: PropertyCategory;
  village: string;
  tehsil: string;
  district: string;
  location: string;
  coordinates: { lat: number; lng: number };
  price: number;
  priceUnit: "total" | "per_bigha" | "per_acre";
  area: number;
  areaUnit: LandUnit;
  pricePerBigha: number;
  pricePerAcre: number;
  irrigation: IrrigationType[];
  soilType: SoilType;
  roadFrontage: number;
  electricityConnection: boolean;
  distanceFromPalia: number;
  highwayTouch: boolean;
  canalTouch: boolean;
  cropHistory: string[];
  khasraNumber: string;
  sellerType: SellerType;
  sellerName: string;
  sellerPhone: string;
  badges: PropertyBadge[];
  images: string[];
  description: string;
  legalStatus: "freehold" | "leasehold" | "patta";
  immediateRegistry: boolean;
  singleOwner: boolean;
  featured: boolean;
  postedAt: string;
  views: number;
}

export const VILLAGES = [
  "Palia Kalan",
  "Sampurna Nagar",
  "Mailani",
  "Tikunia",
  "Bela Kalan",
  "Majhgai",
  "Bankey Ganj",
  "Nighasan",
  "Gola Gokaran Nath",
  "Phoolbehar",
  "Bhira",
  "Mohammadi",
] as const;

export type Village = (typeof VILLAGES)[number];

export const PROPERTY_CATEGORIES: Record<PropertyCategory, { label: string; icon: string; description: string }> = {
  sugarcane_farm: { label: "Sugarcane Farm", icon: "🌾", description: "Prime sugarcane agricultural land" },
  paddy_wheat: { label: "Paddy & Wheat Field", icon: "🌾", description: "Multi-crop paddy and wheat fields" },
  mango_orchard: { label: "Mango Orchard", icon: "🥭", description: "Mature mango & fruit orchards" },
  farmhouse_resort: { label: "Farmhouse & Resort", icon: "🏡", description: "Near Dudhwa National Park" },
  dairy_poultry: { label: "Dairy / Poultry", icon: "🐄", description: "Livestock & poultry farm land" },
  highway_investment: { label: "Highway Investment", icon: "🛣️", description: "High-ROI highway-touch plots" },
  residential_plot: { label: "Residential Plot", icon: "🏘️", description: "Urban & semi-urban plots" },
  commercial_land: { label: "Commercial Land", icon: "🏢", description: "Shops, warehouses & commercial" },
  poplar_plantation: { label: "Poplar / Eucalyptus", icon: "🌳", description: "Timber plantation land" },
  fish_farm: { label: "Fish Farm", icon: "🐟", description: "Aquaculture & fishery land" },
};

export const mockProperties: AgriProperty[] = [
  {
    id: "prop-001",
    title: "Premium Sugarcane Farm on Mailani Highway",
    slug: "sugarcane-farm-mailani-highway-palia",
    category: "sugarcane_farm",
    village: "Palia Kalan",
    tehsil: "Palia",
    district: "Lakhimpur Kheri",
    location: "Mailani Road, Near NH-730, Palia Kalan",
    coordinates: { lat: 28.4328, lng: 80.5889 },
    price: 4500000,
    priceUnit: "total",
    area: 8,
    areaUnit: "bigha",
    pricePerBigha: 562500,
    pricePerAcre: 900000,
    irrigation: ["tubewell", "canal"],
    soilType: "alluvial_loam",
    roadFrontage: 120,
    electricityConnection: true,
    distanceFromPalia: 3,
    highwayTouch: true,
    canalTouch: true,
    cropHistory: ["Sugarcane", "Wheat", "Paddy"],
    khasraNumber: "245/3",
    sellerType: "owner",
    sellerName: "Ramesh Kumar Verma",
    sellerPhone: "+919876543210",
    badges: [
      { label: "Verified Seller", variant: "verified" },
      { label: "Registry Ready", variant: "registry" },
      { label: "Khatauni Verified", variant: "khatauni" },
    ],
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80",
    ],
    description: "Fertile alluvial loam land with dual irrigation — dedicated tubewell plus Sarda Canal access. Sugarcane yield 350+ quintals/acre. Road frontage on NH-730 makes it ideal for commercial farming or investment.",
    legalStatus: "freehold",
    immediateRegistry: true,
    singleOwner: true,
    featured: true,
    postedAt: "2026-07-15",
    views: 342,
  },
  {
    id: "prop-002",
    title: "Sampurna Nagar Road Farmhouse Plot",
    slug: "farmhouse-plot-sampurna-nagar-road",
    category: "farmhouse_resort",
    village: "Sampurna Nagar",
    tehsil: "Palia",
    district: "Lakhimpur Kheri",
    location: "Sampurna Nagar Road, 4km from Palia",
    coordinates: { lat: 28.4501, lng: 80.5712 },
    price: 7200000,
    priceUnit: "total",
    area: 4,
    areaUnit: "acre",
    pricePerBigha: 1125000,
    pricePerAcre: 1800000,
    irrigation: ["tubewell"],
    soilType: "alluvial_loam",
    roadFrontage: 200,
    electricityConnection: true,
    distanceFromPalia: 4,
    highwayTouch: false,
    canalTouch: false,
    cropHistory: ["Mango", "Wheat"],
    khasraNumber: "112/7A",
    sellerType: "verified_broker",
    sellerName: "Anil Singh Properties",
    sellerPhone: "+919812345678",
    badges: [
      { label: "Verified Seller", variant: "verified" },
      { label: "Featured", variant: "featured" },
    ],
    images: [
      "https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?w=800&q=80",
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80",
    ],
    description: "Ideal for eco-resort or luxury farmhouse development. 8km from Dudhwa National Park buffer zone. Paved road access, UPPCL electricity, bore well. Perfect for resort or agri-tourism investment.",
    legalStatus: "freehold",
    immediateRegistry: false,
    singleOwner: true,
    featured: true,
    postedAt: "2026-07-20",
    views: 518,
  },
  {
    id: "prop-003",
    title: "Paddy & Wheat Multi-Crop Land near Tikunia",
    slug: "paddy-wheat-land-tikunia",
    category: "paddy_wheat",
    village: "Tikunia",
    tehsil: "Palia",
    district: "Lakhimpur Kheri",
    location: "Tikunia Block, Near Sarda River Corridor",
    coordinates: { lat: 28.4189, lng: 80.6201 },
    price: 2800000,
    priceUnit: "total",
    area: 5,
    areaUnit: "bigha",
    pricePerBigha: 560000,
    pricePerAcre: 896000,
    irrigation: ["canal", "rainfed"],
    soilType: "alluvial_loam",
    roadFrontage: 60,
    electricityConnection: true,
    distanceFromPalia: 12,
    highwayTouch: false,
    canalTouch: true,
    cropHistory: ["Paddy", "Wheat", "Mustard"],
    khasraNumber: "678/2B",
    sellerType: "direct_farmer",
    sellerName: "Suresh Chandra Tiwari",
    sellerPhone: "+919823456789",
    badges: [
      { label: "Direct Owner", variant: "owner" },
      { label: "Khatauni Verified", variant: "khatauni" },
    ],
    images: [
      "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&q=80",
    ],
    description: "Prime Terai alluvial land with Sarda Canal touch. Three-crop rotation potential. District paved road accessible. Khatauni papers verified, single owner, immediate possession.",
    legalStatus: "freehold",
    immediateRegistry: true,
    singleOwner: true,
    featured: false,
    postedAt: "2026-07-28",
    views: 189,
  },
  {
    id: "prop-004",
    title: "Mango Orchard & Poplar Plantation — Bela Kalan",
    slug: "mango-orchard-poplar-bela-kalan",
    category: "mango_orchard",
    village: "Bela Kalan",
    tehsil: "Palia",
    district: "Lakhimpur Kheri",
    location: "Bela Kalan Village, Lakhimpur Road",
    coordinates: { lat: 28.4620, lng: 80.5440 },
    price: 3600000,
    priceUnit: "total",
    area: 3,
    areaUnit: "acre",
    pricePerBigha: 750000,
    pricePerAcre: 1200000,
    irrigation: ["drip", "tubewell"],
    soilType: "alluvial_loam",
    roadFrontage: 90,
    electricityConnection: true,
    distanceFromPalia: 8,
    highwayTouch: false,
    canalTouch: false,
    cropHistory: ["Mango (Dussehri)", "Poplar", "Eucalyptus"],
    khasraNumber: "334/9",
    sellerType: "owner",
    sellerName: "Hari Om Pandey",
    sellerPhone: "+919834567890",
    badges: [
      { label: "Verified Seller", variant: "verified" },
      { label: "Registry Ready", variant: "registry" },
      { label: "New Listing", variant: "new" },
    ],
    images: [
      "https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=800&q=80",
    ],
    description: "Mature Dussehri mango orchard (150+ trees) with drip irrigation. Mixed Poplar plantation for timber income. 3-acre freehold land, immediate registry possible.",
    legalStatus: "freehold",
    immediateRegistry: true,
    singleOwner: true,
    featured: false,
    postedAt: "2026-07-30",
    views: 267,
  },
  {
    id: "prop-005",
    title: "Commercial Highway Land — NH-730 Palia Bypass",
    slug: "commercial-highway-land-nh730-palia",
    category: "highway_investment",
    village: "Palia Kalan",
    tehsil: "Palia",
    district: "Lakhimpur Kheri",
    location: "NH-730 Bypass, Palia Kalan Entry Point",
    coordinates: { lat: 28.4280, lng: 80.5955 },
    price: 9500000,
    priceUnit: "total",
    area: 2800,
    areaUnit: "sqft",
    pricePerBigha: 0,
    pricePerAcre: 14800000,
    irrigation: [],
    soilType: "alluvial_loam",
    roadFrontage: 80,
    electricityConnection: true,
    distanceFromPalia: 1,
    highwayTouch: true,
    canalTouch: false,
    cropHistory: [],
    khasraNumber: "56/1",
    sellerType: "verified_broker",
    sellerName: "Palia Commercial Realty",
    sellerPhone: "+919845678901",
    badges: [
      { label: "Verified Seller", variant: "verified" },
      { label: "Featured", variant: "featured" },
      { label: "Registry Ready", variant: "registry" },
    ],
    images: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
    ],
    description: "Prime commercial land at the Palia town entry. 80-ft road frontage on NH-730. Ideal for petrol pump, warehouse, cold storage, hotel or showroom. High footfall Indo-Nepal trade corridor.",
    legalStatus: "freehold",
    immediateRegistry: true,
    singleOwner: true,
    featured: true,
    postedAt: "2026-07-10",
    views: 723,
  },
  {
    id: "prop-006",
    title: "Dairy Farm Land with Shed — Majhgai",
    slug: "dairy-farm-land-shed-majhgai",
    category: "dairy_poultry",
    village: "Majhgai",
    tehsil: "Palia",
    district: "Lakhimpur Kheri",
    location: "Majhgai Road, Near Milk Cooperative",
    coordinates: { lat: 28.4390, lng: 80.5620 },
    price: 1800000,
    priceUnit: "total",
    area: 2,
    areaUnit: "bigha",
    pricePerBigha: 900000,
    pricePerAcre: 1440000,
    irrigation: ["tubewell"],
    soilType: "clay",
    roadFrontage: 50,
    electricityConnection: true,
    distanceFromPalia: 6,
    highwayTouch: false,
    canalTouch: false,
    cropHistory: ["Barseem", "Maize"],
    khasraNumber: "789/4C",
    sellerType: "direct_farmer",
    sellerName: "Mohan Lal Yadav",
    sellerPhone: "+919856789012",
    badges: [
      { label: "Direct Owner", variant: "owner" },
      { label: "Khatauni Verified", variant: "khatauni" },
    ],
    images: [
      "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&q=80",
    ],
    description: "Ready dairy farm setup with existing cattle shed, tubewell, and fodder crop land. Near Majhgai Milk Cooperative collection center. Electricity connection, motorable road.",
    legalStatus: "freehold",
    immediateRegistry: false,
    singleOwner: true,
    featured: false,
    postedAt: "2026-07-25",
    views: 145,
  },
  {
    id: "prop-007",
    title: "Residential Plot in Palia Kalan Town",
    slug: "residential-plot-palia-kalan-town",
    category: "residential_plot",
    village: "Palia Kalan",
    tehsil: "Palia",
    district: "Lakhimpur Kheri",
    location: "Civil Lines Extension, Palia Kalan",
    coordinates: { lat: 28.4310, lng: 80.5870 },
    price: 2200000,
    priceUnit: "total",
    area: 1800,
    areaUnit: "sqft",
    pricePerBigha: 0,
    pricePerAcre: 5322666,
    irrigation: [],
    soilType: "alluvial_loam",
    roadFrontage: 30,
    electricityConnection: true,
    distanceFromPalia: 0.5,
    highwayTouch: false,
    canalTouch: false,
    cropHistory: [],
    khasraNumber: "23/B",
    sellerType: "owner",
    sellerName: "Priya Singh",
    sellerPhone: "+919867890123",
    badges: [
      { label: "Verified Seller", variant: "verified" },
      { label: "Registry Ready", variant: "registry" },
      { label: "New Listing", variant: "new" },
    ],
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    ],
    description: "Corner plot in prime Civil Lines area. 30-ft road, UPPCL electricity, municipal water supply, drainage facility. Walking distance from Palia market, school, and hospital.",
    legalStatus: "freehold",
    immediateRegistry: true,
    singleOwner: true,
    featured: false,
    postedAt: "2026-08-01",
    views: 398,
  },
  {
    id: "prop-008",
    title: "Large Sugarcane Farm — Bankey Ganj Block",
    slug: "sugarcane-farm-bankey-ganj",
    category: "sugarcane_farm",
    village: "Bankey Ganj",
    tehsil: "Palia",
    district: "Lakhimpur Kheri",
    location: "Bankey Ganj, Lakhimpur-Palia Road",
    coordinates: { lat: 28.4070, lng: 80.5480 },
    price: 8400000,
    priceUnit: "total",
    area: 15,
    areaUnit: "bigha",
    pricePerBigha: 560000,
    pricePerAcre: 896000,
    irrigation: ["tubewell", "solar_pump"],
    soilType: "alluvial_loam",
    roadFrontage: 180,
    electricityConnection: true,
    distanceFromPalia: 14,
    highwayTouch: true,
    canalTouch: false,
    cropHistory: ["Sugarcane", "Wheat"],
    khasraNumber: "456/11",
    sellerType: "owner",
    sellerName: "Dinesh Bahadur Singh",
    sellerPhone: "+919878901234",
    badges: [
      { label: "Verified Seller", variant: "verified" },
      { label: "Khatauni Verified", variant: "khatauni" },
      { label: "Direct Owner", variant: "owner" },
    ],
    images: [
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80",
    ],
    description: "15-bigha contiguous sugarcane holding. Solar pump plus dedicated tubewell. Adjacent to Palia-Lakhimpur state highway. Parcha khatoni clear, single owner, can be purchased in parts minimum 5 bigha.",
    legalStatus: "freehold",
    immediateRegistry: false,
    singleOwner: true,
    featured: true,
    postedAt: "2026-07-18",
    views: 461,
  },
  {
    id: "prop-009",
    title: "Eco-Resort Development Land — Dudhwa Buffer",
    slug: "resort-land-dudhwa-buffer-zone",
    category: "farmhouse_resort",
    village: "Tikunia",
    tehsil: "Palia",
    district: "Lakhimpur Kheri",
    location: "Dudhwa Buffer Zone Road, Near Tikunia",
    coordinates: { lat: 28.3890, lng: 80.6450 },
    price: 12000000,
    priceUnit: "total",
    area: 5,
    areaUnit: "acre",
    pricePerBigha: 1500000,
    pricePerAcre: 2400000,
    irrigation: ["tubewell"],
    soilType: "alluvial_loam",
    roadFrontage: 250,
    electricityConnection: true,
    distanceFromPalia: 18,
    highwayTouch: false,
    canalTouch: false,
    cropHistory: ["Wheat", "Mustard"],
    khasraNumber: "901/5",
    sellerType: "verified_broker",
    sellerName: "Dudhwa Tourism Realty",
    sellerPhone: "+919889012345",
    badges: [
      { label: "Verified Seller", variant: "verified" },
      { label: "Featured", variant: "featured" },
      { label: "Registry Ready", variant: "registry" },
    ],
    images: [
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    ],
    description: "Rare 5-acre land adjacent to Dudhwa National Park buffer zone. Perfect for eco-resort, jungle lodge or nature retreat. All clearances in process, spectacular forest views, year-round access road.",
    legalStatus: "freehold",
    immediateRegistry: false,
    singleOwner: true,
    featured: true,
    postedAt: "2026-07-05",
    views: 892,
  },
  {
    id: "prop-010",
    title: "Fish Farm Land with Pond — Mailani Road",
    slug: "fish-farm-pond-mailani-road",
    category: "fish_farm",
    village: "Mailani",
    tehsil: "Palia",
    district: "Lakhimpur Kheri",
    location: "Mailani Block, Near Sarda River",
    coordinates: { lat: 28.3990, lng: 80.6800 },
    price: 2100000,
    priceUnit: "total",
    area: 3,
    areaUnit: "bigha",
    pricePerBigha: 700000,
    pricePerAcre: 1120000,
    irrigation: ["canal"],
    soilType: "clay",
    roadFrontage: 40,
    electricityConnection: false,
    distanceFromPalia: 22,
    highwayTouch: false,
    canalTouch: true,
    cropHistory: ["Fish (Rohu, Katla)", "Paddy"],
    khasraNumber: "234/8B",
    sellerType: "direct_farmer",
    sellerName: "Raju Nishad",
    sellerPhone: "+919890123456",
    badges: [
      { label: "Direct Owner", variant: "owner" },
      { label: "Khatauni Verified", variant: "khatauni" },
    ],
    images: [
      "https://images.unsplash.com/photo-1514316703755-dca7d7d9d882?w=800&q=80",
    ],
    description: "Established fish farm with 2 operational ponds (Rohu & Katla). Sarda Canal water access. Near Mailani market for direct sale. PMKSY subsidy eligible land.",
    legalStatus: "freehold",
    immediateRegistry: false,
    singleOwner: false,
    featured: false,
    postedAt: "2026-07-22",
    views: 203,
  },
  {
    id: "prop-011",
    title: "Poplar Timber Plantation — Phoolbehar Road",
    slug: "poplar-plantation-phoolbehar-road",
    category: "poplar_plantation",
    village: "Palia Kalan",
    tehsil: "Palia",
    district: "Lakhimpur Kheri",
    location: "Phoolbehar Road, 6km from Palia",
    coordinates: { lat: 28.4460, lng: 80.5990 },
    price: 3200000,
    priceUnit: "total",
    area: 6,
    areaUnit: "bigha",
    pricePerBigha: 533333,
    pricePerAcre: 853333,
    irrigation: ["tubewell"],
    soilType: "sandy_loam",
    roadFrontage: 70,
    electricityConnection: true,
    distanceFromPalia: 6,
    highwayTouch: false,
    canalTouch: false,
    cropHistory: ["Poplar", "Eucalyptus", "Wheat (intercrop)"],
    khasraNumber: "567/3A",
    sellerType: "owner",
    sellerName: "Raj Kumar Gupta",
    sellerPhone: "+919901234567",
    badges: [
      { label: "Verified Seller", variant: "verified" },
      { label: "Direct Owner", variant: "owner" },
    ],
    images: [
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80",
    ],
    description: "6-bigha poplar plantation with 3-year-old standing trees. Ready for harvest in 4 years. Wheat intercropping for immediate income. Sandy loam ideal for poplar yield. 70-ft road frontage.",
    legalStatus: "freehold",
    immediateRegistry: true,
    singleOwner: true,
    featured: false,
    postedAt: "2026-07-12",
    views: 156,
  },
  {
    id: "prop-012",
    title: "Warehouse / Godown Plot — Palia Industrial Area",
    slug: "warehouse-plot-palia-industrial",
    category: "commercial_land",
    village: "Palia Kalan",
    tehsil: "Palia",
    district: "Lakhimpur Kheri",
    location: "Palia Industrial Area, Gola Road",
    coordinates: { lat: 28.4350, lng: 80.5810 },
    price: 5500000,
    priceUnit: "total",
    area: 5000,
    areaUnit: "sqft",
    pricePerBigha: 0,
    pricePerAcre: 4792000,
    irrigation: [],
    soilType: "alluvial_loam",
    roadFrontage: 60,
    electricityConnection: true,
    distanceFromPalia: 2,
    highwayTouch: true,
    canalTouch: false,
    cropHistory: [],
    khasraNumber: "89/2",
    sellerType: "verified_broker",
    sellerName: "Palia Realty Group",
    sellerPhone: "+919912345678",
    badges: [
      { label: "Verified Seller", variant: "verified" },
      { label: "Registry Ready", variant: "registry" },
    ],
    images: [
      "https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80",
    ],
    description: "5000 sq.ft. industrial-zoned land in Palia's growing commercial belt. 3-phase electricity, wide road, ideal for cold storage, agri-warehouse, or logistics facility serving the Terai belt.",
    legalStatus: "freehold",
    immediateRegistry: true,
    singleOwner: true,
    featured: false,
    postedAt: "2026-07-08",
    views: 512,
  },
];

export function getPropertyById(id: string): AgriProperty | undefined {
  return mockProperties.find((p) => p.id === id);
}

export function getPropertiesByCategory(category: PropertyCategory): AgriProperty[] {
  return mockProperties.filter((p) => p.category === category);
}
export function getPropertyBySlug(slug: string): AgriProperty | undefined {
  return mockProperties.find(p => p.slug === slug);
}

export function getFeaturedProperties(): AgriProperty[] {
  return mockProperties.filter((p) => p.featured);
}

export function getPropertiesByVillage(village: string): AgriProperty[] {
  return mockProperties.filter((p) => p.village === village);
}
