"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Crown, Trash2, RefreshCw, Search,
  CheckCircle, XCircle, Edit2, Shield,
  BarChart3, FileText, Sparkles, LogOut,
  AlertTriangle, X, Eye, EyeOff
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";

const ADMIN_EMAILS = ["admin@cvforge.com","stefannysalas2002@gmail.com","jpsalas9@gmail.com"];

interface Stats {
  total_users:number; pro_users:number; free_users:number;
  total_resumes:number; total_ai_gens:number;
  new_users_week:number; new_users_month:number; conversion_rate:number;
}
interface AdminUser {
  id:number; email:string; full_name:string; plan:string;
  is_active:boolean; created_at:string; resume_count:number; is_admin:boolean;
}

function ConfirmModal({ title, desc, onConfirm, onCancel, danger=false }:
  { title:string; desc:string; onConfirm:()=>void; onCancel:()=>void; danger?:boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
        className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className={"w-12 h-12 rounded-xl flex items-center justify-center mb-4 "+(danger?"bg-red-500/10":"bg-primary/10")}>
          <AlertTriangle size={22} className={danger?"text-red-400":"text-primary"}/>
        </div>
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-6">{desc}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary">Cancelar</button>
          <button onClick={onConfirm} className={"flex-1 py-2.5 rounded-xl text-sm font-bold text-white "+(danger?"bg-red-500 hover:bg-red-600":"bg-primary hover:opacity-90")}>Confirmar</button>
        </div>
      </motion.div>
    </div>
  );
}

