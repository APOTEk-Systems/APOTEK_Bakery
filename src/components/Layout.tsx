import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { inventoryService } from "@/services/inventory";
import { settingsService } from "@/services/settings";
import { useToast } from "@/hooks/use-toast";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toast } = useToast();

  // Global inventory monitoring for notifications
  const rawMaterialsQuery = useQuery({
    queryKey: ["inventory", "raw_material"],
    queryFn: () => inventoryService.getInventory({ type: "raw_material" }),
    refetchInterval: 300000 * 12, // Check every 30 minutes
  });

  const suppliesQuery = useQuery({
    queryKey: ["inventory", "supplies"],
    queryFn: () => inventoryService.getInventory({ type: "supplies" }),
    refetchInterval: 300000 * 12, // Check every 30 minutes
  });

  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsService.getAll(),
  });

  const notificationsEnabled = settingsQuery.data?.notifications;
  const rawMaterials = rawMaterialsQuery.data;
  const supplies = suppliesQuery.data;

  // Global inventory notification logic - show once per page load
  useEffect(() => {
    if ((rawMaterials || supplies) && notificationsEnabled) {
      const allItems = [...(rawMaterials || []), ...(supplies || [])];

      const getStatus = (currentQuantity: number, minLevel: number) => {
        if (currentQuantity <= minLevel * 0.5) return "critical";
        if (currentQuantity <= minLevel) return "low";
        return "in-stock";
      };

      const lowStockItems = allItems.filter((item) => {
        // Run check only for raw materials
        if (item.type?.toLowerCase() !== "raw_material") return false;

        const status = getStatus(item.currentQuantity, item.minLevel);
        return status === "low" || status === "critical";
      });

      const outOfStockItems = allItems.filter((item) => {
        // Run check only for raw materials
        if (item.type?.toLowerCase() !== "raw_material") return false;

        return item.currentQuantity <= 0;
      });

      // Simple approach: show notifications on every page load/refresh if issues exist
      // Use a flag to prevent showing multiple times during the same load
      const loadId = Date.now().toString();
      const currentLoadId = sessionStorage.getItem("current_page_load");

      if (currentLoadId !== loadId) {
        sessionStorage.setItem("current_page_load", loadId);

        if (
          lowStockItems.length > 0 &&
          notificationsEnabled.lowInventoryAlerts
        ) {
          toast({
            title: "Low Inventory Alert",
            description: `You have ${lowStockItems.length} item${
              lowStockItems.length > 1 ? "s" : ""
            } running low on stock across all inventory.`,
            variant: "default",
            duration: 15000, // 15 seconds
          });
        }

        if (
          outOfStockItems.length > 0 &&
          (notificationsEnabled as any)?.outOfStockAlerts
        ) {
          toast({
            title: "Out of Stock Alert",
            description: `You have ${outOfStockItems.length} item${
              outOfStockItems.length > 1 ? "s" : ""
            } completely out of stock.`,
            variant: "destructive",
            duration: 15000, // 15 seconds
          });
        }
      }
    }
  }, [rawMaterials, supplies, notificationsEnabled, toast]);

  const mainClass = isMobile
    ? "flex-1"
    : collapsed
    ? "flex-1 ml-16"
    : "flex-1 ml-64";

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        isMobile={isMobile}
      />
      <main className={mainClass}>{children}</main>
    </div>
  );
};

export default Layout;
