import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users, FileText, TrendingUp, CheckCircle2,
  ArrowRight, Loader2, RefreshCw, AlertCircle
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Legend
} from "recharts";
import { analyticsService } from "../../services/analyticsService";
import { leadService } from "../../services/leadService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { STATUS_COLORS, formatDate } from "../../lib/utils";
import { toast } from "sonner";

const PIE_COLORS = ["#6366f1", "#f59e0b", "#a855f7", "#22c55e", "#ef4444"];

function StatCard({ title, value, icon: Icon, color, loading }) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-3xl font-bold mt-1">{value ?? 0}</p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${color}`} />
    </Card>
  );
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [distributing, setDistributing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, leadsRes] = await Promise.all([
        analyticsService.getAnalytics(),
        leadService.getLeads({ limit: 6, sort: "-createdAt" }),
      ]);
      setAnalytics(analyticsRes.data.data);
      setRecentLeads(leadsRes.data.leads);
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDistribute = async () => {
    setDistributing(true);
    try {
      const { data } = await leadService.distribute();
      toast.success(`✅ ${data.summary.totalLeadsDistributed} leads distributed to ${data.summary.totalAgents} agents!`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Distribution failed");
    } finally {
      setDistributing(false);
    }
  };

  const overview = analytics?.overview;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Overview of your lead distribution system</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleDistribute} disabled={distributing} className="gradient-primary text-white">
            {distributing ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
            Distribute Leads
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Leads" value={overview?.totalLeads} icon={FileText} color="bg-indigo-500" loading={loading} />
        <StatCard title="Total Agents" value={overview?.totalAgents} icon={Users} color="bg-purple-500" loading={loading} />
        <StatCard title="New Leads" value={overview?.newLeads} icon={TrendingUp} color="bg-blue-500" loading={loading} />
        <StatCard title="Converted" value={overview?.convertedLeads} icon={CheckCircle2} color="bg-green-500" loading={loading} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leads by Status</CardTitle>
            <CardDescription>Distribution across all statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={analytics?.leadsByStatus || []} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}>
                    {(analytics?.leadsByStatus || []).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leads per Agent</CardTitle>
            <CardDescription>Assigned leads per sales agent</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics?.leadsByAgent || []} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="agentName" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Leads Trend</CardTitle>
          <CardDescription>Leads created over the past 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-56 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={analytics?.monthlyLeads || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent Leads */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Recent Leads</CardTitle>
            <CardDescription>Latest 6 leads in the system</CardDescription>
          </div>
          <Link to="/admin/leads">
            <Button variant="ghost" size="sm" className="gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : recentLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No leads yet. Add some leads or import a CSV!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground hidden sm:table-cell">Company</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground hidden md:table-cell">Agent</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((lead) => (
                    <tr key={lead._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-2 font-medium">{lead.name}</td>
                      <td className="py-3 px-2 text-muted-foreground hidden sm:table-cell">{lead.company || "—"}</td>
                      <td className="py-3 px-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[lead.status]}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground hidden md:table-cell">{lead.assignedTo?.name || "Unassigned"}</td>
                      <td className="py-3 px-2 text-muted-foreground hidden lg:table-cell">{formatDate(lead.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
