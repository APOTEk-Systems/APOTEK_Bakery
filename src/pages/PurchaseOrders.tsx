import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Truck, Package, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PurchaseOrder {
  id: string;
  requestId: string;
  item: string;
  supplier: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  orderDate: string;
  expectedDelivery?: string;
  status: 'Ordered' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  deliveryAddress: string;
  notes?: string;
}

const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: "PO-001",
    requestId: "REQ-002",
    item: "Granulated Sugar",
    supplier: "Sweet Ingredients Ltd.",
    quantity: 25,
    unit: "kg",
    unitCost: 1.80,
    totalCost: 45.00,
    orderDate: "2024-01-15",
    expectedDelivery: "2024-01-18",
    status: "Shipped",
    deliveryAddress: "123 Bakery Street, City",
    notes: "Approved from stock request REQ-002"
  },
  {
    id: "PO-002",
    requestId: "REQ-003",
    item: "Vanilla Extract",
    supplier: "Flavor House Co.",
    quantity: 6,
    unit: "bottles",
    unitCost: 6.00,
    totalCost: 36.00,
    orderDate: "2024-01-14",
    expectedDelivery: "2024-01-17",
    status: "Delivered",
    deliveryAddress: "123 Bakery Street, City",
    notes: "High-quality pure vanilla extract"
  },
  {
    id: "PO-003",
    requestId: "REQ-004",
    item: "Active Dry Yeast",
    supplier: "Baker's Supply Co.",
    quantity: 20,
    unit: "packets",
    unitCost: 1.75,
    totalCost: 35.00,
    orderDate: "2024-01-16",
    expectedDelivery: "2024-01-19",
    status: "Confirmed",
    deliveryAddress: "123 Bakery Street, City",
    notes: "Critical priority - expedited shipping"
  }
];

export default function PurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ordered': return 'outline';
      case 'Confirmed': return 'default';
      case 'Shipped': return 'secondary';
      case 'Delivered': return 'default';
      case 'Cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const handleReceiveGoods = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: 'Delivered' as const }
        : order
    ));
    
    toast({
      title: "Goods Received",
      description: `Purchase order ${orderId} marked as delivered. Inventory will be updated.`
    });
    
    setIsReceiveDialogOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Navigation />
      
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
              <p className="text-muted-foreground">
                Track and manage purchase orders from approved stock requests
              </p>
            </div>
            
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Purchase Order
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by item, supplier, or PO number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ordered">Ordered</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {orders.filter(o => ['Ordered', 'Confirmed', 'Shipped'].includes(o.status)).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Active Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{orders.filter(o => o.status === 'Shipped').length}</p>
                    <p className="text-sm text-muted-foreground">In Transit</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{orders.filter(o => o.status === 'Delivered').length}</p>
                    <p className="text-sm text-muted-foreground">Delivered</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 text-green-500">$</div>
                  <div>
                    <p className="text-2xl font-bold">
                      ${orders.reduce((sum, o) => sum + o.totalCost, 0).toFixed(0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Orders List */}
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{order.item}</CardTitle>
                        <Badge variant={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        PO: {order.id} • Request: {order.requestId} • Supplier: {order.supplier}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Cost</p>
                      <p className="text-xl font-bold">${order.totalCost.toFixed(2)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                      <p className="text-lg font-semibold">
                        {order.quantity} {order.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Unit Cost</p>
                      <p className="text-lg font-semibold">
                        ${order.unitCost.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Order Date</p>
                      <p className="font-medium">{order.orderDate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Expected Delivery</p>
                      <p className="font-medium">{order.expectedDelivery || 'TBD'}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Delivery Address</p>
                      <p className="text-sm">{order.deliveryAddress}</p>
                    </div>
                    
                    {order.notes && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                        <p className="text-sm text-muted-foreground">{order.notes}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {order.status === 'Shipped' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsReceiveDialogOpen(true);
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Package className="mr-2 h-4 w-4" />
                          Receive Goods
                        </Button>
                      )}
                      
                      {order.status === 'Delivered' && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Received
                        </Badge>
                      )}
                      
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Receive Goods Dialog */}
          <Dialog open={isReceiveDialogOpen} onOpenChange={setIsReceiveDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Receive Goods</DialogTitle>
                <DialogDescription>
                  Mark purchase order as received and update inventory
                </DialogDescription>
              </DialogHeader>
              
              {selectedOrder && (
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Purchase Order</p>
                          <p className="text-lg">{selectedOrder.id}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Item</p>
                          <p className="text-lg">{selectedOrder.item}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Quantity</p>
                          <p className="text-lg font-semibold text-blue-600">
                            {selectedOrder.quantity} {selectedOrder.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Supplier</p>
                          <p>{selectedOrder.supplier}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Important:</strong> Confirming receipt will:
                    </p>
                    <ul className="text-sm text-blue-700 mt-2 ml-4 list-disc">
                      <li>Mark this purchase order as delivered</li>
                      <li>Add {selectedOrder.quantity} {selectedOrder.unit} of {selectedOrder.item} to inventory</li>
                      <li>Update stock levels in the system</li>
                    </ul>
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsReceiveDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => selectedOrder && handleReceiveGoods(selectedOrder.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm Receipt
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {filteredOrders.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No purchase orders found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm || filterStatus !== "all" 
                    ? "Try adjusting your search or filter criteria"
                    : "Purchase orders will appear here when stock requests are approved"
                  }
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Purchase Order
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}