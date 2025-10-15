import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import * as authService from "@/services/auth";
import { User, UserCheck, Edit, Key } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const [isEditingName, setIsEditingName] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [editNameDialogOpen, setEditNameDialogOpen] = useState(false);

  // Use user data from auth context instead of separate query
  const userData = user;
  const isLoading = false;

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: { name?: string; currentPassword?: string; newPassword?: string }) =>
      authService.updateProfile(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  const validateForm = () => {
    const errors: typeof validationErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        errors.currentPassword = "Current password is required to change password";
      }
      if (!formData.newPassword) {
        errors.newPassword = "New password is required";
      } else if (formData.newPassword.length < 6) {
        errors.newPassword = "Password must be at least 6 characters";
      }
      if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateName = () => {
    if (!formData.name.trim()) {
      setValidationErrors({ name: "Name is required" });
      return;
    }

    updateProfileMutation.mutate({ name: formData.name });
    setIsEditingName(false);
  };

  const handleUpdatePassword = () => {
    if (!validatePasswordForm()) return;

    updateProfileMutation.mutate({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword
    });

    setPasswordDialogOpen(false);
    setFormData(prev => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  const validatePasswordForm = () => {
    const errors: typeof validationErrors = {};

    if (!formData.currentPassword) {
      errors.currentPassword = "Current password is required";
    }
    if (!formData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }
    if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Update form data when userData loads
  React.useEffect(() => {
    if (userData) {
      setFormData(prev => ({
        ...prev,
        name: userData.name || "",
      }));
    }
  }, [userData]);

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading profile...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Information */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Profile Information</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <div className="flex items-center gap-3">
                      <span className="text-sm flex-1">
                        {userData?.name || "Not set"}
                      </span>
                      <Dialog open={editNameDialogOpen} onOpenChange={setEditNameDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, name: userData?.name || "" }));
                              setEditNameDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Edit Name</DialogTitle>
                            <DialogDescription>
                              Update your display name.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="editName">Full Name</Label>
                              <Input
                                id="editName"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                placeholder="Enter your full name"
                              />
                              {validationErrors.name && (
                                <p className="text-sm text-destructive">{validationErrors.name}</p>
                              )}
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={() => {
                                setEditNameDialogOpen(false);
                                setFormData(prev => ({ ...prev, name: userData?.name || "" }));
                                setValidationErrors({});
                              }}
                              variant="outline"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => {
                                handleUpdateName();
                                setEditNameDialogOpen(false);
                              }}
                              disabled={updateProfileMutation.isPending}
                            >
                              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email:</Label>
                    <span className="text-sm text-muted-foreground ml-1">
                      {userData?.email || "Not set"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role:</Label>
                    <span className="text-sm text-muted-foreground ml-1">
                      {typeof userData?.role === 'string' ? userData.role : userData?.role?.name || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Change Password Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Security</h3>
                  <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Key className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                          Enter your current password and choose a new one.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            value={formData.currentPassword}
                            onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                            placeholder="Enter current password"
                          />
                          {validationErrors.currentPassword && (
                            <p className="text-sm text-destructive">{validationErrors.currentPassword}</p>
                          )}
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) => handleInputChange("newPassword", e.target.value)}
                            placeholder="Enter new password"
                          />
                          {validationErrors.newPassword && (
                            <p className="text-sm text-destructive">{validationErrors.newPassword}</p>
                          )}
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                            placeholder="Confirm new password"
                          />
                          {validationErrors.confirmPassword && (
                            <p className="text-sm text-destructive">{validationErrors.confirmPassword}</p>
                          )}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={handleUpdatePassword}
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? "Updating..." : "Update Password"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
