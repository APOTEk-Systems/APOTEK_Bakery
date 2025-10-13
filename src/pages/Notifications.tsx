import Layout from "../components/Layout";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {useToast} from "@/hooks/use-toast";
import {settingsService, SettingsData} from "@/services/settings";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Save,
  Bell,
} from "lucide-react";

const Notifications = () => {
  const {toast} = useToast();
  const queryClient = useQueryClient();

  const [notificationsData, setNotificationsData] = useState({
    dailySalesSummary: false,
    lowInventoryAlerts: true,
    newOrderNotifications: true,
    customerBirthdayReminders: true,
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
      setNotificationsData(settings.notifications);
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
      key: "notifications",
      ...notificationsData,
    };

    updateSettingsMutation.mutate(updateData);
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
        </div>

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
                checked={notificationsData?.lowInventoryAlerts}
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
                checked={notificationsData?.newOrderNotifications}
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
                checked={notificationsData?.dailySalesSummary}
                onCheckedChange={(checked) =>
                  setNotificationsData(prev => ({ ...prev, dailySalesSummary: checked }))
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
              {updateSettingsMutation.isPending ? "Saving..." : "Save Notifications"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Notifications;