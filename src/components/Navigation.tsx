import { Button } from "@/components/ui/button";
import { useLocation, Link } from "react-router-dom";
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  Cookie,
  CreditCard,
  Calculator,
  CheckCircle,
  LogIn
} from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: Cookie, label: "Products", path: "/products" },
    { icon: Package, label: "Stock Requests", path: "/stock-requests" },
    { icon: CheckCircle, label: "Approvals", path: "/request-approvals" },
    { icon: ShoppingCart, label: "Purchase Orders", path: "/purchase-orders" },
    { icon: Package, label: "Inventory", path: "/inventory" },
    { icon: ShoppingCart, label: "Orders", path: "/orders" },
    { icon: Users, label: "Customers", path: "/customers" },
    { icon: CreditCard, label: "Sales", path: "/sales" },
    { icon: Calculator, label: "Accounting", path: "/accounting" },
    { icon: Settings, label: "Settings", path: "/settings" }
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
            const isActive = location.pathname === item.path || 
              (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Button
                key={index}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start gap-3 ${isActive ? 'bg-primary text-primary-foreground shadow-warm' : 'hover:bg-muted'}`}
                asChild
              >
                <Link to={item.path}>
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </div>
        
        <div className="absolute bottom-6 left-6 right-6">
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            asChild
          >
            <Link to="/login">
              <LogIn className="h-5 w-5" />
              Login
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;