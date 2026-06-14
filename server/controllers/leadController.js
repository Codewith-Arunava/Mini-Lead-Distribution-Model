const Lead = require('../models/Lead');

// @desc  Get leads (Admin: all; Agent: own only)
// @route GET /api/leads
// @access Private
const getLeads = async (req, res, next) => {
  try {
    const { search, status, assignedTo, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const query = {};

    // Role-based filtering
    if (req.user.role === 'agent') {
      query.assignedTo = req.user._id;
    } else if (assignedTo) {
      query.assignedTo = assignedTo === 'unassigned' ? null : assignedTo;
    }

    if (status) query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .populate('assignedTo', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Lead.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      leads,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single lead
// @route GET /api/leads/:id
// @access Private
const getLead = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role === 'agent') query.assignedTo = req.user._id;

    const lead = await Lead.findOne(query).populate('assignedTo', 'name email');
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    res.status(200).json({ success: true, lead });
  } catch (error) {
    next(error);
  }
};

// @desc  Create lead
// @route POST /api/leads
// @access Private/Admin
const createLead = async (req, res, next) => {
  try {
    const { name, email, phone, company, source } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const lead = await Lead.create({ name, email, phone, company, source });
    res.status(201).json({ success: true, lead });
  } catch (error) {
    next(error);
  }
};

// @desc  Update lead (status, notes, assignment)
// @route PUT /api/leads/:id
// @access Private
const updateLead = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role === 'agent') query.assignedTo = req.user._id;

    let lead = await Lead.findOne(query);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // Agents can only update status and notes
    const allowedFields = req.user.role === 'agent'
      ? ['status', 'notes']
      : ['name', 'email', 'phone', 'company', 'source', 'status', 'notes', 'assignedTo'];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        lead[field] = req.body[field];
      }
    });

    await lead.save();
    lead = await Lead.findById(lead._id).populate('assignedTo', 'name email');

    res.status(200).json({ success: true, lead });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete lead
// @route DELETE /api/leads/:id
// @access Private/Admin
const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    res.status(200).json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLeads, getLead, createLead, updateLead, deleteLead };
