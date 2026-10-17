# Documentación del Proyecto - Sistema de Control de Asistencia

Bienvenido a la carpeta de documentación del **Sistema Web de Registro y Control de Asistencia**. Esta documentación ha sido diseñada con base en el documento oficial de requerimientos funcionales y reglas de negocio del sistema, organizada para facilitar la arquitectura de software, la gestión ágil y el trabajo en paralelo de todo el equipo de desarrollo.

---

## 📚 Estructura de Documentos

| Documento | Descripción | Enlace |
| :--- | :--- | :--- |
| **Diagrama de Clases** | Modelo de dominio UML detallado (Mermaid), entidades, atributos, métodos, relaciones, DTOs y mapeo de reglas de negocio (**RN-01 a RN-08**). | [Ver Diagrama de Clases](diagrama-de-clases.md) |
| **Historias de Usuario** | Catálogo completo de Historias de Usuario (**US-01 a US-15**), organizadas por épicas con criterios de aceptación BDD (Gherkin), especificaciones de frontend/backend/DB, y Story Points. | [Ver Historias de Usuario](historias-de-usuario.md) |
| **Dependencias y Paralelización** | Matriz y grafo visual de dependencias, identificación del camino crítico, distribución en 4 Tracks autónomos, estrategia de desacoplamiento y matriz RACI. | [Ver Plan de Paralelización](dependencias-y-paralelizacion.md) |
| **Repartición para 2 Devs** | Estrategia de arranque en paralelo sin bloqueos para un equipo de 2 programadores, Paso Cero con semillas y matriz sin colisiones Git. | [Ver Repartición para 2 Programadores](reparticion-2-programadores.md) |
| **Vistas del Frontend** | Catálogo técnico de vistas, páginas, componentes, flujos de navegación, middleware y reglas de acceso del frontend. | [Ver Catálogo de Vistas](vistas-frontend.md) |
| **Dirección Visual General** | Sistema de diseño, filosofía visual, paleta cromática, escala tipográfica, arquetipos de interfaz y pautas de micro-interacciones académicas. | [Ver Dirección Visual](direccion-visual-general.md) |
| **Despliegue Render & Vercel** | Guía paso a paso para desplegar Backend y PostgreSQL en Render y Frontend en Vercel con Blueprint y variables de entorno. | [Ver Guía de Despliegue](despliegue-render-vercel.md) |

---

## 🎯 Resumen del Alcance del Sistema

1. **Gestión de Módulos Académicos:**
   * Solo existe **un módulo activo a la vez** (**RN-01**).
   * Al cargar un nuevo módulo con nuevos estudiantes y fechas, los datos previos se conservan íntegros en base de datos (**RN-08**, **RF-15**).
2. **Importación Flexible:**
   * Carga de nómina de estudiantes vía Excel (**RF-11**, **RN-02**).
   * Carga de calendario de clases vía Excel (**RF-12**).
3. **Control de Asistencia del Estudiante:**
   * Acceso por correo o número de matrícula sin contraseña (**RF-01**).
   * Botón de marcación activo únicamente en el día de clase programado (**RF-03**, **RN-04**).
   * Una sola marcación por estudiante y día (**RN-03**).
   * Faltas automáticas al finalizar el día sin registro (**RF-04**, **RN-05**).
   * Historial personal y cálculo de porcentajes (**RF-05**).
4. **Supervisión y Modificación Administrativa:**
   * Lista y búsqueda de estudiantes (**RF-06**).
   * Matriz consolidada de asistencias con totales (**RF-08**).
   * Corrección de asistencias por administrador con trazabilidad auditada (**RF-07**, **RN-06**, **RN-07**).
   * Exportación de planillas a Excel (**RF-17**).
5. **Auditoría y Trazabilidad:**
   * Registro inmutable de acciones críticas (marcaciones, correcciones, activaciones) (**RF-09**, **RF-10**).

---

## 👥 Guía Rápida para el Equipo de Desarrollo

* Si vas a comenzar a programar entidades de TypeORM o controladores NestJS, consulta primero el [Diagrama de Clases](diagrama-de-clases.md).
* Si vas a implementar un feature específico o escribir pruebas unitarias / e2e, revisa los criterios de aceptación en las [Historias de Usuario](historias-de-usuario.md).
* Si quieres saber qué tarea tomar sin bloquearte o cómo mockear contratos para trabajar en paralelo, consulta el [Plan de Dependencias y Paralelización](dependencias-y-paralelizacion.md).
