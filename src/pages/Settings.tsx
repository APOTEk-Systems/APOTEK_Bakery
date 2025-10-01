import Layout from "../components/Layout";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
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
import {Switch} from "@/components/ui/switch";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {useToast} from "@/hooks/use-toast";
import { usersService, CreateUserData } from "@/services/users";
import { settingsService, SettingsData, BusinessHour } from "@/services/settings";
import { User } from "@/services/auth";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Save,
  Store,
  Bell,
  Users,
  DollarSign,
  Clock,
  Shield,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";

const Settings = () => {
  const {toast} = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserData>({
    name: "",
    email: "",
    password: "",
    role: "cashier",
    permissions: [],
  });

  // Local state for settings forms
  const [informationData, setInformationData] = useState({
    bakeryName: "",
    phone: "",
    address: "",
    email: "",
    website: "",
    description: "",
  });

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
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

  const [businessHoursData, setBusinessHoursData] = useState<BusinessHour[]>([]);

  const [notificationsData, setNotificationsData] = useState({
    dailySalesSummary: false,
    lowInventoryAlerts: true,
    newOrderNotifications: true,
    customerBirthdayReminders: true,
  });

  const [vatAndTaxData, setVatAndTaxData] = useState({
    taxRate: 18,
    acceptCash: true,
    acceptCards: true,
  });

  const allPermissions = [
    "read:sales",
    "write:sales",
    "read:customers",
    "write:customers",
    "read:products",
    "read:inventory",
    "read:purchases",
    "write:purchases",
    "read:production",
    "write:production"
  ];

  // Fetch users with React Query
  const { data: users = [], isLoading: loading, error: usersError } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => usersService.getAll(),
  });

  // Fetch settings with React Query
  const { data: settings, isLoading: settingsLoading, error: settingsError } = useQuery<SettingsData>({
    queryKey: ['settings'],
    queryFn: () => settingsService.getAll(),
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => settingsService.update(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Settings updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      });
    },
  });

  // Populate local state when settings data is loaded
  React.useEffect(() => {
    if (settings) {
      setInformationData({
        ...settings.information,
        phone: settings.information.phone ? (settings.information.phone.startsWith('+255') ? settings.information.phone.substring(4) : settings.information.phone) : "",
      });
      setBusinessHoursData(settings.businessHours.data);
      setNotificationsData(settings.notifications);
      setVatAndTaxData(settings.vatAndTax);
    }
  }, [settings]);

  // Show error toasts
  React.useEffect(() => {
    if (usersError) {
      toast({
        title: "Error",
        description: "Failed to fetch users.",
        variant: "destructive",
      });
    }
    if (settingsError) {
      toast({
        title: "Error",
        description: "Failed to fetch settings.",
        variant: "destructive",
      });
    }
  }, [usersError, settingsError, toast]);

  const handleRoleChange = (role: "admin" | "cashier") => {
    setFormData(prev => ({
      ...prev,
      role,
      permissions: role === "admin" ? allPermissions : [],
    }));
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    // Only allow manual permission changes for cashier role
    if (formData.role === "cashier") {
      setFormData(prev => ({
        ...prev,
        permissions: checked
          ? [...prev.permissions, permission]
          : prev.permissions.filter(p => p !== permission),
      }));
    }
  };

  const getFinalPermissions = (role: "admin" | "cashier", permissions: string[]) => {
    return role === "admin" ? ["all"] : permissions;
  };

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (userData: CreateUserData) => usersService.create(userData),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDialogOpen(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "cashier",
        permissions: [],
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create user.",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateUserData> }) =>
      usersService.update(id, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDialogOpen(false);
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "cashier",
        permissions: [],
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user.",
        variant: "destructive",
      });
    },
  });

  // Update user role mutation (for inline toggle)
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: "admin" | "cashier" }) =>
      usersService.update(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => usersService.delete(userId),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    },
  });

  const handleCreateUser = () => {
    const finalData = {
      ...formData,
      permissions: getFinalPermissions(formData.role, formData.permissions),
    };
    createUserMutation.mutate(finalData);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    const userPermissions = user.permissions || [];
    // For admin users, show all permissions as checked in UI
    const displayPermissions = user.role === "admin" ? allPermissions : userPermissions;

    setFormData({
      name: user.name || "",
      email: user.email,
      password: "", // Don't prefill password for security
      role: user.role as "admin" | "cashier",
      permissions: displayPermissions,
    });
    setDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;
    const finalData = {
      ...formData,
      permissions: getFinalPermissions(formData.role, formData.permissions),
    };
    updateUserMutation.mutate({ id: editingUser.id, data: finalData });
  };

  const handleUpdateRole = (userId: number, newRole: "admin" | "cashier") => {
    updateRoleMutation.mutate({ id: userId, role: newRole });
  };

  const handleDeleteUser = (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    deleteUserMutation.mutate(userId);
  };

  const openCreateDialog = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "cashier",
      permissions: [],
    });
    setDialogOpen(true);
  };

  const handleSave = (section: string) => {
    // Clear previous validation errors
    setValidationErrors({});

    let updateData: any = {};

    switch (section) {
      case "Bakery Information":
        // Validate email if provided
        if (informationData.email.trim()) {
          const emailError = validateEmail(informationData.email);
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

        updateData = {
          key: "information",
          ...informationData,
          phone: informationData.phone.trim() ? "+255" + informationData.phone : "",
        };
        break;
      case "Business Hours":
        updateData = {
          key: "businessHours",
          data: businessHoursData,
        };
        break;
      case "Notifications":
        updateData = {
          key: "notifications",
          ...notificationsData,
        };
        break;
      case "Payment & Tax":
        updateData = {
          key: "vatAndTax",
          ...vatAndTaxData,
        };
        break;
      default:
        return;
    }

    updateSettingsMutation.mutate(updateData);
  };

  return (
    <Layout>
      {" "}
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        </div>

        <Tabs defaultValue="information" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger
              value="information"
              className="flex items-center gap-2"
            >
              <Store className="h-4 w-4" />
              Information
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2"
            >
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
                      <Input
                        id="bakeryName"
                        value={informationData.bakeryName}
                        onChange={(e) => setInformationData(prev => ({ ...prev, bakeryName: e.target.value }))}
                        disabled={settingsLoading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex items-center">
                        <span className="border border-input bg-muted px-3 py-2 rounded-l-md text-muted-foreground border-r-0">+255</span>
                        <Input
                          id="phone"
                          value={informationData.phone}
                          onChange={(e) => setInformationData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="enter phone number"
                          className="rounded-l-none"
                          disabled={settingsLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={informationData.address}
                      onChange={(e) => setInformationData(prev => ({ ...prev, address: e.target.value }))}
                      rows={2}
                      disabled={settingsLoading}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={informationData.email}
                        onChange={(e) => {
                          setInformationData(prev => ({ ...prev, email: e.target.value }));
                          // Clear validation error when user starts typing
                          if (validationErrors.email) {
                            setValidationErrors(prev => ({ ...prev, email: undefined }));
                          }
                        }}
                        onBlur={(e) => {
                          const error = validateEmail(e.target.value);
                          setValidationErrors(prev => ({ ...prev, email: error }));
                        }}
                        className={validationErrors.email ? "border-destructive" : ""}
                        disabled={settingsLoading}
                      />
                      {validationErrors.email && (
                        <p className="text-sm text-destructive mt-1">{validationErrors.email}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={informationData.website}
                        onChange={(e) => setInformationData(prev => ({ ...prev, website: e.target.value }))}
                        disabled={settingsLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={informationData.description}
                      onChange={(e) => setInformationData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      disabled={settingsLoading}
                    />
                  </div>

                  <Button
                    onClick={() => handleSave("Bakery Information")}
                    className="w-full md:w-auto"
                    disabled={updateSettingsMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateSettingsMutation.isPending ? "Saving..." : "Save Bakery Info"}
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
                  {businessHoursData.map((hour, index) => (
                    <div key={hour.day} className="flex items-center gap-4">
                      <div className="w-20">
                        <Label>{hour.day}</Label>
                      </div>
                      <Switch
                        checked={hour.isOpen}
                        onCheckedChange={(checked) => {
                          const updatedHours = [...businessHoursData];
                          updatedHours[index] = { ...hour, isOpen: checked };
                          setBusinessHoursData(updatedHours);
                        }}
                        disabled={settingsLoading}
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={hour.open || ""}
                          onChange={(e) => {
                            const updatedHours = [...businessHoursData];
                            updatedHours[index] = { ...hour, open: e.target.value };
                            setBusinessHoursData(updatedHours);
                          }}
                          className="w-24"
                          disabled={!hour.isOpen || settingsLoading}
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          type="time"
                          value={hour.close || ""}
                          onChange={(e) => {
                            const updatedHours = [...businessHoursData];
                            updatedHours[index] = { ...hour, close: e.target.value };
                            setBusinessHoursData(updatedHours);
                          }}
                          className="w-24"
                          disabled={!hour.isOpen || settingsLoading}
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    onClick={() => handleSave("Business Hours")}
                    className="w-full md:w-auto"
                    disabled={updateSettingsMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateSettingsMutation.isPending ? "Saving..." : "Save Hours"}
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
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={openCreateDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add New User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>
                          {editingUser ? "Edit User" : "Create New User"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingUser
                            ? "Update user information and permissions."
                            : "Add a new user to the system with appropriate role and permissions."}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, name: e.target.value }))
                            }
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="email" className="text-right">
                            Email
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, email: e.target.value }))
                            }
                            className="col-span-3"
                          />
                        </div>
                        {!editingUser && (
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right">
                              Password
                            </Label>
                            <Input
                              id="password"
                              type="password"
                              value={formData.password}
                              onChange={(e) =>
                                setFormData((prev) => ({ ...prev, password: e.target.value }))
                              }
                              className="col-span-3"
                            />
                          </div>
                        )}
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="role" className="text-right">
                            Role
                          </Label>
                          <Select
                            value={formData.role}
                            onValueChange={handleRoleChange}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="cashier">Cashier</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                          <Label className="text-right pt-2">Permissions</Label>
                          <div className="col-span-3 space-y-2">
                            <div className="text-sm text-muted-foreground mb-2">
                              {formData.role === "admin"
                                ? "Admin users automatically have all permissions."
                                : "Select the specific permissions for this cashier user:"}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {allPermissions.map((permission) => (
                                <div key={permission} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={permission}
                                    checked={formData.permissions.includes(permission)}
                                    disabled={formData.role === "admin"}
                                    onCheckedChange={(checked) =>
                                      handlePermissionChange(permission, checked as boolean)
                                    }
                                  />
                                  <Label
                                    htmlFor={permission}
                                    className={`text-sm font-normal ${formData.role === "admin" ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                                  >
                                    {permission.replace(":", " ").replace(/^./, str => str.toUpperCase())}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="submit"
                          onClick={editingUser ? handleUpdateUser : handleCreateUser}
                        >
                          {editingUser ? "Update User" : "Create User"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
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
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">
                            Loading users...
                          </TableCell>
                        </TableRow>
                      ) : users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">
                            No users found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.name || "N/A"}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Select
                                value={user.role}
                                onValueChange={(value: "admin" | "cashier") =>
                                  handleUpdateRole(user.id, value)
                                }
                                disabled={updateRoleMutation.isPending}
                              >
                                <SelectTrigger className="w-24 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="cashier">Cashier</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  user.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {user.status || "active"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mr-2"
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="h-4 w-4" />
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={deleteUserMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
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
                    <p className="text-sm text-muted-foreground">
                      Get notified when items are running low
                    </p>
                  </div>
                  <Switch
                    checked={notificationsData.lowInventoryAlerts}
                    onCheckedChange={(checked) =>
                      setNotificationsData(prev => ({ ...prev, lowInventoryAlerts: checked }))
                    }
                    disabled={settingsLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>New Order Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Instant alerts for new orders
                    </p>
                  </div>
                  <Switch
                    checked={notificationsData.newOrderNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationsData(prev => ({ ...prev, newOrderNotifications: checked }))
                    }
                    disabled={settingsLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Daily Sales Summary</Label>
                    <p className="text-sm text-muted-foreground">
                      Email summary at end of day
                    </p>
                  </div>
                  <Switch
                    checked={notificationsData.dailySalesSummary}
                    onCheckedChange={(checked) =>
                      setNotificationsData(prev => ({ ...prev, dailySalesSummary: checked }))
                    }
                    disabled={settingsLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Customer Birthday Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Reminder to send birthday offers
                    </p>
                  </div>
                  <Switch
                    checked={notificationsData.customerBirthdayReminders}
                    onCheckedChange={(checked) =>
                      setNotificationsData(prev => ({ ...prev, customerBirthdayReminders: checked }))
                    }
                    disabled={settingsLoading}
                  />
                </div>

                <Button
                  onClick={() => handleSave("Notifications")}
                  className="w-full"
                  disabled={updateSettingsMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateSettingsMutation.isPending ? "Saving..." : "Save Notifications"}
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
                    <Input
                      id="taxRate"
                      type="number"
                      step="1"
                      value={vatAndTaxData.taxRate}
                      onChange={(e) => setVatAndTaxData(prev => ({ ...prev, taxRate: parseInt(e.target.value) || 0 }))}
                      disabled={settingsLoading}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Accept Cash</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow cash payments
                      </p>
                    </div>
                    <Switch
                      checked={vatAndTaxData.acceptCash}
                      onCheckedChange={(checked) =>
                        setVatAndTaxData(prev => ({ ...prev, acceptCash: checked }))
                      }
                      disabled={settingsLoading}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Accept Cards</Label>
                      <p className="text-sm text-muted-foreground">
                        Accept credit/debit cards
                      </p>
                    </div>
                    <Switch
                      checked={vatAndTaxData.acceptCards}
                      onCheckedChange={(checked) =>
                        setVatAndTaxData(prev => ({ ...prev, acceptCards: checked }))
                      }
                      disabled={settingsLoading}
                    />
                  </div>

                  <Button
                    onClick={() => handleSave("Payment & Tax")}
                    className="w-full"
                    disabled={updateSettingsMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateSettingsMutation.isPending ? "Saving..." : "Save Payment Settings"}
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
      </div>{" "}
    </Layout>
  );
};

export default Settings;
