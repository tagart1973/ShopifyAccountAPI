import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Webhook {
  id: string;
  name: string;
  event: string;
  endpoint: string;
  isActive: boolean;
  lastTriggered: string | null;
  successRate: string;
  createdAt: string;
}

export default function WebhooksTab() {
  const { toast } = useToast();

  const { data: webhooks, isLoading } = useQuery<Webhook[]>({
    queryKey: ["/api/webhooks"],
  });

  const deleteWebhookMutation = useMutation({
    mutationFn: async (webhookId: string) => {
      await apiRequest("DELETE", `/api/webhooks/${webhookId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      toast({
        title: "Webhook Deleted",
        description: "Webhook has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete webhook.",
        variant: "destructive",
      });
    }
  });

  const toggleWebhookMutation = useMutation({
    mutationFn: async ({ webhookId, isActive }: { webhookId: string; isActive: boolean }) => {
      await apiRequest("PUT", `/api/webhooks/${webhookId}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      toast({
        title: "Webhook Updated",
        description: "Webhook status has been updated.",
      });
    },
  });

  const handleDeleteWebhook = (webhookId: string) => {
    if (confirm("Are you sure you want to delete this webhook?")) {
      deleteWebhookMutation.mutate(webhookId);
    }
  };

  const handleToggleWebhook = (webhookId: string, currentStatus: boolean) => {
    toggleWebhookMutation.mutate({ webhookId, isActive: !currentStatus });
  };

  const formatLastTriggered = (timestamp: string | null) => {
    if (!timestamp) return "Never";
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Less than 1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-700 rounded-lg p-4 h-24"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Webhook Management</CardTitle>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Webhook
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {webhooks && webhooks.length > 0 ? (
            webhooks.map((webhook) => (
              <div key={webhook.id} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      webhook.isActive ? "bg-secondary" : "bg-yellow-500"
                    }`}></div>
                    <h4 className="font-medium">{webhook.name}</h4>
                    <Badge variant={webhook.isActive ? "default" : "secondary"} className={
                      webhook.isActive 
                        ? "bg-secondary/20 text-secondary"
                        : "bg-yellow-500/20 text-yellow-500"
                    }>
                      {webhook.isActive ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleWebhook(webhook.id, webhook.isActive)}
                      disabled={toggleWebhookMutation.isPending}
                      className="text-slate-400 hover:text-white"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteWebhook(webhook.id)}
                      disabled={deleteWebhookMutation.isPending}
                      className="text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Event:</span>
                    <span className="ml-2 font-mono">{webhook.event}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Endpoint:</span>
                    <span className="ml-2 font-mono">{webhook.endpoint}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Last Triggered:</span>
                    <span className="ml-2">{formatLastTriggered(webhook.lastTriggered)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Success Rate:</span>
                    <span className="ml-2">{webhook.successRate}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400">
              No webhooks configured. Click "Add Webhook" to create your first webhook.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
