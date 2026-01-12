const db = require('../database');

/**
 * Conduct random draw
 * FR-LD-002: Set number of winners before draw
 * FR-LD-004: Support draws for ranks 7-10
 * FR-LD-006: One prize per participant, auto-remove from future draws
 */
const conductDraw = (req, res) => {
  try {
    const { numberOfWinners, prizeRank, prizeName } = req.body;

    if (!numberOfWinners || numberOfWinners < 1) {
      return res.status(400).json({ error: 'Invalid number of winners' });
    }

    if (!prizeRank || prizeRank < 1) {
      return res.status(400).json({ error: 'Prize rank is required' });
    }

    // Get eligible participants (those who haven't won)
    const eligible = db.prepare(`
      SELECT p.* 
      FROM participants p
      LEFT JOIN winners w ON p.id = w.participant_id
      WHERE w.id IS NULL
    `).all();

    if (eligible.length === 0) {
      return res.status(400).json({ error: 'No eligible participants available' });
    }

    if (eligible.length < numberOfWinners) {
      return res.status(400).json({ 
        error: `Not enough eligible participants. Available: ${eligible.length}, Requested: ${numberOfWinners}` 
      });
    }

    // Randomly select winners
    const shuffled = [...eligible].sort(() => Math.random() - 0.5);
    const selectedWinners = shuffled.slice(0, numberOfWinners);

    // Insert winners into database
    const insertStmt = db.prepare(`
      INSERT INTO winners (participant_id, employee_name, employee_id, company, prize_name, prize_rank)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((winners) => {
      for (const winner of winners) {
        insertStmt.run(
          winner.id,
          winner.employee_name,
          winner.employee_id,
          winner.company,
          prizeName || `Prize Rank ${prizeRank}`,
          prizeRank
        );
      }
    });

    insertMany(selectedWinners);

    res.json({
      success: true,
      winners: selectedWinners.map(w => ({
        employee_name: w.employee_name,
        employee_id: w.employee_id,
        company: w.company,
        prize_name: prizeName || `Prize Rank ${prizeRank}`,
        prize_rank: prizeRank
      })),
      totalSelected: selectedWinners.length,
      remainingEligible: eligible.length - selectedWinners.length
    });

  } catch (error) {
    console.error('Draw error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get draw history
 * FR-LD-005: Check prize history
 */
const getDrawHistory = (req, res) => {
  try {
    const history = db.prepare(`
      SELECT * FROM winners 
      ORDER BY prize_rank DESC, draw_timestamp DESC
    `).all();

    res.json({ history, total: history.length });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all winners
 */
const getWinners = (req, res) => {
  try {
    const winners = db.prepare(`
      SELECT * FROM winners 
      ORDER BY prize_rank DESC, draw_timestamp DESC
    `).all();

    res.json({ winners, total: winners.length });
  } catch (error) {
    console.error('Get winners error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Clear all winners data
 */
const clearAllWinners = (req, res) => {
  try {
    const result = db.prepare('DELETE FROM winners').run();
    
    res.json({ 
      success: true, 
      message: 'ลบข้อมูลผู้ชนะทั้งหมดเรียบร้อย',
      deleted: result.changes
    });
  } catch (error) {
    console.error('Clear winners error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  conductDraw,
  getDrawHistory,
  getWinners,
  clearAllWinners
};
