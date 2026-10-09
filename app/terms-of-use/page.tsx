import { LegalPage } from "@/components/legal-page";

export default function TermsOfUsePage() {
  return (
    <LegalPage
      title="Terms of Use"
      introduction="These terms apply when you use Palia Property Hub to browse property information, publish a listing or contact another user."
      sections={[
        {
          title: "Using the service",
          points: [
            "Provide accurate information and keep your account contact details current.",
            "Keep one-time-password codes and account access under your control. You are responsible for activity carried out through your account.",
            "Do not publish misleading or unauthorised material, impersonate another person, misuse contact information or interfere with the service.",
          ],
        },
        {
          title: "Listings and enquiries",
          paragraphs: [
            "Users are responsible for the accuracy and authority of the information they submit. A listing or profile on the platform is not, by itself, proof of ownership, identity, title, legal status or authority to transact.",
            "When you submit an enquiry, you authorise us to share the details needed to respond with the relevant listing owner or representative. Use contact details only for the enquiry and applicable law.",
          ],
        },
        {
          title: "Property transactions",
          paragraphs: [
            "Buyers, sellers and brokers are responsible for their own discussions, negotiations and transactions. Before paying, signing or taking possession, independently verify ownership, land records, boundaries, access, permissions, encumbrances and all other material facts with qualified professionals and the appropriate authorities.",
            "Palia Property Hub is a marketplace service and is not a party to agreements between users. We do not guarantee a listing, user, transaction, outcome or the availability of any property.",
          ],
        },
        {
          title: "Availability and changes",
          paragraphs: [
            "We may update or suspend parts of the service to maintain security, comply with obligations or improve the platform. We may restrict accounts or content that appear to violate these terms or create risk for users.",
          ],
        },
      ]}
    />
  );
}