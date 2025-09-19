import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Navigation from '@/components/Navigation';
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
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 ml-64 p-6">
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
      </main>
    </div>
  );
};

export default Sales;