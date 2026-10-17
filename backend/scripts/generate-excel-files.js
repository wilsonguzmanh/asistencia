const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const docsDir = path.resolve(__dirname, '../../docs');
const plantillasDir = path.join(docsDir, 'plantillas_excel');

if (!fs.existsSync(plantillasDir)) {
  fs.mkdirSync(plantillasDir, { recursive: true });
}

// Estilos corporativos profesionales
const PALETTE = {
  headerFillNavy: '1E293B',    // Slate 900
  headerFillIndigo: '4338CA',  // Indigo 700
  headerFillEmerald: '047857', // Emerald 700
  headerFillRose: 'BE123C',    // Rose 700
  headerFillAmber: 'B45309',   // Amber 700
  textWhite: 'FFFFFF',
  textDark: '0F172A',
  rowEven: 'F8FAFC',
  rowOdd: 'FFFFFF',
  rowErrorHighlight: 'FFF1F2', // Rose 50
  borderLight: 'CBD5E1',       // Slate 300
  accentPresent: 'DCFCE7',     // Green 100
  textPresent: '166534',       // Green 800
  accentAbsent: 'FEE2E2',      // Red 100
  textAbsent: '991B1B',        // Red 800
};

const fontHeader = {
  name: 'Segoe UI',
  size: 11,
  bold: true,
  color: { argb: PALETTE.textWhite },
};

const fontData = {
  name: 'Segoe UI',
  size: 10,
  color: { argb: PALETTE.textDark },
};

const borderThin = {
  top: { style: 'thin', color: { argb: PALETTE.borderLight } },
  left: { style: 'thin', color: { argb: PALETTE.borderLight } },
  bottom: { style: 'thin', color: { argb: PALETTE.borderLight } },
  right: { style: 'thin', color: { argb: PALETTE.borderLight } },
};

