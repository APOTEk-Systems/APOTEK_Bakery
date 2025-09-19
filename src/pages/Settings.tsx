import Navigation from "../components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Save, 
  Store, 
  Bell, 
  Users, 
  DollarSign,
  Clock,
  Mail,
  Smartphone,
  Shield
} from "lucide-react";

const Settings = () => {
  const { toast } = useToast();

  const handleSave = (section: string) => {
    toast({
      title: "Settings Saved",
      description: `${section} settings have been updated successfully.`
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 ml-64 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your bakery's configuration and preferences</p>
        </div>

        <Tabs defaultValue="information" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="information" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Information
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              System Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="information" className="mt-6">
            <div className="space-y-6">
              {/* Bakery Information */}
              <Card className="shadow-warm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Bakery Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bakeryName">Bakery Name</Label>
                      <Input id="bakeryName" defaultValue="Golden Crust Bakery" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" defaultValue="(555) 123-BAKE" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea 
                      id="address" 
                      defaultValue="123 Baker Street, Pastry City, PC 12345" 
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="info@goldencrustbakery.com" />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" defaultValue="www.goldencrustbakery.com" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      defaultValue="Artisanal bakery serving fresh bread and pastries since 1995"
                      rows={3}
                    />
                  </div>
                  
                  <Button onClick={() => handleSave("Bakery Information")} className="w-full md:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    Save Bakery Info
                  </Button>
                </CardContent>
              </Card>

              {/* Business Hours */}
              <Card className="shadow-warm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Business Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
                  ].map((day, index) => (
                    <div key={day} className="flex items-center gap-4">
                      <div className="w-20">
                        <Label>{day}</Label>
                      </div>
                      <Switch defaultChecked={index < 6} />
                      <div className="flex items-center gap-2">
                        <Input 
                          type="time" 
                          defaultValue="07:00" 
                          className="w-24"
                          disabled={index === 6}
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input 
                          type="time" 
                          defaultValue={index === 5 ? "20:00" : "18:00"} 
                          className="w-24"
                          disabled={index === 6}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <Button onClick={() => handleSave("Business Hours")} className="w-full md:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    Save Hours
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Manage System Users</h3>
                  <Button onClick={() => handleSave("Users")}>
                    <Save className="h-4 w-4 mr-2" />
                    Add New User
                  </Button>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>John Doe</TableCell>
                        <TableCell>john@example.com</TableCell>
                        <TableCell>Admin</TableCell>
                        <TableCell>Active</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                          <Button variant="destructive" size="sm">Deactivate</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Jane Smith</TableCell>
                        <TableCell>jane@example.com</TableCell>
                        <TableCell>Manager</TableCell>
                        <TableCell>Active</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                          <Button variant="destructive" size="sm">Deactivate</Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            {/* Notifications */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Low Inventory Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when items are running low</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>New Order Notifications</Label>
                    <p className="text-sm text-muted-foreground">Instant alerts for new orders</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Daily Sales Summary</Label>
                    <p className="text-sm text-muted-foreground">Email summary at end of day</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Customer Birthday Reminders</Label>
                    <p className="text-sm text-muted-foreground">Reminder to send birthday offers</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Button onClick={() => handleSave("Notifications")} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Notifications
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="mt-6">
            <div className="space-y-6">
              {/* Payment & Tax */}
              <Card className="shadow-warm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    VAT & Tax
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
            
                  
                  <div>
                    <Label htmlFor="taxRate">VAT (%)</Label>
                    <Input id="taxRate" type="number" step="1" defaultValue="18" />
                  </div>    
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Accept Cash</Label>
                      <p className="text-sm text-muted-foreground">Allow cash payments</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Accept Cards</Label>
                      <p className="text-sm text-muted-foreground">Accept credit/debit cards</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <Button onClick={() => handleSave("Payment & Tax")} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Payment Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Customer Settings */}
              {/* <Card className="shadow-warm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Customer Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="loyaltyRate">Loyalty Points Rate</Label>
                    <div className="flex items-center gap-2">
                      <Input id="loyaltyRate" type="number" defaultValue="1" className="w-20" />
                      <span className="text-sm text-muted-foreground">point per $1 spent</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="redemptionValue">Point Redemption Value</Label>
                    <div className="flex items-center gap-2">
                      <Input id="redemptionValue" type="number" step="0.01" defaultValue="0.01" className="w-20" />
                      <span className="text-sm text-muted-foreground">$ per point</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Birthday Discounts</Label>
                      <p className="text-sm text-muted-foreground">Automatic birthday offers</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div>
                    <Label htmlFor="birthdayDiscount">Birthday Discount (%)</Label>
                    <Input id="birthdayDiscount" type="number" defaultValue="10" />
                  </div>
                  
                  <Button onClick={() => handleSave("Customer Settings")} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Customer Settings
                  </Button>
                </CardContent>
              </Card> */}

              {/* System Preferences */}
              {/* <Card className="shadow-warm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    System Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="America/New_York">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select defaultValue="MM/DD/YYYY">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-backup Data</Label>
                      <p className="text-sm text-muted-foreground">Daily automatic backups</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Usage Analytics</Label>
                      <p className="text-sm text-muted-foreground">Help improve the app</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <Button onClick={() => handleSave("System Preferences")} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </Button>
                </CardContent>
              </Card> */}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Settings;