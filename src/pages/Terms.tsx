import { useState } from "react";

const tabs = ["Terms of Service", "Privacy Policy"] as const;
type Tab = (typeof tabs)[number];

const termsContent = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing or using MyFit ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform. These terms apply to all users including visitors, registered users, and creators.`,
  },
  {
    title: "2. Eligibility",
    body: `You must be at least 18 years of age to use MyFit. By using the Platform, you represent and warrant that you meet this requirement. Users under 18 may use the Platform only with verified parental consent.`,
  },
  {
    title: "3. User Accounts",
    body: `You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately at support@myfittt.com if you suspect any unauthorized use of your account. MyFit is not liable for losses caused by unauthorized account access resulting from your failure to safeguard your credentials.`,
  },
  {
    title: "4. Bookings & Payments",
    body: `All bookings are subject to creator availability and confirmed only upon successful payment. Prices are listed in Indian Rupees (INR) and include applicable taxes. MyFit charges a platform fee of 15% on each transaction. Payments are processed securely via our payment partners.`,
  },
  {
    title: "5. Cancellations & Refunds",
    body: `Users may cancel a booking up to 12 hours before the scheduled session for a full refund. Cancellations within 12 hours are subject to the creator's individual cancellation policy. Refunds, where applicable, are processed within 5–7 business days. MyFit reserves the right to issue refunds at its discretion in cases of platform error or creator no-show.`,
  },
  {
    title: "6. Creator Conduct",
    body: `Creators on MyFit agree to provide services as described in their profile, maintain professional conduct at all times, hold any certifications they claim to hold, and not solicit users to transact outside the Platform. Violation of these terms may result in account suspension or permanent removal.`,
  },
  {
    title: "7. Prohibited Activities",
    body: `You agree not to use the Platform to: post false or misleading information; harass, threaten, or harm other users; attempt to reverse-engineer or compromise Platform security; use automated scripts to access or interact with the Platform; or engage in any activity that violates applicable Indian law.`,
  },
  {
    title: "8. Intellectual Property",
    body: `All content on MyFit — including logos, design, text, and software — is the property of MyFit or its licensors and is protected under Indian and international intellectual property law. You may not reproduce, distribute, or create derivative works without express written permission.`,
  },
  {
    title: "9. Limitation of Liability",
    body: `MyFit provides the Platform on an "as is" basis. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Platform, including physical injury arising from fitness sessions booked through the Platform. Users engage in physical activity at their own risk.`,
  },
  {
    title: "10. Changes to Terms",
    body: `MyFit reserves the right to modify these Terms at any time. Changes will be communicated via email or a prominent notice on the Platform. Continued use of the Platform after changes constitutes acceptance of the revised Terms.`,
  },
  {
    title: "11. Governing Law",
    body: `These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka.`,
  },
  {
    title: "12. Contact",
    body: `For questions about these Terms, contact us at legal@myfittt.com.`,
  },
];

const privacyContent = [
  {
    title: "1. Information We Collect",
    body: `We collect information you provide directly: name, email address, phone number, and password when you register. We also collect usage data (pages visited, session duration, device type), payment information (processed securely by our payment partners — we do not store card details), and fitness preferences you provide when browsing or booking.`,
  },
  {
    title: "2. How We Use Your Information",
    body: `We use your information to: create and manage your account; process bookings and payments; send OTP verification and transactional emails; personalize your experience; send service updates and promotional communications (you may opt out at any time); and improve the Platform through analytics.`,
  },
  {
    title: "3. Data Sharing",
    body: `We do not sell your personal data. We share data with: creators (limited to booking details needed to fulfil your session); payment processors (Razorpay or equivalent) for transaction processing; email service providers (Resend) solely for sending transactional emails; and analytics providers under strict data processing agreements.`,
  },
  {
    title: "4. Data Storage & Security",
    body: `Your data is stored on secure cloud servers located in India and the United States. We use industry-standard encryption (TLS in transit, AES-256 at rest) and access controls to protect your information. Passwords are hashed using bcrypt and never stored in plain text.`,
  },
  {
    title: "5. Cookies",
    body: `MyFit uses cookies and similar technologies to maintain your session, remember your preferences, and understand how you use the Platform. You may disable cookies in your browser settings, but some features of the Platform may not function correctly as a result.`,
  },
  {
    title: "6. Your Rights",
    body: `You have the right to: access the personal data we hold about you; request correction of inaccurate data; request deletion of your account and associated data; opt out of marketing communications; and lodge a complaint with the relevant data protection authority. To exercise these rights, contact privacy@myfittt.com.`,
  },
  {
    title: "7. Data Retention",
    body: `We retain your account data for as long as your account is active. Upon account deletion, we delete your personal data within 30 days, except where retention is required by law (e.g., financial transaction records retained for 7 years as per Indian accounting law).`,
  },
  {
    title: "8. Children's Privacy",
    body: `MyFit is not directed to children under 18. We do not knowingly collect personal data from minors. If we become aware that a minor has provided us personal data, we will delete it promptly.`,
  },
  {
    title: "9. Changes to This Policy",
    body: `We may update this Privacy Policy periodically. We will notify you of significant changes via email. Your continued use of the Platform after changes constitutes acceptance of the updated Policy.`,
  },
  {
    title: "10. Contact",
    body: `For privacy-related questions or requests, contact us at privacy@myfittt.com.`,
  },
];

export default function Terms() {
  const [activeTab, setActiveTab] = useState<Tab>("Terms of Service");
  const content = activeTab === "Terms of Service" ? termsContent : privacyContent;

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="border-b border-border/60 bg-secondary/20">
        <div className="container-app py-20 text-center">
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-4">
            Legal <span className="text-accent">Documents</span>
          </h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>

          {/* Tab switcher */}
          <div className="inline-flex gap-1 rounded-xl border border-border/60 bg-background p-1 mt-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-6 py-2 text-sm font-medium transition ${
                  activeTab === tab
                    ? "gradient-accent text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container-app py-16 max-w-3xl mx-auto">
        <div className="space-y-8">
          {content.map((section) => (
            <div key={section.title}>
              <h2 className="font-display font-semibold text-lg mb-3">{section.title}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-border/60 bg-secondary/30 p-6 text-sm text-muted-foreground">
          <p>
            Questions about our legal documents?{" "}
            <a href="mailto:legal@myfittt.com" className="text-accent hover:underline">
              legal@myfittt.com
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}