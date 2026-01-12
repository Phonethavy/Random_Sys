const XLSX = require('xlsx');
const db = require('../database');
const fs = require('fs');

/**
 * Upload and validate participants from Excel file
 * FR-LD-001: Upload eligible participants list
 */
const uploadParticipants = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    // Validate data
    const errors = [];
    const validData = [];

    data.forEach((row, index) => {
      const rowNum = index + 2; // Excel rows start at 1, plus header
      const employeeName = row['ชื่อพนักงาน'] || row['employee_name'] || row['name'];
      const employeeId = row['รหัสพนักงาน'] || row['employee_id'] || row['id'];
      const company = row['บริษัท'] || row['company'];

      // Check for required fields
      if (!employeeName || !employeeId || !company) {
        errors.push({
          row: rowNum,
          message: `Missing required fields. Found: ${JSON.stringify(row)}`
        });
      } else {
        validData.push({
          employee_name: String(employeeName).trim(),
          employee_id: String(employeeId).trim(),
          company: String(company).trim()
        });
      }
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    if (errors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        errors,
        totalRows: data.length,
        validRows: validData.length
      });
    }

    // Check if there are existing winners - if so, we cannot delete participants
    const winnersCount = db.prepare('SELECT COUNT(*) as count FROM winners').get();
    const replaceMode = req.query.replace === 'true';

    if (replaceMode && winnersCount.count > 0) {
      return res.status(400).json({ 
        error: 'ไม่สามารถลบรายชื่อเดิมได้ เนื่องจากมีการจับรางวัลแล้ว',
        winnersCount: winnersCount.count
      });
    }

    if (replaceMode && winnersCount.count === 0) {
      // Clear existing participants only if no winners exist
      db.prepare('DELETE FROM participants').run();
    }

    // Insert valid data (skip duplicates)
    const insertStmt = db.prepare(`
      INSERT OR IGNORE INTO participants (employee_name, employee_id, company) 
      VALUES (?, ?, ?)
    `);

    const insertMany = db.transaction((participants) => {
      let inserted = 0;
      let skipped = 0;
      for (const p of participants) {
        const result = insertStmt.run(p.employee_name, p.employee_id, p.company);
        if (result.changes > 0) {
          inserted++;
        } else {
          skipped++;
        }
      }
      return { inserted, skipped };
    });

    const result = insertMany(validData);

    res.json({ 
      success: true, 
      message: 'Participants uploaded successfully',
      totalProcessed: validData.length,
      inserted: result.inserted,
      skipped: result.skipped
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all participants
 */
const getParticipants = (req, res) => {
  try {
    const participants = db.prepare('SELECT * FROM participants ORDER BY employee_name').all();
    res.json({ participants, total: participants.length });
  } catch (error) {
    console.error('Get participants error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get eligible participants (those who haven't won yet)
 * FR-LD-006: One prize per participant
 */
const getEligibleParticipants = (req, res) => {
  try {
    const eligible = db.prepare(`
      SELECT p.* 
      FROM participants p
      LEFT JOIN winners w ON p.id = w.participant_id
      WHERE w.id IS NULL
      ORDER BY p.employee_name
    `).all();

    res.json({ eligible, total: eligible.length });
  } catch (error) {
    console.error('Get eligible error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  uploadParticipants,
  getParticipants,
  getEligibleParticipants
};
