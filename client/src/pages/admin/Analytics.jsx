import { useState, useEffect } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Legend
} from "recharts";
import { analyticsService } from "../../services/analyticsService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { toast } from "sonner";

const PIE_COLORS = ["#6366f1", "#f59e0b", "#a855f7", "#22c55e", "#ef4444"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border rounded-lg p-3 shadow-lg text-sm">
        <p className="font-medium">{label || payload[0].name}</p>
        <p className="text-primary">{payload[0].value} leads</p>
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: res } = await analyticsService.getAnalytics();
      setData(res.data);
    } catch { toast.error("Failed to load analytics"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm">Lead performance insights and statistics</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: data?.overview?.totalLeads, color: "text-indigo-500" },
          { label: "Total Agents", value: data?.overview?.totalAgents, color: "text-purple-500" },
          { label: "New Leads", value: data?.overview?.newLeads, color: "text-blue-500" },
          { label: "Converted", value: data?.overview?.convertedLeads, color: "text-green-500" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-5 text-center">
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">{label}</p>
              {loading ? (
                <Skeleton className="h-9 w-12 mx-auto mt-2" />
              ) : (
                <p className={`text-4xl font-bold mt-1 ${color}`}>{value ?? 0}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leads by Status - Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Leads by Status</CardTitle>
            <CardDescription>Breakdown of leads across all pipeline stages</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-72 w-full" /> : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data?.leadsByStatus || []}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ status, count, percent }) => `${status}: ${count} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={true}
                  >
                    {(data?.leadsByStatus || []).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Leads by Agent - Bar */}
        <Card>
          <CardHeader>
            <CardTitle>Leads per Agent</CardTitle>
            <CardDescription>Number of leads assigned to each sales agent</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-72 w-full" /> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data?.leadsByAgent || []} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                  <XAxis dataKey="agentName" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend - Line */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Leads Trend</CardTitle>
          <CardDescription>Total leads created each month over the past 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-72 w-full" /> : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data?.monthlyLeads || []} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ fill: "#6366f1", r: 5, strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
