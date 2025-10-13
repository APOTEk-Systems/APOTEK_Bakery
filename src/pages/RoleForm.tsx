import Layout from "../components/Layout";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {useToast} from "@/hooks/use-toast";
import { rolesService, Role, CreateRoleData } from "@/services/roles";
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Shield,
  Save,
  ArrowLeft,
  Loader2,
} from "lucide-react";

const RoleForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const [roleFormData, setRoleFormData] = useState<CreateRoleData>({
    name: "",
    description: "",
    permissions: [],
  });
  const [isEditingAdmin, setIsEditingAdmin] = useState(false);

  // Comprehensive permissions organized by modules
  const permissionModules = {
    "Dashboard": [
      "view:salesDashboard",
      "view:purchasesDashboard",
      "view:inventoryDashboard",
      "view:accountingDashboard",
    ],
   
    "Sales": [
      "create:sales",
      "view:sales",
    //  "update:sales",
    //  "delete:sales",
      "update:payment",
      "view:customers",
      "create:customers",
      "update:customers",
      "delete:customers",
     // "update:credit",
    ],
    "Purchases": [
      "view:purchases",
      "create:purchases",
      "update:purchases",
      "approve:purchases",
      "receive:goods",
      "view:suppliers",
      "create:suppliers",
      "update:suppliers",
      "delete:suppliers",
    ],
    "Inventory": [
      "view:products",
      "create:products",
      "update:products",
      "delete:products",
      "update:quantity",
      "view:inventory",
      "create:inventory",
      "update:inventory",
      "delete:inventory",
      "view:adjustments",
      "create:adjustments",
      "update:adjustments",
    ],
    "Accounting": [
      "view:expenses",
      "create:expenses",
      "update:expenses",
      "approve:expenses",
      "delete:expenses",
      "view:reports",
    ],
    "Production": [
      "view:production",
      "create:production",
      "update:production",
      "delete:production",
    ],
    "Reporting": [
      "view:reports",
      "view:audit",
    ],
     "Users & Role Management": [
      "view:users",
      "create:users",
      "update:users",
      "delete:users",
      "manage:roles",
    ],
    "Settings": [
      "view:settings",
      "update:settings",
    ],
  };

  const allPermissions = Object.values(permissionModules).flat();

  // Fetch role if editing
  const { data: role, isLoading: roleLoading } = useQuery<Role>({
    queryKey: ['role', id],
    queryFn: () => rolesService.getById(Number(id)),
    enabled: isEdit,
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: (roleData: CreateRoleData) => rolesService.create(roleData),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Role created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      navigate('/roles');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create role.",
        variant: "destructive",
      });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateRoleData> }) =>
      rolesService.update(id, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Role updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      navigate('/roles');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update role.",
        variant: "destructive",
      });
    },
  });

  // Populate form data when role is loaded
  useEffect(() => {
    if (isEdit && role) {
      const isAdmin = role.name.toLowerCase() === "admin";
      setIsEditingAdmin(isAdmin);
      setRoleFormData({
        name: role.name,
        description: role.description || "",
        permissions: isAdmin ? allPermissions : role.permissions,
      });
    }
  }, [role, isEdit, allPermissions]);

  const handleSave = () => {
    if (!roleFormData.name.trim()) {
      toast({
        title: "Error",
        description: "Role name is required.",
        variant: "destructive",
      });
      return;
    }

    if (isEdit && id) {
      updateRoleMutation.mutate({ id: Number(id), data: roleFormData });
    } else {
      createRoleMutation.mutate(roleFormData);
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setRoleFormData((prev) => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permission]
        : prev.permissions.filter(p => p !== permission),
    }));
  };

  const handleModuleToggle = (modulePermissions: string[], checked: boolean) => {
    setRoleFormData((prev) => ({
      ...prev,
      permissions: checked
        ? [...new Set([...prev.permissions, ...modulePermissions])]
        : prev.permissions.filter(p => !modulePermissions.includes(p)),
    }));
  };

  if (isEdit && roleLoading) {
    return (
      <Layout>
        <div className="flex min-h-screen bg-background">
          <main className="flex-1 ml-64 p-6 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </main>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/roles">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Roles
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEdit ? "Edit Role" : "Create New Role"}
          </h1>
        </div>

        <Card className="shadow-warm max-w-4xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <Label htmlFor="name">Role Name *</Label>
                <Input
                  id="name"
                  value={roleFormData.name}
                  onChange={(e) =>
                    setRoleFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  disabled={isEditingAdmin}
                  placeholder="Enter role name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={roleFormData.description}
                  onChange={(e) =>
                    setRoleFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  disabled={isEditingAdmin}
                  placeholder="Enter role description"
                  rows={2}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label className="text-base font-semibold">Permissions</Label>
                  <p className="text-sm text-muted-foreground">
                    Select the permissions for this role. Permissions are organized by modules.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="check-all"
                    checked={roleFormData.permissions.length === allPermissions.length}
                    disabled={isEditingAdmin}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setRoleFormData((prev) => ({ ...prev, permissions: allPermissions }));
                      } else {
                        setRoleFormData((prev) => ({ ...prev, permissions: [] }));
                      }
                    }}
                  />
                  <Label htmlFor="check-all" className="text-sm font-medium">
                    Check All
                  </Label>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(permissionModules).map(([moduleName, permissions]) => {
                  const moduleChecked = permissions.every(p => roleFormData.permissions.includes(p));
                  const modulePartial = permissions.some(p => roleFormData.permissions.includes(p)) && !moduleChecked;

                  return (
                    <div key={moduleName} className="border rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Checkbox
                          id={`module-${moduleName}`}
                          checked={moduleChecked}
                          disabled={isEditingAdmin}
                          onCheckedChange={(checked) =>
                            handleModuleToggle(permissions, checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={`module-${moduleName}`}
                          className="text-lg font-semibold"
                        >
                          {moduleName}
                        </Label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-6">
                        {permissions.map((permission) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Checkbox
                              id={`perm-${permission}`}
                              checked={roleFormData.permissions.includes(permission)}
                              disabled={isEditingAdmin}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(permission, checked as boolean)
                              }
                            />
                            <Label
                              htmlFor={`perm-${permission}`}
                              className={`text-sm font-normal ${isEditingAdmin ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                            >
                              {permission.replace(/:/g, " ").replace(/\b\w/g, l => l.toUpperCase()).replace(/Inventory/g, "Materials & Supplies").replace(/Adjustment/g, "Materials & Supplies Adjustment")}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
                className="flex-1"
              >
                {createRoleMutation.isPending || updateRoleMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isEdit ? "Update Role" : "Create Role"}
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link to="/roles">Cancel</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RoleForm;