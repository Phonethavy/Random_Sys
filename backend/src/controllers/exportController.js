const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');
const db = require('../database');
const path = require('path');
const fs = require('fs');

/**
 * Export eligible participants to Excel
 * FR-LD-003: Export remaining participants
 * FR-LD-004: Support manual draw for ranks 1-6
 */
const exportEligibleToExcel = (req, res) => {
  try {
    const eligible = db.prepare(`
      SELECT p.employee_name, p.employee_id, p.company
      FROM participants p
      LEFT JOIN winners w ON p.id = w.participant_id
      WHERE w.id IS NULL
      ORDER BY p.employee_name
    `).all();

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(eligible.map(p => ({
      'Name_employee': p.employee_name,
      'Employee_ID': p.employee_id,
      'Company': p.company
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Eligible Participants');

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=eligible-participants-${Date.now()}.xlsx`);
    res.send(buffer);

  } catch (error) {
    console.error('Export Excel error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Export eligible participants to PDF (print-ready)
 * FR-LD-003: Print-ready format for manual draw
 */
const exportEligibleToPDF = (req, res) => {
  try {
    const eligible = db.prepare(`
      SELECT p.employee_name, p.employee_id, p.company
      FROM participants p
      LEFT JOIN winners w ON p.id = w.participant_id
      WHERE w.id IS NULL
      ORDER BY p.employee_name
    `).all();

    const doc = new PDFDocument({ 
      size: 'A4',
      margin: 50 
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=eligible-participants-${Date.now()}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add title
    doc.fontSize(20).text('List of award recipients', { align: 'center' });
    doc.fontSize(12).text(`Date ${new Date().toLocaleDateString('la-LA')}`, { align: 'center' });
    doc.moveDown(2);

    // Add table header
    const tableTop = doc.y;
    const colWidths = { name: 200, id: 100, company: 150 };
    const startX = 50;

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Name_employee', startX, tableTop, { width: colWidths.name });
    doc.text('Employee_ID', startX + colWidths.name, tableTop, { width: colWidths.id });
    doc.text('Company', startX + colWidths.name + colWidths.id, tableTop, { width: colWidths.company });

    doc.moveTo(startX, doc.y + 5).lineTo(startX + 450, doc.y + 5).stroke();
    doc.moveDown(0.5);

    // Add table rows
    doc.font('Helvetica').fontSize(9);
    eligible.forEach((person, index) => {
      const y = doc.y;

      // Check if we need a new page
      if (y > 700) {
        doc.addPage();
        doc.fontSize(9);
      }

      doc.text(person.employee_name, startX, doc.y, { width: colWidths.name });
      doc.text(person.employee_id, startX + colWidths.name, y, { width: colWidths.id });
      doc.text(person.company, startX + colWidths.name + colWidths.id, y, { width: colWidths.company });
      
      doc.moveDown(0.8);

      // Add separator line every 5 rows
      if ((index + 1) % 5 === 0) {
        doc.moveTo(startX, doc.y).lineTo(startX + 450, doc.y).stroke();
        doc.moveDown(0.3);
      }
    });

    // Add footer
    doc.fontSize(8).text(`ລວມທັງໝົດ ${eligible.length} ຄົນ`, startX, doc.page.height - 50);

    doc.end();

  } catch (error) {
    console.error('Export PDF error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Export winners to Excel
 * FR-LD-005: Winner history export
 */
const exportWinnersToExcel = (req, res) => {
  try {
    const winners = db.prepare(`
      SELECT employee_name, employee_id, company, prize_name, prize_rank, draw_timestamp
      FROM winners
      ORDER BY prize_rank DESC, draw_timestamp DESC
    `).all();

    const ws = XLSX.utils.json_to_sheet(winners.map(w => ({
      'Name_employee': w.employee_name,
      'Employee_ID': w.employee_id,
      'Company': w.company,
      'Prize': w.prize_name,
      'Prize_rank': w.prize_rank,
      'Date': new Date(w.draw_timestamp).toLocaleString('la-LA')
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Winners');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=winners-${Date.now()}.xlsx`);
    res.send(buffer);

  } catch (error) {
    console.error('Export winners error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  exportEligibleToExcel,
  exportEligibleToPDF,
  exportWinnersToExcel
};
