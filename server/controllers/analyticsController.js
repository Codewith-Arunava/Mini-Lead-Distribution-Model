const Lead = require('../models/Lead');
const User = require('../models/User');

// @desc  Get analytics data
// @route GET /api/analytics
// @access Private/Admin
const getAnalytics = async (req, res, next) => {
  try {
    const [
      leadsByStatus,
      leadsByAgent,
      monthlyLeads,
      totalLeads,
      totalAgents,
      newLeads,
      convertedLeads,
    ] = await Promise.all([
      // Leads by status
      Lead.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      // Leads per agent (only assigned)
      Lead.aggregate([
        { $match: { assignedTo: { $ne: null } } },
        { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'agent',
          },
        },
        { $unwind: '$agent' },
        {
          $project: {
            agentName: '$agent.name',
            agentEmail: '$agent.email',
            count: 1,
          },
        },
        { $sort: { count: -1 } },
      ]),

      // Monthly leads for the past 12 months
      Lead.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        {
          $project: {
            _id: 0,
            year: '$_id.year',
            month: '$_id.month',
            count: 1,
          },
        },
      ]),

      Lead.countDocuments(),
      User.countDocuments({ role: 'agent' }),
      Lead.countDocuments({ status: 'New' }),
      Lead.countDocuments({ status: 'Converted' }),
    ]);

    // Format monthly data with month names
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthly = monthlyLeads.map((item) => ({
      month: `${monthNames[item.month - 1]} ${item.year}`,
      count: item.count,
    }));

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalLeads,
          totalAgents,
          newLeads,
          convertedLeads,
          unassignedLeads: await Lead.countDocuments({ assignedTo: null }),
        },
        leadsByStatus: leadsByStatus.map((item) => ({ status: item._id, count: item.count })),
        leadsByAgent,
        monthlyLeads: formattedMonthly,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics };
