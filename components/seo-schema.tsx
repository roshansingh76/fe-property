// Server Component — renders JSON-LD structured data scripts

interface SeoSchemaProps {
  page?: "home" | "listings" | "property";
  propertyTitle?: string;
  propertyPrice?: number;
  propertyDescription?: string;
  propertyUrl?: string;
}

export function SeoSchema({
  page = "home",
  propertyTitle,
  propertyPrice,
  propertyDescription,
  propertyUrl,
}: SeoSchemaProps) {
  const siteUrl = "https://paliaproperty.in";

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${siteUrl}/#organization`,
    name: "Palia Property Hub",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description:
      "Palia Property Hub is the leading agricultural and real estate marketplace for Palia Kalan and surrounding areas in Lakhimpur Kheri, Uttar Pradesh. Buy and sell sugarcane farms, residential plots, farmhouses, and commercial land.",
    telephone: "+91-9876543210",
    email: "info@paliaproperty.in",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Main Market, Near Bus Stand",
      addressLocality: "Palia Kalan",
      addressRegion: "Uttar Pradesh",
      postalCode: "262902",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 28.4328,
      longitude: 80.5889,
    },
    areaServed: [
      { "@type": "City", name: "Palia Kalan" },
      { "@type": "City", name: "Sampurna Nagar" },
      { "@type": "City", name: "Mailani" },
      { "@type": "City", name: "Tikunia" },
      { "@type": "City", name: "Lakhimpur Kheri" },
    ],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "19:00",
    },
    sameAs: [
      "https://facebook.com/paliaproperty",
      "https://instagram.com/paliaproperty",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: "Palia Property Hub",
    description: "Buy & Sell Agriculture Land, Farmhouses, Residential & Commercial Property in Palia Kalan, Lakhimpur Kheri",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/listings?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "en-IN",
    publisher: {
      "@id": `${siteUrl}/#organization`,
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How to buy agriculture land in Palia Kalan?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Use Palia Property Hub to browse verified sugarcane farms, paddy fields, and orchards in Palia Kalan. Filter by village, area (Bigha/Acre), irrigation type, and budget. Contact sellers directly via WhatsApp.",
        },
      },
      {
        "@type": "Question",
        name: "What is the price of agricultural land near Lakhimpur Kheri?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Agricultural land prices in Lakhimpur Kheri (Palia Kalan area) range from ₹3-8 Lakh per Bigha depending on irrigation, road frontage, and soil type. Highway-touch land commands a premium of 30-50%.",
        },
      },
      {
        "@type": "Question",
        name: "Is land available near Dudhwa National Park?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! Palia Property Hub lists farmhouse plots and resort development land in the buffer zone around Dudhwa National Park near Tikunia and Mailani villages. Ideal for eco-resorts and nature retreats.",
        },
      },
      {
        "@type": "Question",
        name: "How many bigha is one acre in UP?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "In Uttar Pradesh (Terai / Palia Kalan region), 1 Acre = approximately 1.6 Pucca Bigha (or 4-5 Kucha Bigha locally). 1 Pucca Bigha = 0.62 Acres = 27,000 Sq. Ft. Use our built-in converter for accurate calculations.",
        },
      },
      {
        "@type": "Question",
        name: "Are listings free on Palia Property Hub?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, listing your property on Palia Property Hub is completely free for individual farmers and property owners. No commission, no hidden charges.",
        },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      ...(page === "listings" ? [{ "@type": "ListItem", position: 2, name: "Property Listings", item: `${siteUrl}/listings` }] : []),
      ...(page === "property" && propertyTitle ? [
        { "@type": "ListItem", position: 2, name: "Property Listings", item: `${siteUrl}/listings` },
        { "@type": "ListItem", position: 3, name: propertyTitle, item: propertyUrl ?? siteUrl },
      ] : []),
    ],
  };

  const propertySchema = page === "property" && propertyTitle ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: propertyTitle,
    description: propertyDescription,
    url: propertyUrl ?? siteUrl,
    offers: {
      "@type": "Offer",
      price: propertyPrice,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      seller: {
        "@id": `${siteUrl}/#organization`,
      },
    },
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {page === "home" && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {propertySchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(propertySchema) }}
        />
      )}
    </>
  );
}
