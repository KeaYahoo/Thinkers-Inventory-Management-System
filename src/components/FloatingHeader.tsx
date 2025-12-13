"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Truck, Users, FileText, Settings } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", Icon: Package },
  { href: "/consumption", label: "Consumption", Icon: ShoppingCart },
  { href: "/vehicles", label: "Vehicles", Icon: Truck },
  { href: "/suppliers", label: "Suppliers", Icon: Users },
  { href: "/reports", label: "Reports", Icon: FileText },
  { href: "/settings", label: "Settings", Icon: Settings },
];

const isActive = (path: string, href: string) => {
  if (href === "/") return path === "/";
  return path.startsWith(href);
};

export default function FloatingHeader() {
  const pathname = usePathname();

  return (
    <div className="fixed left-1/2 top-6 z-50 w-[calc(100%-1.5rem)] max-w-4xl -translate-x-1/2">
      <div className="flex items-center gap-8 rounded-full border border-border-subtle bg-surface px-4 py-2 shadow-float">
        <div className="flex items-center gap-2 px-4 text-lg font-bold text-brand">
          <span className="inline-block h-3 w-3 rounded-full bg-brand" />
          Solid Nexus
        </div>
        <nav className="flex items-center gap-2 overflow-x-auto">
          {navItems.map(({ href, label, Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm transition ${
                  active
                    ? "bg-surface text-brand shadow-sm border border-border-subtle"
                    : "text-primary-muted hover:text-primary hover:bg-surface/50"
                }`}
              >
                <Icon size={18} aria-hidden />
                <span className="hidden md:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
