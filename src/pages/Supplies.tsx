import Layout from "../components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SuppliesListTab from "../components/supplies/SuppliesListTab";
import SuppliesAdjustmentsTab from "../components/supplies/SuppliesAdjustmentsTab";

const Supplies = () => {
  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Supplies</h1>
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


