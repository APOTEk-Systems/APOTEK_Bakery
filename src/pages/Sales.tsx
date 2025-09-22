import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Layout from "../components/Layout";
import RecentSales from '@/components/sales/RecentSales';
import UnpaidSales from '@/components/sales/UnpaidSales';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Button,
} from '@/components/ui/button';

const Sales: React.FC = () => {
  return (
    <Layout>\r\n      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Sales</h1>
              <p className="text-muted-foreground">Track daily sales and transactions</p>
            </div>
            <Link to="/sales/new">
              <Button className="shadow-warm">
                <Plus className="h-4 w-4 mr-2" /> New Sale
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="recent" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recent">Recent Sales</TabsTrigger>
            <TabsTrigger value="unpaid">Unpaid Credit Sales</TabsTrigger>
          </TabsList>
          <TabsContent value="recent">
            <RecentSales />
          </TabsContent>
          <TabsContent value="unpaid">
            <UnpaidSales />
          </TabsContent>
        </Tabs>
      </div>\r\n    </Layout>
  );
};

export default Sales;


