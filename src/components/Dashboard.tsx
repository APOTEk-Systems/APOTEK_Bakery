import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Users,
  DollarSign,
  Cookie,
  Timer
} from "lucide-react";
import bakeryHeroImage from "@/assets/bakery-hero.jpg";

const Dashboard = () => {
  const todayStats = {
    revenue: 1247.50,
    orders: 28,
    customers: 42,
    popularItem: "Sourdough Bread"
  };

  const inventoryAlerts = [
    { item: "All-purpose flour", level: "Low", status: "warning" },
    { item: "Vanilla extract", level: "Critical", status: "critical" },
    { item: "Butter", level: "Low", status: "warning" }
  ];

  const recentOrders = [
    { id: "ORD-001", customer: "Sarah Johnson", items: "2x Croissants, 1x Coffee Cake", total: 24.50, status: "preparing" },
    { id: "ORD-002", customer: "Mike Chen", items: "1x Sourdough, 3x Muffins", total: 18.75, status: "ready" },
    { id: "ORD-003", customer: "Emma Davis", items: "Wedding Cake (Custom)", total: 185.00, status: "pending" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-to-r from-primary to-accent overflow-hidden">
        <img 
          src={bakeryHeroImage} 
          alt="Bakery interior with fresh bread and pastries"
          className="w-full h-full object-cover mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-primary/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary-foreground mb-2">
              Golden Crust Bakery
            </h1>
            <p className="text-xl text-primary-foreground/90">
              Management Dashboard
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-warm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ${todayStats.revenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                +12% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-warm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Orders Today
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {todayStats.orders}
              </div>
              <p className="text-xs text-muted-foreground">
                3 pending • 8 in progress
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-warm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Customers Served
              </CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {todayStats.customers}
              </div>
              <p className="text-xs text-muted-foreground">
                +5 new customers
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-warm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Popular Item
              </CardTitle>
              <Cookie className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-foreground">
                {todayStats.popularItem}
              </div>
              <p className="text-xs text-muted-foreground">
                12 sold today
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inventory Alerts */}
          <Card className="shadow-warm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Inventory Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {inventoryAlerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{alert.item}</p>
                    <p className="text-sm text-muted-foreground">Stock level: {alert.level}</p>
                  </div>
                  <Badge 
                    variant={alert.status === "critical" ? "destructive" : "secondary"}
                  >
                    {alert.level}
                  </Badge>
                </div>
              ))}
              <Button className="w-full mt-4" variant="outline">
                <Package className="h-4 w-4 mr-2" />
                Manage Inventory
              </Button>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="lg:col-span-2 shadow-warm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-primary" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium text-foreground">{order.id}</span>
                        <Badge 
                          variant={
                            order.status === "ready" ? "default" : 
                            order.status === "preparing" ? "secondary" : 
                            "outline"
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{order.customer}</p>
                      <p className="text-sm text-foreground">{order.items}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-foreground">${order.total}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                View All Orders
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;