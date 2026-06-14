const User = require('../models/User');
const Lead = require('../models/Lead');

// @desc  Distribute unassigned leads equally to all agents (round-robin)
// @route POST /api/distribute
// @access Private/Admin
const distribute = async (req, res, next) => {
  try {
    // Fetch all agents
    const agents = await User.find({ role: 'agent' }).select('_id name email');
    if (agents.length === 0) {
      return res.status(400).json({ success: false, message: 'No agents found. Create agents first.' });
    }

    // Fetch all unassigned leads
    const unassignedLeads = await Lead.find({ assignedTo: null }).select('_id name email');
    if (unassignedLeads.length === 0) {
      return res.status(400).json({ success: false, message: 'No unassigned leads to distribute.' });
    }

    // Round-robin distribution
    const assignments = {};
    agents.forEach((agent) => {
      assignments[agent._id.toString()] = {
        agent: { _id: agent._id, name: agent.name, email: agent.email },
        leads: [],
      };
    });

    const bulkOps = unassignedLeads.map((lead, index) => {
      const agent = agents[index % agents.length];
      assignments[agent._id.toString()].leads.push({ _id: lead._id, name: lead.name });

      return {
        updateOne: {
          filter: { _id: lead._id },
          update: { $set: { assignedTo: agent._id } },
        },
      };
    });

    await Lead.bulkWrite(bulkOps);

    const summary = Object.values(assignments).map((item) => ({
      agent: item.agent,
      assignedCount: item.leads.length,
      leads: item.leads,
    }));

    res.status(200).json({
      success: true,
      message: `Successfully distributed ${unassignedLeads.length} leads among ${agents.length} agents`,
      summary: {
        totalLeadsDistributed: unassignedLeads.length,
        totalAgents: agents.length,
        perAgent: summary,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { distribute };
