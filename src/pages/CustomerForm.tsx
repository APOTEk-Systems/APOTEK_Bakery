import {useState, useEffect} from "react";
import {Link, useParams, useNavigate} from "react-router-dom";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
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
      | "loyaltyPoints"
    >
  >({
    name: "",
    email: "",
    phone: "",
    address: "",
    status: "active",
    creditLimit: 0,
    notes: "",
    isCredit: true,
    // birthday: "",
    currentCredit: 0,
  });

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    phone?: string;
  }>({});

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return undefined; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (!phone.trim()) return undefined; // Optional field

    // Remove any spaces or hyphens
    const cleanPhone = phone.replace(/[\s\-]/g, '');

    // Check for 07 or 06 prefix (10 digits total)
    if (/^(07|06)\d{8}$/.test(cleanPhone)) {
      return undefined;
    }

    // Allow numbers starting with 7 or 6 (leading zero ignored)
    if (/^(7|6)\d*$/.test(cleanPhone)) {
      return undefined;
    }

    return "Invalid Phone Number";
  };

  // React Query for fetching customer data
  const customerQuery = useQuery({
    queryKey: ["customer", id],
    queryFn: () => customersService.getById(parseInt(id!)),
    enabled: isEdit && !!id,
  });

  // React Query mutation for creating/updating customers
  const customerMutation = useMutation({
    mutationFn: (data: {customer: any; isEdit: boolean}) =>
      data.isEdit
        ? customersService.update(parseInt(id!), data.customer)
        : customersService.create(data.customer),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["customers"]});
      setValidationErrors({}); // Clear validation errors on success
      toast({
        title: isEdit ? "Customer Updated" : "Customer Created",
        description: `${formData.name} has been ${
          isEdit ? "updated" : "added"
        } successfully.`,
      });
      navigate("/customers");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: isEdit
          ? "Failed to update customer"
          : "Failed to create customer",
        variant: "destructive",
      });
    },
  });

  // Set form data when customer data is loaded
  useEffect(() => {
    if (customerQuery.data) {
      const customer = customerQuery.data;
      setFormData({
        name: customer.name,
        email: customer.email || "",
        phone: customer.phone ? (customer.phone.startsWith('+255') ? customer.phone.substring(4) : customer.phone) : "",
        address: customer.address || "",
        status: customer.status,
        isCredit: customer.isCredit,
        creditLimit: customer.creditLimit,
        notes: customer.notes || "",
        // birthday: customer.birthday || "",
        currentCredit: customer.currentCredit,
      });
    }
  }, [customerQuery.data]);

  const handleInputChange = (field: string, value: any) => {
    if (field === "creditLimit") {
      setFormData((prev) => ({...prev, [field]: parseFloat(value) || 0}));
    } else {
      setFormData((prev) => ({...prev, [field]: value}));
    }

    // Clear validation errors when user starts typing
    if (field === "email" && validationErrors.email) {
      setValidationErrors(prev => ({ ...prev, email: undefined }));
    }
    if (field === "phone" && validationErrors.phone) {
      setValidationErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous validation errors
    setValidationErrors({});

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Customer name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.phone.trim()) {
      toast({
        title: "Error",
        description: "Phone number is required",
        variant: "destructive",
      });
      return;
    }

    if (formData.creditLimit <= 0) {
      toast({
        title: "Error",
        description: "Credit limit is required and must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email.trim() && !formData.phone.trim()) {
      toast({
        title: "Error",
        description: "Either email or phone is required",
        variant: "destructive",
      });
      return;
    }

    // Validate email if provided
    if (formData.email.trim()) {
      const emailError = validateEmail(formData.email);
      if (emailError) {
        setValidationErrors(prev => ({ ...prev, email: emailError }));
        toast({
          title: "Error",
          description: emailError,
          variant: "destructive",
        });
        return;
      }
    }

    // Validate phone if provided
    if (formData.phone.trim()) {
      const phoneError = validatePhone(formData.phone);
      if (phoneError) {
        setValidationErrors(prev => ({ ...prev, phone: phoneError }));
        toast({
          title: "Error",
          description: phoneError,
          variant: "destructive",
        });
        return;
      }
    }

    // Normalize phone number
    const normalizedFormData = {
      ...formData,
      phone: formData.phone.trim() ? "+255" + formData.phone.replace(/^0/, '') : "",
    };

    customerMutation.mutate({customer: normalizedFormData, isEdit});
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
         
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cards side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        onChange={(e) => {
                          handleInputChange("email", e.target.value);
                        }}
                        onBlur={(e) => {
                          const error = validateEmail(e.target.value);
                          setValidationErrors(prev => ({ ...prev, email: error }));
                        }}
                        placeholder="customer@email.com"
                        className={validationErrors.email ? "border-destructive" : ""}
                      />
                      {validationErrors.email && (
                        <p className="text-sm text-destructive mt-1">{validationErrors.email}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="flex items-center">
                        <span className="border border-input bg-muted px-3 py-2 rounded-l-md text-muted-foreground border-r-0">+255</span>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => {
                            handleInputChange("phone", e.target.value);
                          }}
                          onBlur={(e) => {
                            const error = validatePhone(e.target.value);
                            setValidationErrors(prev => ({ ...prev, phone: error }));
                          }}
                          placeholder="enter phone number"
                          className={`rounded-l-none ${validationErrors.phone ? "border-destructive" : ""}`}
                        />
                      </div>
                      {validationErrors.phone && (
                        <p className="text-sm text-destructive mt-1">{validationErrors.phone}</p>
                      )}
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
                      <Label htmlFor="creditLimit">Credit Limit *</Label>
                      <Input
                        id="creditLimit"
                        type="text" // 👈 use text to allow formatted values
                        inputMode="numeric"
                        value={
                          formData.creditLimit !== null &&
                          formData.creditLimit !== undefined
                            ? Number(formData.creditLimit).toLocaleString(
                                "en-US",
                              )
                            : ""
                        }
                        onChange={(e) => {
                          // Strip commas before saving
                          const raw = e.target.value.replace(/,/g, "");
                          handleInputChange(
                            "creditLimit",
                            raw === "" ? 0 : parseInt(raw)
                          );
                        }}
                        placeholder="1,000.00"
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
            </div>

            {/* Form Actions */}
            <Card className="shadow-warm">
              <CardContent className="pt-6">
                <div className="flex flex-row-reverse gap-3">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      customerMutation.isPending || customerQuery.isLoading
                    }
                  >
                    {customerMutation.isPending ? (
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
                  <Button type="button" variant="outline" asChild className="w-full">
                    <Link to="/customers">Cancel</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>{" "}
    </Layout>
  );
};

export default CustomerForm;

