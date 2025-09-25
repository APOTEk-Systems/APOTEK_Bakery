import Layout from "../components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InventoryListTab from "../components/inventory/InventoryListTab";
import InventoryAdjustmentsTab from "../components/inventory/InventoryAdjustmentsTab";

const Inventory = () => {
  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Raw Materials</h1>
            <p className="text-muted-foreground">Track your bakery's raw materials</p>
          </div>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <InventoryListTab type="raw_material" title="Raw Materials" />
          </TabsContent>

          <TabsContent value="adjustments" className="mt-6">
            <InventoryAdjustmentsTab type="raw_material" title="Raw Materials" />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Inventory;


