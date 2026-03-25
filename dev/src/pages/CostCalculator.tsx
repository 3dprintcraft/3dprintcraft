import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, Settings, ChevronDown, ChevronUp, Printer, Zap, Wrench, Palette, Clock, TrendingUp, RotateCcw } from "lucide-react";
import logo from "@/assets/logo.png";

// ─── Constants ───────────────────────────────────────────────────────────────

const FILAMENTS = [
  // PLA family
  { id: "pla-basic",   name: "PLA Basic",    price: 19.99, color: "#4CAF50" },
  { id: "pla-matte",   name: "PLA Matte",    price: 22.99, color: "#8BC34A" },
  { id: "pla-silk",    name: "PLA Silk",     price: 24.99, color: "#FFD700" },
  { id: "pla-silk+",   name: "PLA Silk+",    price: 27.99, color: "#FFA500" },
  { id: "pla-lumi",    name: "PLA Luminous", price: 27.99, color: "#7CFC00" },
  { id: "pla-cf",      name: "PLA-CF",       price: 34.99, color: "#333333" },
  // PETG family
  { id: "petg-basic",  name: "PETG Basic",   price: 22.99, color: "#2196F3" },
  { id: "petg-hf",     name: "PETG-HF",      price: 24.99, color: "#1976D2" },
  { id: "petg-cf",     name: "PETG-CF",      price: 39.99, color: "#0D47A1" },
  // Engineering
  { id: "abs",         name: "ABS",          price: 22.99, color: "#9E9E9E" },
  { id: "asa",         name: "ASA",          price: 24.99, color: "#607D8B" },
  { id: "tpu-95a",     name: "TPU 95A",      price: 29.99, color: "#E91E63" },
  { id: "pa-cf",       name: "PA-CF",        price: 49.99, color: "#212121" },
  { id: "custom",      name: "Custom",       price: 0,     color: "#9C27B0" },
];

const PRINTERS = [
  { id: "a1-combo", name: "A1 Combo",  watts: 200, maintenancePerHour: 0.15 },
  { id: "p1s",      name: "P1S",       watts: 280, maintenancePerHour: 0.18 },
];

const DEFAULT_ELECTRICITY = 0.197; // €/kWh from bill (excl. municipal taxes)

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toFixed(2);
const fmtE = (n: number) => `€${fmt(n)}`;

// ─── Sub-components ──────────────────────────────────────────────────────────

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}
const Section = ({ icon, title, children }: SectionProps) => (
  <div className="bg-card border border-border rounded-xl p-5">
    <div className="flex items-center gap-2 mb-4">
      <span className="text-primary">{icon}</span>
      <h2 className="font-heading font-semibold text-foreground text-sm uppercase tracking-wider">{title}</h2>
    </div>
    {children}
  </div>
);

interface FieldProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
}
const Field = ({ label, children, hint }: FieldProps) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-muted-foreground">{label}</label>
    {children}
    {hint && <span className="text-xs text-muted-foreground/60">{hint}</span>}
  </div>
);

