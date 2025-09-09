import { Button } from "@/components/ui/button";
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  Cookie
} from "lucide-react";

const Navigation = () => {
  const navItems = [
    { icon: Home, label: "Dashboard", active: true },
    { icon: Cookie, label: "Products", active: false },
    { icon: Package, label: "Inventory", active: false },
    { icon: ShoppingCart, label: "Orders", active: false },
    { icon: Users, label: "Customers", active: false },
    { icon: Settings, label: "Settings", active: false }
  ];

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border shadow-warm z-50">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <Cookie className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">Golden Crust</h2>
            <p className="text-sm text-muted-foreground">Bakery Manager</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Button
                key={index}
                variant={item.active ? "default" : "ghost"}
                className={`w-full justify-start gap-3 ${item.active ? 'bg-primary text-primary-foreground shadow-warm' : 'hover:bg-muted'}`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;