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
  UtensilsCrossed,
  Banknote,
  Wrench,
  Milk,
  User,
  ClipboardMinus,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { settingsService } from "@/services/settings";
import { useQuery } from "@tanstack/react-query";

// Helper function to check permissions
const hasPermission = (user: any, permission: string): boolean => {
  if (!user) return false;
  if (user.permissions?.includes("all")) return true;
  return user.permissions?.includes(permission) || false;
};
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavigationProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  isMobile: boolean;
}

const Navigation = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  isMobile,
}: NavigationProps) => {
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getAll(),
  });
  const [inventoryOpen, setInventoryOpen] = useState(
    location.pathname.startsWith("/inventory") ||
      location.pathname.startsWith("/supplies") ||
      location.pathname.startsWith("/products")
  );
  const [salesOpen, setSalesOpen] = useState(
    location.pathname.startsWith("/sales")
  );
  const [settingsOpen, setSettingsOpen] = useState(
    location.pathname.startsWith("/information") ||
      location.pathname.startsWith("/configurations") ||
      location.pathname.startsWith("/adjustment-reasons") ||
      location.pathname.startsWith("/expense-categories") ||
      location.pathname.startsWith("/users") ||
      location.pathname.startsWith("/roles") ||
      location.pathname.startsWith("/notifications")
  );

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: CreditCard, label: "Sales", path: "/sales" },
    { icon: ShoppingCart, label: "Purchases", path: "/purchases" },
    { icon: Package, label: "Inventory", path: "/inventory" },
    { icon: Factory, label: "Production", path: "/production" },
    { icon: Calculator, label: "Accounting", path: "/accounting" },
    { icon: FileText, label: "Reports", path: "/reports" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const NavContent = () => (
    <div
      className={`flex flex-col h-screen ${collapsed && !isMobile ? "p-2" : "py-4 pl-3 pr-1"}`}
    >
      {isMobile && (
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <img src="/icon.png" className="w-full" alt="Apotek Icon" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">{settings?.information?.bakeryName || 'APOTEk System'}</h2>
            <p className="text-sm text-muted-foreground">Bakery Manager</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 pb-20 custom-scrollbar">
        {isAuthenticated ? (
          <>
            {navItems.map((item, index) => {
              const Icon = item.icon;

              // Check permissions for Dashboard
              if (item.label === "Dashboard") {
                const hasAnyDashboardPermission =
                  hasPermission(user, "view:salesDashboard") ||
                  hasPermission(user, "view:purchasesDashboard") ||
                  hasPermission(user, "view:inventoryDashboard") ||
                  hasPermission(user, "view:accountingDashboard") ||
                  hasPermission(user, "view:productionDashboard");
                if (!hasAnyDashboardPermission) return null;
              }
              if (item.label === "Inventory") {
                const hasViewInventory = hasPermission(user, "view:inventory");
                const hasViewProducts = hasPermission(user, "view:products");

                // Only show inventory section if user has at least one inventory permission
                if (!hasViewInventory && !hasViewProducts) {
                  return null;
                }

                const isActive =
                  location.pathname.startsWith("/materials") ||
                  location.pathname.startsWith("/supplies") ||
                  location.pathname.startsWith("/products");
                return (
                  <Collapsible
                    key={index}
                    open={inventoryOpen}
                    onOpenChange={setInventoryOpen}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={`w-full justify-between ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-warm"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          {(!collapsed || isMobile) && item.label}
                        </div>
                        {(!collapsed || isMobile) && (
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              inventoryOpen ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 ml-3">
                      {hasViewInventory && (
                        <Button
                          variant={
                            location.pathname.startsWith("/materials")
                              ? "secondary"
                              : "ghost"
                          }
                          className="w-full justify-start hover:bg-muted"
                          asChild
                        >
                          <Link
                            to="/materials"
                            className="flex items-center gap-2"
                          >
                            <Milk className="h-4 w-4" />
                            {(!collapsed || isMobile) && "Materials"}
                          </Link>
                        </Button>
                      )}
                      {hasViewInventory && (
                        <Button
                          variant={
                            location.pathname.startsWith("/supplies")
                              ? "secondary"
                              : "ghost"
                          }
                          className="w-full justify-start hover:bg-muted"
                          asChild
                        >
                          <Link
                            to="/supplies"
                            className="flex items-center gap-2"
                          >
                            <UtensilsCrossed className="h-4 w-4" />
                            {(!collapsed || isMobile) && "Supplies"}
                          </Link>
                        </Button>
                      )}
                      {hasViewProducts && (
                        <Button
                          variant={
                            location.pathname.startsWith("/products")
                              ? "secondary"
                              : "ghost"
                          }
                          className="w-full justify-start hover:bg-muted"
                          asChild
                        >
                          <Link
                            to="/products"
                            className="flex items-center gap-2"
                          >
                            <Cookie className="h-4 w-4" />
                            {(!collapsed || isMobile) && "Products"}
                          </Link>
                        </Button>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                );
              }
              if (item.label === "Sales") {
                const hasViewSales = hasPermission(user, "view:sales");
                const hasCreateSales = hasPermission(user, "create:sales");
                const hasViewCustomers = hasPermission(user, "view:customers");

                // Only show sales section if user has at least one sales permission
                if (!hasViewSales && !hasCreateSales && !hasViewCustomers) {
                  return null;
                }

                const isActive = location.pathname.startsWith("/sales");
                return (
                  <Collapsible
                    key={index}
                    open={salesOpen}
                    onOpenChange={setSalesOpen}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={`w-full justify-between ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-warm mb-2"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          {(!collapsed || isMobile) && item.label}
                        </div>
                        {(!collapsed || isMobile) && (
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              salesOpen ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 ml-3">
                      {hasCreateSales && (
                        <Button
                          variant={
                            location.pathname === "/sales/new"
                              ? "secondary"
                              : "ghost"
                          }
                          className="w-full justify-start hover:bg-muted"
                          asChild
                        >
                          <Link
                            to="/sales/new"
                            className="flex items-center gap-2"
                          >
                            <Banknote className="h-4 w-4" />
                            {(!collapsed || isMobile) && "New Sale"}
                          </Link>
                        </Button>
                      )}
                      {hasViewSales && (
                        <Button
                          variant={
                            location.pathname === "/sales"
                              ? "secondary"
                              : "ghost"
                          }
                          className="w-full justify-start hover:bg-muted"
                          asChild
                        >
                          <Link to="/sales" className="flex items-center gap-2">
                            <BarChart2 className="h-4 w-4" />
                            {(!collapsed || isMobile) && "Sales History"}
                          </Link>
                        </Button>
                      )}
                      {hasViewCustomers && (
                        <Button
                          variant={
                            location.pathname === "/customers"
                              ? "secondary"
                              : "ghost"
                          }
                          className="w-full justify-start hover:bg-muted"
                          asChild
                        >
                          <Link
                            to="/customers"
                            className="flex items-center gap-2"
                          >
                            <Users className="h-4 w-4" />
                            {(!collapsed || isMobile) && "Customers"}
                          </Link>
                        </Button>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                );
              }
              if (item.label === "Settings") {
                const isActive =
                  location.pathname.startsWith("/information") ||
                  location.pathname.startsWith("/configurations") ||
                  location.pathname.startsWith("/adjustment-reasons") ||
                  location.pathname.startsWith("/expense-categories") ||
                  location.pathname.startsWith("/users") ||
                  location.pathname.startsWith("/roles") ||
                  location.pathname.startsWith("/notifications");
                return (
                  <Collapsible
                    key={index}
                    open={settingsOpen}
                    onOpenChange={setSettingsOpen}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={`w-full justify-between ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-warm mb-2"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          {(!collapsed || isMobile) && item.label}
                        </div>
                        {(!collapsed || isMobile) && (
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              settingsOpen ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 ml-3">
                      {/* General */}
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        General
                      </div>
                      <div className="ml-2 space-y-1">
                        {(hasPermission(user, "view:business-information") ||
                          hasPermission(
                            user,
                            "update:business-information"
                          )) && (
                          <Button
                            variant={
                              location.pathname === "/information"
                                ? "secondary"
                                : "ghost"
                            }
                            className="w-full justify-start hover:bg-muted"
                            asChild
                          >
                            <Link
                              to="/information"
                              className="flex items-center gap-2"
                            >
                              <Store className="h-4 w-4" />
                              {(!collapsed || isMobile) && "Business Information"}
                            </Link>
                          </Button>
                        )}
                        {(hasPermission(user, "view:configurations") ||
                          hasPermission(user, "update:configurations")) && (
                          <Button
                            variant={
                              location.pathname === "/configurations"
                                ? "secondary"
                                : "ghost"
                            }
                            className="w-full justify-start hover:bg-muted"
                            asChild
                          >
                            <Link
                              to="/configurations"
                              className="flex items-center gap-2"
                            >
                              <Settings className="h-4 w-4" />
                              {(!collapsed || isMobile) && "Configurations"}
                            </Link>
                          </Button>
                        )}
                        {(hasPermission(user, "view:adjustment-reasons") ||
                          hasPermission(user, "update:adjustment-reasons")) && (
                          <Button
                            variant={
                              location.pathname === "/adjustment-reasons"
                                ? "secondary"
                                : "ghost"
                            }
                            className="w-full justify-start hover:bg-muted"
                            asChild
                          >
                            <Link
                              to="/adjustment-reasons"
                              className="flex items-center gap-2"
                            >
                              <ClipboardMinus className="h-4 w-4" />
                              {(!collapsed || isMobile) && "Adjustment Reasons"}
                            </Link>
                          </Button>
                        )}
                        {(hasPermission(user, "view:expense-categories") ||
                          hasPermission(user, "update:expense-categories")) && (
                          <Button
                            variant={
                              location.pathname === "/expense-categories"
                                ? "secondary"
                                : "ghost"
                            }
                            className="w-full justify-start hover:bg-muted"
                            asChild
                          >
                            <Link
                              to="/expense-categories"
                              className="flex items-center gap-2"
                            >
                              <Shield className="h-4 w-4" />
                              {(!collapsed || isMobile) && "Expense Categories"}
                            </Link>
                          </Button>
                        )}
                      </div>

                      {/* Security */}
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Security
                      </div>
                      <div className="ml-2 space-y-1 flex flex-col-reverse">
                        
                        {(hasPermission(user, "view:users") ||
                          hasPermission(user, "create:users") ||
                          hasPermission(user, "update:users") ||
                          hasPermission(user, "delete:users")) && (
                          <Button
                            variant={
                              location.pathname === "/users"
                                ? "secondary"
                                : "ghost"
                            }
                            className="w-full justify-start hover:bg-muted"
                            asChild
                          >
                            <Link
                              to="/users"
                              className="flex items-center gap-2"
                            >
                              <Users className="h-4 w-4" />
                              {(!collapsed || isMobile) && "Users"}
                            </Link>
                          </Button>
                        )}
                        {(hasPermission(user, "view:roles") ||
                          hasPermission(user, "create:roles") ||
                          hasPermission(user, "update:roles") ||
                          hasPermission(user, "delete:roles")) && (
                          <Button
                            variant={
                              location.pathname === "/roles"
                                ? "secondary"
                                : "ghost"
                            }
                            className="w-full justify-start hover:bg-muted"
                            asChild
                          >
                            <Link
                              to="/roles"
                              className="flex items-center gap-2"
                            >
                              <Shield className="h-4 w-4" />
                              {(!collapsed || isMobile) && "Roles"}
                            </Link>
                          </Button>
                        )}
                      </div>

                      {/* Notifications */}
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Alerts
                      </div>
                      <div className="ml-2 space-y-1">
                        {(hasPermission(user, "view:notifications") ||
                          hasPermission(user, "update:notifications")) && (
                          <Button
                            variant={
                              location.pathname === "/notifications"
                                ? "secondary"
                                : "ghost"
                            }
                            className="w-full justify-start hover:bg-muted"
                            asChild
                          >
                            <Link
                              to="/notifications"
                              className="flex items-center gap-2"
                            >
                              <Bell className="h-4 w-4" />
                              {(!collapsed || isMobile) && "Alerts"}
                            </Link>
                          </Button>
                        )}
                      </div>

                      {/* Tools */}
                      {/* <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Tools
                      </div>
                      <div className="ml-2 space-y-1">
                        <Button
                          variant={
                            location.pathname === "/export"
                              ? "secondary"
                              : "ghost"
                          }
                          className="w-full justify-start hover:bg-muted"
                          asChild
                        >
                          <Link
                            to="/export"
                            className="flex items-center gap-2"
                          >
                            <FileText className="h-4 w-4" />
                            {(!collapsed || isMobile) && "Export to Excel"}
                          </Link>
                        </Button>
                      </div> */}
                    </CollapsibleContent>
                  </Collapsible>
                );
              }
              const isActive =
                location.pathname === item.path ||
                (item.path !== "/" && location.pathname.startsWith(item.path));

              // Check permissions for specific pages
              if (item.label === "Production") {
                if (!hasPermission(user, "view:production")) return null;
              }
              if (item.label === "Accounting") {
                if (!hasPermission(user, "view:expenses")) return null;
              }
              if (item.label === "Reports") {
                const hasAnyReportPermission =
                  hasPermission(user, "view:sales-reports") ||
                  hasPermission(user, "view:purchases-reports") ||
                  hasPermission(user, "view:inventory-reports") ||
                  hasPermission(user, "view:production-reports") ||
                  hasPermission(user, "view:accounting-reports") ||
                  hasPermission(user, "view:audit");
                if (!hasAnyReportPermission) return null;
              }
              if (item.label === "Settings") {
                const hasAnySettingsPermission =
                  hasPermission(user, "view:business-information") ||
                  hasPermission(user, "update:business-information") ||
                  hasPermission(user, "view:configurations") ||
                  hasPermission(user, "update:configurations") ||
                  hasPermission(user, "view:adjustment-reasons") ||
                  hasPermission(user, "update:adjustment-reasons") ||
                  hasPermission(user, "view:expense-categories") ||
                  hasPermission(user, "update:expense-categories") ||
                  hasPermission(user, "view:users") ||
                  hasPermission(user, "create:users") ||
                  hasPermission(user, "update:users") ||
                  hasPermission(user, "delete:users") ||
                  hasPermission(user, "view:roles") ||
                  hasPermission(user, "create:roles") ||
                  hasPermission(user, "update:roles") ||
                  hasPermission(user, "delete:roles") ||
                  hasPermission(user, "view:notifications") ||
                  hasPermission(user, "update:notifications");
                if (!hasAnySettingsPermission) return null;
              }

              return (
                <Button
                  key={index}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-warm"
                      : "hover:bg-muted"
                  }`}
                  asChild
                >
                  <Link to={item.path}>
                    <Icon className="h-5 w-5" />
                    {(!collapsed || isMobile) && item.label}
                  </Link>
                </Button>
              );
            })}
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
      {/* User Profile Section - Sticky at bottom */}
      <div className="sticky bottom-0 pt-2 border-t border-border bg-card ">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 hover:bg-muted p-3 h-auto"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback className="text-xs">
                  {user?.name?.[0]?.toUpperCase() ||
                    user?.email?.[0]?.toUpperCase() ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              {(!collapsed || isMobile) && (
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-medium truncate max-w-[120px]">
                    {user?.name || "User"}
                  </span>
                  <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {typeof user?.role === "string"
                      ? user.role
                      : user?.role?.name || "Role"}
                  </span>
                </div>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="end" side="right">
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                asChild
              >
                <Link to="/profile">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </PopoverContent>
        </Popover>
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
              <img src="/icon.png" className="w-full" alt="APOTEk Image" />
            </div>
            <h2 className="font-bold text-lg text-foreground">APOTEk System</h2>
          </div>
        </div>
        <div className="h-16" /> {/* Spacer for fixed top bar */}
      </>
    );
  }

  return (
    <nav
      className={`fixed left-0 top-0 h-full ${
        collapsed ? "w-12" : "w-64"
      } bg-card border-r border-border shadow-warm z-50 transition-all duration-300`}
    >
      <div className="flex items-center justify-between py-4 px-2 border-b">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8  rounded-lg flex items-center justify-center">
              <img src="/icon.png" className="w-full" alt="APOTEk Logo" />
            </div>
            <h2 className="font-bold text-lg text-foreground">{settings?.information?.bakeryName || 'APOTEk System'}</h2>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
      <NavContent />
    </nav>
  );
};

export default Navigation;
