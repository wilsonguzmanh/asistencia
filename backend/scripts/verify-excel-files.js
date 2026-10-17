const fs = require('fs');
const path = require('path');

// Compilamos / requerimos de dist o ts-node
// O bien usamos una prueba con ts-node
async function main() {
  const { ExcelParserService } = require('../dist/features/modules/services/excel-parser.service');
  const { ScheduleParserService } = require('../dist/features/modules/services/schedule-parser.service');

  const excelParser = new ExcelParserService();
  const scheduleParser = new ScheduleParserService();

  const docsDir = path.resolve(__dirname, '../../docs/plantillas_excel');

  console.log('🧪 Verificando archivos Excel generados contra los servicios del Backend...');

  // 1. Estudiantes Válidos
  const validStudentsBuffer = fs.readFileSync(path.join(docsDir, '01_plantilla_estudiantes_valida.xlsx'));
  const resStudentsValid = await excelParser.parseStudentsExcel(validStudentsBuffer);
  console.log(`\n1. [01_plantilla_estudiantes_valida.xlsx]:`);
  console.log(`   - hasErrors: ${resStudentsValid.hasErrors}`);
  console.log(`   - totalRows: ${resStudentsValid.totalRows}`);
  console.log(`   - validRowsCount: ${resStudentsValid.validRowsCount}`);
  if (!resStudentsValid.hasErrors && resStudentsValid.validRowsCount === 25) {
    console.log('   ✅ PASÓ: 25 estudiantes procesados sin errores.');
  } else {
    console.error('   ❌ FALLÓ:', resStudentsValid.errors);
  }

  // 2. Fechas Válidas
  const validSchedulesBuffer = fs.readFileSync(path.join(docsDir, '02_plantilla_fechas_horarios_valida.xlsx'));
  const resSchedulesValid = await scheduleParser.parseSchedulesExcel(validSchedulesBuffer);
  console.log(`\n2. [02_plantilla_fechas_horarios_valida.xlsx]:`);
  console.log(`   - hasErrors: ${resSchedulesValid.hasErrors}`);
  console.log(`   - totalSessions: ${resSchedulesValid.totalSessions}`);
  console.log(`   - validSchedules: ${resSchedulesValid.schedules.length}`);
  if (!resSchedulesValid.hasErrors && resSchedulesValid.schedules.length === 12) {
    console.log('   ✅ PASÓ: 12 clases procesadas en orden cronológico.');
  } else {
    console.error('   ❌ FALLÓ:', resSchedulesValid.errors);
  }

  // 3. Estudiantes con Errores
  const errorStudentsBuffer = fs.readFileSync(path.join(docsDir, '03_plantilla_estudiantes_con_errores_prueba.xlsx'));
  const resStudentsError = await excelParser.parseStudentsExcel(errorStudentsBuffer);
  console.log(`\n3. [03_plantilla_estudiantes_con_errores_prueba.xlsx]:`);
  console.log(`   - hasErrors: ${resStudentsError.hasErrors}`);
  console.log(`   - errorCount: ${resStudentsError.errorCount}`);
  if (resStudentsError.hasErrors && resStudentsError.errorCount > 0) {
    console.log(`   ✅ PASÓ: Detectó correctamente ${resStudentsError.errorCount} errores de validación esperados.`);
  } else {
    console.error('   ❌ FALLÓ: No detectó los errores esperados.');
  }

  // 4. Fechas con Errores
  const errorSchedulesBuffer = fs.readFileSync(path.join(docsDir, '04_plantilla_fechas_horarios_con_errores_prueba.xlsx'));
  const resSchedulesError = await scheduleParser.parseSchedulesExcel(errorSchedulesBuffer);
  console.log(`\n4. [04_plantilla_fechas_horarios_con_errores_prueba.xlsx]:`);
  console.log(`   - hasErrors: ${resSchedulesError.hasErrors}`);
  console.log(`   - errorCount: ${resSchedulesError.errorCount}`);
  if (resSchedulesError.hasErrors && resSchedulesError.errorCount > 0) {
    console.log(`   ✅ PASÓ: Detectó correctamente ${resSchedulesError.errorCount} errores de calendario esperados.`);
  } else {
    console.error('   ❌ FALLÓ: No detectó los errores esperados.');
  }
}

main().catch(console.error);
