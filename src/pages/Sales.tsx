import React from 'react';
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

        <Tabs defaultValue="recent" className="space-y-6">
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


