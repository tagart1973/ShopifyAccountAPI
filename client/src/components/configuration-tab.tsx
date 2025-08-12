import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, RotateCcw, Eye, EyeOff } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ConfigItem {
  id: string;
  key: string;
  value: string;
  encrypted: boolean;
}

export default function ConfigurationTab() {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const { data: config, isLoading } = useQuery<ConfigItem[]>({
    queryKey: ["/api/configuration"],
  });

  const saveConfigMutation = useMutation({
    mutationFn: async (configItem: { key: string; value: string; encrypted: boolean }) => {
      await apiRequest("PUT", "/api/configuration", configItem);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/configuration"] });
      toast({
        title: "Configuration Updated",
        description: "Settings have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save configuration.",
        variant: "destructive",
      });
    }
  });

  const handleSaveConfig = (key: string, value: string, encrypted: boolean) => {
    saveConfigMutation.mutate({ key, value, encrypted });
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j}>
                      <div className="h-4 bg-slate-700 rounded w-1/3 mb-2"></div>
                      <div className="h-10 bg-slate-700 rounded"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const envVars = config?.filter(c => 
    ["SHOPIFY_STORE_URL", "SHOPIFY_ACCESS_TOKEN", "REDIS_URL", "PORT"].includes(c.key)
  ) || [];

  const apiSettings = config?.filter(c => 
    ["ENABLE_RATE_LIMITING", "RATE_LIMIT_RPM", "ENABLE_CACHING", "CACHE_TTL", "ENABLE_REQUEST_LOGGING"].includes(c.key)
  ) || [];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Environment Variables */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {envVars.map((item) => (
              <div key={item.key}>
                <Label className="text-slate-300">
                  {item.key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                </Label>
                <div className="relative">
                  <Input
                    type={item.encrypted && !showPasswords[item.key] ? "password" : "text"}
                    value={item.value}
                    onChange={(e) => handleSaveConfig(item.key, e.target.value, item.encrypted)}
                    className="bg-slate-700 border-slate-600 text-white pr-10"
                  />
                  {item.encrypted && (
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(item.key)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPasswords[item.key] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <Button 
              onClick={() => {
                envVars.forEach(item => {
                  handleSaveConfig(item.key, item.value, item.encrypted);
                });
              }}
              disabled={saveConfigMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </CardContent>
        </Card>

        {/* API Settings */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>API Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {apiSettings.map((item) => {
              const isBooleanSetting = ["ENABLE_RATE_LIMITING", "ENABLE_CACHING", "ENABLE_REQUEST_LOGGING"].includes(item.key);
              
              if (isBooleanSetting) {
                return (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">
                        {item.key.replace(/ENABLE_|_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                      <p className="text-xs text-slate-400">
                        {item.key === "ENABLE_RATE_LIMITING" && "Limit API requests per minute"}
                        {item.key === "ENABLE_CACHING" && "Cache API responses for performance"}
                        {item.key === "ENABLE_REQUEST_LOGGING" && "Log all API requests and responses"}
                      </p>
                    </div>
                    <Switch
                      checked={item.value === "true"}
                      onCheckedChange={(checked) => handleSaveConfig(item.key, checked.toString(), false)}
                    />
                  </div>
                );
              }

              return (
                <div key={item.key}>
                  <Label className="text-slate-300">
                    {item.key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </Label>
                  <Input
                    type="number"
                    value={item.value}
                    onChange={(e) => handleSaveConfig(item.key, e.target.value, false)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              );
            })}
            
            <Button 
              onClick={() => {
                apiSettings.forEach(item => {
                  handleSaveConfig(item.key, item.value, item.encrypted);
                });
              }}
              disabled={saveConfigMutation.isPending}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Apply Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
