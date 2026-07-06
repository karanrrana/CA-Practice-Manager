import {
  Calculator,
  CalendarDays,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  UserCircle,
  Users,
  UsersRound,
} from "lucide-react";
import { ClipboardList } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Users;
  roles?: Role[];
}

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/companies", label: "Companies", icon: Users },
  { to: "/staff", label: "Staff Members", icon: UsersRound, roles: ["Admin"] },
  {
  to: "/my-tasks",
  label: "My Tasks",
  icon: ClipboardList,
  roles: ["Manager", "Staff"],
},
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/documents", label: "Documents", icon: FolderOpen },
  { to: "/profile", label: "Profile", icon: UserCircle },
  { to: "/settings", label: "Settings", icon: Settings, roles: ["Admin"] },
];

function SidebarContent({ onLogout }: { onLogout: () => void }) {
  const { username, role } = useAuth();
  const location = useLocation();

  const items = NAV.filter((n) => !n.roles || (role && n.roles.includes(role)));

  return (
  <motion.div
    
    initial={{ opacity: 0, x: -30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    className="relative flex h-full flex-col overflow-hidden"
  >
    <div className="pointer-events-none absolute -top-16 -left-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />
    <div className="pointer-events-none absolute bottom-0 right-0 h-52 w-52 rounded-full bg-purple-500/10 blur-3xl" />
    <div className="flex items-center gap-3 px-6 py-7">
      <motion.span
  whileHover={{
    rotate: 8,
    scale: 1.1,
  }}
  transition={{
    type: "spring",
    stiffness: 250,
  }}
  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-xl"
>
        <Calculator className="h-6 w-6 text-white" />
      </motion.span>

      <div>
        <p className="text-lg font-bold text-white">
          Minocha & Minocha
        </p>

        <p className="text-xs text-slate-300">
          Management Tool
        </p>
      </div>
    </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-2">
        {items.map((item, index) => {
          const active = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <motion.div
  key={item.to}
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{
    duration: 0.35,
    delay: index * 0.05,
  }}
>
  <Link
    to={item.to}
    className={cn(
      "group relative flex items-center gap-4 overflow-hidden rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300",
      active
        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    )}
  >
  {/* {active && (
  <motion.div
    layoutId="sidebar-active"
    className="absolute inset-0 rounded-2xl ring-1 ring-white/20"
  />
)} */}

    <Icon className="h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" />

    <span className="flex-1">{item.label}</span>

    {active && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="h-2 w-2 rounded-full bg-white shadow-lg"
      />
    )}
  </Link>
</motion.div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-4 rounded-2xl bg-white/5 p-4 transition-all duration-300 hover:bg-white/10">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-sm font-bold uppercase text-white shadow-lg">
            {username.slice(0, 2)}
          </span>
          <div className="min-w-0">
           <motion.p
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.6 }}
  className="truncate text-base font-semibold text-white"
>{username}</motion.p>
            <p className="text-xs uppercase tracking-widest text-slate-400">{role}</p>
          </div>
        </div>
        <Button
  variant="ghost"
  size="sm"
  onClick={onLogout}
  className="
    w-full
    justify-start
    rounded-2xl
    border
    border-white/10
    bg-white/10
    py-6
    text-white
    shadow-sm
    backdrop-blur-md
    transition-all
    duration-300
    hover:scale-[1.02]
    hover:border-red-500
    hover:bg-red-500
    hover:text-white
    hover:shadow-xl
  "
>
  <LogOut className="mr-3 h-5 w-5" />
  Logout
</Button>
      </div>
    </motion.div>
  );
}

export function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside
      className={cn(
        "hidden w-80 shrink-0 border-r border-slate-700 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white md:block"
      )}
    >
      <div className="sticky top-0 h-screen">
        <SidebarContent onLogout={logout} />
      </div>
    </aside>
  );
}

export function MobileSidebar() {
  const { logout } = useAuth();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-60 p-0">
        <SidebarContent onLogout={logout} />
      </SheetContent>
    </Sheet>
  );
}
