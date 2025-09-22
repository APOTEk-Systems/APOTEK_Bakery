import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Edit,
  User,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  Phone,
  Mail
} from "lucide-react";

const OrderDetail = () => {
  const { id } = useParams();
  
  // Mock data - in real app, fetch by ID
  const order = {
    id: id || "ORD-001",
    customerName: "Sarah Johnson",
    customerEmail: "sarah@email.com",
    customerPhone: "(555) 123-4567",
    items: [
      { 
        id: 1,
        name: "Chocolate Croissant", 
        quantity: 2, 
        price: 4.25,
        notes: "Extra chocolate"
      },
      { 
        id: 2,
        name: "Cappuccino", 
        quantity: 1, 
        price: 3.50,
        notes: ""
      }
    ],
    subtotal: 12.00,
    tax: 0.96,
    total: 12.96,
    status: "preparing",
    priority: "normal",
    orderDate: "2024-01-22T09:30:00Z",
    dueDate: "2024-01-22T16:00:00Z",
    notes: "Customer prefers extra chocolate on croissants. Call when ready for pickup.",
    paymentStatus: "paid",
    paymentMethod: "card"
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "secondary";
      case "preparing": return "default";
      case "ready": return "outline";
      case "completed": return "outline";
      default: return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const statusOptions = [
    { value: "pending", label: "Pending", color: "secondary" },
    { value: "preparing", label: "Preparing", color: "default" },
    { value: "ready", label: "Ready for Pickup", color: "outline" },
    { value: "completed", label: "Completed", color: "outline" }
  ];

  return (
    <Layout>\r\n      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Link>
            </Button>
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Order {order.id}</h1>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
                <Badge variant="outline">{order.paymentStatus}</Badge>
                {order.priority === "urgent" && (
                  <Badge variant="destructive">Urgent</Badge>
                )}
              </div>
            </div>
            <Button asChild className="shadow-warm">
              <Link to={`/orders/${order.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Order
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start p-4 bg-muted/30 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{item.name}</h4>
                        {item.notes && (
                          <p className="text-sm text-muted-foreground mt-1">Note: {item.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">
                          {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Order Total */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="text-foreground">${order.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Notes */}
            {order.notes && (
              <Card className="shadow-warm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Order Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground">{order.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Status Updates */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map((status) => (
                    <Button
                      key={status.value}
                      variant={order.status === status.value ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => {
                        // Handle status update
                        console.log(`Update status to: ${status.value}`);
                      }}
                    >
                      {status.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium text-foreground">{order.customerName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`mailto:${order.customerEmail}`}
                    className="text-sm text-foreground hover:text-primary"
                  >
                    {order.customerEmail}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`tel:${order.customerPhone}`}
                    className="text-sm text-foreground hover:text-primary"
                  >
                    {order.customerPhone}
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Placed</p>
                  <p className="font-medium text-foreground">
                    {formatDate(order.orderDate)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    at {formatTime(order.orderDate)}
                  </p>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium text-foreground">
                    {formatDate(order.dueDate)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    at {formatTime(order.dueDate)}
                  </p>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Time remaining: 6h 30m
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"}>
                    {order.paymentStatus}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Method</span>
                  <span className="text-foreground capitalize">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold text-foreground">${order.total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>\r\n    </Layout>
  );
};

export default OrderDetail;


