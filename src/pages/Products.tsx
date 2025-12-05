import {useState} from "react";
import Layout from "../components/Layout";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import ProductAdjustmentsTab from "@/components/products/ProductAdjustmentsTab";
import ProductListTab from "@/components/products/ProductListTab";

const Products = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Products</h1>
            </div>
          </div>
        </div>

        <Tabs defaultValue="list" className=" w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Product List</TabsTrigger>
            <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
                      <ProductListTab />
                    </TabsContent>

          <TabsContent value="adjustments">
            <ProductAdjustmentsTab />
          </TabsContent>
        </Tabs>
        
                {/* Delete Confirmation Dialog */}
                {/* This is handled within ProductListTab component */}
              </div>
            </Layout>
          );
};

export default Products;
