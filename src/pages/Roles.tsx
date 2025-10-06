import Layout from "../components/Layout";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
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
import { rolesService, Role, CreateRoleData } from "@/services/roles";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Shield,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";

const Roles = () => {
  const {toast} = useToast();
  const queryClient = useQueryClient();
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleFormData, setRoleFormData] = useState<CreateRoleData>({
    name: "",
    description: "",
    permissions: [],
  });
  const [isEditingAdmin, setIsEditingAdmin] = useState(false);

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

  // Fetch roles with React Query
  const { data: roles = [], isLoading: rolesLoading, error: rolesError } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: () => rolesService.getAll(),
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
      setRoleDialogOpen(false);
      setRoleFormData({
        name: "",
        description: "",
        permissions: [],
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create role.",
        variant: "destructive",
      });
    },
  });

  // Update role data mutation
  const updateRoleDataMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateRoleData> }) =>
      rolesService.update(id, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Role updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setRoleDialogOpen(false);
      setEditingRole(null);
      setRoleFormData({
        name: "",
        description: "",
        permissions: [],
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update role.",
        variant: "destructive",
      });
    },
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: (roleId: number) => rolesService.delete(roleId),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Role deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete role.",
        variant: "destructive",
      });
    },
  });

  // Show error toasts
  React.useEffect(() => {
    if (rolesError) {
      toast({
        title: "Error",
        description: "Failed to fetch roles.",
        variant: "destructive",
      });
    }
  }, [rolesError, toast]);

  const handleCreateRole = () => {
    createRoleMutation.mutate(roleFormData);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    const isAdmin = role.name.toLowerCase() === "admin";
    setIsEditingAdmin(isAdmin);
    setRoleFormData({
      name: role.name,
      description: role.description || "",
      permissions: isAdmin ? allPermissions : role.permissions,
    });
    setRoleDialogOpen(true);
  };

  const handleUpdateRoleData = () => {
    if (!editingRole) return;
    updateRoleDataMutation.mutate({ id: editingRole.id, data: roleFormData });
  };

  const handleDeleteRole = (roleId: number) => {
    if (!confirm("Are you sure you want to delete this role?")) return;
    deleteRoleMutation.mutate(roleId);
  };

  const openCreateRoleDialog = () => {
    setEditingRole(null);
    setIsEditingAdmin(false);
    setRoleFormData({
      name: "",
      description: "",
      permissions: [],
    });
    setRoleDialogOpen(true);
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Role Management</h1>
        </div>

        <Card className="shadow-warm">
          <CardHeader>
        
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold"></h3>
              <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateRoleDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Role
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingRole ? "Edit Role" : "Create New Role"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingRole
                        ? "Update role information and permissions."
                        : "Add a new role to the system with appropriate permissions."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="roleName" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="roleName"
                        value={roleFormData.name}
                        disabled={isEditingAdmin}
                        onChange={(e) =>
                          setRoleFormData((prev) => ({ ...prev, name: e.target.value }))
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="roleDescription" className="text-right">
                        Description
                      </Label>
                      <Textarea
                        id="roleDescription"
                        value={roleFormData.description}
                        disabled={isEditingAdmin}
                        onChange={(e) =>
                          setRoleFormData((prev) => ({ ...prev, description: e.target.value }))
                        }
                        className="col-span-3"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label className="text-right pt-2">Permissions</Label>
                      <div className="col-span-3 space-y-2">
                        <div className="text-sm text-muted-foreground mb-2">
                          Select the permissions for this role:
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {allPermissions.map((permission) => (
                            <div key={permission} className="flex items-center space-x-2">
                              <Checkbox
                                id={`role-${permission}`}
                                checked={roleFormData.permissions.includes(permission)}
                                disabled={isEditingAdmin}
                                onCheckedChange={(checked) =>
                                  setRoleFormData((prev) => ({
                                    ...prev,
                                    permissions: checked
                                      ? [...prev.permissions, permission]
                                      : prev.permissions.filter(p => p !== permission),
                                  }))
                                }
                              />
                              <Label
                                htmlFor={`role-${permission}`}
                                className={`text-sm font-normal ${isEditingAdmin ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
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
                      onClick={editingRole ? handleUpdateRoleData : handleCreateRole}
                    >
                      {editingRole ? "Update Role" : "Create Role"}
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
                    <TableHead>Description</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rolesLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        Loading roles...
                      </TableCell>
                    </TableRow>
                  ) : roles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No roles found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell>{role.name}</TableCell>
                        <TableCell>{role.description || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.map((perm) => (
                              <span key={perm} className="px-2 py-1 bg-muted rounded text-xs">
                                {perm}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mr-2"
                            onClick={() => handleEditRole(role)}
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteRole(role.id)}
                            disabled={deleteRoleMutation.isPending}
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
      </div>
    </Layout>
  );
};

export default Roles;