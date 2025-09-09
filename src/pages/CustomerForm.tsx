import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, User } from "lucide-react";

const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: isEdit ? "Sarah Johnson" : "",
    email: isEdit ? "sarah@email.com" : "",
    phone: isEdit ? "(555) 123-4567" : "",
    address: isEdit ? "123 Main St, Anytown, ST 12345" : "",
    status: isEdit ? "active" : "active",
    loyaltyPoints: isEdit ? "142" : "0",
    notes: isEdit ? "Prefers extra chocolate on pastries" : "",
    birthday: isEdit ? "1990-05-15" : "",
    preferredContact: isEdit ? "email" : "email"
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Customer name is required", variant: "destructive" });
      return;
    }
    
    if (!formData.email.trim() && !formData.phone.trim()) {
      toast({ title: "Error", description: "Either email or phone is required", variant: "destructive" });
      return;
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({ title: "Error", description: "Please enter a valid email address", variant: "destructive" });
      return;
    }

    toast({
      title: isEdit ? "Customer Updated" : "Customer Created",
      description: `${formData.name} has been ${isEdit ? "updated" : "added"} successfully.`
    });
    
    navigate("/customers");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 ml-64 p-6">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/customers">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Customers
              </Link>
            </Button>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEdit ? "Edit Customer" : "Add New Customer"}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? "Update customer information" : "Add a new customer to your database"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <Card className="shadow-warm">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter customer's full name"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="customer@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Enter customer's address"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="birthday">Birthday (Optional)</Label>
                      <Input
                        id="birthday"
                        type="date"
                        value={formData.birthday}
                        onChange={(e) => handleInputChange("birthday", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="preferredContact">Preferred Contact</Label>
                      <Select value={formData.preferredContact} onValueChange={(value) => handleInputChange("preferredContact", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Settings */}
              <Card className="shadow-warm">
                <CardHeader>
                  <CardTitle>Customer Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="loyaltyPoints">Loyalty Points</Label>
                      <Input
                        id="loyaltyPoints"
                        type="number"
                        min="0"
                        value={formData.loyaltyPoints}
                        onChange={(e) => handleInputChange("loyaltyPoints", e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      placeholder="Any special notes about this customer..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Form Actions */}
              <Card className="shadow-warm">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      {isEdit ? "Update Customer" : "Create Customer"}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                      <Link to="/customers">Cancel</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Preview Card */}
          <div className="space-y-6">
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">
                      {formData.name || "Customer Name"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formData.status === "active" ? "Active Customer" : "Inactive Customer"}
                    </p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {formData.email && (
                      <p className="text-foreground">📧 {formData.email}</p>
                    )}
                    {formData.phone && (
                      <p className="text-foreground">📞 {formData.phone}</p>
                    )}
                    {formData.address && (
                      <p className="text-foreground">📍 {formData.address}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="text-sm text-muted-foreground">Loyalty Points</span>
                    <span className="font-medium text-foreground">{formData.loyaltyPoints || 0}</span>
                  </div>
                  
                  {formData.notes && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground mb-1">Notes</p>
                      <p className="text-sm text-foreground italic">"{formData.notes}"</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Either email or phone number is required</p>
                <p>• Use notes to track customer preferences</p>
                <p>• Loyalty points can be manually adjusted</p>
                <p>• Birthday helps with promotional campaigns</p>
                <p>• Inactive customers won't receive marketing emails</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerForm;