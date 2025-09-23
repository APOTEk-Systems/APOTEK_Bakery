import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import SuppliesListTab from "../components/supplies/SuppliesListTab";
import SuppliesAdjustmentsTab from "../components/supplies/SuppliesAdjustmentsTab";

const Supplies = () => {
  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Supplies</h1>
              <p className="text-muted-foreground">Track your bakery's supplies</p>
            </div>
            <Button asChild className="shadow-warm">
              <Link to="/supplies/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Supply
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="adjustments">Issue</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <SuppliesListTab />
          </TabsContent>

          <TabsContent value="adjustments" className="mt-6">
            <SuppliesAdjustmentsTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Supplies;


