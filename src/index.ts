import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { errorMiddleware } from "./middleware/error.middleware";

// Module controllers
import { authController } from "./modules/auth/auth.controller";
import { studentController } from "./modules/student/student.controller";
import { departmentController } from "./modules/department/department.controller";
import { courseController } from "./modules/course/course.controller";
import { sectionController } from "./modules/section/section.controller";
import { enrollmentController } from "./modules/enrollment/enrollment.controller";
import { gradeController } from "./modules/grade/grade.controller";
import { attendanceController } from "./modules/attendance/attendance.controller";
import { feeController } from "./modules/fee/fee.controller";
import { announcementController } from "./modules/announcement/announcement.controller";
import { libraryController } from "./modules/library/library.controller";
import { examController } from "./modules/exam/exam.controller";

const app = new Elysia()
  // Plugins
  .use(cors())
  .use(
    swagger({
      documentation: {
        info: {
          title: "Student Services System API",
          version: "1.0.0",
          description:
            "Comprehensive student services system with authentication, enrollment, grades, attendance, fees, library, and more.",
        },
        tags: [
          { name: "Auth", description: "Authentication endpoints" },
          { name: "Students", description: "Student management" },
          { name: "Departments", description: "Department management" },
          { name: "Courses", description: "Course management" },
          { name: "Sections", description: "Class section management" },
          { name: "Enrollment", description: "Course enrollment" },
          { name: "Grades", description: "Grade management" },
          { name: "Attendance", description: "Attendance tracking" },
          { name: "Fees", description: "Fee and payment management" },
          { name: "Announcements", description: "Campus announcements" },
          { name: "Library", description: "Library management" },
          { name: "Exams", description: "Exam scheduling and results" },
        ],
      },
    }),
  )

  // Middleware
  .use(errorMiddleware)

  // Health check
  .get("/", () => ({
    success: true,
    message: "🎓 Student Services System API is running!",
    version: "1.0.0",
    docs: "/swagger",
  }))

  // API routes
  .use(authController)
  .use(studentController)
  .use(departmentController)
  .use(courseController)
  .use(sectionController)
  .use(enrollmentController)
  .use(gradeController)
  .use(attendanceController)
  .use(feeController)
  .use(announcementController)
  .use(libraryController)
  .use(examController)

  // Start server
  .listen(3000);

console.log(
  `🎓 Student Services System is running at http://${app.server?.hostname}:${app.server?.port}`,
);
console.log(
  `📖 API Documentation: http://${app.server?.hostname}:${app.server?.port}/swagger`,
);
