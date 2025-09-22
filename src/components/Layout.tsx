import { useState } from "react";
import Navigation from "./Navigation";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
      <main className={mainClass}>
        {children}
      </main>
    </div>
  );
};

export default Layout;