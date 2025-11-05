import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { permission } from 'process';

// Helper function to check permissions
const hasPermission = (user: any, permission: string): boolean => {
  if (!user) return false;
  if (user.permissions?.includes("all")) return true;
  return user.permissions?.includes(permission) || false;
};

const DashboardRedirect: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    // Define permission to route mapping in priority order
    const permissionRoutes = [
      { permission: 'create:sales', route: '/sales/new' }, // Cashiers go straight to sales
      { permission: 'view:sales', route: '/sales' },
      { permission  :'view:purchases', route: '/purchases' },
      { permission: 'view:products', route: '/products' },
      { permission: 'view:customers', route: '/customers' },
      { permission: 'view:reports', route: '/reports' },
      { permission: 'view:profile', route: '/profile' },
    ];

    // Find first permitted route
    const permittedRoute = permissionRoutes.find(route =>
      hasPermission(user, route.permission)
    );

    if (permittedRoute) {
      console.log(`🔄 Redirecting user ${user.name} to ${permittedRoute.route} based on ${permittedRoute.permission} permission`);
      navigate(permittedRoute.route);
    } else {
      // No permissions found, stay on current page (will show welcome message)
      console.log(`⚠️ User ${user.name} has no dashboard or primary permissions, showing welcome page`);
    }
  }, [user, navigate]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-background flex justify-center items-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting to your workspace...</p>
      </div>
    </div>
  );
};

export default DashboardRedirect;