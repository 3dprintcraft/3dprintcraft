import { motion } from "framer-motion";
import { Award, Clock, Users, CheckCircle } from "lucide-react";
import aboutBg from "@/assets/about-bg.jpg";

const stats = [
  { icon: Clock, value: "25+", label: "Χρόνια Εμπειρίας" },
  { icon: Users, value: "1000+", label: "Ικανοποιημένοι Πελάτες" },
  { icon: Award, value: "100%", label: "Εγγύηση Ποιότητας" },
];

const values = [
  "Άμεση ανταπόκριση & εξυπηρέτηση",
  "Πιστοποιημένα υλικά & εξοπλισμός",
  "Τήρηση προθεσμιών & προϋπολογισμού",
  "Εξειδικευμένο & έμπειρο προσωπικό",
];

const AboutSection = () => {
  return (
    <section id="about" className="section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden aspect-[4/3]">
              <img
                src={aboutBg}
                alt="Η ομάδα μας"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 hidden sm:block px-6 py-4 rounded-xl bg-primary text-primary-foreground glow-md">
              <span className="text-3xl font-heading font-bold">25+</span>
              <p className="text-sm font-medium">Χρόνια Εμπειρίας</p>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-primary font-heading font-semibold text-sm tracking-widest uppercase mb-3 block">
              Η Εταιρεία μας
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-6">
              Αξιοπιστία που <span className="text-gradient">Χτίζεται</span> με Χρόνια
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Η <strong className="text-foreground">ΗΛΕΚΤΡΟΚΑΛΥΨΗ</strong> δραστηριοποιείται στον χώρο 
              των ηλεκτρολογικών εγκαταστάσεων εδώ και πάνω από 25 χρόνια. Με γνώμονα την ποιότητα, 
              την ασφάλεια και την τεχνολογική εξέλιξη, προσφέρουμε ολοκληρωμένες λύσεις 
              για κατοικίες και επαγγελματικούς χώρους.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Η οικογένεια Δημόπουλου — Γιάννης & Βασίλης — με πάθος για την αριστεία 
              και τη σύγχρονη τεχνολογία, εγγυάται κάθε εγκατάσταση.
            </p>

            <ul className="space-y-3 mb-8">
              {values.map((value) => (
                <li key={value} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{value}</span>
                </li>
              ))}
            </ul>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center p-4 rounded-xl bg-card border border-border">
                  <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <span className="text-2xl font-heading font-bold text-gradient block">
                    {stat.value}
                  </span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
