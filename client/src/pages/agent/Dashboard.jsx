import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, TrendingUp, CheckCircle2, Star, ArrowRight, AlertCircle } from "lucide-react";
import { leadService } from "../../services/leadService";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { STATUS_COLORS, formatDate } from "../../lib/utils";
import { toast } from "sonner";

function AgentStatCard({ title, value, icon: Icon, color, loading }) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? <Skeleton className="h-8 w-12 mt-1" /> : <p className="text-3xl font-bold mt-1">{value}</p>}
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

export default function AgentDashboard() {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, qualified: 0, converted: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data } = await leadService.getLeads({ limit: 100 });
        const all = data.leads;
        setLeads(all.slice(0, 5));
        setStats({
          total: data.total,
          new: all.filter((l) => l.status === "New").length,
          qualified: all.filter((l) => l.status === "Qualified").length,
          converted: all.filter((l) => l.status === "Converted").length,
        });
      } catch { toast.error("Failed to load dashboard"); }
      finally { setLoading(false); }
    };
    fetchLeads();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}! 👋</h1>
        <p className="text-muted-foreground text-sm">Here's an overview of your assigned leads</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AgentStatCard title="My Leads" value={stats.total} icon={FileText} color="bg-indigo-500" loading={loading} />
        <AgentStatCard title="New Leads" value={stats.new} icon={TrendingUp} color="bg-blue-500" loading={loading} />
        <AgentStatCard title="Qualified" value={stats.qualified} icon={Star} color="bg-purple-500" loading={loading} />
        <AgentStatCard title="Converted" value={stats.converted} icon={CheckCircle2} color="bg-green-500" loading={loading} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Recent Leads</CardTitle>
            <CardDescription>Your 5 most recent assigned leads</CardDescription>
          </div>
          <Link to="/agent/leads">
            <Button variant="ghost" size="sm" className="gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : leads.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No leads assigned yet. Check back later!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground hidden sm:table-cell">Company</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-2 font-medium">{lead.name}</td>
                      <td className="py-3 px-2 text-muted-foreground hidden sm:table-cell">{lead.company || "—"}</td>
                      <td className="py-3 px-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[lead.status]}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground hidden md:table-cell">{formatDate(lead.createdAt)}</td>
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
