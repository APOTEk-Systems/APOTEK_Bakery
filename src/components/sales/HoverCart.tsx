import { useState } from "react";
import { ShoppingCart, ChevronRight, ChevronLeft, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/funcs";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  cartQuantity: number;
}

interface HoverCartProps {
  cart: CartItem[];
  products: any[];
  updateQuantity: (id: number, quantity: number) => void;
  removeFromCart: (id: number) => void;
  setCurrentStep: (step: number) => void;
  onPreview: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const HoverCart = ({
  cart,
  products,
  updateQuantity,
  removeFromCart,
  setCurrentStep,
  onPreview,
  isOpen,
  setIsOpen
}: HoverCartProps) => {
  const totalItems = cart.reduce((s, i) => s + i.cartQuantity, 0);
  const subtotal = cart.reduce((s, it) => s + it.price * it.cartQuantity, 0);

  return (
    <>
      {/* Cart button - fixed at bottom right */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full w-14 h-14 shadow-lg relative"
          size="icon"
        >
          <ShoppingCart className="h-6 w-6" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Button>
      </div>

      {/* Hover cart panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 max-w-[90vw] z-50">
          <Card className="shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShoppingCart className="h-5 w-5" />
                  Cart ({totalItems} items)
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="max-h-80 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Cart is empty</p>
                  <p className="text-sm mt-2">Add products to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="font-medium truncate text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.price)} × {item.cartQuantity}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
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
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium">Subtotal:</span>
                    <span className="font-bold">{formatCurrency(subtotal)}</span>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={onPreview}
                      className="w-full"
                      size="sm"
                    >
                      Preview Cart
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>

                    <Button
                      onClick={() => setCurrentStep(2)}
                      className="w-full"
                      size="sm"
                      variant="secondary"
                    >
                      Proceed to Checkout
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default HoverCart;