// -------------------------------------------------------------
// 1. Plantilla de Estudiantes Válida
// -------------------------------------------------------------
async function generateValidStudentsFile() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistema de Asistencia Postgrado';
  workbook.created = new Date();

  // Hoja 1: Estudiantes
  const sheet = workbook.addWorksheet('Estudiantes', {
    views: [{ showGridLines: true }],
  });

  sheet.columns = [
    { header: 'Número de registro', key: 'reg', width: 22 },
    { header: 'Nombre completo', key: 'name', width: 35 },
    { header: 'Correo electrónico', key: 'email', width: 35 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = fontHeader;
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: PALETTE.headerFillIndigo },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = borderThin;
  });

  const students = [
    { reg: '1001', name: 'Juan Pérez Gómez', email: 'juan.perez@postgrado.edu.bo' },
    { reg: '1002', name: 'María López Fernández', email: 'maria.lopez@postgrado.edu.bo' },
    { reg: '1003', name: 'Carlos Ruiz Morales', email: 'carlos.ruiz@postgrado.edu.bo' },
    { reg: '1004', name: 'Ana Rodríguez Vaca', email: 'ana.rodriguez@postgrado.edu.bo' },
    { reg: '1005', name: 'David Mamani Quispe', email: 'david.mamani@postgrado.edu.bo' },
    { reg: '1006', name: 'Sofía Vargas Torrico', email: 'sofia.vargas@postgrado.edu.bo' },
    { reg: '1007', name: 'Lucas Mendoza Castro', email: 'lucas.mendoza@postgrado.edu.bo' },
    { reg: '1008', name: 'Valentina Flores Soliz', email: 'valentina.flores@postgrado.edu.bo' },
    { reg: '1009', name: 'Mateo Fernández Chávez', email: 'mateo.fernandez@postgrado.edu.bo' },
    { reg: '1010', name: 'Camila Gutiérrez Paz', email: 'camila.gutierrez@postgrado.edu.bo' },
    { reg: '1011', name: 'Diego Morales Pinto', email: 'diego.morales@postgrado.edu.bo' },
    { reg: '1012', name: 'Lucía Castro Ortiz', email: 'lucia.castro@postgrado.edu.bo' },
    { reg: '1013', name: 'Gabriel Romero Dorado', email: 'gabriel.romero@postgrado.edu.bo' },
    { reg: '1014', name: 'Valeria Suárez Justiniano', email: 'valeria.suarez@postgrado.edu.bo' },
    { reg: '1015', name: 'Alejandro Rojas Aguilera', email: 'alejandro.rojas@postgrado.edu.bo' },
    { reg: '1016', name: 'Patricia Claros Méndez', email: 'patricia.claros@postgrado.edu.bo' },
    { reg: '1017', name: 'Rodrigo Alarcón Silva', email: 'rodrigo.alarcon@postgrado.edu.bo' },
    { reg: '1018', name: 'Natalia Benítez Peña', email: 'natalia.benitez@postgrado.edu.bo' },
    { reg: '1019', name: 'Fernando Quiroga Soto', email: 'fernando.quiroga@postgrado.edu.bo' },
    { reg: '1020', name: 'Daniela Céspedes Ramos', email: 'daniela.cespedes@postgrado.edu.bo' },
    { reg: '1021', name: 'Andrés Barrientos Terán', email: 'andres.barrientos@postgrado.edu.bo' },
    { reg: '1022', name: 'Mariana Zeballos Cuéllar', email: 'mariana.zeballos@postgrado.edu.bo' },
    { reg: '1023', name: 'Jorge Escalante Vedia', email: 'jorge.escalante@postgrado.edu.bo' },
    { reg: '1024', name: 'Claudia Mercado Salazar', email: 'claudia.mercado@postgrado.edu.bo' },
    { reg: '1025', name: 'Sebastián Vaca Guzmán', email: 'sebastian.vaca@postgrado.edu.bo' },
  ];

  students.forEach((s, idx) => {
    const row = sheet.addRow([s.reg, s.name, s.email]);
    row.height = 20;
    const isEven = idx % 2 === 0;
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(2).alignment = { vertical: 'middle', horizontal: 'left' };
    row.getCell(3).alignment = { vertical: 'middle', horizontal: 'left' };

    row.eachCell((cell) => {
      cell.font = fontData;
      cell.border = borderThin;
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isEven ? PALETTE.rowOdd : PALETTE.rowEven },
      };
    });
  });

  // Hoja 2: Instrucciones
  const instSheet = workbook.addWorksheet('Instrucciones', {
    views: [{ showGridLines: true }],
  });
  instSheet.columns = [
    { header: 'Columna', key: 'col', width: 25 },
    { header: 'Tipo de Dato', key: 'type', width: 20 },
    { header: 'Obligatorio', key: 'req', width: 15 },
    { header: 'Reglas y Validaciones', key: 'desc', width: 60 },
  ];
  const instHeader = instSheet.getRow(1);
  instHeader.height = 26;
  instHeader.eachCell((cell) => {
    cell.font = fontHeader;
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: PALETTE.headerFillNavy },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const instData = [
    ['Número de registro', 'Texto / Numérico', 'SÍ', 'Identificador único del estudiante. No se permiten valores duplicados en el archivo (RN-02).'],
    ['Nombre completo', 'Texto', 'SÍ', 'Nombres y apellidos completos del estudiante (mínimo 3 caracteres).'],
    ['Correo electrónico', 'Texto (Email)', 'SÍ', 'Dirección de correo válida con formato estándar usuario@dominio.com.'],
  ];

  instData.forEach((d) => {
    const r = instSheet.addRow(d);
    r.height = 22;
    r.eachCell((c) => {
      c.font = fontData;
      c.border = borderThin;
      c.alignment = { vertical: 'middle' };
    });
  });

  const filePath1 = path.join(plantillasDir, '01_plantilla_estudiantes_valida.xlsx');
  const filePath2 = path.join(docsDir, 'plantilla_estudiantes.xlsx');
  await workbook.xlsx.writeFile(filePath1);
  await workbook.xlsx.writeFile(filePath2);
  console.log('✅ Generado:', filePath1);
  console.log('✅ Generado:', filePath2);
}

