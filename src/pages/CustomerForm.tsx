import {useState, useEffect} from "react";
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
import {ArrowLeft, Save, User, Loader2} from "lucide-react";
import {PastryProSpinner} from "@/components/ui/PastryProSpinner";
import {customersService, type Customer} from "../services/customers";

const CustomerForm = () => {
  const {id} = useParams();
  const navigate = useNavigate();
  const {toast} = useToast();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<
    Omit<
      Customer,
      | "id"
      | "totalOrders"
      | "totalSpent"
      | "lastOrder"
      | "favoriteItems"
      | "recentOrders"
    >
  >({
    name: "",
    email: "",
    phone: "",
    address: "",
    status: "active",
    loyaltyPoints: 0,
    notes: "",
    isCredit: false,
    birthday: "",
    creditLimit: 0,
    currentCredit: 0,
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      const fetchCustomer = async () => {
        try {
          setFetchLoading(true);
          const customer = await customersService.getById(parseInt(id));
          setFormData({
            name: customer.name,
            email: customer.email || "",
            phone: customer.phone || "",
            address: customer.address || "",
            status: customer.status,
            isCredit: customer.isCredit,
            loyaltyPoints: customer.loyaltyPoints,
            notes: customer.notes || "",
            birthday: customer.birthday || "",
            creditLimit: customer.creditLimit,
            currentCredit: customer.currentCredit,
          });
        } catch (err) {
          toast({
            title: "Error",
            description: "Failed to load customer data",
            variant: "destructive",
          });
        } finally {
          setFetchLoading(false);
        }
      };

      fetchCustomer();
    }
  }, [id, isEdit, toast]);

  const handleInputChange = (field: string, value: any) => {
    if (field === "loyaltyPoints") {
      setFormData((prev) => ({...prev, [field]: parseInt(value) || 0}));
    } else {
      setFormData((prev) => ({...prev, [field]: value}));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Customer name is required",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (!formData.email.trim() && !formData.phone.trim()) {
      toast({
        title: "Error",
        description: "Either email or phone is required",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      if (isEdit && id) {
        await customersService.update(parseInt(id), formData);
        toast({
          title: "Customer Updated",
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        await customersService.create(formData);
        toast({
          title: "Customer Created",
          description: `${formData.name} has been added successfully.`,
        });
      }
      navigate("/customers");
    } catch (err) {
      toast({
        title: "Error",
        description: isEdit
          ? "Failed to update customer"
          : "Failed to create customer",
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6">
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
              {isEdit
                ? "Update customer information"
                : "Add a new customer to your database"}
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
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
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
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        placeholder="customer@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      placeholder="Enter customer's address"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="birthday">Birthday (Optional)</Label>
                    <Input
                      id="birthday"
                      type="date"
                      value={formData.birthday}
                      onChange={(e) =>
                        handleInputChange("birthday", e.target.value)
                      }
                    />
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
                        onChange={(e) =>
                          handleInputChange("loyaltyPoints", e.target.value)
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        handleInputChange("notes", e.target.value)
                      }
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
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={loading || fetchLoading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {isEdit ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {isEdit ? "Update Customer" : "Create Customer"}
                        </>
                      )}
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
          {fetchLoading ? (
            <div className="space-y-6">
              <div className="flex justify-center py-8">
                <PastryProSpinner />
              </div>
            </div>
          ) : (
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
                        {formData.status === "active"
                          ? "Active Customer"
                          : "Inactive Customer"}
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
                      <span className="text-sm text-muted-foreground">
                        Loyalty Points
                      </span>
                      <span className="font-medium text-foreground">
                        {formData.loyaltyPoints || 0}
                      </span>
                    </div>

                    {formData.notes && (
                      <div className="pt-3 border-t">
                        <p className="text-sm text-muted-foreground mb-1">
                          Notes
                        </p>
                        <p className="text-sm text-foreground italic">
                          "{formData.notes}"
                        </p>
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
          )}
        </div>
      </div>{" "}
    </Layout>
  );
};

export default CustomerForm;
