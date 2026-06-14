import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Loader2, Users, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { agentService } from "../../services/agentService";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Skeleton } from "../../components/ui/skeleton";
import { formatDate } from "../../lib/utils";

const agentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
});

function AgentForm({ onSubmit, defaultValues, isEdit, isSubmitting }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(agentSchema),
    defaultValues,
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input {...register("name")} placeholder="Alex Johnson" />
        {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input {...register("email")} type="email" placeholder="agent@company.com" />
        {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>{isEdit ? "New Password (leave blank to keep current)" : "Password"}</Label>
        <Input {...register("password")} type="password" placeholder="••••••••" />
        {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? "Update Agent" : "Create Agent"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editAgent, setEditAgent] = useState(null);
  const [deleteAgent, setDeleteAgent] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAgents = async () => {
    try {
      const { data } = await agentService.getAgents();
      setAgents(data.agents);
    } catch { toast.error("Failed to load agents"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAgents(); }, []);

  const handleCreate = async (data) => {
    setSubmitting(true);
    try {
      await agentService.createAgent(data);
      toast.success("Agent created successfully!");
      setShowCreate(false);
      fetchAgents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create agent");
    } finally { setSubmitting(false); }
  };

  const handleUpdate = async (data) => {
    setSubmitting(true);
    try {
      const payload = { ...data };
      if (!payload.password) delete payload.password;
      await agentService.updateAgent(editAgent._id, payload);
      toast.success("Agent updated!");
      setEditAgent(null);
      fetchAgents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update agent");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await agentService.deleteAgent(deleteAgent._id);
      toast.success("Agent deleted. Their leads have been unassigned.");
      setDeleteAgent(null);
      fetchAgents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete agent");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agents</h1>
          <p className="text-muted-foreground text-sm">Manage your sales agents</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gradient-primary text-white">
          <Plus className="w-4 h-4" /> Add Agent
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" /> Agent List
          </CardTitle>
          <CardDescription>{agents.length} agent{agents.length !== 1 ? "s" : ""} registered</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No agents yet</p>
              <p className="text-sm">Create your first agent to start distributing leads</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-3 font-medium text-muted-foreground">Agent</th>
                    <th className="text-left py-3 px-3 font-medium text-muted-foreground hidden sm:table-cell">Email</th>
                    <th className="text-center py-3 px-3 font-medium text-muted-foreground">Leads</th>
                    <th className="text-left py-3 px-3 font-medium text-muted-foreground hidden md:table-cell">Joined</th>
                    <th className="text-right py-3 px-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr key={agent._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {agent.name.charAt(0)}
                          </div>
                          <span className="font-medium">{agent.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground hidden sm:table-cell">{agent.email}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          {agent.assignedLeadsCount}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground hidden md:table-cell">{formatDate(agent.createdAt)}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => setEditAgent(agent)} className="h-8 w-8">
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteAgent(agent)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Agent</DialogTitle></DialogHeader>
          <AgentForm onSubmit={handleCreate} isEdit={false} isSubmitting={submitting} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editAgent} onOpenChange={() => setEditAgent(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Agent</DialogTitle></DialogHeader>
          {editAgent && (
            <AgentForm
              onSubmit={handleUpdate}
              defaultValues={{ name: editAgent.name, email: editAgent.email, password: "" }}
              isEdit={true}
              isSubmitting={submitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteAgent} onOpenChange={() => setDeleteAgent(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" /> Delete Agent
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong>{deleteAgent?.name}</strong>? Their{" "}
            <strong>{deleteAgent?.assignedLeadsCount}</strong> lead(s) will become unassigned.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAgent(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
