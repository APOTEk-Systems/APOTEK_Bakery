import Layout from "../components/Layout";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {useToast} from "@/hooks/use-toast";
import { usersService, CreateUserData } from "@/services/users";
import { rolesService } from "@/services/roles";
import { User } from "@/services/auth";
import { useAuth } from "@/contexts/AuthContext";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Users = () => {
  const {toast} = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Omit<CreateUserData, 'permissions'> & { confirmPassword: string }>({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    confirmPassword: "",
    roleId: 2, // default to cashier
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

  // Fetch users with React Query
  const { data: users = [], isLoading: loading, error: usersError } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => usersService.getAll(),
  });

  // Fetch roles with React Query
  const { data: roles = [] } = useQuery({
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
        phoneNumber: "",
        confirmPassword: "",
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
        phoneNumber: "",
        confirmPassword: "",
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

  // Show error toasts
  React.useEffect(() => {
    if (usersError) {
      toast({
        title: "Error",
        description: "Failed to fetch users.",
        variant: "destructive",
      });
    }
  }, [usersError, toast]);

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
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    const { confirmPassword, ...finalData } = formData;
    createUserMutation.mutate(finalData as CreateUserData);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email,
      password: "", // Don't prefill password for security
      phoneNumber: "",
      confirmPassword: "",
      roleId: typeof user.role === 'object' ? Number(user.role?.id) || 2 : 2,
    });
    setDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;
    const finalData = { ...formData } as Partial<CreateUserData>;
    updateUserMutation.mutate({ id: editingUser.id, data: finalData });
  };

  const handleDeleteUser = (userId: number) => {
    // Prevent deleting the current user
    if (currentUser && currentUser.id === userId) {
      toast({
        title: "Error",
        description: "You cannot delete your own account.",
        variant: "destructive",
      });
      return;
    }
    if (!confirm("Are you sure you want to delete this user?")) return;
    deleteUserMutation.mutate(userId);
  };

  const openCreateDialog = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      phoneNumber: "",
      confirmPassword: "",
      roleId: 2,
    });
    setDialogOpen(true);
  };

   const getStatusColor = (status: string) => {
    return status === "active" ? "default" : "secondary";
  };
  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        </div>

        <Card className="shadow-warm">
          <CardHeader>
          
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold"></h3>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
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
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phoneNumber" className="text-right">
                        Phone Number
                      </Label>
                      <Input
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))
                        }
                        className="col-span-3"
                      />
                    </div>
                    {!editingUser && (
                      <>
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
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="confirmPassword" className="text-right">
                            Confirm Password
                          </Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                            }
                            className="col-span-3"
                          />
                        </div>
                      </>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="role" className="text-right">
                        Role
                      </Label>
                      <Select
                        value={getRoleNameFromId(formData.roleId)}
                        onValueChange={handleRoleChange}
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
                        <TableCell>{typeof user.role === 'object' ? user.role.name : user.role}</TableCell>
                        <TableCell>
                         <Badge variant={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
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
      </div>
    </Layout>
  );
};

export default Users;