// -------------------------------------------------------------
// 2. Plantilla de Fechas y Horarios Válida
// -------------------------------------------------------------
async function generateValidSchedulesFile() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistema de Asistencia Postgrado';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Calendario', {
    views: [{ showGridLines: true }],
  });

  sheet.columns = [
    { header: 'Fecha', key: 'date', width: 20 },
    { header: 'Hora inicio', key: 'start', width: 20 },
    { header: 'Hora fin', key: 'end', width: 20 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = fontHeader;
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: PALETTE.headerFillEmerald },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = borderThin;
  });

  const schedules = [
    { date: '19/10/2026', start: '18:30', end: '21:30' },
    { date: '21/10/2026', start: '18:30', end: '21:30' },
    { date: '23/10/2026', start: '18:30', end: '21:30' },
    { date: '26/10/2026', start: '18:30', end: '21:30' },
    { date: '28/10/2026', start: '18:30', end: '21:30' },
    { date: '30/10/2026', start: '18:30', end: '21:30' },
    { date: '02/11/2026', start: '18:30', end: '21:30' },
    { date: '04/11/2026', start: '18:30', end: '21:30' },
    { date: '06/11/2026', start: '18:30', end: '21:30' },
    { date: '09/11/2026', start: '18:30', end: '21:30' },
    { date: '11/11/2026', start: '18:30', end: '21:30' },
    { date: '13/11/2026', start: '18:30', end: '21:30' },
  ];

  schedules.forEach((s, idx) => {
    const row = sheet.addRow([s.date, s.start, s.end]);
    row.height = 20;
    const isEven = idx % 2 === 0;
    row.eachCell((cell) => {
      cell.font = fontData;
      cell.border = borderThin;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isEven ? PALETTE.rowOdd : PALETTE.rowEven },
      };
    });
  });

  // Hoja 2: Instrucciones
  const instSheet = workbook.addWorksheet('Instrucciones', {
    views: [{ showGridLines: true }],
  });
  instSheet.columns = [
    { header: 'Columna', key: 'col', width: 22 },
    { header: 'Formato Requerido', key: 'fmt', width: 25 },
    { header: 'Reglas de Validación', key: 'rules', width: 65 },
  ];
  const instHeader = instSheet.getRow(1);
  instHeader.height = 26;
  instHeader.eachCell((cell) => {
    cell.font = fontHeader;
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: PALETTE.headerFillNavy },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const instData = [
    ['Fecha', 'DD/MM/YYYY o YYYY-MM-DD', 'Día en que se habilita la marcación de asistencia (RN-04). No se permiten fechas duplicadas en el archivo.'],
    ['Hora inicio', 'HH:mm (24 horas)', 'Horario oficial de inicio (informativo RF-12). Debe ser cronológicamente anterior a Hora fin.'],
    ['Hora fin', 'HH:mm (24 horas)', 'Horario oficial de conclusión (informativo RF-12). Debe ser cronológicamente posterior a Hora inicio.'],
  ];

  instData.forEach((d) => {
    const r = instSheet.addRow(d);
    r.height = 22;
    r.eachCell((c) => {
      c.font = fontData;
      c.border = borderThin;
      c.alignment = { vertical: 'middle' };
    });
  });

  const filePath1 = path.join(plantillasDir, '02_plantilla_fechas_horarios_valida.xlsx');
  const filePath2 = path.join(docsDir, 'plantilla_fechas_horarios.xlsx');
  await workbook.xlsx.writeFile(filePath1);
  await workbook.xlsx.writeFile(filePath2);
  console.log('✅ Generado:', filePath1);
  console.log('✅ Generado:', filePath2);
}

