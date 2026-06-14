import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Search, ChevronLeft, ChevronRight, Loader2, AlertCircle, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { leadService } from "../../services/leadService";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Skeleton } from "../../components/ui/skeleton";
import { STATUS_COLORS, STATUS_OPTIONS, formatDate, formatDateTime } from "../../lib/utils";

export default function MyLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);
  const [updating, setUpdating] = useState(false);
  const LIMIT = 10;

  const { register, handleSubmit, reset, setValue } = useForm();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, sort: "-createdAt" };
      if (search) params.search = search;
      if (filterStatus !== "all") params.status = filterStatus;
      const { data } = await leadService.getLeads(params);
      setLeads(data.leads);
      setTotal(data.total);
    } catch { toast.error("Failed to load leads"); }
    finally { setLoading(false); }
  }, [page, search, filterStatus]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);
  useEffect(() => { setPage(1); }, [search, filterStatus]);

  const openUpdate = (lead) => {
    setSelectedLead(lead);
    reset({ status: lead.status, notes: lead.notes || "" });
  };

  const handleUpdate = async (data) => {
    setUpdating(true);
    try {
      await leadService.updateLead(selectedLead._id, data);
      toast.success("Lead updated successfully!");
      setSelectedLead(null);
      fetchLeads();
    } catch { toast.error("Failed to update lead"); }
    finally { setUpdating(false); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Leads</h1>
        <p className="text-muted-foreground text-sm">{total} leads assigned to you</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
              <p className="text-sm">Try adjusting your search or wait for leads to be assigned</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr>
                    {["Name", "Email", "Company", "Status", "Notes", "Date", "Actions"].map((h) => (
                      <th key={h} className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead._id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-medium">{lead.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{lead.email}</td>
                      <td className="py-3 px-4 text-muted-foreground">{lead.company || "—"}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[lead.status]}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {lead.notes ? (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MessageSquare className="w-3 h-3" />
                            <span className="truncate max-w-24 text-xs">{lead.notes}</span>
                          </div>
                        ) : <span className="text-muted-foreground/40 text-xs">—</span>}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap text-xs">{formatDate(lead.createdAt)}</td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm" onClick={() => openUpdate(lead)} className="h-7 text-xs">
                          Update
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
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

      {/* Update Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Lead</DialogTitle>
            <DialogDescription>{selectedLead?.name} — {selectedLead?.email}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleUpdate)} className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                defaultValue={selectedLead?.status}
                onValueChange={(v) => setValue("status", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[s]}`}>{s}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <textarea
                {...register("notes")}
                placeholder="Add notes about this lead..."
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>

            {/* Lead info */}
            <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Phone:</span><span>{selectedLead?.phone || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Source:</span><span>{selectedLead?.source}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Created:</span><span>{selectedLead && formatDateTime(selectedLead.createdAt)}</span></div>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setSelectedLead(null)}>Cancel</Button>
              <Button type="submit" disabled={updating}>
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
