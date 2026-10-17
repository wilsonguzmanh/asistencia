import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import {
  AcademicModule,
  Student,
  ClassSchedule,
  Attendance,
  AdminUser,
  ActivityLog,
  APP_ENTITIES,
} from '../entities';
import {
  ModuleStatus,
  AttendanceStatus,
  UserRole,
  ActivityAction,
} from '../../common/enums';

// Cargar variables de entorno
dotenv.config();

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export async function runSeed(externalDataSource?: DataSource) {
  console.log('🌱 [Paso Cero] Iniciando script de semilla (Database Seed)...');

  let dataSource = externalDataSource;
  let shouldClose = false;

  if (!dataSource) {
    const isLocal =
      !process.env.DATABASE_URL ||
      process.env.DATABASE_URL.includes('localhost') ||
      process.env.DATABASE_URL.includes('127.0.0.1');
    const enableSsl =
      process.env.DB_SSL === 'true' || (!isLocal && !!process.env.DATABASE_URL);
    const sslConfig = enableSsl ? { rejectUnauthorized: false } : false;

    dataSource = process.env.DATABASE_URL
      ? new DataSource({
          type: 'postgres',
          url: process.env.DATABASE_URL,
          entities: APP_ENTITIES,
          synchronize: true,
          ssl: sslConfig,
        })
      : new DataSource({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_NAME || 'asistencia_db',
          entities: APP_ENTITIES,
          synchronize: true,
          ssl: sslConfig,
        });

    await dataSource.initialize();
    shouldClose = true;
    console.log('✅ Conexión a la base de datos establecida.');
  }

  const adminRepo = dataSource.getRepository(AdminUser);
  const moduleRepo = dataSource.getRepository(AcademicModule);
  const studentRepo = dataSource.getRepository(Student);
  const scheduleRepo = dataSource.getRepository(ClassSchedule);
  const attendanceRepo = dataSource.getRepository(Attendance);
  const logRepo = dataSource.getRepository(ActivityLog);

  // 1. Limpieza segura de datos previos de desarrollo
  console.log('🧹 Limpiando datos previos de desarrollo...');
  await dataSource.query(
    'TRUNCATE TABLE attendances, activity_logs, class_schedules, students, academic_modules, admin_users CASCADE',
  );

  // 2. Crear Administrador por Defecto (RF-02)
  console.log('👤 Creando usuario Administrador...');
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash('admin123', saltRounds);

  const admin = adminRepo.create({
    username: 'admin',
    email: 'admin@sistema.com',
    passwordHash,
    role: UserRole.ADMIN,
    isActive: true,
  });
  await adminRepo.save(admin);
  console.log('   ↳ Admin creado: admin@sistema.com (clave: admin123)');

  // 3. Crear Módulo Académico Activo (RN-01, RF-13)
  console.log('📚 Creando Módulo Académico ACTIVO...');
  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - 10);
  const endDate = new Date();
  endDate.setDate(today.getDate() + 20);

  const academicModule = moduleRepo.create({
    name: 'Módulo Piloto: DevOps & Infraestructura como Código',
    code: 'DCID-V1E1-M2',
    status: ModuleStatus.ACTIVE,
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  });
  const savedModule = await moduleRepo.save(academicModule);
  console.log(`   ↳ Módulo activo creado: [${savedModule.code}] ${savedModule.name}`);

  // 4. Crear 15 Estudiantes Matriculados en el Módulo (RF-01, RN-02)
  console.log('🎓 Creando Estudiantes matriculados en el módulo activo...');
  const studentsData = [
    { registrationNumber: '1001', fullName: 'Juan Pérez Gómez', email: 'juan@gmail.com' },
    { registrationNumber: '1002', fullName: 'María López Fernández', email: 'maria@gmail.com' },
    { registrationNumber: '1003', fullName: 'Carlos Ruiz Morales', email: 'carlos@gmail.com' },
    { registrationNumber: '1004', fullName: 'Ana Rodríguez Vaca', email: 'ana.rodriguez@gmail.com' },
    { registrationNumber: '1005', fullName: 'David Mamani Quispe', email: 'david.mamani@gmail.com' },
    { registrationNumber: '1006', fullName: 'Sofía Vargas Torrico', email: 'sofia.vargas@gmail.com' },
    { registrationNumber: '1007', fullName: 'Lucas Mendoza Castro', email: 'lucas.mendoza@gmail.com' },
    { registrationNumber: '1008', fullName: 'Valentina Flores Soliz', email: 'valentina.flores@gmail.com' },
    { registrationNumber: '1009', fullName: 'Mateo Fernández Chávez', email: 'mateo.fernandez@gmail.com' },
    { registrationNumber: '1010', fullName: 'Camila Gutiérrez Paz', email: 'camila.gutierrez@gmail.com' },
    { registrationNumber: '1011', fullName: 'Diego Morales Pinto', email: 'diego.morales@gmail.com' },
    { registrationNumber: '1012', fullName: 'Lucía Castro Ortiz', email: 'lucia.castro@gmail.com' },
    { registrationNumber: '1013', fullName: 'Gabriel Romero Dorado', email: 'gabriel.romero@gmail.com' },
    { registrationNumber: '1014', fullName: 'Valeria Suárez Justiniano', email: 'valeria.suarez@gmail.com' },
    { registrationNumber: '1015', fullName: 'Alejandro Rojas Aguilera', email: 'alejandro.rojas@gmail.com' },
  ];

  const savedStudents: Student[] = [];
  for (const item of studentsData) {
    const student = studentRepo.create({
      moduleId: savedModule.id,
      registrationNumber: item.registrationNumber,
      fullName: item.fullName,
      email: item.email,
    });
    savedStudents.push(await studentRepo.save(student));
  }
  console.log(`   ↳ ${savedStudents.length} estudiantes matriculados.`);

  // 5. Crear Fechas de Clase (Pasadas, Hoy y Futuras) (RF-12, RN-04)
  console.log('📅 Creando Calendario de Clases (Pasadas, Hoy y Futuras)...');
  const pastDate1 = new Date();
  pastDate1.setDate(today.getDate() - 5);

  const pastDate2 = new Date();
  pastDate2.setDate(today.getDate() - 2);

  const futureDate1 = new Date();
  futureDate1.setDate(today.getDate() + 2);

  const futureDate2 = new Date();
  futureDate2.setDate(today.getDate() + 5);

  const schedulesData = [
    { classDate: formatDate(pastDate1), startTime: '18:00', endTime: '21:00' },
    { classDate: formatDate(pastDate2), startTime: '18:00', endTime: '21:00' },
    { classDate: formatDate(today), startTime: '18:00', endTime: '21:00' }, // FECHA DE HOY (habilita botón para US-08)
    { classDate: formatDate(futureDate1), startTime: '18:00', endTime: '21:00' },
    { classDate: formatDate(futureDate2), startTime: '18:00', endTime: '21:00' },
  ];

  const savedSchedules: ClassSchedule[] = [];
  for (const item of schedulesData) {
    const schedule = scheduleRepo.create({
      moduleId: savedModule.id,
      classDate: item.classDate,
      startTime: item.startTime,
      endTime: item.endTime,
    });
    savedSchedules.push(await scheduleRepo.save(schedule));
  }
  console.log(`   ↳ ${savedSchedules.length} fechas de clase programadas (incluyendo la fecha de hoy: ${formatDate(today)}).`);

  // 6. Asistencias de prueba para clases pasadas y de hoy (US-08, US-09, RF-08)
  console.log('📝 Creando marcas de asistencia de prueba...');
  let totalAttendancesCount = 0;

  // Clase Pasada 1: La mayoría asistió (estudiantes 0..11)
  for (let i = 0; i < savedStudents.length; i++) {
    const isPresent = i < 11;
    const att = attendanceRepo.create({
      studentId: savedStudents[i].id,
      classScheduleId: savedSchedules[0].id,
      status: isPresent ? AttendanceStatus.PRESENTE : AttendanceStatus.FALTA,
      markedAt: isPresent ? pastDate1 : null,
      markedByRole: isPresent ? UserRole.STUDENT : undefined,
    });
    await attendanceRepo.save(att);
    totalAttendancesCount++;
  }

  // Clase Pasada 2: Asistencia variada
  const presentIndexesClass2 = [0, 1, 3, 5, 7, 8, 10, 13];
  for (let i = 0; i < savedStudents.length; i++) {
    const isPresent = presentIndexesClass2.includes(i);
    const att = attendanceRepo.create({
      studentId: savedStudents[i].id,
      classScheduleId: savedSchedules[1].id,
      status: isPresent ? AttendanceStatus.PRESENTE : AttendanceStatus.FALTA,
      markedAt: isPresent ? pastDate2 : null,
      markedByRole: isPresent ? UserRole.STUDENT : undefined,
    });
    await attendanceRepo.save(att);
    totalAttendancesCount++;
  }

  // Clase de HOY: 2 estudiantes ya marcaron (María López 1002 y Sofía Vargas 1006)
  // Juan Pérez (1001), Ana Rodríguez (1004) quedan pendientes para probar la marcación en vivo
  const todayMarkedIndexes = [1, 5];
  for (const idx of todayMarkedIndexes) {
    const attToday = attendanceRepo.create({
      studentId: savedStudents[idx].id,
      classScheduleId: savedSchedules[2].id,
      status: AttendanceStatus.PRESENTE,
      markedAt: today,
      markedByRole: UserRole.STUDENT,
    });
    await attendanceRepo.save(attToday);
    totalAttendancesCount++;
  }

  // 7. Registro de Justificación Administrativa de Prueba (RN-06, RN-07)
  // David Mamani (1005) tenía FALTA en clase 2, pero el admin lo corrigió a PRESENTE
  const davidAttendance = await attendanceRepo.findOne({
    where: {
      studentId: savedStudents[4].id,
      classScheduleId: savedSchedules[1].id,
    },
  });
  if (davidAttendance) {
    davidAttendance.status = AttendanceStatus.PRESENTE;
    davidAttendance.remarks =
      'Justificado por certificado médico presentado en secretaría académica (RN-07)';
    davidAttendance.markedByUserId = admin.id;
    davidAttendance.markedByRole = UserRole.ADMIN;
    await attendanceRepo.save(davidAttendance);

    const overrideLog = logRepo.create({
      moduleId: savedModule.id,
      userId: admin.id,
      userIdentifier: admin.username,
      userRole: UserRole.ADMIN,
      action: ActivityAction.UPDATE_ATTENDANCE,
      entityAffected: 'Attendance',
      entityId: davidAttendance.id,
      previousValue: { status: AttendanceStatus.FALTA },
      newValue: {
        status: AttendanceStatus.PRESENTE,
        remarks: davidAttendance.remarks,
        studentName: savedStudents[4].fullName,
      },
      ipAddress: '127.0.0.1',
    });
    await logRepo.save(overrideLog);
  }

  // 8. Registro de Auditoría Inicial (RF-09, US-14)
  console.log('🛡️ Registrando evento inicial en log de auditoría...');
  const initialLog = logRepo.create({
    moduleId: savedModule.id,
    userId: admin.id,
    userIdentifier: admin.username,
    userRole: UserRole.ADMIN,
    action: ActivityAction.ACTIVATE_MODULE,
    entityAffected: 'AcademicModule',
    entityId: savedModule.id,
    newValue: { code: savedModule.code, name: savedModule.name, status: savedModule.status },
    ipAddress: '127.0.0.1',
  });
  await logRepo.save(initialLog);
  console.log('   ↳ Evento de activación registrado en auditoría.');

  console.log('\n🎉 [Paso Cero Completado con Éxito]');
  console.log(`  - 1 Administrador: admin@sistema.com (admin123)`);
  console.log(`  - 1 Módulo Activo: [${savedModule.code}] ${savedModule.name}`);
  console.log(`  - ${savedStudents.length} Estudiantes Matriculados (Matrículas 1001 a 1015)`);
  console.log(`  - ${savedSchedules.length} Fechas de Clase`);
  console.log(`  - ${totalAttendancesCount} Marcas de Asistencia iniciales.`);

  if (shouldClose) {
    await dataSource.destroy();
  }

  return {
    admin: admin.email,
    module: `[${savedModule.code}] ${savedModule.name}`,
    studentsCount: savedStudents.length,
    schedulesCount: savedSchedules.length,
    attendancesCount: totalAttendancesCount,
  };
}

// Ejecutar si se invoca directamente
if (require.main === module) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Error al ejecutar el seed:', err);
      process.exit(1);
    });
}