// -------------------------------------------------------------
// 3. Plantilla de Estudiantes con Errores de Prueba
// -------------------------------------------------------------
async function generateErrorStudentsFile() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'QA & Testing Asistencia';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Estudiantes (Con Errores)', {
    views: [{ showGridLines: true }],
  });

  sheet.columns = [
    { header: 'Número de registro', key: 'reg', width: 22 },
    { header: 'Nombre completo', key: 'name', width: 32 },
    { header: 'Correo electrónico', key: 'email', width: 32 },
    { header: 'Motivo del Error de Prueba', key: 'reason', width: 45 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = fontHeader;
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: PALETTE.headerFillRose },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = borderThin;
  });

  const testRows = [
    { reg: '1001', name: 'Juan Pérez Gómez', email: 'juan.perez@postgrado.edu.bo', err: 'Fila válida base', valid: true },
    { reg: '1002', name: 'María López Fernández', email: 'maria.lopez@postgrado.edu.bo', err: 'Fila válida base', valid: true },
    { reg: '1001', name: 'Juan Pérez Duplicado', email: 'juan.clon@postgrado.edu.bo', err: 'ERROR RN-02: Matrícula "1001" repetida (duplicada de Fila 2)', valid: false },
    { reg: '', name: 'Carlos Morales Sin Registro', email: 'carlos.morales@postgrado.edu.bo', err: 'ERROR: Número de registro obligatorio no proporcionado', valid: false },
    { reg: '1005', name: '', email: 'david.mamani@postgrado.edu.bo', err: 'ERROR: Nombre completo obligatorio no proporcionado', valid: false },
    { reg: '1006', name: 'Sofía Vargas Torrico', email: '', err: 'ERROR: Correo electrónico obligatorio no proporcionado', valid: false },
    { reg: '1007', name: 'Lucas Mendoza Castro', email: 'correo-sin-arroba-ni-extension', err: 'ERROR: Formato de correo electrónico no cumple sintaxis estándar', valid: false },
    { reg: '1008', name: 'Valentina Flores Soliz', email: 'valentina@@gmail..com', err: 'ERROR: Sintaxis de correo con doble símbolo inválida', valid: false },
    { reg: '1002', name: 'María López Clon', email: 'maria.clon@postgrado.edu.bo', err: 'ERROR RN-02: Matrícula "1002" repetida (duplicada de Fila 3)', valid: false },
    { reg: '1010', name: 'Camila Gutiérrez Paz', email: 'camila.gutierrez@postgrado.edu.bo', err: 'Fila válida normal', valid: true },
  ];

  testRows.forEach((r) => {
    const row = sheet.addRow([r.reg, r.name, r.email, r.err]);
    row.height = 22;
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(2).alignment = { vertical: 'middle', horizontal: 'left' };
    row.getCell(3).alignment = { vertical: 'middle', horizontal: 'left' };
    row.getCell(4).alignment = { vertical: 'middle', horizontal: 'left' };

    row.eachCell((cell, colNum) => {
      cell.border = borderThin;
      cell.font = fontData;
      if (!r.valid) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: PALETTE.rowErrorHighlight },
        };
        if (colNum === 4) {
          cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: PALETTE.textAbsent } };
        }
      }
    });
  });

  const filePath = path.join(plantillasDir, '03_plantilla_estudiantes_con_errores_prueba.xlsx');
  await workbook.xlsx.writeFile(filePath);
  console.log('✅ Generado:', filePath);
}

// -------------------------------------------------------------
// 4. Plantilla de Fechas y Horarios con Errores de Prueba
// -------------------------------------------------------------
async function generateErrorSchedulesFile() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'QA & Testing Asistencia';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Calendario (Con Errores)', {
    views: [{ showGridLines: true }],
  });

  sheet.columns = [
    { header: 'Fecha', key: 'date', width: 20 },
    { header: 'Hora inicio', key: 'start', width: 18 },
    { header: 'Hora fin', key: 'end', width: 18 },
    { header: 'Motivo del Error de Prueba', key: 'reason', width: 48 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = fontHeader;
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: PALETTE.headerFillAmber },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = borderThin;
  });

  const testRows = [
    { date: '19/10/2026', start: '18:30', end: '21:30', err: 'Fila válida base', valid: true },
    { date: '21/10/2026', start: '18:30', end: '21:30', err: 'Fila válida base', valid: true },
    { date: '19/10/2026', start: '19:00', end: '22:00', err: 'ERROR RN-04: Fecha "19/10/2026" repetida en el archivo', valid: false },
    { date: '23/10/2026', start: '22:00', end: '18:30', err: 'ERROR LÓGICO: Hora fin (18:30) no es posterior a Hora inicio (22:00)', valid: false },
    { date: '26/10/2026', start: '25:99', end: '21:30', err: 'ERROR DE FORMATO: Hora de inicio no cumple reloj de 24h', valid: false },
    { date: '28/10/2026', start: '18:30', end: 'hora_invalida', err: 'ERROR DE FORMATO: Hora de fin no cumple formato HH:mm', valid: false },
    { date: 'fecha_invalida', start: '18:30', end: '21:30', err: 'ERROR DE FECHA: Cadena no interpretable como DD/MM/YYYY', valid: false },
    { date: '', start: '18:30', end: '21:30', err: 'ERROR OBLIGATORIO: Celda de fecha completamente vacía', valid: false },
    { date: '30/10/2026', start: '', end: '21:30', err: 'ERROR OBLIGATORIO: Hora de inicio vacía', valid: false },
    { date: '02/11/2026', start: '18:30', end: '21:30', err: 'Fila válida normal', valid: true },
  ];

  testRows.forEach((r) => {
    const row = sheet.addRow([r.date, r.start, r.end, r.err]);
    row.height = 22;
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(3).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(4).alignment = { vertical: 'middle', horizontal: 'left' };

    row.eachCell((cell, colNum) => {
      cell.border = borderThin;
      cell.font = fontData;
      if (!r.valid) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: PALETTE.rowErrorHighlight },
        };
        if (colNum === 4) {
          cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: PALETTE.textAbsent } };
        }
      }
    });
  });

  const filePath = path.join(plantillasDir, '04_plantilla_fechas_horarios_con_errores_prueba.xlsx');
  await workbook.xlsx.writeFile(filePath);
  console.log('✅ Generado:', filePath);
}

