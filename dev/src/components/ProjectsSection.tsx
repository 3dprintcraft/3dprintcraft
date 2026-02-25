import { motion } from "framer-motion";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";
import project4 from "@/assets/project-4.jpg";

const projects = [
  { img: project1, title: "Smart Home Αυτοματισμοί", category: "Οικιακό" },
  { img: project2, title: "Βιομηχανικός Πίνακας", category: "Επαγγελματικό" },
  { img: project3, title: "Σχεδιασμός Φωτισμού", category: "Οικιακό" },
  { img: project4, title: "Φωτοβολταϊκά Συστήματα", category: "Ανανεώσιμες Πηγές" },
];

const ProjectsSection = () => {
  return (
    <section id="projects" className="section-padding bg-card/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-heading font-semibold text-sm tracking-widest uppercase mb-3 block">
            Portfolio
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
            Τα <span className="text-gradient">Έργα</span> μας
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
            Δείγματα από τις εγκαταστάσεις και τα έργα που έχουμε ολοκληρώσει.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="group relative overflow-hidden rounded-xl aspect-[4/3]"
            >
              <img
                src={project.img}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <span className="text-primary-foreground/80 text-xs font-heading font-semibold tracking-widest uppercase">
                  {project.category}
                </span>
                <h3 className="text-xl font-heading font-bold mt-1 text-white">{project.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
