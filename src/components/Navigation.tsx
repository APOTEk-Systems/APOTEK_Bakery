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
   BarChart2,
   Menu,
   ChevronLeft,
   ChevronRight,
   FileText,
   Shield,
   Store,
   Bell,
   Utensils,
   UtensilsCrossed
 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface NavigationProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  isMobile: boolean;
}

const Navigation = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen, isMobile }: NavigationProps) => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const [inventoryOpen, setInventoryOpen] = useState(location.pathname.startsWith('/inventory') || location.pathname.startsWith('/supplies') || location.pathname.startsWith('/products'));
  const [salesOpen, setSalesOpen] = useState(location.pathname.startsWith('/sales'));
  const [settingsOpen, setSettingsOpen] = useState(location.pathname.startsWith('/settings'));
  
  const navItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: CreditCard, label: "Sales", path: "/sales" },
    { icon: ShoppingCart, label: "Purchases", path: "/purchases" },
    { icon: Package, label: "Inventory", path: "/inventory" },
    { icon: Factory, label: "Production", path: "/production-runs" },
    { icon: Calculator, label: "Accounting", path: "/accounting" },
    { icon: FileText, label: "Reports", path: "/reports" },
    { icon: Settings, label: "Settings", path: "/settings" }
  ];

  const NavContent = () => (
    <div className={collapsed && !isMobile ? "p-2" : "p-6"}>
      {isMobile && (
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <img src="/icon.png"  className="w-full"/>
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">APOTEk System</h2>
            <p className="text-sm text-muted-foreground">Bakery Manager</p>
          </div>
        </div>
      )}

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
                          {(!collapsed || isMobile) && item.label}
                        </div>
                        {(!collapsed || isMobile) && <ChevronDown className={`h-4 w-4 transition-transform ${inventoryOpen ? 'rotate-180' : ''}`} />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 ml-3">
                      <Button
                        variant={location.pathname.startsWith('/material') ? "secondary" : "ghost"}
                        className="w-full justify-start hover:bg-muted"
                        asChild
                      >
                        <Link to="/materials" className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          {(!collapsed || isMobile) && "Materials"}
                        </Link>
                      </Button>
                      <Button
                        variant={location.pathname.startsWith('/supplies') ? "secondary" : "ghost"}
                        className="w-full justify-start hover:bg-muted"
                        asChild
                      >
                        <Link to="/supplies" className="flex items-center gap-2">
                          <UtensilsCrossed  className="h-4 w-4" />
                          {(!collapsed || isMobile) && "Supplies"}
                        </Link>
                      </Button>
                      <Button
                        variant={location.pathname.startsWith('/products') ? "secondary" : "ghost"}
                        className="w-full justify-start hover:bg-muted"
                        asChild
                      >
                        <Link to="/products" className="flex items-center gap-2">
                          <Cookie className="h-4 w-4" />
                          {(!collapsed || isMobile) && "Products"}
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
                          {(!collapsed || isMobile) && item.label}
                        </div>
                        {(!collapsed || isMobile) && <ChevronDown className={`h-4 w-4 transition-transform ${salesOpen ? 'rotate-180' : ''}`} />}
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
                          {(!collapsed || isMobile) && "POS"}
                        </Link>
                      </Button>
                      <Button
                        variant={location.pathname === '/sales' ? "secondary" : "ghost"}
                        className="w-full justify-start hover:bg-muted"
                        asChild
                      >
                        <Link to="/sales" className="flex items-center gap-2">
                          <BarChart2 className="h-4 w-4" />
                          {(!collapsed || isMobile) && "Sales History"}
                        </Link>
                      </Button>
                      <Button
                        variant={location.pathname === '/customers' ? "secondary" : "ghost"}
                        className="w-full justify-start hover:bg-muted"
                        asChild
                      >
                        <Link to="/customers" className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {(!collapsed || isMobile) && "Customers"}
                        </Link>
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>
                );
              }
              if (item.label === "Settings") {
                const isActive = location.pathname.startsWith('/settings');
                return (
                  <Collapsible key={index} open={settingsOpen} onOpenChange={setSettingsOpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={`w-full justify-between ${isActive ? 'bg-primary text-primary-foreground shadow-warm mb-2' : 'hover:bg-muted'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          {(!collapsed || isMobile) && item.label}
                        </div>
                        {(!collapsed || isMobile) && <ChevronDown className={`h-4 w-4 transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 ml-3">
                      <Button
                        variant={location.pathname === '/user-role-management' ? "secondary" : "ghost"}
                        className="w-full justify-start hover:bg-muted"
                        asChild
                      >
                        <Link to="/user-role-management" className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {(!collapsed || isMobile) && "Users and Roles"}
                        </Link>
                      </Button>
                      <Button
                        variant={location.pathname === '/information' ? "secondary" : "ghost"}
                        className="w-full justify-start hover:bg-muted"
                        asChild
                      >
                        <Link to="/information" className="flex items-center gap-2">
                          <Store className="h-4 w-4" />
                          {(!collapsed || isMobile) && "Information"}
                        </Link>
                      </Button>
                      <Button
                        variant={location.pathname === '/notifications' ? "secondary" : "ghost"}
                        className="w-full justify-start hover:bg-muted"
                        asChild
                      >
                        <Link to="/notifications" className="flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          {(!collapsed || isMobile) && "Notifications"}
                        </Link>
                      </Button>
                      <Button
                        variant={location.pathname === '/system-settings' ? "secondary" : "ghost"}
                        className="w-full justify-start hover:bg-muted"
                        asChild
                      >
                        <Link to="/system-settings" className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          {(!collapsed || isMobile) && "System Settings"}
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
                    {(!collapsed || isMobile) && item.label}
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
              {(!collapsed || isMobile) && "Logout"}
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
                {(!collapsed || isMobile) && "Login"}
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 hover:bg-muted"
              asChild
            >
              <Link to="/register">
                <CheckCircle className="h-5 w-5" />
                {(!collapsed || isMobile) && "Register"}
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-warm h-16 flex items-center px-4">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <NavContent />
            </SheetContent>
          </Sheet>
          <div className="ml-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
               <img src="/icon.png"  className="w-full"/>
            </div>
            <h2 className="font-bold text-lg text-foreground">APOTEk System</h2>
          </div>
        </div>
        <div className="h-16" /> {/* Spacer for fixed top bar */}
      </>
    );
  }

  return (
    <nav className={`fixed left-0 top-0 h-full ${collapsed ? 'w-16' : 'w-64'} bg-card border-r border-border shadow-warm z-50 transition-all duration-300`}>
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8  rounded-lg flex items-center justify-center">
            <img src="/icon.png"  className="w-full"/>
            </div>
            <h2 className="font-bold text-lg text-foreground">APOTEk System</h2>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <NavContent />
    </nav>
  );
};

export default Navigation;