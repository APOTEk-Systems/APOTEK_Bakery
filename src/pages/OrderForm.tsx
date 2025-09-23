import {useState} from "react";
import {Link, useParams, useNavigate} from "react-router-dom";
import Layout from "../components/Layout";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {useToast} from "@/hooks/use-toast";
import {ArrowLeft, Save, Plus, Trash2, Search} from "lucide-react";

const OrderForm = () => {
  const {id} = useParams();
  const navigate = useNavigate();
  const {toast} = useToast();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    customerName: isEdit ? "Sarah Johnson" : "",
    customerEmail: isEdit ? "sarah@email.com" : "",
    customerPhone: isEdit ? "(555) 123-4567" : "",
    dueDate: isEdit ? "2024-01-22" : "",
    dueTime: isEdit ? "16:00" : "",
    status: isEdit ? "pending" : "pending",
    priority: isEdit ? "normal" : "normal",
    notes: isEdit ? "Customer prefers extra chocolate" : "",
  });

  const [orderItems, setOrderItems] = useState(
    isEdit
      ? [
          {
            productId: "1",
            name: "Chocolate Croissant",
            price: 4.25,
            quantity: 2,
            notes: "Extra chocolate",
          },
          {
            productId: "2",
            name: "Cappuccino",
            price: 3.5,
            quantity: 1,
            notes: "",
          },
        ]
      : [{productId: "", name: "", price: 0, quantity: 1, notes: ""}]
  );

  // Mock products for selection
  const availableProducts = [
    {id: "1", name: "Sourdough Bread", price: 8.5},
    {id: "2", name: "Chocolate Croissant", price: 4.25},
    {id: "3", name: "Red Velvet Cupcake", price: 3.75},
    {id: "4", name: "Blueberry Muffin", price: 3.0},
    {id: "5", name: "Cappuccino", price: 3.5},
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({...prev, [field]: value}));
  };

  const handleItemChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const newItems = [...orderItems];

    if (field === "productId") {
      const product = availableProducts.find((p) => p.id === value);
      if (product) {
        newItems[index] = {
          ...newItems[index],
          productId: product.id,
          name: product.name,
          price: product.price,
        };
      }
    } else {
      newItems[index] = {...newItems[index], [field]: value};
    }

    setOrderItems(newItems);
  };

  const addItem = () => {
    setOrderItems([
      ...orderItems,
      {productId: "", name: "", price: 0, quantity: 1, notes: ""},
    ]);
  };

  const removeItem = (index: number) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  const calculateSubtotal = () => {
    return orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const calculateTax = (subtotal: number) => {
    return subtotal * 0.08; // 8% tax
  };

  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);
  const total = subtotal + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName.trim()) {
      toast({
        title: "Error",
        description: "Customer name is required",
        variant: "destructive",
      });
      return;
    }

    if (orderItems.some((item) => !item.productId)) {
      toast({
        title: "Error",
        description: "Please select products for all items",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: isEdit ? "Order Updated" : "Order Created",
      description: `Order has been ${
        isEdit ? "updated" : "created"
      } successfully.`,
    });

    navigate("/orders");
  };

  return (
    <Layout>
      {" "}
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Link>
            </Button>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEdit ? "Edit Order" : "Create New Order"}
            </h1>
            <p className="text-muted-foreground">
              {isEdit
                ? "Update order information"
                : "Create a new customer order"}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) =>
                      handleInputChange("customerName", e.target.value)
                    }
                    placeholder="Enter customer name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerEmail">Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) =>
                        handleInputChange("customerEmail", e.target.value)
                      }
                      placeholder="customer@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">Phone</Label>
                    <Input
                      id="customerPhone"
                      value={formData.customerPhone}
                      onChange={(e) =>
                        handleInputChange("customerPhone", e.target.value)
                      }
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="shadow-warm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Order Items</CardTitle>
                  <Button
                    type="button"
                    onClick={addItem}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderItems.map((item, index) => (
                  <div
                    key={index}
                    className="space-y-3 p-4 border border-border rounded-lg"
                  >
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <Label>Product *</Label>
                        <Select
                          value={item.productId}
                          onValueChange={(value) =>
                            handleItemChange(index, "productId", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableProducts.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - ${product.price.toFixed(2)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="w-24">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "quantity",
                              parseInt(e.target.value) || 1
                            )
                          }
                        />
                      </div>

                      <div className="w-24">
                        <Label>Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.price.toFixed(2)}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "price",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>

                      {orderItems.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div>
                      <Label>Notes</Label>
                      <Input
                        value={item.notes}
                        onChange={(e) =>
                          handleItemChange(index, "notes", e.target.value)
                        }
                        placeholder="Special instructions for this item"
                      />
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Line Total:{" "}
                        <span className="font-medium text-foreground">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Order Details */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) =>
                        handleInputChange("dueDate", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueTime">Due Time</Label>
                    <Input
                      id="dueTime"
                      type="time"
                      value={formData.dueTime}
                      onChange={(e) =>
                        handleInputChange("dueTime", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        handleInputChange("status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="preparing">Preparing</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) =>
                        handleInputChange("priority", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Order Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Special instructions or notes for this order"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            {/* Order Total */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span className="text-foreground">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="shadow-warm">
              <CardContent className="pt-6 space-y-3">
                <Button type="submit" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {isEdit ? "Update Order" : "Create Order"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <Link to="/orders">Cancel</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>{" "}
    </Layout>
  );
};

export default OrderForm;
