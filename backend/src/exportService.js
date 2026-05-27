const { Parser } = require('json2csv');
const { Builder } = require('xml2js');
const PDFDocument = require('pdfkit');

function exportJSON(records) {
  return JSON.stringify(records, null, 2);
}

function exportCSV(records) {
  if (!records || records.length === 0) return '';
  const flat = records.map(r => {
    const wd = r.weather_data ? JSON.parse(r.weather_data) : {};
    return {
      id: r.id,
      location: r.resolved_location || r.location_input,
      latitude: r.latitude,
      longitude: r.longitude,
      date_from: r.date_from,
      date_to: r.date_to,
      created_at: r.created_at,
      updated_at: r.updated_at,
      current_temp: wd.current?.main?.temp,
      current_condition: wd.current?.weather?.[0]?.description,
      humidity: wd.current?.main?.humidity,
      wind_speed: wd.current?.wind?.speed
    };
  });
  const parser = new Parser();
  return parser.parse(flat);
}

function exportXML(records) {
  const builder = new Builder({ rootName: 'WeatherQueries', xmldec: { version: '1.0', encoding: 'UTF-8' } });
  const data = {
    Query: records.map(r => {
      const wd = r.weather_data ? JSON.parse(r.weather_data) : {};
      return {
        id: r.id,
        location: r.resolved_location || r.location_input,
        latitude: r.latitude,
        longitude: r.longitude,
        date_from: r.date_from || '',
        date_to: r.date_to || '',
        created_at: r.created_at,
        updated_at: r.updated_at,
        current_temp: wd.current?.main?.temp || '',
        current_condition: wd.current?.weather?.[0]?.description || '',
        humidity: wd.current?.main?.humidity || '',
        wind_speed: wd.current?.wind?.speed || ''
      };
    })
  };
  return builder.buildObject(data);
}

function exportMarkdown(records) {
  const lines = ['# Weather Query History', '', `*Exported on ${new Date().toLocaleString()}*`, ''];
  for (const r of records) {
    const wd = r.weather_data ? JSON.parse(r.weather_data) : {};
    lines.push(`## Query #${r.id}: ${r.resolved_location || r.location_input}`);
    lines.push('');
    lines.push(`| Field | Value |`);
    lines.push(`|-------|-------|`);
    lines.push(`| Location | ${r.resolved_location || r.location_input} |`);
    lines.push(`| Coordinates | ${r.latitude}, ${r.longitude} |`);
    lines.push(`| Date Range | ${r.date_from || 'N/A'} → ${r.date_to || 'N/A'} |`);
    lines.push(`| Created | ${r.created_at} |`);
    if (wd.current) {
      lines.push(`| Temperature | ${wd.current.main?.temp}°C |`);
      lines.push(`| Condition | ${wd.current.weather?.[0]?.description} |`);
      lines.push(`| Humidity | ${wd.current.main?.humidity}% |`);
      lines.push(`| Wind Speed | ${wd.current.wind?.speed} m/s |`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

function exportPDF(records, res) {
  const doc = new PDFDocument({ margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="weather_queries.pdf"');
  doc.pipe(res);

  // Title
  doc.fontSize(22).font('Helvetica-Bold').text('Weather Query History', { align: 'center' });
  doc.fontSize(10).font('Helvetica').fillColor('#666').text(`Exported on ${new Date().toLocaleString()}`, { align: 'center' });
  doc.moveDown(1.5);

  for (const r of records) {
    const wd = r.weather_data ? JSON.parse(r.weather_data) : {};
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#000')
      .text(`Query #${r.id}: ${r.resolved_location || r.location_input}`);
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica').fillColor('#333');
    doc.text(`Coordinates: ${r.latitude}, ${r.longitude}`);
    doc.text(`Date Range: ${r.date_from || 'N/A'} → ${r.date_to || 'N/A'}`);
    doc.text(`Created: ${r.created_at}`);
    if (wd.current) {
      doc.text(`Temperature: ${wd.current.main?.temp}°C`);
      doc.text(`Condition: ${wd.current.weather?.[0]?.description}`);
      doc.text(`Humidity: ${wd.current.main?.humidity}%`);
      doc.text(`Wind Speed: ${wd.current.wind?.speed} m/s`);
    }
    doc.moveDown(1);
    doc.moveTo(40, doc.y).lineTo(550, doc.y).strokeColor('#ddd').stroke();
    doc.moveDown(0.5);
  }

  doc.end();
}

module.exports = { exportJSON, exportCSV, exportXML, exportMarkdown, exportPDF };
