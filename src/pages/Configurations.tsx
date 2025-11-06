import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { settingsService, SettingsData } from "@/services/settings";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Settings, Edit, X } from "lucide-react";

const Configurations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);

  // Local state for settings forms
  const [configurationData, setConfigurationData] = useState({
    vat: "",
    receiptSize: "a5",
    printReceipt: true,
    allowCreditSales: false,
  });

  // Fetch settings with React Query
  const {
    data: settings,
    isLoading: settingsLoading,
    error: settingsError,
  } = useQuery<SettingsData>({
    queryKey: ["settings"],
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
      queryClient.invalidateQueries({ queryKey: ["settings"] });
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
    if (settings?.configuration) {
      setConfigurationData({
        vat: settings.configuration.vat?.toString() || "",
        receiptSize: settings.configuration.receiptSize || "a5",
        printReceipt: settings.configuration.printReceipt ?? true,
        allowCreditSales: settings.configuration.allowCreditSales ?? false,
      });
    }
  }, [settings]);

  // Show error toasts
  React.useEffect(() => {
    if (settingsError) {
      toast({
        title: "Error",
        description: "Failed to fetch settings.",
        variant: "destructive",
      });
    }
  }, [settingsError, toast]);

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    // Reset form data to original settings
    if (settings?.configuration) {
      setConfigurationData({
        vat: settings.configuration.vat?.toString() || "",
        receiptSize: settings.configuration.receiptSize || "a5",
        printReceipt: settings.configuration.printReceipt ?? true,
        allowCreditSales: settings.configuration.allowCreditSales ?? false,
      });
    }
    setIsEditMode(false);
  };

  // Helper function to render form field or display value
  const renderField = (
    label: string,
    value: string | boolean,
    field: React.ReactNode,
    className: string = ""
  ) => {
    if (!isEditMode) {
      return (
        <div className={className}>
          <Label>{label}</Label>
          <p className="text-sm text-muted-foreground mt-1">
            {typeof value === "boolean"
              ? value
                ? "Yes"
                : "No"
              : value || "Not set"}
          </p>
        </div>
      );
    }
    return field;
  };

  const handleSave = () => {
    const updateData = {
      key: "configuration",
      ...configurationData,
      vat: parseFloat(configurationData.vat) || 0,
    };

    updateSettingsMutation.mutate(updateData, {
      onSuccess: () => {
        setIsEditMode(false);
      },
    });
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Configurations</h1>
        </div>

        <div className="space-y-6">
          {/* System Configurations */}
          <Card className="shadow-warm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Configurations
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField(
                  "VAT Percentage",
                  configurationData.vat || "",
                  <div>
                    <Label htmlFor="vat">VAT Percentage</Label>
                    <Input
                      id="vat"
                      type="number"
                      step="0.01"
                      value={configurationData.vat || ""}
                      onChange={(e) =>
                        setConfigurationData((prev) => ({
                          ...prev,
                          vat: e.target.value,
                        }))
                      }
                      placeholder="18.00"
                      disabled={settingsLoading}
                    />
                  </div>
                )}
                {renderField(
                  "Receipt Size",
                  configurationData.receiptSize
                    .replace(/-/g, " ") // replace hyphens with spaces
                    .replace(/\b\w/g, (c) => c.toUpperCase()) || "a5",
                  <div>
                    <Label htmlFor="receiptSize">Receipt Size</Label>
                    <Select
                      value={configurationData.receiptSize || "a5"}
                      onValueChange={(value) =>
                        setConfigurationData((prev) => ({
                          ...prev,
                          receiptSize: value,
                        }))
                      }
                      disabled={settingsLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a5">A5</SelectItem>
                        <SelectItem value="a4">A4</SelectItem>
                        <SelectItem value="thermal-80mm">
                          Thermal 80mm
                        </SelectItem>
                        <SelectItem value="thermal-58mm">
                          Thermal 58mm
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField(
                  "Print Receipt",
                  configurationData.printReceipt,
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="printReceipt"
                      checked={configurationData.printReceipt}
                      onCheckedChange={(checked) =>
                        setConfigurationData((prev) => ({
                          ...prev,
                          printReceipt: checked,
                        }))
                      }
                      disabled={settingsLoading}
                    />
                    <Label htmlFor="printReceipt">Print Receipt</Label>
                  </div>
                )}
                {renderField(
                  "Allow Credit Sales",
                  configurationData.allowCreditSales,
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="allowCreditSales"
                      checked={configurationData.allowCreditSales}
                      onCheckedChange={(checked) =>
                        setConfigurationData((prev) => ({
                          ...prev,
                          allowCreditSales: checked,
                        }))
                      }
                      disabled={settingsLoading}
                    />
                    <Label htmlFor="allowCreditSales">Allow Credit Sales</Label>
                  </div>
                )}
              </div>
              <div className="flex justify-end w-full">
                {" "}
                {!isEditMode ? (
                  <Button onClick={handleEdit} variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleCancel} variant="outline">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={updateSettingsMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateSettingsMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Configurations;
