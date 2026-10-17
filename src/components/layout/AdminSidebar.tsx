"use client";

import { NavSidebar, type NavLink } from "./NavSidebar";
import { BarChart3, Users, Package, DollarSign, UserCog } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const baseLinks: NavLink[] = [
  { href: "/admin/dashboard", label: "Dashboard", Icon: BarChart3 },
  { href: "/admin/clients", label: "Clientes", Icon: Users },
  { href: "/admin/orders", label: "Órdenes", Icon: Package },
  { href: "/admin/pricing", label: "Precios", Icon: DollarSign },
];

const adminLinks: NavLink[] = [
  { href: "/admin/users", label: "Usuarios", Icon: UserCog },
];

export function AdminSidebar() {
  const { isAdmin } = useAuth();
  const links = isAdmin ? [...baseLinks, ...adminLinks] : baseLinks;

  return <NavSidebar links={links} />;
}
