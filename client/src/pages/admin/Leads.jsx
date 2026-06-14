import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus, Trash2, Loader2, Search, Filter, ChevronLeft, ChevronRight,
  AlertCircle, TrendingUp, Pencil
} from "lucide-react";
import { toast } from "sonner";
import { leadService } from "../../services/leadService";
import { agentService } from "../../services/agentService";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Skeleton } from "../../components/ui/skeleton";
import { STATUS_COLORS, STATUS_OPTIONS, SOURCE_OPTIONS, formatDate } from "../../lib/utils";

const leadSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.string().optional(),
});

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAgent, setFilterAgent] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [deleteLead, setDeleteLead] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [distributing, setDistributing] = useState(false);
  const LIMIT = 10;

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, sort: "-createdAt" };
      if (search) params.search = search;
      if (filterStatus !== "all") params.status = filterStatus;
      if (filterAgent !== "all") params.assignedTo = filterAgent;
      const { data } = await leadService.getLeads(params);
      setLeads(data.leads);
      setTotal(data.total);
    } catch { toast.error("Failed to load leads"); }
    finally { setLoading(false); }
  }, [page, search, filterStatus, filterAgent]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);
  useEffect(() => {
    agentService.getAgents().then(({ data }) => setAgents(data.agents)).catch(() => {});
  }, []);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [search, filterStatus, filterAgent]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(leadSchema) });

  const handleCreate = async (data) => {
    setSubmitting(true);
    try {
      await leadService.createLead(data);
      toast.success("Lead created!");
      setShowCreate(false);
      reset();
      fetchLeads();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to create lead"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await leadService.deleteLead(deleteLead._id);
      toast.success("Lead deleted");
      setDeleteLead(null);
      fetchLeads();
    } catch { toast.error("Failed to delete lead"); }
    finally { setSubmitting(false); }
  };

  const handleDistribute = async () => {
    setDistributing(true);
    try {
      const { data } = await leadService.distribute();
      toast.success(`✅ ${data.summary.totalLeadsDistributed} leads distributed!`);
      fetchLeads();
    } catch (err) { toast.error(err.response?.data?.message || "Distribution failed"); }
    finally { setDistributing(false); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-muted-foreground text-sm">{total} total leads</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={handleDistribute} disabled={distributing}>
            {distributing ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
            Distribute
          </Button>
          <Button onClick={() => setShowCreate(true)} className="gradient-primary text-white">
            <Plus className="w-4 h-4" /> Add Lead
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="w-4 h-4 mr-2 opacity-50" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterAgent} onValueChange={setFilterAgent}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {agents.map((a) => <SelectItem key={a._id} value={a._id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No leads found</p>
              <p className="text-sm">Try adjusting your filters or add new leads</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr>
                    {["Name", "Email", "Company", "Status", "Agent", "Date", "Actions"].map((h) => (
                      <th key={h} className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead._id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-medium whitespace-nowrap">{lead.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{lead.email}</td>
                      <td className="py-3 px-4 text-muted-foreground">{lead.company || "—"}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[lead.status]}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">{lead.assignedTo?.name || <span className="text-orange-500">Unassigned</span>}</td>
                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">{formatDate(lead.createdAt)}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteLead(lead)}>
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({total} total)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={(v) => { setShowCreate(v); reset(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create New Lead</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Name *</Label>
                <Input {...register("name")} placeholder="John Smith" />
                {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Email *</Label>
                <Input {...register("email")} type="email" placeholder="john@company.com" />
                {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input {...register("phone")} placeholder="+1 234 567 8900" />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input {...register("company")} placeholder="Acme Corp" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Source</Label>
                <select {...register("source")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">Select source</option>
                  {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Lead"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteLead} onOpenChange={() => setDeleteLead(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Delete Lead
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete <strong>{deleteLead?.name}</strong>? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteLead(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
