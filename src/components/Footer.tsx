"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const TOS_CONTENT = `
TERMS OF SERVICE

Effective Date: September 2026

Welcome to Ficus & Figs. By accessing our website, booking a stay, or utilizing our services, you agree to be bound by these comprehensive Terms of Service. Please read them carefully, as they govern your relationship with Ficus & Figs ("we," "us," or "our").

1. RESERVATIONS, DEPOSITS, AND PAYMENTS
1.1 Booking Confirmation: All reservations are considered provisional until a non-refundable deposit of 50% of the total booking cost is received and cleared. 
1.2 Final Payment: The remaining balance must be settled no later than 14 days prior to the scheduled date of arrival. Failure to remit payment may result in the cancellation of your reservation without refund of the initial deposit.
1.3 Accepted Methods: We accept major credit cards and wire transfers. All transactions are processed in USD or KES equivalent at the prevailing bank rate.

2. CANCELLATION AND MODIFICATION POLICY
2.1 Guest Cancellations: Cancellations made more than 30 days prior to arrival will incur a 20% administrative fee. Cancellations within 14-30 days forfeit the 50% deposit. Cancellations within 14 days of arrival result in a 100% forfeiture of the total booking cost.
2.2 Force Majeure: Ficus & Figs shall not be liable for any failure or delay in performing its obligations where such failure or delay results from any cause that is beyond its reasonable control, including acts of God, severe weather, governmental actions, or pandemics.

3. PROPERTY USE AND HOUSE RULES
3.1 Occupancy: The maximum occupancy of the estate is strictly limited to the number of guests declared at the time of booking. Unauthorized visitors or overnight guests are not permitted.
3.2 Events and Commercial Use: The estate is intended for private, tranquil retreats. Hosting parties, weddings, large gatherings, or commercial photography/videography without prior written consent and the payment of applicable venue fees is strictly prohibited and constitutes grounds for immediate eviction without refund.
3.3 Conduct: Guests must respect the tranquility of the surroundings and the neighboring properties. Quiet hours are enforced between 10:00 PM and 7:00 AM.

4. DAMAGES, LIABILITY, AND SECURITY
4.1 Security Deposit: A pre-authorization security deposit may be required upon check-in to cover potential incidental damages.
4.2 Guest Liability: You are fully responsible for the cost of repairing any damage to the property, furnishings, fixtures, or grounds caused by you or any member of your party during your stay.
4.3 Limitation of Liability: Ficus & Figs, its owners, and its staff shall not be held liable for any personal injury, loss, damage, or theft of guest property occurring on the premises, except where such injury or loss is caused by our gross negligence.

5. INTELLECTUAL PROPERTY
All content on this website, including but not limited to text, high-resolution photography, branding, and design, is the exclusive intellectual property of Ficus & Figs and is protected by international copyright laws. Unauthorized reproduction is strictly forbidden.

6. GOVERNING LAW AND DISPUTE RESOLUTION
These terms shall be governed by and construed in accordance with the laws of the Republic of Kenya. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts of Nairobi, Kenya.
`;

const PRIVACY_CONTENT = `
PRIVACY POLICY

Effective Date: September 2026

Ficus & Figs ("we," "us," or "our") is deeply committed to protecting your privacy and ensuring the security of your personal data. This Privacy Policy outlines our practices regarding the collection, use, processing, and disclosure of information when you interact with our website or utilize our hospitality services.

1. INFORMATION WE COLLECT
1.1 Personally Identifiable Information (PII): When you make a reservation, inquire about our services, or subscribe to our communications, we collect personal details including, but not limited to, your full name, email address, physical address, phone number, and passport/identification details (required by local law for lodging).
1.2 Financial Data: Payment details, such as credit card numbers and billing addresses, are collected exclusively for transaction processing. We do not store full credit card numbers on our servers; these are handled directly by our PCI-DSS compliant third-party payment gateways.
1.3 Automated Data Collection: We automatically collect technical information about your visit to our website, including your IP address, browser type, operating system, pages viewed, and the timestamp of your visit, to optimize our digital experience.