function ResetPasswordModal({ userId, userEmail, onClose }:
  { userId:number; userEmail:string; onClose:()=>void }) {
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (pass.length < 8) { toast.error("Mínimo 8 caracteres"); return; }
    setLoading(true);
    try { await (api as any).adminResetPassword(userId, pass); toast.success("Contraseña reseteada"); onClose(); }
    catch { toast.error("Error al resetear"); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
        className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Resetear contraseña</h3>
          <button onClick={onClose}><X size={18} className="text-muted-foreground"/></button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Usuario: <span className="text-foreground font-medium">{userEmail}</span></p>
        <div className="relative mb-4">
          <input type={show?"text":"password"} value={pass} onChange={e=>setPass(e.target.value)}
            placeholder="Nueva contraseña (mín. 8)" className="input-base w-full pr-10"/>
          <button onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {show?<EyeOff size={14}/>:<Eye size={14}/>}
          </button>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm hover:bg-secondary">Cancelar</button>
          <button onClick={submit} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 disabled:opacity-60">
            {loading?"Guardando...":"Guardar"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [stats,    setStats]    = useState<Stats|null>(null);
  const [users,    setUsers]    = useState<AdminUser[]>([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [tab,      setTab]      = useState<"stats"|"users">("stats");
  const [confirm,  setConfirm]  = useState<{action:()=>void;title:string;desc:string;danger?:boolean}|null>(null);
  const [resetPw,  setResetPw]  = useState<{id:number;email:string}|null>(null);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (!ADMIN_EMAILS.includes(user.email)) { toast.error("Acceso denegado"); router.push("/dashboard"); return; }
    loadData();
  }, [user]);

  useEffect(() => {
    if (user && ADMIN_EMAILS.includes(user.email)) {
      const t = setTimeout(loadData, 300);
      return () => clearTimeout(t);
    }
  }, [search, planFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, u] = await Promise.all([
        (api as any).adminGetStats(),
        (api as any).adminGetUsers(search, planFilter),
      ]);
      setStats(s); setUsers(u.users); setTotal(u.total);
    } catch { toast.error("Error al cargar datos"); }
    finally { setLoading(false); }
  };

  const changePlan = (u: AdminUser) => {
    const newPlan = u.plan === "pro" ? "free" : "pro";
    setConfirm({
      title:`Cambiar plan de ${u.email}`,
      desc:`¿Cambiar de ${u.plan} a ${newPlan}?`,
      action: async () => {
        setConfirm(null);
        try { await (api as any).adminUpdatePlan(u.id, newPlan); toast.success(`Plan → ${newPlan}`); loadData(); }
        catch { toast.error("Error"); }
      }
    });
  };

  const toggleActive = (u: AdminUser) => {
    setConfirm({
      title: u.is_active ? "Desactivar cuenta" : "Activar cuenta",
      desc: `¿${u.is_active?"Desactivar":"Activar"} la cuenta de ${u.email}?`,
      danger: u.is_active,
      action: async () => {
        setConfirm(null);
        try { await (api as any).adminToggleActive(u.id, !u.is_active); toast.success("Cuenta actualizada"); loadData(); }
        catch { toast.error("Error"); }
      }
    });
  };

  const deleteUser = (u: AdminUser) => {
    setConfirm({
      title:"Eliminar usuario",
      desc:`¿Eliminar permanentemente ${u.email} y todos sus datos? No se puede deshacer.`,
      danger:true,
      action: async () => {
        setConfirm(null);
        try { await (api as any).adminDeleteUser(u.id); toast.success("Usuario eliminado"); loadData(); }
        catch (err:any) { toast.error(err?.response?.data?.detail||"Error"); }
      }
    });
  };

  if (!user || !ADMIN_EMAILS.includes(user.email)) return null;

  return (
    <div className="min-h-screen bg-background">
      {confirm && <ConfirmModal title={confirm.title} desc={confirm.desc} danger={confirm.danger} onConfirm={confirm.action} onCancel={()=>setConfirm(null)}/>}
      {resetPw && <ResetPasswordModal userId={resetPw.id} userEmail={resetPw.email} onClose={()=>{setResetPw(null);loadData();}}/>}

      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:"linear-gradient(135deg,#6c63ff,#22d3ee)"}}>
              <Shield size={16} className="text-white"/>
            </div>
            <span className="font-bold text-sm">CVForge AI</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{background:"linear-gradient(135deg,#6c63ff,#22d3ee)"}}>ADMIN</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block">{user.email}</span>
            <button onClick={()=>router.push("/dashboard")} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors">Dashboard</button>
            <button onClick={()=>{logout();router.push("/login");}} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground">
              <LogOut size={13}/> Salir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight">Panel de Administración</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestiona usuarios, planes y estadísticas</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-8">
          {[{id:"stats" as const,label:"Estadísticas",icon:BarChart3},{id:"users" as const,label:"Usuarios",icon:Users}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={"flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all "+(tab===t.id?"border-primary text-primary":"border-transparent text-muted-foreground hover:text-foreground")}>
              <t.icon size={14}/>{t.label}
              {t.id==="users"&&total>0&&<span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{total}</span>}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STATS */}
          {tab==="stats"&&(
            <motion.div key="stats" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}>
              {loading?(
                <div className="flex justify-center py-20"><RefreshCw size={24} className="animate-spin text-primary"/></div>
              ):stats?(
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {label:"Total usuarios",  value:stats.total_users,   icon:Users,    color:"text-violet-400", bg:"bg-violet-500/10"},
                      {label:"Plan Pro",         value:stats.pro_users,     icon:Crown,    color:"text-amber-400",  bg:"bg-amber-500/10"},
                      {label:"Total CVs",        value:stats.total_resumes, icon:FileText, color:"text-cyan-400",   bg:"bg-cyan-500/10"},
                      {label:"Generaciones IA",  value:stats.total_ai_gens, icon:Sparkles, color:"text-pink-400",   bg:"bg-pink-500/10"},
                    ].map(s=>(
                      <div key={s.label} className="p-5 rounded-2xl border border-border bg-card">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
                          <div className={"w-8 h-8 rounded-lg flex items-center justify-center "+s.bg}>
                            <s.icon size={15} className={s.color}/>
                          </div>
                        </div>
                        <p className={"text-3xl font-bold font-mono "+s.color}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      {label:"Nuevos esta semana",value:"+"+stats.new_users_week,  sub:"últimos 7 días",  color:"text-emerald-400"},
                      {label:"Nuevos este mes",   value:"+"+stats.new_users_month, sub:"últimos 30 días", color:"text-blue-400"},
                      {label:"Tasa conversión",   value:stats.conversion_rate+"%", sub:"Free → Pro",      color:"text-violet-400"},
                    ].map(s=>(
                      <div key={s.label} className="p-5 rounded-2xl border border-border bg-card">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{s.label}</p>
                        <p className={"text-3xl font-bold font-mono "+s.color}>{s.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-5 rounded-2xl border border-border bg-card">
                    <h3 className="font-semibold text-sm mb-4">Distribución de planes</h3>
                    <div className="h-3 rounded-full bg-secondary overflow-hidden flex mb-3">
                      <motion.div initial={{width:0}} animate={{width:stats.total_users>0?`${(stats.free_users/stats.total_users)*100}%`:"0%"}}
                        transition={{duration:0.8}} className="h-full bg-muted-foreground/30"/>
                      <motion.div initial={{width:0}} animate={{width:stats.total_users>0?`${(stats.pro_users/stats.total_users)*100}%`:"0%"}}
                        transition={{duration:0.8,delay:0.1}} className="h-full" style={{background:"linear-gradient(90deg,#6c63ff,#22d3ee)"}}/>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-muted-foreground/30"/>
                        Free: <span className="text-foreground font-semibold">{stats.free_users}</span>
                      </span>
                      <span className="text-muted-foreground flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{background:"linear-gradient(135deg,#6c63ff,#22d3ee)"}}/>
                        Pro: <span className="text-foreground font-semibold">{stats.pro_users}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ):null}
            </motion.div>
          )}

          {/* USERS */}
          {tab==="users"&&(
            <motion.div key="users" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}>
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                  <input value={search} onChange={e=>setSearch(e.target.value)}
                    placeholder="Buscar por email o nombre..." className="input-base w-full pl-9"/>
                </div>
                <select value={planFilter} onChange={e=>setPlanFilter(e.target.value)} className="input-base sm:w-36">
                  <option value="">Todos los planes</option>
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                </select>
                <button onClick={loadData} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-secondary text-sm">
                  <RefreshCw size={13}/> Actualizar
                </button>
              </div>

              {loading?(
                <div className="flex justify-center py-20"><RefreshCw size={24} className="animate-spin text-primary"/></div>
              ):(
                <div className="rounded-2xl border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-secondary/50">
                          {["Usuario","Registro","Plan","CVs","Estado","Acciones"].map((h,i)=>(
                            <th key={h} className={"px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider "+(i===0?"text-left":i===5?"text-right":"text-left")+(i===1?" hidden sm:table-cell":i===3?" hidden md:table-cell":"")}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u,i)=>(
                          <tr key={u.id} className={"border-b border-border hover:bg-secondary/30 "+(i%2===0?"":"bg-secondary/10")}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                  style={{background:"linear-gradient(135deg,#6c63ff,#22d3ee)"}}>
                                  {(u.full_name||u.email)[0].toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium truncate max-w-[150px]">{u.full_name||"—"}</p>
                                  <p className="text-xs text-muted-foreground truncate max-w-[150px]">{u.email}</p>
                                </div>
                                {u.is_admin&&<Shield size={11} className="text-primary flex-shrink-0"/>}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">{u.created_at||"—"}</td>
                            <td className="px-4 py-3">
                              <button onClick={()=>!u.is_admin&&changePlan(u)} disabled={u.is_admin}
                                className={"inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border transition-all "+(
                                  u.plan==="pro"
                                    ?"bg-violet-500/10 text-violet-400 border-violet-500/20 hover:bg-violet-500/20"
                                    :"bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
                                )+(u.is_admin?" opacity-50 cursor-not-allowed":" cursor-pointer")}>
                                {u.plan==="pro"?<><Crown size={9}/> Pro</>:"Free"}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{u.resume_count}</td>
                            <td className="px-4 py-3">
                              <span className={"inline-flex items-center gap-1 text-xs font-medium "+(u.is_active?"text-emerald-400":"text-red-400")}>
                                {u.is_active?<><CheckCircle size={11}/>Activo</>:<><XCircle size={11}/>Inactivo</>}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                {!u.is_admin&&(
                                  <button onClick={()=>toggleActive(u)} title={u.is_active?"Desactivar":"Activar"}
                                    className={"p-1.5 rounded-lg transition-colors "+(u.is_active?"hover:bg-amber-500/10 text-amber-400":"hover:bg-emerald-500/10 text-emerald-400")}>
                                    {u.is_active?<XCircle size={14}/>:<CheckCircle size={14}/>}
                                  </button>
                                )}
                                <button onClick={()=>setResetPw({id:u.id,email:u.email})} title="Resetear contraseña"
                                  className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                                  <Edit2 size={14}/>
                                </button>
                                {!u.is_admin&&(
                                  <button onClick={()=>deleteUser(u)} title="Eliminar"
                                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                                    <Trash2 size={14}/>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {users.length===0&&!loading&&(
                      <div className="text-center py-12 text-muted-foreground text-sm">No se encontraron usuarios</div>
                    )}
                  </div>
                  <div className="px-4 py-3 border-t border-border bg-secondary/20 text-xs text-muted-foreground">
                    Mostrando {users.length} de {total} usuarios
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
