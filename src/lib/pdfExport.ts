import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

export interface PdfExportOptions {
  filename: string;
  marginMm?: number;
  scale?: number;
  windowWidth?: number;
  onProgress?: (current: number, total: number) => void;
}

/**
 * Cleanly prepares an element for capture by disabling borders, shadows, and overflow clipping.
 */
function prepareElementForCapture(el: HTMLElement): () => void {
  const originalBorderRadius = el.style.borderRadius;
  const originalBoxShadow = el.style.boxShadow;
  const originalBorder = el.style.border;

  // Temporarily strip card aesthetics so PDF appears as crisp, official document paper
  el.style.borderRadius = "0px";
  el.style.boxShadow = "none";
  el.style.border = "none";

  const overflowEls = Array.from(el.querySelectorAll<HTMLElement>(".overflow-x-auto, .overflow-hidden"));
  const originalOverflows = overflowEls.map((o) => o.style.overflow);
  overflowEls.forEach((o) => {
    o.style.overflow = "visible";
  });

  return () => {
    el.style.borderRadius = originalBorderRadius;
    el.style.boxShadow = originalBoxShadow;
    el.style.border = originalBorder;
    overflowEls.forEach((o, idx) => {
      o.style.overflow = originalOverflows[idx];
    });
  };
}

/**
 * Finds safe vertical slice positions in canvas coordinates so no table row or block is cut in half.
 */
function calculateSafeBreakPoints(
  el: HTMLElement,
  canvasHeight: number,
  pageMaxHeightPx: number
): number[] {
  const elRect = el.getBoundingClientRect();
  const scaleY = canvasHeight / Math.max(1, elRect.height);

  // Query candidate boundary elements: rows, section headers, keep-together blocks
  const candidates = Array.from(
    el.querySelectorAll<HTMLElement>("tr, h2, h3, .keep-together, .section-header, .cbydp-signatories, .abyip-signatories, .budget-signatories")
  );

  const boundaries = candidates.map((c) => {
    const cRect = c.getBoundingClientRect();
    return {
      top: (cRect.top - elRect.top) * scaleY,
      bottom: (cRect.bottom - elRect.top) * scaleY,
    };
  });

  const breaks: number[] = [];
  let currentY = 0;

  while (currentY < canvasHeight) {
    const targetBottom = currentY + pageMaxHeightPx;

    if (targetBottom >= canvasHeight) {
      breaks.push(canvasHeight);
      break;
    }

    // Check if targetBottom cuts through any candidate boundary
    let safeBreak = targetBottom;
    for (const b of boundaries) {
      // If the cut point lies strictly inside a row or block
      if (b.top < targetBottom && b.bottom > targetBottom) {
        // If the top is ahead of our current start point by at least 30% of page height, cut before it
        if (b.top > currentY + pageMaxHeightPx * 0.3) {
          safeBreak = b.top;
          break;
        }
      }
    }

    breaks.push(safeBreak);
    currentY = safeBreak;
  }

  return breaks;
}

/**
 * Exports DOM page elements into an official, un-distorted Landscape A4 PDF document.
 * Strictly adheres to A4 landscape standards (297mm x 210mm) at 100% scale.
 * When tables or PPA entries exceed one page, they automatically continue to the next A4 page
 * without cutting rows or squishing text.
 */
export async function exportOfficialLandscapePdf(
  elements: HTMLElement[],
  options: PdfExportOptions
): Promise<void> {
  if (!elements || elements.length === 0) {
    throw new Error("No pages available for PDF export.");
  }

  const margin = options.marginMm ?? 8;
  const scale = options.scale ?? 2;
  const windowWidth = options.windowWidth ?? 1200;

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pdfWidth = 297; // mm
  const pdfHeight = 210; // mm
  const targetWidth = pdfWidth - margin * 2; // e.g. 281 mm
  const maxHeightPerPage = pdfHeight - margin * 2; // e.g. 194 mm

  let totalPagesCreated = 0;

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (options.onProgress) {
      options.onProgress(i + 1, elements.length);
    }

    // Clean element from UI cards/shadows/overflow clipping
    const restoreStyles = prepareElementForCapture(el);

    let canvas: HTMLCanvasElement;
    try {
      canvas = await html2canvas(el, {
        scale,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth,
        scrollY: 0,
        scrollX: 0,
      });
    } finally {
      restoreStyles();
    }

    const cW = canvas.width;
    const cH = canvas.height;
    // Maximum height that fits on one A4 landscape page in canvas pixels:
    const pageMaxHeightPx = (maxHeightPerPage / targetWidth) * cW;

    // Tolerance of 10px (~1mm) to prevent unnecessary pagination of single-page covers
    if (cH <= pageMaxHeightPx + 15) {
      // Element fits entirely on ONE page (e.g. Front Cover Page)
      if (totalPagesCreated > 0) {
        pdf.addPage("a4", "landscape");
      }
      totalPagesCreated++;

      const imgHeightMm = (cH * targetWidth) / cW;
      const yOffset = margin + Math.max(0, (maxHeightPerPage - imgHeightMm) / 2);
      const imgData = canvas.toDataURL("image/jpeg", 0.98);

      pdf.addImage(
        imgData,
        "JPEG",
        margin,
        yOffset,
        targetWidth,
        imgHeightMm,
        undefined,
        "FAST"
      );
    } else {
      // Element exceeds one page (e.g. Center of Participation with many PPA entries):
      // Automatically continue to next page(s) by slicing at clean row boundaries!
      const breakPoints = calculateSafeBreakPoints(el, cH, pageMaxHeightPx);

      let sliceStartY = 0;
      for (const sliceEndY of breakPoints) {
        const sliceHeightPx = sliceEndY - sliceStartY;
        if (sliceHeightPx <= 0) continue;

        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = cW;
        sliceCanvas.height = sliceHeightPx;
        const ctx = sliceCanvas.getContext("2d");

        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, cW, sliceHeightPx);
          ctx.drawImage(
            canvas,
            0,
            sliceStartY,
            cW,
            sliceHeightPx,
            0,
            0,
            cW,
            sliceHeightPx
          );
        }

        if (totalPagesCreated > 0) {
          pdf.addPage("a4", "landscape");
        }
        totalPagesCreated++;

        const sliceHeightMm = (sliceHeightPx * targetWidth) / cW;
        const imgData = sliceCanvas.toDataURL("image/jpeg", 0.98);

        pdf.addImage(
          imgData,
          "JPEG",
          margin,
          margin,
          targetWidth,
          sliceHeightMm,
          undefined,
          "FAST"
        );

        sliceStartY = sliceEndY;
      }
    }
  }

  pdf.save(options.filename);
}
