"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useResumeStore } from "@/stores/resumeStore";

const THEME_COLORS: Record<string, { accent: string; header: string; style: string }> = {
  atlas:  { accent:"#6c63ff", header:"linear-gradient(135deg,#6c63ff,#22d3ee)", style:"modern" },
  nova:   { accent:"#0ea5e9", header:"linear-gradient(135deg,#0ea5e9,#7dd3fc)", style:"modern" },
  zenith: { accent:"#10b981", header:"linear-gradient(135deg,#10b981,#6ee7b7)", style:"modern" },
  nexus:  { accent:"#f43f5e", header:"linear-gradient(135deg,#f43f5e,#fda4af)", style:"bold" },
  pulse:  { accent:"#8b5cf6", header:"linear-gradient(135deg,#8b5cf6,#c4b5fd)", style:"modern" },
  slate:  { accent:"#475569", header:"", style:"minimal" },
};

interface LivePreviewProps {
  scale?: number;
}

export function LivePreview({ scale = 1 }: LivePreviewProps) {
  const { resume } = useResumeStore();
  const p = resume.personal || {};
  const tc = THEME_COLORS[resume.template] || THEME_COLORS.atlas;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={resume.template}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white shadow-2xl overflow-hidden"
        style={{
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          fontSize: `${10 * scale}px`,
          lineHeight: 1.5,
          minHeight: "600px",
          borderRadius: "8px",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {/* Header */}
        {tc.style === "minimal" ? (
          <div className="p-8 pb-4 border-b border-gray-100">
            <h1 style={{ fontSize:"22px", fontWeight:700, color:"#1e293b", marginBottom:"2px" }}>
              {p.name || "Tu Nombre"}
            </h1>
            <p style={{ fontSize:"11px", color:"#64748b", marginBottom:"6px" }}>
              {p.title || "Tu título profesional"}
            </p>
            <p style={{ fontSize:"9px", color:"#94a3b8" }}>
              {[p.email, p.phone, p.location].filter(Boolean).join("   ·   ")}
            </p>
          </div>
        ) : (
          <div style={{ background: tc.header, padding:"24px 28px 18px", color:"#fff" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
              {p.name ? (
                <div style={{ flex:1 }}>
                  <h1 style={{ fontSize:"20px", fontWeight:700, margin:0 }}>{p.name}</h1>
                  <p style={{ fontSize:"11px", color:"rgba(255,255,255,0.8)", margin:"2px 0 6px" }}>{p.title}</p>
                  <p style={{ fontSize:"9px", color:"rgba(255,255,255,0.6)" }}>
                    {[p.email, p.phone, p.location].filter(Boolean).join("  ·  ")}
                  </p>
                </div>
              ) : (
                <div style={{ flex:1 }}>
                  <div style={{ width:"140px", height:"14px", background:"rgba(255,255,255,0.2)", borderRadius:"4px", marginBottom:"6px" }} />
                  <div style={{ width:"90px", height:"9px", background:"rgba(255,255,255,0.15)", borderRadius:"4px" }} />
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ padding:"16px 22px", display:"flex", flexDirection:"column", gap:"10px" }}>
          {/* Summary */}
          {resume.summary && (
            <Section title="Resumen" accent={tc.accent}>
              <p style={{ fontSize:"9px", color:"#555", lineHeight:1.6 }}>{resume.summary}</p>
            </Section>
          )}

          {/* Experience */}
          {resume.experiences.length > 0 && (
            <Section title="Experiencia" accent={tc.accent}>
              {resume.experiences.slice(0,3).map((exp, i) => (
                <div key={i} style={{ marginBottom:"8px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div>
                      <p style={{ fontSize:"9px", fontWeight:700, color:"#222", margin:0 }}>{exp.role}</p>
                      <p style={{ fontSize:"8.5px", color:tc.accent, margin:"1px 0" }}>{exp.company}</p>
                    </div>
                    <p style={{ fontSize:"8px", color:"#999", flexShrink:0, marginLeft:"8px" }}>
                      {exp.start_date} – {exp.is_current ? "Presente" : exp.end_date}
                    </p>
                  </div>
                  {exp.description && (
                    <p style={{ fontSize:"8.5px", color:"#666", margin:"3px 0 0", lineHeight:1.5 }}
                      className="line-clamp-2">
                      {exp.description}
                    </p>
                  )}
                  {exp.technologies?.length > 0 && (
                    <p style={{ fontSize:"8px", color:"#999", margin:"2px 0 0", fontStyle:"italic" }}>
                      {exp.technologies.join(" · ")}
                    </p>
                  )}
                </div>
              ))}
            </Section>
          )}

          {/* Skills */}
          {resume.skills.length > 0 && (
            <Section title="Habilidades" accent={tc.accent}>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"4px" }}>
                {resume.skills.map((s, i) => (
                  <span key={i} style={{
                    fontSize:"8px", padding:"2px 7px", borderRadius:"20px",
                    border:`1px solid ${tc.accent}40`, color:tc.accent,
                  }}>
                    {s.name}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Projects */}
          {resume.projects.length > 0 && (
            <Section title="Proyectos" accent={tc.accent}>
              {resume.projects.slice(0,2).map((proj, i) => (
                <div key={i} style={{ marginBottom:"6px" }}>
                  <p style={{ fontSize:"9px", fontWeight:700, color:"#222", margin:0 }}>{proj.name}</p>
                  {proj.description && (
                    <p style={{ fontSize:"8.5px", color:"#666", margin:"2px 0 0" }}
                      className="line-clamp-1">{proj.description}</p>
                  )}
                </div>
              ))}
            </Section>
          )}

          {/* Education */}
          {resume.educations.length > 0 && (
            <Section title="Educación" accent={tc.accent}>
              {resume.educations.map((edu: any, i: number) => (
                <div key={i} style={{ marginBottom:"4px" }}>
                  <p style={{ fontSize:"9px", fontWeight:700, color:"#222", margin:0 }}>
                    {edu.degree} {edu.field && `en ${edu.field}`}
                  </p>
                  <p style={{ fontSize:"8.5px", color:"#666", margin:"1px 0 0" }}>{edu.institution}</p>
                </div>
              ))}
            </Section>
          )}

          {/* Empty state */}
          {!resume.summary && resume.experiences.length === 0 && resume.skills.length === 0 && (
            <div style={{ textAlign:"center", padding:"40px 0", color:"#ccc" }}>
              <p style={{ fontSize:"10px" }}>Completa tu perfil para ver la vista previa aquí</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"6px" }}>
        <p style={{ fontSize:"8px", fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", color:accent, margin:0 }}>
          {title}
        </p>
        <div style={{ flex:1, height:"0.5px", background:`${accent}30` }} />
      </div>
      {children}
    </div>
  );
}
