import { NavLink } from "react-router-dom";
import { 
  BarChart3, 
  Users, 
  Tractor, 
  Truck, 
  Receipt, 
  FileText 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: BarChart3,
  },
  {
    title: "Customers", 
    href: "/customers",
    icon: Users,
  },
  {
    title: "Harvestor",
    href: "/harvestor", 
    icon: Tractor,
  },
  {
    title: "Trailer",
    href: "/trailer",
    icon: Truck,
  },
  {
    title: "Expenses",
    href: "/expenses",
    icon: Receipt,
  },
  {
    title: "Miscellaneous", 
    href: "/miscellaneous",
    icon: FileText,
  }
];

export const HorizontalNavigation = () => {
  return (
    <nav className="flex items-center space-x-1 bg-gradient-card border-b px-4 py-2 overflow-x-auto">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                "hover:bg-primary/10 hover:text-primary",
                isActive
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground"
              )
            }
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{item.title}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};