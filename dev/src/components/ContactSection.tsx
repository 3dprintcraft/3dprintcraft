import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Send, Instagram } from "lucide-react";

const ViberIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M11.4 0C5.5 0 .6 4.4.6 9.8c0 2.8 1.2 5.3 3.2 7.1v3.8l3.6-2c1.2.3 2.5.5 3.9.5 5.9 0 10.8-4.4 10.8-9.8C22.1 4.4 17.3 0 11.4 0zm.1 17.6c-1.3 0-2.5-.2-3.6-.6l-.4-.1-2.5 1.3.7-2.5-.3-.3C3.9 14.2 2.8 12.1 2.8 9.8c0-4.7 3.9-8.5 8.7-8.5s8.7 3.8 8.7 8.5-3.9 8.5-8.7 8.5v.1zm4.8-6.2c-.3-.1-1.6-.8-1.8-.9-.3-.1-.5-.1-.7.1-.2.2-.8.9-1 1.1-.2.2-.4.2-.6.1-.8-.4-1.6-.9-2.3-1.5-.6-.6-1.2-1.3-1.6-2.1-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.2-.5 0-.2-.6-1.5-.8-2-.2-.5-.5-.4-.7-.4h-.6c-.2 0-.5.1-.8.4-.8.8-1.2 1.7-1.2 2.7 0 1.6.9 3.2 2.3 4.7 1.8 2.1 4 3.3 6.4 3.8.5.1 1.1.1 1.6-.1.6-.3 1-.7 1.3-1.3.1-.3.1-.7 0-.9z"/>
  </svg>
);

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Νέο μήνυμα από ${formData.name}`);
    const body = encodeURIComponent(
      `Όνομα: ${formData.name}\nEmail: ${formData.email}\nΤηλέφωνο: ${formData.phone}\n\nΜήνυμα:\n${formData.message}`
    );
    window.location.href = `mailto:ilektrokalypsi@gmail.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section id="contact" className="section-padding bg-card/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-heading font-semibold text-sm tracking-widest uppercase mb-3 block">
            Επικοινωνία
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
            Επικοινωνήστε <span className="text-gradient">Μαζί μας</span>
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
            Είμαστε στη διάθεσή σας για κάθε ηλεκτρολογική ανάγκη.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex items-start gap-4 p-5 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-semibold mb-2">Τηλέφωνα</h3>
                <a href="tel:+302610338350" className="block text-muted-foreground hover:text-primary transition-colors">
                  📞 Fax: 2610 33 83 50
                </a>
                <a href="tel:+306907761446" className="block text-muted-foreground hover:text-primary transition-colors">
                  📱 Γιάννης Δημόπουλος: 690 776 1446
                </a>
                <a href="tel:+306932773017" className="block text-muted-foreground hover:text-primary transition-colors">
                  📱 Βασίλης Δημόπουλος: 693 277 3017
                </a>

                {/* Viber button — visible only on mobile */}
                <a
                  href="viber://call?number=+306907761446"
                  className="sm:hidden mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-heading font-semibold text-sm text-white transition-all hover:brightness-110"
                  style={{ backgroundColor: "#7360F2" }}
                >
                  <ViberIcon />
                  Viber
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-semibold mb-2">Email</h3>
                <a href="mailto:ilektrokalypsi@gmail.com" className="text-muted-foreground hover:text-primary transition-colors break-all">
                  ilektrokalypsi@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Instagram className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-semibold mb-2">Social Media</h3>
                <a
                  href="https://instagram.com/ilektrokalypsi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  @ilektrokalypsi
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-semibold mb-2">Κατάστημα</h3>
                <p className="text-muted-foreground">Πάτρα, Ελλάδα</p>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="space-y-5 p-6 sm:p-8 rounded-2xl bg-card border border-border"
          >
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Ονοματεπώνυμο
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Το όνομά σας"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Τηλέφωνο
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="69x xxx xxxx"
                />
              </div>
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Μήνυμα
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                placeholder="Περιγράψτε τι χρειάζεστε..."
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-primary text-primary-foreground font-heading font-bold text-lg hover:brightness-110 transition-all glow-sm"
            >
              <Send className="w-5 h-5" />
              {submitted ? "Ευχαριστούμε! ✓" : "Αποστολή Μηνύματος"}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
