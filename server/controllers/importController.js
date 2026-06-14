const { parse } = require('csv-parse');
const Lead = require('../models/Lead');

const VALID_SOURCES = ['Website', 'Facebook', 'LinkedIn', 'Referral', 'Email', 'Cold Call', 'Other'];

// @desc  Import leads from CSV file
// @route POST /api/leads/import
// @access Private/Admin
const importCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a CSV file' });
    }

    const fileContent = req.file.buffer.toString('utf-8');
    const rows = [];

    await new Promise((resolve, reject) => {
      parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      })
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'CSV file is empty' });
    }

    const results = { success: [], errors: [] };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // Account for header row

      // Validate required fields
      if (!row.name || !row.name.trim()) {
        results.errors.push({ row: rowNum, reason: 'Missing required field: name' });
        continue;
      }

      if (!row.email || !row.email.trim()) {
        results.errors.push({ row: rowNum, reason: 'Missing required field: email', data: row });
        continue;
      }

      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(row.email.trim())) {
        results.errors.push({ row: rowNum, reason: `Invalid email: ${row.email}`, data: row });
        continue;
      }

      const source = VALID_SOURCES.includes(row.source) ? row.source : 'Other';

      try {
        const lead = await Lead.create({
          name: row.name.trim(),
          email: row.email.trim().toLowerCase(),
          phone: row.phone?.trim() || '',
          company: row.company?.trim() || '',
          source,
        });
        results.success.push({ row: rowNum, leadId: lead._id, name: lead.name });
      } catch (err) {
        results.errors.push({
          row: rowNum,
          reason: err.code === 11000 ? 'Duplicate email' : err.message,
          data: row,
        });
      }
    }

    res.status(200).json({
      success: true,
      summary: {
        total: rows.length,
        imported: results.success.length,
        failed: results.errors.length,
      },
      imported: results.success,
      errors: results.errors,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { importCSV };
