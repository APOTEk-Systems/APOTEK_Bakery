import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from "../components/Layout";
import RecentSales from '@/components/sales/RecentSales';
import UnpaidSales from '@/components/sales/UnpaidSales';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';

// Helper function to check permissions
const hasPermission = (user: any, permission: string): boolean => {
  if (!user) return false;
  if (user.permissions?.includes("all")) return true;
  return user.permissions?.includes(permission) || false;
};


const Sales: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'recent';

  const hasViewSales = hasPermission(user, "view:sales");

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  if (!hasViewSales) {
    return (
      <Layout>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <h1 className="text-2xl font-bold text-muted-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to view sales.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Sales History</h1>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recent">Recent Sales</TabsTrigger>
            <TabsTrigger value="unpaid">Unpaid Sales</TabsTrigger>
          </TabsList>
          <TabsContent value="recent">
            <RecentSales />
          </TabsContent>
          <TabsContent value="unpaid">
            <UnpaidSales />
          </TabsContent>
        </Tabs>
      </div>
      </Layout>
  );
};

export default Sales;


