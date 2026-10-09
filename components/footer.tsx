import Link from "next/link";
import { Phone, Mail, MapPin, MessageCircle, Leaf, ArrowUpRight } from "lucide-react";

const LINKS = {
  "Buy Property": [
    { label: "Agriculture Land", href: "/listings?tab=buy_agri" },
    { label: "Sugarcane Farms", href: "/listings?category=sugarcane_farm" },
    { label: "Farmhouse & Resort", href: "/listings?category=farmhouse_resort" },
    { label: "Residential Plots", href: "/listings?category=residential_plot" },
    { label: "Commercial Land", href: "/listings?category=commercial_land" },
    { label: "Highway Land", href: "/listings?category=highway_investment" },
  ],
  "Locations": [
    { label: "Palia Kalan", href: "/listings?village=Palia+Kalan" },
    { label: "Sampurna Nagar", href: "/listings?village=Sampurna+Nagar" },
    { label: "Mailani", href: "/listings?village=Mailani" },
    { label: "Tikunia", href: "/listings?village=Tikunia" },
    { label: "Bela Kalan", href: "/listings?village=Bela+Kalan" },
    { label: "Bankey Ganj", href: "/listings?village=Bankey+Ganj" },
  ],
  "Tools": [
    { label: "Broker Login", href: "/broker/login" },
    { label: "Unit Converter", href: "/#converter" },
    { label: "Verify Khatauni", href: "/#guide" },
    { label: "Sell Property", href: "/#sell" },
    { label: "Dudhwa Resort Land", href: "/listings?category=farmhouse_resort" },
    { label: "Market Prices", href: "/#prices" },
    { label: "Contact Us", href: "/#contact" },
  ],
};

const SEO_PHRASES = [
  "Agriculture land for sale in Palia Kalan",
  "Sugarcane land near Lakhimpur Kheri",
  "Farmhouse plot near Dudhwa National Park",
  "Buy farmland in Sampurna Nagar",
  "Residential plot in Palia",
  "Bigha to Acre conversion UP",
];

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white" role="contentinfo">
      {/* CTA strip */}
      <div className="bg-gradient-to-r from-agri-green to-forest-700 px-4 md:px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-extrabold text-white mb-1">Ready to Buy or Sell Land?</h3>
            <p className="text-white/70 text-sm">Connect with local experts in Palia Kalan instantly.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <a
              href="https://wa.me/919876543210?text=Hi%2C%20I%20want%20to%20enquire%20about%20property"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold px-5 py-2.5 rounded-xl transition-all hover:scale-105"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp Us
            </a>
            <a
              href="tel:+919876543210"
              className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold px-5 py-2.5 rounded-xl transition-all"
            >
              <Phone className="w-4 h-4" /> Call Now
            </a>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-agri-green to-forest-600 rounded-xl flex items-center justify-center shadow-green">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-extrabold text-white text-lg leading-none">Palia Property Hub</div>
                <div className="text-white/40 text-[10px] uppercase tracking-widest font-semibold mt-0.5">Lakhimpur Kheri, UP</div>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-xs">
              The most trusted agricultural and real estate marketplace for Palia Kalan and the Terai region of Lakhimpur Kheri.
            </p>
            <div className="space-y-3">
              {[
                { href: "tel:+919876543210", icon: Phone, text: "+91 98765 43210" },
                { href: "https://wa.me/919876543210", icon: MessageCircle, text: "WhatsApp Us", color: "text-[#25D366]" },
                { href: "mailto:info@paliaproperty.in", icon: Mail, text: "info@paliaproperty.in" },
              ].map(item => (
                <a key={item.text} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-white/50 hover:text-white transition-colors group">
                  <div className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center flex-shrink-0 group-hover:bg-white/15 transition-colors">
                    <item.icon className={`w-3.5 h-3.5 ${item.color ?? ""}`} />
                  </div>
                  {item.text}
                </a>
              ))}
              <div className="flex items-start gap-2.5 text-sm text-white/50">
                <div className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span>Main Market, Near Bus Stand,<br />Palia Kalan — 262902, UP</span>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-white/80 font-bold text-xs uppercase tracking-widest mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.label}>
                    <Link href={link.href}
                      className="flex items-center gap-1 text-sm text-white/40 hover:text-white transition-colors duration-200 group">
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* SEO phrases */}
        <div className="mt-10 pt-8 border-t border-white/8">
          <p className="text-white/25 text-[10px] uppercase tracking-widest mb-3 font-bold">Popular Searches</p>
          <div className="flex flex-wrap gap-2">
            {SEO_PHRASES.map(phrase => (
              <span key={phrase} className="text-[11px] text-white/30 bg-white/5 border border-white/8 px-3 py-1 rounded-full hover:text-white/50 hover:border-white/15 transition-colors cursor-default">
                {phrase}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
          <p>© {new Date().getFullYear()} Palia Property Hub. Palia Kalan, Lakhimpur Kheri, Uttar Pradesh.</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-white/60 transition-colors">Log in / Register</Link>
            {["Privacy Policy", "Terms of Use", "Disclaimer"].map(l => (
              <Link key={l} href={`/${l.toLowerCase().replace(/ /g, "-")}`} className="hover:text-white/60 transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