// -------------------------------------------------------------
// 5. Plantilla de Módulo Completo Multilista (Master Workbook)
// -------------------------------------------------------------
async function generateMasterModuleFile() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Dirección de Postgrado';
  workbook.created = new Date();

  // Hoja 1: Ficha del Módulo
  const metaSheet = workbook.addWorksheet('Información del Módulo', {
    views: [{ showGridLines: true }],
  });
  metaSheet.columns = [
    { header: 'Parámetro', key: 'key', width: 28 },
    { header: 'Valor Propuesto', key: 'val', width: 45 },
    { header: 'Instrucciones del Sistema', key: 'obs', width: 50 },
  ];
  const metaHeader = metaSheet.getRow(1);
  metaHeader.height = 28;
  metaHeader.eachCell((cell) => {
    cell.font = fontHeader;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PALETTE.headerFillNavy } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const metaRows = [
    ['Nombre del Módulo', 'Módulo 2: Infraestructura como Código (IaC)', 'Ingresar en el formulario del Asistente (Paso 3)'],
    ['Código de Módulo', 'DCID-V1E1-M2', 'Identificador único institucional (RN-01)'],
    ['Docente / Facilitador', 'Ing. Especialista en DevOps & Cloud', 'Informativo para la gestión académica'],
    ['Modalidad', 'Virtual Sincrónica', 'Plataforma Zoom / Teams'],
    ['Total Estudiantes', '30 alumnos', 'Definidos en la pestaña "Estudiantes"'],
    ['Total Sesiones', '12 clases', 'Definidas en la pestaña "Fechas y Horarios"'],
    ['Horario Oficial', '18:30 a 21:30', 'Habilitación de marcación diaria de 00:00 a 23:59'],
  ];

  metaRows.forEach((r) => {
    const row = metaSheet.addRow(r);
    row.height = 22;
    row.eachCell((c) => {
      c.font = fontData;
      c.border = borderThin;
      c.alignment = { vertical: 'middle' };
    });
  });

  // Hoja 2: Estudiantes
  const stuSheet = workbook.addWorksheet('Estudiantes', {
    views: [{ showGridLines: true }],
  });
  stuSheet.columns = [
    { header: 'Número de registro', key: 'reg', width: 22 },
    { header: 'Nombre completo', key: 'name', width: 35 },
    { header: 'Correo electrónico', key: 'email', width: 35 },
  ];
  const stuHeader = stuSheet.getRow(1);
  stuHeader.height = 28;
  stuHeader.eachCell((cell) => {
    cell.font = fontHeader;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PALETTE.headerFillIndigo } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const allStudents = [
    { reg: '1001', name: 'Juan Pérez Gómez', email: 'juan.perez@postgrado.edu.bo' },
    { reg: '1002', name: 'María López Fernández', email: 'maria.lopez@postgrado.edu.bo' },
    { reg: '1003', name: 'Carlos Ruiz Morales', email: 'carlos.ruiz@postgrado.edu.bo' },
    { reg: '1004', name: 'Ana Rodríguez Vaca', email: 'ana.rodriguez@postgrado.edu.bo' },
    { reg: '1005', name: 'David Mamani Quispe', email: 'david.mamani@postgrado.edu.bo' },
    { reg: '1006', name: 'Sofía Vargas Torrico', email: 'sofia.vargas@postgrado.edu.bo' },
    { reg: '1007', name: 'Lucas Mendoza Castro', email: 'lucas.mendoza@postgrado.edu.bo' },
    { reg: '1008', name: 'Valentina Flores Soliz', email: 'valentina.flores@postgrado.edu.bo' },
    { reg: '1009', name: 'Mateo Fernández Chávez', email: 'mateo.fernandez@postgrado.edu.bo' },
    { reg: '1010', name: 'Camila Gutiérrez Paz', email: 'camila.gutierrez@postgrado.edu.bo' },
    { reg: '1011', name: 'Diego Morales Pinto', email: 'diego.morales@postgrado.edu.bo' },
    { reg: '1012', name: 'Lucía Castro Ortiz', email: 'lucia.castro@postgrado.edu.bo' },
    { reg: '1013', name: 'Gabriel Romero Dorado', email: 'gabriel.romero@postgrado.edu.bo' },
    { reg: '1014', name: 'Valeria Suárez Justiniano', email: 'valeria.suarez@postgrado.edu.bo' },
    { reg: '1015', name: 'Alejandro Rojas Aguilera', email: 'alejandro.rojas@postgrado.edu.bo' },
    { reg: '1016', name: 'Patricia Claros Méndez', email: 'patricia.claros@postgrado.edu.bo' },
    { reg: '1017', name: 'Rodrigo Alarcón Silva', email: 'rodrigo.alarcon@postgrado.edu.bo' },
    { reg: '1018', name: 'Natalia Benítez Peña', email: 'natalia.benitez@postgrado.edu.bo' },
    { reg: '1019', name: 'Fernando Quiroga Soto', email: 'fernando.quiroga@postgrado.edu.bo' },
    { reg: '1020', name: 'Daniela Céspedes Ramos', email: 'daniela.cespedes@postgrado.edu.bo' },
    { reg: '1021', name: 'Andrés Barrientos Terán', email: 'andres.barrientos@postgrado.edu.bo' },
    { reg: '1022', name: 'Mariana Zeballos Cuéllar', email: 'mariana.zeballos@postgrado.edu.bo' },
    { reg: '1023', name: 'Jorge Escalante Vedia', email: 'jorge.escalante@postgrado.edu.bo' },
    { reg: '1024', name: 'Claudia Mercado Salazar', email: 'claudia.mercado@postgrado.edu.bo' },
    { reg: '1025', name: 'Sebastián Vaca Guzmán', email: 'sebastian.vaca@postgrado.edu.bo' },
    { reg: '1026', name: 'Paula Justiniano Suárez', email: 'paula.justiniano@postgrado.edu.bo' },
    { reg: '1027', name: 'Mauricio Pinto Antelo', email: 'mauricio.pinto@postgrado.edu.bo' },
    { reg: '1028', name: 'Romina Daza Ribera', email: 'romina.daza@postgrado.edu.bo' },
    { reg: '1029', name: 'Gonzalo Soria Galvarro', email: 'gonzalo.soria@postgrado.edu.bo' },
    { reg: '1030', name: 'Silvia Landívar Bravo', email: 'silvia.landivar@postgrado.edu.bo' },
  ];

  allStudents.forEach((s, idx) => {
    const row = stuSheet.addRow([s.reg, s.name, s.email]);
    row.height = 20;
    const isEven = idx % 2 === 0;
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(2).alignment = { vertical: 'middle', horizontal: 'left' };
    row.getCell(3).alignment = { vertical: 'middle', horizontal: 'left' };
    row.eachCell((c) => {
      c.font = fontData;
      c.border = borderThin;
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? PALETTE.rowOdd : PALETTE.rowEven } };
    });
  });

  // Hoja 3: Calendario
  const schSheet = workbook.addWorksheet('Fechas y Horarios', {
    views: [{ showGridLines: true }],
  });
  schSheet.columns = [
    { header: 'Fecha', key: 'date', width: 20 },
    { header: 'Hora inicio', key: 'start', width: 20 },
    { header: 'Hora fin', key: 'end', width: 20 },
  ];
  const schHeader = schSheet.getRow(1);
  schHeader.height = 28;
  schHeader.eachCell((cell) => {
    cell.font = fontHeader;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PALETTE.headerFillEmerald } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const allDates = [
    { date: '19/10/2026', start: '18:30', end: '21:30' },
    { date: '21/10/2026', start: '18:30', end: '21:30' },
    { date: '23/10/2026', start: '18:30', end: '21:30' },
    { date: '26/10/2026', start: '18:30', end: '21:30' },
    { date: '28/10/2026', start: '18:30', end: '21:30' },
    { date: '30/10/2026', start: '18:30', end: '21:30' },
    { date: '02/11/2026', start: '18:30', end: '21:30' },
    { date: '04/11/2026', start: '18:30', end: '21:30' },
    { date: '06/11/2026', start: '18:30', end: '21:30' },
    { date: '09/11/2026', start: '18:30', end: '21:30' },
    { date: '11/11/2026', start: '18:30', end: '21:30' },
    { date: '13/11/2026', start: '18:30', end: '21:30' },
    { date: '16/11/2026', start: '18:30', end: '21:30' },
    { date: '18/11/2026', start: '18:30', end: '21:30' },
    { date: '20/11/2026', start: '18:30', end: '21:30' },
  ];

  allDates.forEach((d, idx) => {
    const row = schSheet.addRow([d.date, d.start, d.end]);
    row.height = 20;
    const isEven = idx % 2 === 0;
    row.eachCell((c) => {
      c.font = fontData;
      c.border = borderThin;
      c.alignment = { vertical: 'middle', horizontal: 'center' };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? PALETTE.rowOdd : PALETTE.rowEven } };
    });
  });

  const filePath = path.join(plantillasDir, '05_plantilla_carga_masiva_modulo_completo.xlsx');
  await workbook.xlsx.writeFile(filePath);
  console.log('✅ Generado:', filePath);
}

