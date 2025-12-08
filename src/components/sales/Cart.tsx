import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
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

// Component for individual quantity input

const QuantityInput = ({
  item,
  updateQuantity,
  products,
}: {
  item: CartItem;
  updateQuantity: (id: number, quantity: number) => void;
  products: any[];
}) => {
  const [localValue, setLocalValue] = useState(item.cartQuantity.toString());
  const [isFocused, setIsFocused] = useState(false);
  const [limitToastShown, setLimitToastShown] = useState(false);
  const { toast } = useToast();

  // Get the product to check available stock

  const product = products.find((p) => p.id === item.id);
  const maxStock = product?.quantity ?? item.quantity ?? 999999;

  // Sync local value when cart quantity changes

  useEffect(() => {
    if (!isFocused) {
      setLocalValue(item.cartQuantity.toString());
    }
  }, [item.cartQuantity, isFocused]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    e.target.select();
    setLocalValue(item.cartQuantity.toString());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty string for backspacing

    if (value === "") {
      setLocalValue("");
      setLimitToastShown(false); // Reset toast shown state
      return;
    }

    // Ensure only numbers are entered

    if (!/^\d+$/.test(value)) {
      return;
    }

    const parsedValue = parseInt(value, 10);

    // Clamp value to maxStock

    if (parsedValue > maxStock) {
      setLocalValue(maxStock.toString());

      if (!limitToastShown) {
        toast({
          title: "Stock Limit Reached",
          description: `Only ${maxStock} units available for ${item.name}.`,
        });

        setLimitToastShown(true);
      }
    } else {
      setLocalValue(parsedValue.toString()); // Use parsed value to remove leading zeros etc.
      setLimitToastShown(false); // Reset toast shown state
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setLimitToastShown(false); // Reset toast on blur
    const parsedValue = parseInt(localValue, 10);

    // If input is empty or invalid on blur, reset to 1
    if (isNaN(parsedValue) || parsedValue < 1) {
      updateQuantity(item.id, 1);
    } else {
      // The value is already clamped, now we sync it with parent state
      updateQuantity(item.id, parsedValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  return (
    <Input
      type="number"
      min="1"
      max={maxStock}
      value={isFocused ? localValue : item.cartQuantity}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="w-16 text-center h-6"
    />
  );
};

const Cart = ({
  cart,
  products,
  updateQuantity,
  removeFromCart,
  setCurrentStep,
}: CartProps) => {
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

                    <QuantityInput
                      item={item}
                      updateQuantity={updateQuantity}
                      products={products}
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
