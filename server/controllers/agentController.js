const User = require('../models/User');
const Lead = require('../models/Lead');

// @desc  Get all agents with assigned lead count
// @route GET /api/agents
// @access Private/Admin
const getAgents = async (req, res, next) => {
  try {
    const agents = await User.aggregate([
      { $match: { role: 'agent' } },
      {
        $lookup: {
          from: 'leads',
          localField: '_id',
          foreignField: 'assignedTo',
          as: 'assignedLeads',
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          createdAt: 1,
          assignedLeadsCount: { $size: '$assignedLeads' },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    res.status(200).json({ success: true, count: agents.length, agents });
  } catch (error) {
    next(error);
  }
};

// @desc  Create a new agent
// @route POST /api/agents
// @access Private/Admin
const createAgent = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    const agent = await User.create({ name, email, password, role: 'agent' });

    res.status(201).json({
      success: true,
      agent: { _id: agent._id, name: agent.name, email: agent.email, role: agent.role, createdAt: agent.createdAt },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Update an agent
// @route PUT /api/agents/:id
// @access Private/Admin
const updateAgent = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const agent = await User.findOne({ _id: req.params.id, role: 'agent' });
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }

    if (name) agent.name = name;
    if (email && email !== agent.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      agent.email = email;
    }
    if (password) agent.password = password;

    await agent.save();

    res.status(200).json({
      success: true,
      agent: { _id: agent._id, name: agent.name, email: agent.email, role: agent.role, createdAt: agent.createdAt },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete an agent (unassign their leads)
// @route DELETE /api/agents/:id
// @access Private/Admin
const deleteAgent = async (req, res, next) => {
  try {
    const agent = await User.findOne({ _id: req.params.id, role: 'agent' });
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }

    // Unassign leads
    await Lead.updateMany({ assignedTo: agent._id }, { assignedTo: null });

    await agent.deleteOne();

    res.status(200).json({ success: true, message: 'Agent deleted and leads unassigned' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAgents, createAgent, updateAgent, deleteAgent };