2. HOW WE USE YOUR INFORMATION
2.1 Service Provision: To process reservations, manage check-ins/check-outs, and provide personalized hospitality services during your stay.
2.2 Communication: To send you booking confirmations, pre-arrival questionnaires, administrative notices, and, provided you have explicitly opted-in, exclusive promotional offers regarding Ficus & Figs.
2.3 Compliance and Security: To comply with local regulatory requirements for guest registration and to detect, prevent, and address fraud, security breaches, or technical issues.

3. DATA SHARING AND DISCLOSURE
We do not sell, rent, or trade your personal data to third parties. Your information may only be shared with:
3.1 Trusted Service Providers: Third-party vendors who perform services on our behalf (e.g., payment processing, email delivery, legal counsel), strictly under confidentiality agreements.
3.2 Legal Authorities: When compelled by law, subpoena, or court order to disclose information to governmental or law enforcement authorities.

4. DATA RETENTION AND SECURITY
We retain your personal information only for as long as is necessary for the purposes set out in this policy and to satisfy any legal, accounting, or reporting requirements. We implement robust, industry-standard physical, electronic, and managerial procedures to safeguard your data against unauthorized access, alteration, or disclosure.

5. COOKIES AND TRACKING TECHNOLOGIES
Our website utilizes cookies and similar tracking technologies to enhance user experience, analyze site traffic, and understand user behavior. You have the right to accept or decline cookies via your browser settings or our integrated Cookie Consent manager.

