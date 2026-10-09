import { LegalPage } from "@/components/legal-page";

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      introduction="This policy describes how Palia Property Hub uses information you provide when browsing listings, creating an account, publishing a property or contacting a buyer or seller."
      sections={[
        {
          title: "Information we collect",
          points: [
            "Account details such as your mobile number, display name and account type. Mobile numbers are used for one-time-password sign-in.",
            "Property details and contact information you submit when publishing a listing.",
            "Buyer enquiry details, including contact information, property preferences and messages you choose to send.",
            "Basic technical and usage information needed to operate, protect and improve the service.",
          ],
        },
        {
          title: "How information is used",
          paragraphs: [
            "We use submitted information to provide accounts, publish and manage listings, respond to enquiries, connect people about relevant properties, prevent misuse and maintain the service.",
            "When you enquire about a listing, the contact details and message you submit are shared with the listing owner or their authorised representative so they can respond.",
          ],
        },
        {
          title: "Sharing and disclosure",
          paragraphs: [
            "We do not sell personal contact information. Information may be shared with the people involved in an enquiry, service providers that help operate the platform, or where disclosure is required to address security, legal or regulatory obligations.",
          ],
        },
        {
          title: "Storage and security",
          paragraphs: [
            "Sign-in credentials are stored in your browser to keep you signed in. We use reasonable safeguards for information handled by the platform, but no online service can guarantee absolute security. Information is retained as needed to operate the service and meet applicable obligations.",
          ],
        },
        {
          title: "Your choices",
          paragraphs: [
            "You can contact us to ask about information associated with your account or request a correction. Some information may need to be retained where required for service, security or legal purposes.",
          ],
        },
      ]}
    />
  );
}