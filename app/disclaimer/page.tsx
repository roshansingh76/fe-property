import { LegalPage } from "@/components/legal-page";

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Property Information Disclaimer"
      introduction="Property information on Palia Property Hub is provided for general marketplace use. Verify all material details independently before making a decision."
      sections={[
        {
          title: "User-submitted information",
          paragraphs: [
            "Listings, photographs, descriptions, prices, measurements and contact details may be submitted or updated by users. Information can be incomplete, outdated or inaccurate. Review status or verification labels do not replace your own checks or establish legal title.",
          ],
        },
        {
          title: "Do your own due diligence",
          points: [
            "Confirm identity, ownership, title, khasra and khatauni records, boundaries and any co-owner or inheritance rights with the relevant authorities and qualified local professionals.",
            "Check access, land use, zoning, easements, utilities, taxes, disputes, encumbrances and permissions that may affect the property.",
            "Inspect the property in person and verify the agreed price, area, unit and transaction documents before paying or signing.",
          ],
        },
        {
          title: "No professional advice or transaction guarantee",
          paragraphs: [
            "Information on this site is not legal, financial, tax, valuation or investment advice. Consult appropriately qualified professionals for advice specific to your circumstances.",
            "The platform does not guarantee that a property is available, that a user is authorised to sell or represent it, or that a transaction will proceed or complete.",
          ],
        },
      ]}
    />
  );
}