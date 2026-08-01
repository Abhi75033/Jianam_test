import { useState } from "react";
import {
  HelpCircle, Phone, MessageSquare, ShieldAlert, LifeBuoy, FileText, Send, CheckCircle
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

export default function MemberSupportPage() {
  const { t } = useLanguage();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error(t("Please enter both subject and message."));
      return;
    }
    setSubmitted(true);
    toast.success(t("Support ticket submitted! Ticket ID: #JIN-9842"));
  };

  return (
    <div className="space-y-8">
      
      {/* ── Top Header Banner ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <LifeBuoy className="h-6 w-6 text-red-500" />
            <span>{t("Emergency Help & Support Desk")}</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            24/7 Helpline, Emergency Medical & Yatra Assistance, and Support Ticket Management.
          </p>
        </div>
      </div>

      {/* ── Emergency Call Helpline Banner ───────────────────────────────── */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl shrink-0">
            🚨
          </div>
          <div>
            <h2 className="text-xl font-black">24/7 Jain Yatra & Medical Emergency Helpline</h2>
            <p className="text-xs text-white/90 font-medium mt-0.5">Need immediate assistance during Yatra, hospital emergency, or senior citizen help?</p>
          </div>
        </div>

        <a
          href="tel:1800108108"
          className="px-6 py-3.5 bg-white text-red-600 font-black text-xs rounded-2xl shadow-lg hover:bg-red-50 transition-colors shrink-0 flex items-center gap-2"
        >
          <Phone className="h-4 w-4" />
          <span>Call 1800-108-108 (Toll Free)</span>
        </a>
      </div>

      {/* ── Support Ticket Form & FAQ Grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Submit Ticket Column */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-orange-500" />
            <span>{t("Submit a Support Ticket")}</span>
          </h2>

          {submitted ? (
            <div className="p-6 bg-green-50 border border-green-200 rounded-2xl text-center space-y-2">
              <CheckCircle className="h-10 w-10 text-green-600 mx-auto" />
              <h3 className="text-sm font-bold text-green-900">Ticket Submitted Successfully!</h3>
              <p className="text-xs text-green-700">Ticket ID: <strong>#JIN-9842</strong>. Our support team will contact you shortly.</p>
              <button onClick={() => { setSubmitted(false); setSubject(""); setMessage(""); }} className="mt-3 px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-xl">
                Submit Another Ticket
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Subject / Topic</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Booking Receipt issue, Account Verification, Yatra query..."
                  className="w-full px-4 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Describe your query in detail</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain how our support team can assist you..."
                  className="w-full px-4 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="h-4 w-4" />
                <span>Submit Ticket</span>
              </button>
            </form>
          )}
        </div>

        {/* FAQs Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-orange-500" />
              <span>Frequently Asked Questions</span>
            </h3>
            {[
              { q: "How do I download my donation receipt?", a: "Go to Profile → Wallet to download your instant PDF donation receipts." },
              { q: "How is my digital ID verified?", a: "Your ID is verified using unique signed token encryption linked to your profile." },
              { q: "Can I update my Gaccha & Sub-Sect details?", a: "Yes, visit Profile → Edit Profile to update community credentials anytime." },
            ].map((faq, i) => (
              <div key={i} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1">
                <div className="text-xs font-bold text-slate-900">{faq.q}</div>
                <div className="text-[11px] text-slate-500 leading-relaxed">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
