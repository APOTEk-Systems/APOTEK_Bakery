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
import { rolesService, Role, CreateRoleData } from "@/services/roles";
import { User } from "@/services/auth";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Save,
  Users,
  Shield,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";

const UserRoleManagement = () => {
  const {toast} = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Omit<CreateUserData, 'permissions'>>({
    name: "",
    email: "",
    password: "",
    roleId: 2, // default to cashier
  });

  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleFormData, setRoleFormData] = useState<CreateRoleData>({
    name: "",
    description: "",
    permissions: [],
  });
  const [isEditingAdmin, setIsEditingAdmin] = useState(false);

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

  // Fetch roles with React Query
  const { data: roles = [], isLoading: rolesLoading, error: rolesError } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: () => rolesService.getAll(),
  });

  // Update user mutation
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
        roleId: 2,
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
        roleId: 2,
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
      usersService.update(id, { roleId: role === "admin" ? 1 : 2 }),
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
    if (usersError) {
      toast({
        title: "Error",
        description: "Failed to fetch users.",
        variant: "destructive",
      });
    }
    if (rolesError) {
      toast({
        title: "Error",
        description: "Failed to fetch roles.",
        variant: "destructive",
      });
    }
  }, [usersError, rolesError, toast]);

  const handleRoleChange = (roleName: string) => {
    const selectedRole = roles.find(r => r.name === roleName);
    if (selectedRole) {
      setFormData(prev => ({
        ...prev,
        roleId: selectedRole.id,
      }));
    }
  };


  const getRoleNameFromId = (roleId: number) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : "";
  };

  const getFinalPermissions = (roleId: number, permissions: string[]) => {
    const roleName = getRoleNameFromId(roleId);
    return roleName === "admin" ? ["all"] : permissions;
  };

  const handleCreateUser = () => {
    const finalData = { ...formData } as CreateUserData;
    createUserMutation.mutate(finalData);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email,
      password: "", // Don't prefill password for security
      roleId: Number(user.role?.id) || 2,
    });
    setDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;
    const finalData = { ...formData } as Partial<CreateUserData>;
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
      roleId: 2,
    });
    setDialogOpen(true);
  };

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
          <h1 className="text-3xl font-bold text-foreground">User and Role Management</h1>
        </div>

        <Tabs defaultValue="user-management" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user-management" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="role-management" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Role Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="user-management" className="mt-6">
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
                            ? "Update user information."
                            : "Add a new user to the system with appropriate role."}
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
                            value={getRoleNameFromId(formData.roleId)}
                            onValueChange={handleRoleChange}
                            disabled={editingUser !== null}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map((role) => (
                                <SelectItem key={role.id} value={role.name}>
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                            <TableCell>{user.role.name}</TableCell>
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

          <TabsContent value="role-management" className="mt-6">
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Role Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Manage System Roles</h3>
                  <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={openCreateRoleDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Role
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
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default UserRoleManagement;
