import { useState } from "react";
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
  Factory,
  Calculator,
  CheckCircle,
  LogOut,
  ChevronDown,
  BarChart2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";

const Navigation = () => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const [inventoryOpen, setInventoryOpen] = useState(location.pathname.startsWith('/inventory') || location.pathname.startsWith('/supplies') || location.pathname.startsWith('/products'));
  const [salesOpen, setSalesOpen] = useState(location.pathname.startsWith('/sales'));
  
  const navItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: CreditCard, label: "Sales", path: "/sales" },
    { icon: ShoppingCart, label: "Purchases", path: "/purchases" },
    { icon: Package, label: "Inventory", path: "/inventory" },
    { icon: Factory, label: "Production", path: "/production-runs" },
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
          {isAuthenticated ? (
            <>
              {navItems.map((item, index) => {
                const Icon = item.icon;
                if (item.label === "Inventory") {
                  const isActive = location.pathname.startsWith('/inventory') || location.pathname.startsWith('/supplies') || location.pathname.startsWith('/products');
                  return (
                    <Collapsible key={index} open={inventoryOpen} onOpenChange={setInventoryOpen}>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className={`w-full justify-between ${isActive ? 'bg-primary text-primary-foreground shadow-warm mb-2' : 'hover:bg-muted'}`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5" />
                            {item.label}
                          </div>
                          <ChevronDown className={`h-4 w-4 transition-transform ${inventoryOpen ? 'rotate-180' : ''}`} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 ml-3">
                        <Button
                          variant={location.pathname.startsWith('/inventory') ? "secondary" : "ghost"}
                          className="w-full justify-start hover:bg-muted"
                          asChild
                        >
                          <Link to="/inventory" className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Raw Materials
                          </Link>
                        </Button>
                        <Button
                          variant={location.pathname.startsWith('/supplies') ? "secondary" : "ghost"}
                          className="w-full justify-start hover:bg-muted"
                          asChild
                        >
                          <Link to="/supplies" className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Supplies
                          </Link>
                        </Button>
                        <Button
                          variant={location.pathname.startsWith('/products') ? "secondary" : "ghost"}
                          className="w-full justify-start hover:bg-muted"
                          asChild
                        >
                          <Link to="/products" className="flex items-center gap-2">
                            <Cookie className="h-4 w-4" />
                            Finished Goods
                          </Link>
                        </Button>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                }
                if (item.label === "Sales") {
                  const isActive = location.pathname.startsWith('/sales');
                  return (
                    <Collapsible key={index} open={salesOpen} onOpenChange={setSalesOpen}>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className={`w-full justify-between ${isActive ? 'bg-primary text-primary-foreground shadow-warm mb-2' : 'hover:bg-muted'}`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5" />
                            {item.label}
                          </div>
                          <ChevronDown className={`h-4 w-4 transition-transform ${salesOpen ? 'rotate-180' : ''}`} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 ml-3">
                       
                        <Button
                          variant={location.pathname === '/sales/new' ? "secondary" : "ghost"}
                          className="w-full justify-start hover:bg-muted"
                          asChild
                        >
                          <Link to="/sales/new" className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            POS
                          </Link>
                        </Button>
                             <Button
                          variant={location.pathname === '/sales' ? "secondary" : "ghost"}
                          className="w-full justify-start hover:bg-muted"
                          asChild
                        >
                          <Link to="/sales" className="flex items-center gap-2">
                            <BarChart2 className="h-4 w-4" />
                            Sales History
                          </Link>
                        </Button>
                        <Button
                          variant={location.pathname === '/customers' ? "secondary" : "ghost"}
                          className="w-full justify-start hover:bg-muted"
                          asChild
                        >
                          <Link to="/customers" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Customers
                          </Link>
                        </Button>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                }
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
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 hover:bg-muted"
                onClick={logout}
              >
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 hover:bg-muted"
                asChild
              >
                <Link to="/login">
                  <CheckCircle className="h-5 w-5" />
                  Login
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 hover:bg-muted"
                asChild
              >
                <Link to="/register">
                  <CheckCircle className="h-5 w-5" />
                  Register
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;