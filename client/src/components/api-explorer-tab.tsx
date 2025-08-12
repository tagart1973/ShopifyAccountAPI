import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ApiResponse {
  status: number;
  statusText: string;
  data: any;
  responseTime: number;
}

export default function ApiExplorerTab() {
  const [method, setMethod] = useState("GET");
  const [endpoint, setEndpoint] = useState("/customers");
  const [headers, setHeaders] = useState('{\n  "Authorization": "Bearer token",\n  "Content-Type": "application/json"\n}');
  const [body, setBody] = useState('{\n  "customer_id": "123",\n  "fields": ["id", "email", "name"]\n}');
  const [response, setResponse] = useState<ApiResponse | null>(null);

  const sendRequestMutation = useMutation({
    mutationFn: async () => {
      const start = Date.now();
      try {
        const fullUrl = `/api/explorer${endpoint}`;
        const parsedHeaders = JSON.parse(headers || '{}');
        const requestBody = method !== "GET" ? JSON.parse(body || '{}') : undefined;

        const res = await apiRequest(method, fullUrl, requestBody);
        const data = await res.json();
        const responseTime = Date.now() - start;

        return {
          status: res.status,
          statusText: res.statusText,
          data,
          responseTime
        };
      } catch (error: any) {
        const responseTime = Date.now() - start;
        return {
          status: error.status || 500,
          statusText: error.message || "Request Failed",
          data: { error: error.message },
          responseTime
        };
      }
    },
    onSuccess: (data) => {
      setResponse(data);
    }
  });

  const endpoints = [
    { method: "GET", path: "/customers/{id}", description: "Get customer details" },
    { method: "POST", path: "/customers", description: "Create new customer" },
    { method: "PUT", path: "/customers/{id}", description: "Update customer" },
    { method: "GET", path: "/customers/{id}/orders", description: "Get customer orders" },
  ];

  const handleSendRequest = () => {
    sendRequestMutation.mutate();
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-secondary bg-secondary/20";
    if (status >= 400) return "text-red-500 bg-red-500/20";
    return "text-yellow-500 bg-yellow-500/20";
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Builder */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Request Builder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-300">HTTP Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-slate-300">Endpoint</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-sm text-slate-400 bg-slate-700 border border-r-0 border-slate-600 rounded-l-lg">
                  /api/v1
                </span>
                <Input
                  type="text"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="flex-1 bg-slate-700 border-slate-600 rounded-l-none text-white"
                  placeholder="/customers"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-slate-300">Headers</Label>
              <Textarea
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white font-mono text-sm"
                rows={3}
              />
            </div>
            
            <div>
              <Label className="text-slate-300">Request Body</Label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white font-mono text-sm"
                rows={6}
              />
            </div>
            
            <Button 
              onClick={handleSendRequest}
              disabled={sendRequestMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Play className="w-4 h-4 mr-2" />
              {sendRequestMutation.isPending ? "Sending..." : "Send Request"}
            </Button>
          </CardContent>
        </Card>

        {/* Response Viewer */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Response</CardTitle>
              {response && (
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(response.status)}`}>
                    {response.status} {response.statusText}
                  </span>
                  <span className="text-xs text-slate-400">{response.responseTime}ms</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {response ? (
              <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-slate-300">
                  <code>{JSON.stringify(response.data, null, 2)}</code>
                </pre>
              </div>
            ) : (
              <div className="bg-slate-900 rounded-lg p-4 text-center text-slate-400">
                Send a request to see the response
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Available Endpoints */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Available Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {endpoints.map((endpoint, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors"
                onClick={() => {
                  setMethod(endpoint.method);
                  setEndpoint(endpoint.path);
                }}
              >
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    endpoint.method === "GET" ? "bg-secondary text-slate-900" :
                    endpoint.method === "POST" ? "bg-yellow-500 text-slate-900" :
                    "bg-primary text-white"
                  }`}>
                    {endpoint.method}
                  </span>
                  <span className="font-mono text-sm">{endpoint.path}</span>
                  <span className="text-sm text-slate-400">{endpoint.description}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
