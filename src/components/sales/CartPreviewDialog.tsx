import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Minus, Plus, Trash2, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/funcs";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  cartQuantity: number;
}

interface CartPreviewDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  cart: CartItem[];
  products: any[];
  updateQuantity: (id: number, quantity: number) => void;
  removeFromCart: (id: number) => void;
  setCurrentStep: (step: number) => void;
}

const CartPreviewDialog = ({
  isOpen,
  setIsOpen,
  cart,
  products,
  updateQuantity,
  removeFromCart,
  setCurrentStep
}: CartPreviewDialogProps) => {
  const totalItems = cart.reduce((s, i) => s + i.cartQuantity, 0);
  const subtotal = cart.reduce((s, it) => s + it.price * it.cartQuantity, 0);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart Preview ({totalItems} items)
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Cart is empty</p>
              <p className="text-sm mt-2">Add products to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
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
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>

                    <span className="w-8 text-center font-medium">{item.cartQuantity}</span>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(item.id, item.cartQuantity + 1);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromCart(item.id);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium text-lg">Subtotal:</span>
              <span className="font-bold text-lg">{formatCurrency(subtotal)}</span>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => setCurrentStep(2)}
                className="w-full"
                size="lg"
              >
                Proceed to Checkout
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>

              <Button
                onClick={() => setIsOpen(false)}
                className="w-full"
                variant="outline"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CartPreviewDialog;