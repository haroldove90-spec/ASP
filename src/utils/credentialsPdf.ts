import { jsPDF } from "jspdf";

export interface PredefinedUser {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  puesto: string;
  firma: string;
  password?: string;
}

export function downloadCredentialsPdf(users: PredefinedUser[]) {
  // Initialize jsPDF in portrait mode
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let currentY = 20;

  // Primary brand color: ASP Olive Green (#85AA1C)
  const primaryColor = { r: 133, g: 170, b: 28 };
  // Neutral dark color: Slate Gray (#1E293B)
  const darkColor = { r: 30, g: 41, b: 59 };
  // Secondary light gray (#F8FAFC)
  const lightGray = { r: 248, g: 250, b: 252 };
  // Slate secondary text (#64748B)
  const grayColor = { r: 100, g: 116, b: 139 };

  const drawHeader = () => {
    // Top colored accent bar
    doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.rect(0, 0, pageWidth, 5, "F");

    // Company logo and Title text
    doc.setTextColor(darkColor.r, darkColor.g, darkColor.b);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("ASP / EcH&S", margin, 20);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(grayColor.r, grayColor.g, grayColor.b);
    doc.text(
      "Análisis & Servicios Profesionales de Ecología, Consultoría, Higiene, & Seguridad Industrial",
      margin,
      25
    );

    // Decorative separator line
    doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.setLineWidth(0.8);
    doc.line(margin, 28, pageWidth - margin, 28);

    currentY = 36;
  };

  const drawFooter = (pageNumber: number, totalPages: number) => {
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(grayColor.r, grayColor.g, grayColor.b);
    
    // Bottom safety warning
    const warningText = "DOCUMENTO DE CONTROL INTERNO - CONFIDENCIAL - PROHIBIDA SU REPRODUCCIÓN NO AUTORIZADA";
    doc.text(warningText, margin, pageHeight - 12);

    // Page number
    const pageStr = `Página ${pageNumber} de ${totalPages}`;
    doc.text(pageStr, pageWidth - margin - doc.getTextWidth(pageStr), pageHeight - 12);

    // Footer divider line
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);
  };

  // Build Pages & Content
  drawHeader();

  // Document Title inside Page
  doc.setFillColor(lightGray.r, lightGray.g, lightGray.b);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 24, 3, 3, "FD");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.text("PORTAL DE CONTROL OPERATIVO & FIRMA DIGITAL", margin + 5, currentY + 6);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(darkColor.r, darkColor.g, darkColor.b);
  doc.text("CREDENCIALES OFICIALES DE ACCESO DE PERSONAL AUTORIZADO", margin + 5, currentY + 12);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(grayColor.r, grayColor.g, grayColor.b);
  doc.text(
    "Este reporte contiene el directorio del personal con firma electrónica (e.firma SAT) registrada para auditorías y certificaciones en el simulador.",
    margin + 5,
    currentY + 19
  );

  currentY += 32;

  // Group users logically for better presentation
  const roleGroups: { [key: string]: { label: string; list: PredefinedUser[] } } = {
    high: {
      label: "ALTA DIRECCIÓN & ADMINISTRACIÓN",
      list: users.filter(u => ["ceo", "dir_op", "dir_at_cl", "sys_admin"].includes(u.rol))
    },
    management: {
      label: "GERENCIA & CONTROL DE CALIDAD",
      list: users.filter(u => ["ger_tec", "ger_cal", "jefe_rep"].includes(u.rol))
    },
    operations: {
      label: "COORDINACIÓN & OPERACIONES EN LABORATORIO",
      list: users.filter(u => ["coord_lab", "jefe_op", "jefe_alm"].includes(u.rol))
    },
    field: {
      label: "INGENIERÍA & METRÓLOGOS DE CAMPO",
      list: users.filter(u => ["ing_campo"].includes(u.rol))
    }
  };

  let pageIndex = 1;

  // Let's draw each group
  Object.keys(roleGroups).forEach((groupKey) => {
    const group = roleGroups[groupKey];
    if (group.list.length === 0) return;

    // Check if we have enough space for the group header + at least 1 user (approx 45mm needed)
    if (currentY > pageHeight - 50) {
      // Add page
      doc.addPage();
      pageIndex++;
      drawHeader();
    }

    // Draw Group Header
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(margin, currentY, pageWidth - margin * 2, 7, "F");
    
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.4);
    doc.line(margin, currentY, margin, currentY + 7); // vertical left accent bar

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(darkColor.r, darkColor.g, darkColor.b);
    doc.text(group.label, margin + 4, currentY + 5);

    currentY += 10;

    // Table Headers
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(grayColor.r, grayColor.g, grayColor.b);
    
    doc.text("Puesto / Nombre", margin + 2, currentY);
    doc.text("Credenciales de Acceso", margin + 70, currentY);
    doc.text("Firma Digital SAT", margin + 130, currentY);

    currentY += 3;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 4;

    // Draw group users
    group.list.forEach((user) => {
      // Check if we need to wrap to next page for the user row (approx 18mm height)
      if (currentY > pageHeight - 30) {
        doc.addPage();
        pageIndex++;
        drawHeader();
        
        // Redraw table header on new page
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(grayColor.r, grayColor.g, grayColor.b);
        doc.text("Puesto / Nombre", margin + 2, currentY);
        doc.text("Credenciales de Acceso", margin + 70, currentY);
        doc.text("Firma Digital SAT", margin + 130, currentY);
        currentY += 3;
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 4;
      }

      // Draw subtle row background or divider
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, currentY + 12, pageWidth - margin, currentY + 12);

      // Col 1: Puesto & Name
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(darkColor.r, darkColor.g, darkColor.b);
      doc.text(user.nombre, margin + 2, currentY + 3);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(grayColor.r, grayColor.g, grayColor.b);
      doc.text(user.puesto || user.rol.toUpperCase(), margin + 2, currentY + 7);

      // Col 2: Email & Pass
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.text(user.email, margin + 70, currentY + 3);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(darkColor.r, darkColor.g, darkColor.b);
      doc.text("Contraseña: ", margin + 70, currentY + 7);
      
      const pwd = user.password || "ASPPass2026!";
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(6, 95, 70); // deep emerald green
      doc.text(pwd, margin + 87, currentY + 7);

      // Col 3: SAT Fingerprint
      doc.setFont("Courier", "normal");
      doc.setFontSize(7);
      doc.setTextColor(darkColor.r, darkColor.g, darkColor.b);
      
      const fingerprintPart1 = user.firma.split(" ")[0] || "SHA256:---";
      const fingerprintPart2 = user.firma.replace(fingerprintPart1, "").trim();
      
      doc.text(fingerprintPart1, margin + 130, currentY + 3);
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(6.5);
      doc.setTextColor(grayColor.r, grayColor.g, grayColor.b);
      doc.text(fingerprintPart2, margin + 130, currentY + 7);

      currentY += 14;
    });

    currentY += 6; // spacing after group
  });

  // Stamp all pages with page numbers
  const totalPages = pageIndex;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(i, totalPages);
  }

  // Save the PDF
  doc.save("ASP-EcHS-Credenciales-Acceso.pdf");
}
