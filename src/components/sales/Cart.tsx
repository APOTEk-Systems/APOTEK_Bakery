import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Minus, Plus, Trash2, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/funcs";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  cartQuantity: number;
}

interface CartProps {
  cart: CartItem[];
  products: any[];
  updateQuantity: (id: number, quantity: number) => void;
  removeFromCart: (id: number) => void;
  setCurrentStep: (step: number) => void;
}

const Cart = ({ cart, products, updateQuantity, removeFromCart, setCurrentStep }: CartProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart ({cart.reduce((s, i) => s + i.cartQuantity, 0)} items)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Cart is empty
              </p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.price)} each
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(item.id, item.cartQuantity - 1);
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>

                    <Input
                      type="number"
                      min="1"
                      max={item.quantity}
                      value={item.cartQuantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        updateQuantity(item.id, val);
                      }}
                      className="w-16 text-center h-6"
                      onClick={(e) => e.stopPropagation()}
                    />

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(item.id, item.cartQuantity + 1);
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromCart(item.id);
                      }}
                      className="h-6 w-6 p-0 ml-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="pt-4 border-t">
              <Button
                onClick={() => setCurrentStep(2)}
                className="w-full"
                size="lg"
              >
                Proceed to Checkout
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Cart;