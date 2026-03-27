import { jsPDF } from 'jspdf';
import type { LandAssessment } from '@shared/types';

/**
 * Export assessment data as a CSV file download.
 */
export function exportCSV(assessment: LandAssessment): void {
  const rows = [
    ['Field', 'Value'],
    ['Latitude', String(assessment.coordinates.lat)],
    ['Longitude', String(assessment.coordinates.lng)],
    ['Total Hectares', String(assessment.totalHectares)],
    ['Usable Hectares', String(assessment.leaseEstimate.usableHectares)],
    ['Nearest Substation', assessment.nearestSubstation.name],
    ['Distance to Substation (km)', String(assessment.nearestSubstation.distanceKm)],
    ['Grid Proximity Rating', assessment.overallViabilityScore],
    ['Annual Lease Income (AUD)', String(assessment.leaseEstimate.annualIncomeAud)],
    ['Lease Rate ($/ha/yr)', String(assessment.leaseEstimate.leaseRatePerHa)],
    ['25-Year Total Income (AUD)', String(assessment.leaseEstimate.totalLifetimeIncomeAud)],
    ['Water Savings (ML/yr)', String(assessment.waterSavings.annualSavingsMl)],
    ['Water Cost Savings ($/yr)', String(assessment.waterSavings.annualCostSavingsAud)],
    ['Solar Exposure (MJ/m²/day)', String(assessment.solarExposure.annualAvgMjM2)],
    ['Strategic Cropping Land', assessment.constraints.strategicCroppingLand ? 'Yes' : 'No'],
    ['Flood Zone', assessment.constraints.floodZone ? 'Yes' : 'No'],
    ['Grid Constraint Warning', assessment.gridConstraintWarning || 'None'],
    ['Assessment Date', assessment.assessedAt],
  ];

  const csv = rows.map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `agrivolt-assessment-${assessment.coordinates.lat.toFixed(4)}-${assessment.coordinates.lng.toFixed(4)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export assessment as a PDF report with a map image.
 */
export async function exportPDF(assessment: LandAssessment, mapboxToken: string): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = margin;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('AgriVolt Site Assessment Report', margin, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated: ${new Date(assessment.assessedAt).toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, y);
  y += 4;
  doc.text(`Location: ${assessment.coordinates.lat.toFixed(4)}, ${assessment.coordinates.lng.toFixed(4)}`, margin, y);
  y += 8;

  // Map image
  doc.setTextColor(0, 0, 0);
  try {
    const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/pin-l+22c55e(${assessment.coordinates.lng},${assessment.coordinates.lat})/${assessment.coordinates.lng},${assessment.coordinates.lat},12,0/600x400@2x?access_token=${mapboxToken}`;
    const img = await loadImage(mapUrl);
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = imgWidth * (400 / 600);
    doc.addImage(img, 'PNG', margin, y, imgWidth, imgHeight);
    y += imgHeight + 6;
  } catch {
    // Skip map image on failure
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('(Map image unavailable)', margin, y);
    y += 6;
  }

  // Key Metrics
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Metrics', margin, y);
  y += 6;

  const metrics = [
    ['Annual Lease Income', `$${assessment.leaseEstimate.annualIncomeAud.toLocaleString()}`],
    ['25-Year Total', `$${assessment.leaseEstimate.totalLifetimeIncomeAud.toLocaleString()}`],
    ['Water Savings', `${assessment.waterSavings.annualSavingsMl} ML/yr`],
    ['Solar Exposure', `${assessment.solarExposure.annualAvgMjM2} MJ/m²/day`],
  ];

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  for (const [label, val] of metrics) {
    doc.setFont('helvetica', 'normal');
    doc.text(label, margin, y);
    doc.setFont('helvetica', 'bold');
    doc.text(val, pageWidth - margin, y, { align: 'right' });
    y += 5;
  }
  y += 4;

  // Full Details
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Assessment Details', margin, y);
  y += 6;

  const details = [
    ['Total Hectares', String(assessment.totalHectares)],
    ['Usable Hectares', String(assessment.leaseEstimate.usableHectares)],
    ['Lease Rate', `$${assessment.leaseEstimate.leaseRatePerHa}/ha/yr`],
    ['Nearest Substation', `${assessment.nearestSubstation.name} (${assessment.nearestSubstation.distanceKm.toFixed(1)} km)`],
    ['Grid Rating', assessment.overallViabilityScore.toUpperCase()],
    ['Water Cost Savings', `$${assessment.waterSavings.annualCostSavingsAud.toLocaleString()}/yr`],
    ['Evaporation Reduction', `${assessment.waterSavings.evaporationReductionPct}%`],
  ];

  doc.setFontSize(10);
  for (const [label, val] of details) {
    doc.setFont('helvetica', 'normal');
    doc.text(label, margin, y);
    doc.setFont('helvetica', 'bold');
    doc.text(val, pageWidth - margin, y, { align: 'right' });
    y += 5;
  }
  y += 4;

  // Constraints
  if (assessment.constraints.strategicCroppingLand || assessment.constraints.floodZone || assessment.gridConstraintWarning) {
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Constraints & Warnings', margin, y);
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    if (assessment.constraints.strategicCroppingLand) {
      doc.text('• Strategic Cropping Land — planning restrictions apply', margin, y);
      y += 5;
    }
    if (assessment.constraints.floodZone) {
      doc.text('• Flood zone — elevated panels recommended', margin, y);
      y += 5;
    }
    if (assessment.gridConstraintWarning) {
      const lines = doc.splitTextToSize(`• Grid Warning: ${assessment.gridConstraintWarning}`, pageWidth - margin * 2);
      doc.text(lines, margin, y);
      y += lines.length * 5;
    }
    y += 4;
  }

  // Footer
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Data: Geoscience Australia · BOM · QLD Spatial · Energy QLD DAPR 2025', margin, y);
  y += 4;
  doc.text('Estimates are indicative only and based on publicly available data. Not financial advice.', margin, y);
  y += 4;
  doc.text('Generated by AgriVolt — agrivolt-navy.vercel.app', margin, y);

  doc.save(`agrivolt-report-${assessment.coordinates.lat.toFixed(4)}-${assessment.coordinates.lng.toFixed(4)}.pdf`);
}

function loadImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('No canvas context'));
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = url;
  });
}