6. YOUR RIGHTS
Depending on your jurisdiction (including compliance with GDPR for European citizens), you may have the right to request access to, correction of, or deletion of your personal data held by us. To exercise these rights, please contact our Data Protection Officer at privacy@kiambubnb.com.
`;

const WhatsappIcon = ({ className, strokeWidth = 1.5 }: { className?: string, strokeWidth?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export function Footer() {
  const [modalContent, setModalContent] = useState<{ title: string; body: string } | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const settings = useQuery(api.settings?.getSettings || (() => null));
  const submitInquiry = useMutation(api.inquiries?.submitInquiry || (() => Promise.resolve()));

  const openModal = (title: string, body: string) => {
    setModalContent({ title, body });
  };

  const closeModal = () => {
    setModalContent(null);
  };

  return (
    <>
      <footer id="contact" className="min-h-screen flex flex-col pt-24 md:pt-32 pb-8 bg-[#0a0a0a] border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22180%22 height=%22180%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')] opacity-[0.03] mix-blend-overlay"></div>
        
        <div className="flex-1 flex flex-col justify-center w-full relative z-10">
          <div className="max-w-[100rem] w-full mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
            
            {/* Left: Info & Links */}
            <div className="md:col-span-7 flex flex-col justify-between py-4 order-2 md:order-1">
              <div>
                <h3 className="text-5xl md:text-7xl font-serif font-light tracking-tighter mb-8 whitespace-pre-wrap">{settings === undefined ? "\u00A0" : (settings?.propertyName ? settings.propertyName.replace(" ", "\n") + "." : "Ficus and\nFigs.")}</h3>

                <div className="space-y-4 text-white/70 font-light mt-8">
                  <p className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[#c2a27c]" /> Kiambu Hills, Kenya
                  </p>
                  <a href={`mailto:${settings?.email || "info@ficusandfigs.com"}`} className="flex items-center gap-3 hover:text-[#c2a27c] transition-colors w-fit">
                    <Mail className="w-4 h-4 text-[#c2a27c]" /> {settings?.email || "info@ficusandfigs.com"}
                  </a>
                  <a href={`tel:${settings?.phone ? settings.phone.replace(/\D/g,'') : "+254708443090"}`} className="flex items-center gap-3 hover:text-[#c2a27c] transition-colors w-fit">
                    <Phone className="w-4 h-4 text-[#c2a27c]" /> {settings?.phone || "+254 708 443 090"}
                  </a>
                </div>
                
                <div className="flex flex-wrap gap-6 mt-10">
                  <a href={settings?.instagram || "#"} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-[#c2a27c] hover:text-[#c2a27c] transition-all duration-300">
                    <Instagram className="w-5 h-5" strokeWidth={1.5} />
                  </a>
                  <a href={settings?.facebook || "#"} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-[#c2a27c] hover:text-[#c2a27c] transition-all duration-300">
                    <Facebook className="w-5 h-5" strokeWidth={1.5} />
                  </a>
                  <a href={settings?.twitter || "#"} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-[#c2a27c] hover:text-[#c2a27c] transition-all duration-300">
                    <Twitter className="w-5 h-5" strokeWidth={1.5} />
                  </a>
                  <a href={settings?.whatsapp ? `https://wa.me/${settings.whatsapp.replace(/\D/g,'')}` : "#"} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-[#c2a27c] hover:text-[#c2a27c] transition-all duration-300">
                    <WhatsappIcon className="w-5 h-5" strokeWidth={1.5} />
                  </a>
                </div>
              </div>

              <div className="flex gap-8 mt-20 md:mt-0 pt-8 border-t border-white/10">
                <button 
                  onClick={() => openModal("Terms of Service", TOS_CONTENT)}
                  className="font-mono text-xs uppercase tracking-widest text-white/50 hover:text-[#c2a27c] transition-colors cursor-pointer"
                >
                  Terms of Service
                </button>
                <button 
                  onClick={() => openModal("Privacy Policy", PRIVACY_CONTENT)}
                  className="font-mono text-xs uppercase tracking-widest text-white/50 hover:text-[#c2a27c] transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="md:col-span-5 order-1 md:order-2 backdrop-blur-md bg-white/5 border border-white/10 p-8 md:p-10 rounded-2xl">
              <h3 className="text-3xl font-serif font-light mb-2">Inquire About a Stay</h3>
              <p className="text-white/60 text-sm mb-8 font-light">Leave your details and we will reach out to arrange your visit.</p>
              
              <form 
                className="space-y-8" 
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!email || !message) return;
                  setIsSubmitting(true);
                  try {
                    await submitInquiry({
                      name: fullName.trim(),
                      email,
                      subject: "Website Inquiry",
                      message
                    });
                    setSubmitSuccess(true);
                    setFullName("");
                    setEmail("");
                    setMessage("");
                    setTimeout(() => setSubmitSuccess(false), 5000);
                  } catch (e) {
                    console.error("Failed to submit", e);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                <div className="grid grid-cols-1 gap-8">
                  <input type="text" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Full Name" required className="w-full bg-transparent border-b border-white/20 px-0 py-2 text-sm focus:outline-none focus:border-[#c2a27c] transition-colors text-white placeholder-white/40" />
                </div>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email Address" required className="w-full bg-transparent border-b border-white/20 px-0 py-2 text-sm focus:outline-none focus:border-[#c2a27c] transition-colors text-white placeholder-white/40" />
                <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Tell us about your intended stay" required rows={3} className="w-full bg-transparent border-b border-white/20 px-0 py-2 text-sm focus:outline-none focus:border-[#c2a27c] transition-colors text-white placeholder-white/40 resize-none"></textarea>
                
                <button disabled={isSubmitting || submitSuccess} className="relative group inline-flex items-center justify-center px-10 py-4 mt-2 w-full cursor-pointer disabled:opacity-50">
                  <div className={`absolute inset-0 skew-x-[-15deg] transition-transform duration-500 ${submitSuccess ? 'bg-green-500' : 'bg-[#c2a27c] group-hover:scale-105'}`}></div>
                  <span className="relative z-10 text-black font-mono uppercase tracking-[0.2em] text-xs font-bold">
                    {submitSuccess ? "Message Sent!" : (isSubmitting ? "Sending..." : "Send Inquiry")}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Copyright & Bottom Spacing */}
        <div className="mt-8 md:mt-12 pt-6 flex items-center justify-center text-center w-full border-t border-white/5 relative z-10">
            <p className="font-mono text-[10px] tracking-[0.2em] text-white/20 uppercase">
              &copy; {new Date().getFullYear()} Ficus and Figs. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Policy Modal */}
      <AnimatePresence>
        {modalContent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-xl"
            />
            
            <motion.div 
              data-lenis-prevent="true"
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-[#100f0d] border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl overscroll-contain"
            >
              <button 
                onClick={closeModal}
                className="absolute top-6 right-6 font-mono text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors"
              >
                Close
              </button>
              
              <h2 className="text-3xl font-serif mb-8 text-[#c2a27c]">{modalContent.title}</h2>
              <div className="text-white/70 font-light leading-relaxed space-y-6 text-sm whitespace-pre-wrap font-sans">
                {modalContent.body}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
