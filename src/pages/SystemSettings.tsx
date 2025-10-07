import Layout from "../components/Layout";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {useToast} from "@/hooks/use-toast";
import {settingsService, SettingsData} from "@/services/settings";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Save,
  DollarSign,
} from "lucide-react";

const SystemSettings = () => {
  const {toast} = useToast();
  const queryClient = useQueryClient();

  const [vatAndTaxData, setVatAndTaxData] = useState({
    taxRate: 18,
    acceptCash: true,
    acceptCards: true,
  });

  // Fetch settings with React Query
  const { data: settings, isLoading: settingsLoading, error: settingsError } = useQuery<SettingsData>({
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
      queryClient.invalidateQueries({queryKey: ["settings"]});
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
      setVatAndTaxData(settings.vatAndTax);
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

  const handleSave = () => {
    const updateData = {
      key: "vatAndTax",
      ...vatAndTaxData,
    };

    updateSettingsMutation.mutate(updateData);
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
        </div>

        {/* Payment & Tax */}
        <Card className="shadow-warm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
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
              onClick={handleSave}
              className="w-full"
              disabled={updateSettingsMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateSettingsMutation.isPending ? "Saving..." : "Save Payment Settings"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SystemSettings;