const inputCls = "w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow";
const selectCls = "w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow appearance-none cursor-pointer";

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CostCalculator() {
  // Printer & material
  const [printerId, setPrinterId]     = useState("p1s");
  const [filamentId, setFilamentId]   = useState("pla-basic");
  const [customPrice, setCustomPrice] = useState(0);

  // Print details
  const [printHours, setPrintHours]   = useState(0);
  const [printMins, setPrintMins]     = useState(0);
  const [filamentG, setFilamentG]     = useState(0);

  // Multi-color
  const [multiColor, setMultiColor]   = useState(false);
  const [numColors, setNumColors]     = useState(2);
  const [purgePerChange, setPurgePerChange] = useState(30); // grams per color change

  // Design time
  const [designHours, setDesignHours]     = useState(0);
  const [designRate, setDesignRate]       = useState(15); // €/h

  // Markup
  const [markup, setMarkup] = useState(30); // %

  // Settings panel
  const [showSettings, setShowSettings] = useState(false);
  const [electricityRate, setElectricityRate] = useState(DEFAULT_ELECTRICITY);
  const [maintenanceRate, setMaintenanceRate] = useState<Record<string, number>>({
    "a1-combo": 0.15,
    "p1s": 0.18,
  });

  // ── Derived ──
  const printer  = PRINTERS.find(p => p.id === printerId)!;
  const filament = FILAMENTS.find(f => f.id === filamentId)!;
  const pricePerKg = filamentId === "custom" ? customPrice : filament.price;

  const totalPrintHours = printHours + printMins / 60;
  const purgeWasteG     = multiColor && numColors > 1 ? (numColors - 1) * purgePerChange : 0;
  const totalFilamentG  = filamentG + purgeWasteG;

  const costs = useMemo(() => {
    const filamentCost   = (filamentG  / 1000) * pricePerKg;
    const purgeCost      = (purgeWasteG / 1000) * pricePerKg;
    const electricityCost = (totalPrintHours * printer.watts / 1000) * electricityRate;
    const maintenance    = totalPrintHours * (maintenanceRate[printerId] ?? 0.15);
    const design         = designHours * designRate;
    const subtotal       = filamentCost + purgeCost + electricityCost + maintenance + design;
    const profit         = subtotal * (markup / 100);
    const total          = subtotal + profit;
    return { filamentCost, purgeCost, electricityCost, maintenance, design, subtotal, profit, total };
  }, [filamentG, purgeWasteG, pricePerKg, totalPrintHours, printer, electricityRate, maintenanceRate, printerId, designHours, designRate, markup]);

  const handleReset = () => {
    setPrintHours(0); setPrintMins(0); setFilamentG(0);
    setDesignHours(0); setMultiColor(false); setNumColors(2); setPurgePerChange(30);
  };

  const CostRow = ({ label, value, sub }: { label: string; value: number; sub?: boolean }) => (
    <div className={`flex justify-between items-center ${sub ? "text-sm text-muted-foreground" : "text-foreground"}`}>
      <span>{label}</span>
      <span className={sub ? "" : "font-medium"}>{fmtE(value)}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="3D PrintCraft" className="h-8 w-auto" />
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-primary" />
              <span className="font-heading font-semibold text-sm">Κοστολόγηση Εκτύπωσης</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Επαναφορά
            </button>
            <button
              onClick={() => setShowSettings(s => !s)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              Ρυθμίσεις
              {showSettings ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </header>

      {/* Settings panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-border bg-muted/50"
        >
          <div className="max-w-5xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Κόστος ρεύματος (€/kWh)" hint="Από τον λογαριασμό σας">
              <input type="number" step="0.001" min="0" value={electricityRate}
                onChange={e => setElectricityRate(+e.target.value)} className={inputCls} />
            </Field>
            <Field label="Συντήρηση A1 Combo (€/h)">
              <input type="number" step="0.01" min="0" value={maintenanceRate["a1-combo"]}
                onChange={e => setMaintenanceRate(r => ({ ...r, "a1-combo": +e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Συντήρηση P1S (€/h)">
              <input type="number" step="0.01" min="0" value={maintenanceRate["p1s"]}
                onChange={e => setMaintenanceRate(r => ({ ...r, "p1s": +e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Ωριαία χρέωση σχεδιασμού (€/h)">
              <input type="number" step="1" min="0" value={designRate}
                onChange={e => setDesignRate(+e.target.value)} className={inputCls} />
            </Field>
          </div>
        </motion.div>
      )}

      {/* Main grid */}
      <main className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Left column: inputs */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Printer & Material */}
          <Section icon={<Printer className="w-4 h-4" />} title="Εκτυπωτής & Υλικό">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Εκτυπωτής">
                <div className="relative">
                  <select value={printerId} onChange={e => setPrinterId(e.target.value)} className={selectCls}>
                    {PRINTERS.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.watts}W avg)</option>
                    ))}
                  </select>
                </div>
              </Field>
              <Field label="Υλικό (Bambu Store)">
                <div className="relative">
                  <select value={filamentId} onChange={e => setFilamentId(e.target.value)} className={selectCls}>
                    {FILAMENTS.map(f => (
                      <option key={f.id} value={f.id}>{f.name}{f.id !== "custom" ? ` — €${f.price}/kg` : ""}</option>
                    ))}
                  </select>
                </div>
              </Field>
              {filamentId === "custom" && (
                <Field label="Τιμή custom υλικού (€/kg)">
                  <input type="number" step="0.01" min="0" value={customPrice}
                    onChange={e => setCustomPrice(+e.target.value)} className={inputCls} />
                </Field>
              )}
              {filamentId !== "custom" && (
                <div className="sm:col-span-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-xs text-muted-foreground">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: filament.color }} />
                  <span>{filament.name} — <strong className="text-foreground">{fmtE(pricePerKg)}/kg</strong> (Bambu Store)</span>
                </div>
              )}
            </div>
          </Section>

          {/* Print details */}
          <Section icon={<Zap className="w-4 h-4" />} title="Στοιχεία Εκτύπωσης">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Field label="Ώρες εκτύπωσης">
                <input type="number" min="0" value={printHours}
                  onChange={e => setPrintHours(+e.target.value)} className={inputCls} placeholder="0" />
              </Field>
              <Field label="Λεπτά εκτύπωσης">
                <input type="number" min="0" max="59" value={printMins}
                  onChange={e => setPrintMins(+e.target.value)} className={inputCls} placeholder="0" />
              </Field>
              <Field label="Βάρος filament (g)" hint="Χωρίς purge">
                <input type="number" min="0" step="0.1" value={filamentG}
                  onChange={e => setFilamentG(+e.target.value)} className={inputCls} placeholder="0" />
              </Field>
              <Field label="Σύνολο χρόνου" hint="(υπολογισμένο)">
                <div className={`${inputCls} bg-muted text-muted-foreground`}>
                  {Math.floor(totalPrintHours)}h {Math.round((totalPrintHours % 1) * 60)}min
                </div>
              </Field>
            </div>
          </Section>

          {/* Multi-color */}
          <Section icon={<Palette className="w-4 h-4" />} title="Πολύχρωμη Εκτύπωση (AMS)">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setMultiColor(v => !v)}
                className={`relative w-10 h-5 rounded-full transition-colors ${multiColor ? "bg-primary" : "bg-muted"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${multiColor ? "left-5" : "left-0.5"}`} />
              </button>
              <span className="text-sm text-muted-foreground">
                {multiColor ? "Ενεργή πολύχρωμη εκτύπωση" : "Μονόχρωμη εκτύπωση"}
              </span>
            </div>
            {multiColor && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Field label="Αριθμός χρωμάτων" hint="Αλλαγές: χρώματα - 1">
                  <input type="number" min="2" max="16" value={numColors}
                    onChange={e => setNumColors(+e.target.value)} className={inputCls} />
                </Field>
                <Field label="Purge waste / αλλαγή (g)" hint="Εξαρτάται από AMS profile">
                  <input type="number" min="0" step="1" value={purgePerChange}
                    onChange={e => setPurgePerChange(+e.target.value)} className={inputCls} />
                </Field>
                <Field label="Σύνολο purge waste" hint="(υπολογισμένο)">
                  <div className={`${inputCls} bg-muted text-muted-foreground`}>
                    {purgeWasteG.toFixed(1)}g
                  </div>
                </Field>
              </div>
            )}
          </Section>

          {/* Design time */}
          <Section icon={<Clock className="w-4 h-4" />} title="Χρόνος Σχεδιασμού">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Ώρες σχεδιασμού">
                <input type="number" min="0" step="0.5" value={designHours}
                  onChange={e => setDesignHours(+e.target.value)} className={inputCls} placeholder="0" />
              </Field>
              <Field label="Χρέωση/ώρα (€)" hint="Ορίζεται στις Ρυθμίσεις">
                <div className={`${inputCls} bg-muted text-muted-foreground`}>
                  {fmtE(designRate)}/h
                </div>
              </Field>
            </div>
          </Section>

          {/* Markup */}
          <Section icon={<TrendingUp className="w-4 h-4" />} title="Κέρδος">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Ποσοστό κέρδους (%)" hint="Επί του συνολικού κόστους">
                <input type="number" min="0" step="5" value={markup}
                  onChange={e => setMarkup(+e.target.value)} className={inputCls} />
              </Field>
              <Field label="Κέρδος σε €" hint="(υπολογισμένο)">
                <div className={`${inputCls} bg-muted text-muted-foreground`}>
                  {fmtE(costs.profit)}
                </div>
              </Field>
            </div>
            {/* Markup slider */}
            <div className="mt-3">
              <input type="range" min="0" max="200" step="5" value={markup}
                onChange={e => setMarkup(+e.target.value)}
                className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span><span>50%</span><span>100%</span><span>150%</span><span>200%</span>
              </div>
            </div>
          </Section>
        </div>

        {/* Right column: results */}
        <div className="flex flex-col gap-4">
          {/* Cost breakdown */}
          <div className="bg-card border border-border rounded-xl p-5 sticky top-20">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-4 h-4 text-primary" />
              <h2 className="font-heading font-semibold text-sm uppercase tracking-wider">Ανάλυση Κόστους</h2>
            </div>

            <div className="flex flex-col gap-2.5 mb-4">
              <CostRow label="🧵 Filament" value={costs.filamentCost} sub />
              {multiColor && numColors > 1 && (
                <CostRow label="♻️ Purge waste" value={costs.purgeCost} sub />
              )}
              <CostRow label="⚡ Ρεύμα" value={costs.electricityCost} sub />
              <CostRow label="🔧 Συντήρηση" value={costs.maintenance} sub />
              {designHours > 0 && (
                <CostRow label="🎨 Σχεδιασμός" value={costs.design} sub />
              )}
            </div>

            <div className="border-t border-border pt-3 flex flex-col gap-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Συνολικό κόστος</span>
                <span>{fmtE(costs.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Κέρδος ({markup}%)</span>
                <span>+{fmtE(costs.profit)}</span>
              </div>
            </div>

            {/* Final price */}
            <motion.div
              key={costs.total}
              initial={{ scale: 0.97 }}
              animate={{ scale: 1 }}
              className="mt-4 rounded-xl bg-primary/10 border border-primary/30 p-4 text-center"
            >
              <p className="text-xs text-primary font-medium uppercase tracking-wider mb-1">Τιμή Πώλησης</p>
              <p className="text-3xl font-heading font-bold text-primary">
                {fmtE(costs.total)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">χωρίς ΦΠΑ</p>
            </motion.div>

            {/* Info chips */}
            <div className="mt-4 flex flex-col gap-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Εκτυπωτής</span>
                <span className="font-medium text-foreground">{printer.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Κατανάλωση</span>
                <span className="font-medium text-foreground">{((totalPrintHours * printer.watts) / 1000).toFixed(3)} kWh</span>
              </div>
              <div className="flex justify-between">
                <span>Ρεύμα ({fmtE(electricityRate)}/kWh)</span>
                <span className="font-medium text-foreground">{fmtE(costs.electricityCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Υλικό ({fmtE(pricePerKg)}/kg)</span>
                <span className="font-medium text-foreground">{filamentG}g</span>
              </div>
              {multiColor && purgeWasteG > 0 && (
                <div className="flex justify-between">
                  <span>Purge ({numColors} χρώματα)</span>
                  <span className="font-medium text-foreground">{purgeWasteG}g</span>
                </div>
              )}
            </div>

            {/* Cost per gram */}
            {costs.total > 0 && totalFilamentG > 0 && (
              <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground text-center">
                {fmtE(costs.total / totalFilamentG)}/g · {fmtE(costs.total / (totalFilamentG / 1000))}/kg πωλούμενο
              </div>
            )}
          </div>

          {/* Tips card */}
          <div className="bg-muted/50 border border-border rounded-xl p-4 text-xs text-muted-foreground flex flex-col gap-2">
            <p className="font-medium text-foreground text-xs uppercase tracking-wider">Πληροφορίες</p>
            <p>• Ρεύμα: {fmtE(electricityRate)}/kWh (Protergia Secure)</p>
            <p>• A1 Combo: ~200W μέσος όρος</p>
            <p>• P1S: ~280W μέσος όρος</p>
            <p>• Purge waste default 30g/αλλαγή</p>
            <p>• Τιμές Bambu Store (EU, χωρίς ΦΠΑ)</p>
          </div>
        </div>
      </main>
    </div>
  );
}
