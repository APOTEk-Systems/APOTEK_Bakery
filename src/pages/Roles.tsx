import Layout from "../components/Layout";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Link } from "react-router-dom";

const Roles = () => {
  const {toast} = useToast();
  const queryClient = useQueryClient();

  // Fetch roles with React Query
  const { data: roles = [], isLoading: rolesLoading, error: rolesError } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: () => rolesService.getAll(),
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

  const handleDeleteRole = (roleId: number) => {
    if (!confirm("Are you sure you want to delete this role?")) return;
    deleteRoleMutation.mutate(roleId);
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
              <Button asChild>
                <Link to="/roles/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Role
                </Link>
              </Button>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    {/* <TableHead>Permissions</TableHead> */}
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
                        {/* <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.map((perm) => (
                              <span key={perm} className="px-2 py-1 bg-muted rounded text-xs">
                                {perm}
                              </span>
                            ))}
                          </div>
                        </TableCell> */}
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mr-2"
                            asChild
                          >
                            <Link to={`/roles/${role.id}/edit`}>
                              <Edit className="h-4 w-4" />
                              Edit
                            </Link>
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