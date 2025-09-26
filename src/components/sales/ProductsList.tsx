import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/funcs";
import { type Product } from "@/services/products";

interface ProductsListProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredProducts: Product[];
  addToCart: (product: Product) => void;
}

const ProductsList = ({
  searchTerm,
  setSearchTerm,
  filteredProducts,
  addToCart
}: ProductsListProps) => {
  return (
    <div className="lg:col-span-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Products
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No products found. Try adjusting your search.
              </div>
            ) : (
              filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="p-4 hover:shadow-md transition-shadow"
                >
                  <div className="text-center space-y-2">
                    <h3 className="font-medium text-sm">
                      {product.name}
                    </h3>
                    <p className="text-xl font-bold text-primary">
                      {formatCurrency(product.price)}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Stock: {product.quantity}{" "}
                    </p>
                    <Button
                      onClick={() => addToCart(product)}
                      disabled={product.quantity === 0}
                      className="w-full"
                      size="sm"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductsList;