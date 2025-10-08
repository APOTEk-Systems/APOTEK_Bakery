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


const Sales: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'recent';

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

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


