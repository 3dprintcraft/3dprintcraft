import { motion } from "framer-motion";
import { Zap, Home, Building2, Lightbulb, Shield, Wrench, Cpu, Sun } from "lucide-react";

const services = [
  {
    icon: Zap,
    title: "Ηλεκτρολογικές Εγκαταστάσεις",
    desc: "Ολοκληρωμένες ηλεκτρολογικές εγκαταστάσεις για νέες κατασκευές και ανακαινίσεις.",
  },
  {
    icon: Home,
    title: "Οικιακές Υπηρεσίες",
    desc: "Επισκευές, αντικαταστάσεις πινάκων, νέες γραμμές και αναβαθμίσεις.",
  },
  {
    icon: Building2,
    title: "Επαγγελματικοί Χώροι",
    desc: "Ηλεκτρολογικές λύσεις για καταστήματα, γραφεία και βιομηχανικούς χώρους.",
  },
  {
    icon: Lightbulb,
    title: "Φωτισμός & LED",
    desc: "Σχεδιασμός φωτισμού, εγκατάσταση LED και ενεργειακά αποδοτικές λύσεις.",
  },
  {
    icon: Cpu,
    title: "Αυτοματισμοί & Smart Home",
    desc: "Έξυπνα συστήματα σπιτιού, αυτοματισμοί φωτισμού και ελέγχου.",
  },
  {
    icon: Shield,
    title: "Συστήματα Ασφαλείας",
    desc: "Εγκατάσταση συναγερμών, καμερών και συστημάτων θυροτηλεόρασης.",
  },
  {
    icon: Wrench,
    title: "Συντήρηση & Επισκευές",
    desc: "Τακτική συντήρηση και άμεσες επισκευές βλαβών 24/7.",
  },
  {
    icon: Sun,
    title: "Φωτοβολταϊκά",
    desc: "Εγκατάσταση και συντήρηση φωτοβολταϊκών συστημάτων.",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="section-padding">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-heading font-semibold text-sm tracking-widest uppercase mb-3 block">
            Υπηρεσίες
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
            Τι <span className="text-gradient">Προσφέρουμε</span>
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
            Πλήρες φάσμα ηλεκτρολογικών υπηρεσιών με εγγύηση ποιότητας και ασφάλειας.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group p-6 rounded-xl bg-card border border-border hover:border-primary/30 hover:glow-sm transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <service.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">{service.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
