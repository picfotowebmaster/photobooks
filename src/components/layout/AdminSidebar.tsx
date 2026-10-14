"use client";

import { NavSidebar, type NavLink } from "./NavSidebar";
import { BarChart3, Users, Package, DollarSign } from "lucide-react";

const links: NavLink[] = [
  { href: "/admin/dashboard", label: "Dashboard", Icon: BarChart3 },
  { href: "/admin/clients", label: "Clientes", Icon: Users },
  { href: "/admin/orders", label: "Órdenes", Icon: Package },
  { href: "/admin/pricing", label: "Precios", Icon: DollarSign },
];

export function AdminSidebar() {
  return <NavSidebar links={links} />;
}