// -------------------------------------------------------------
// 6. Matriz de Asistencias de Referencia (US-13, RF-17)
// -------------------------------------------------------------
async function generateAttendanceMatrixReference() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Dirección de Postgrado';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Matriz de Asistencia', {
    views: [{ showGridLines: true }],
  });

  // Título Institucional
  sheet.mergeCells('A1:N1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'PLANILLA CONSOLIDADA DE ASISTENCIAS - DIRECCIÓN DE POSTGRADO';
  titleCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: PALETTE.textWhite } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PALETTE.headerFillNavy } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(1).height = 34;

  // Subtítulo con metadata
  sheet.mergeCells('A2:N2');
  const metaCell = sheet.getCell('A2');
  metaCell.value = 'Módulo: Infraestructura como Código (IaC) | Código: DCID-V1E1-M2 | Estado: ACTIVO | Descargado: 14/10/2026';
  metaCell.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: PALETTE.textWhite } };
  metaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '334155' } }; // Slate 700
  metaCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(2).height = 22;

  // Encabezados de tabla en Fila 3
  const classDates = ['19/10/2026', '21/10/2026', '23/10/2026', '26/10/2026', '28/10/2026', '30/10/2026', '02/11/2026', '04/11/2026'];
  const headers = [
    'Nro. Registro',
    'Nombre Completo',
    'Correo Electrónico',
    ...classDates,
    'Presentes (P)',
    'Faltas (F)',
    '% Asistencia',
  ];

  sheet.getRow(3).values = headers;
  sheet.getRow(3).height = 26;
  sheet.getRow(3).eachCell((cell, colNum) => {
    cell.font = fontHeader;
    cell.border = borderThin;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    if (colNum <= 3) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PALETTE.headerFillIndigo } };
    } else if (colNum <= 3 + classDates.length) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PALETTE.headerFillEmerald } };
    } else {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PALETTE.headerFillNavy } };
    }
  });

  sheet.getColumn(1).width = 16;
  sheet.getColumn(2).width = 30;
  sheet.getColumn(3).width = 32;
  for (let i = 4; i <= 3 + classDates.length; i++) {
    sheet.getColumn(i).width = 14;
  }
  sheet.getColumn(4 + classDates.length).width = 15;
  sheet.getColumn(5 + classDates.length).width = 15;
  sheet.getColumn(6 + classDates.length).width = 16;

  // 15 Estudiantes con asistencias simuladas
  const mockRows = [
    { reg: '1001', name: 'Juan Pérez Gómez', email: 'juan.perez@postgrado.edu.bo', marks: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'] },
    { reg: '1002', name: 'María López Fernández', email: 'maria.lopez@postgrado.edu.bo', marks: ['P', 'P', 'F', 'P', 'P', 'P', 'P', 'P'] },
    { reg: '1003', name: 'Carlos Ruiz Morales', email: 'carlos.ruiz@postgrado.edu.bo', marks: ['P', 'F', 'F', 'P', 'P', 'F', 'P', 'P'] },
    { reg: '1004', name: 'Ana Rodríguez Vaca', email: 'ana.rodriguez@postgrado.edu.bo', marks: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'] },
    { reg: '1005', name: 'David Mamani Quispe', email: 'david.mamani@postgrado.edu.bo', marks: ['P', 'P', 'P', 'F', 'P', 'P', 'P', 'P'] },
    { reg: '1006', name: 'Sofía Vargas Torrico', email: 'sofia.vargas@postgrado.edu.bo', marks: ['F', 'P', 'P', 'P', 'P', 'P', 'P', 'P'] },
    { reg: '1007', name: 'Lucas Mendoza Castro', email: 'lucas.mendoza@postgrado.edu.bo', marks: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'] },
    { reg: '1008', name: 'Valentina Flores Soliz', email: 'valentina.flores@postgrado.edu.bo', marks: ['P', 'F', 'P', 'P', 'P', 'P', 'F', 'P'] },
    { reg: '1009', name: 'Mateo Fernández Chávez', email: 'mateo.fernandez@postgrado.edu.bo', marks: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'] },
    { reg: '1010', name: 'Camila Gutiérrez Paz', email: 'camila.gutierrez@postgrado.edu.bo', marks: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'F'] },
    { reg: '1011', name: 'Diego Morales Pinto', email: 'diego.morales@postgrado.edu.bo', marks: ['P', 'P', 'F', 'F', 'P', 'P', 'P', 'P'] },
    { reg: '1012', name: 'Lucía Castro Ortiz', email: 'lucia.castro@postgrado.edu.bo', marks: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'] },
    { reg: '1013', name: 'Gabriel Romero Dorado', email: 'gabriel.romero@postgrado.edu.bo', marks: ['F', 'F', 'P', 'P', 'P', 'P', 'P', 'P'] },
    { reg: '1014', name: 'Valeria Suárez Justiniano', email: 'valeria.suarez@postgrado.edu.bo', marks: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'] },
    { reg: '1015', name: 'Alejandro Rojas Aguilera', email: 'alejandro.rojas@postgrado.edu.bo', marks: ['P', 'P', 'P', 'P', 'F', 'P', 'P', 'P'] },
  ];

  mockRows.forEach((item, idx) => {
    const rowNum = 4 + idx;
    const dateStartCol = 'D';
    const dateEndCol = 'K';

    const pFormula = `COUNTIF(${dateStartCol}${rowNum}:${dateEndCol}${rowNum}, "P")`;
    const fFormula = `COUNTIF(${dateStartCol}${rowNum}:${dateEndCol}${rowNum}, "F")`;
    const pctFormula = `L${rowNum}/(L${rowNum}+M${rowNum})`;

    const rowValues = [
      item.reg,
      item.name,
      item.email,
      ...item.marks,
      { formula: pFormula },
      { formula: fFormula },
      { formula: pctFormula },
    ];

    const row = sheet.addRow(rowValues);
    row.height = 20;

    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(2).alignment = { vertical: 'middle', horizontal: 'left' };
    row.getCell(3).alignment = { vertical: 'middle', horizontal: 'left' };

    // Formatear marcas de clase P y F
    for (let c = 4; c <= 3 + classDates.length; c++) {
      const cell = row.getCell(c);
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      const val = item.marks[c - 4];
      if (val === 'P') {
        cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: PALETTE.textPresent } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PALETTE.accentPresent } };
      } else {
        cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: PALETTE.textAbsent } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PALETTE.accentAbsent } };
      }
    }

    // Totales y Porcentaje
    const pCell = row.getCell(12);
    const fCell = row.getCell(13);
    const pctCell = row.getCell(14);

    pCell.alignment = { vertical: 'middle', horizontal: 'center' };
    fCell.alignment = { vertical: 'middle', horizontal: 'center' };
    pctCell.alignment = { vertical: 'middle', horizontal: 'center' };
    pctCell.numFmt = '0.0%';

    row.eachCell((c) => {
      c.border = borderThin;
      if (!c.font || !c.font.bold) {
        c.font = fontData;
      }
    });
  });

  const filePath = path.join(plantillasDir, '06_plantilla_matriz_asistencias_referencia.xlsx');
  await workbook.xlsx.writeFile(filePath);
  console.log('✅ Generado:', filePath);
}

// Ejecutar todos
async function run() {
  console.log('🚀 Iniciando generación de archivos Excel oficiales en docs/plantillas_excel...');
  await generateValidStudentsFile();
  await generateValidSchedulesFile();
  await generateErrorStudentsFile();
  await generateErrorSchedulesFile();
  await generateMasterModuleFile();
  await generateAttendanceMatrixReference();
  console.log('🎉 Todos los archivos Excel se han generado exitosamente.');
}

run().catch((err) => {
  console.error('❌ Error al generar archivos Excel:', err);
  process.exit(1);
});
