src/
├── index.ts # App entry, plugin registration
├── modules/
│ ├── auth/
│ │ ├── auth.controller.ts
│ │ └── auth.service.ts
│ ├── student/
│ │ ├── student.controller.ts
│ │ └── student.service.ts
│ ├── department/
│ │ ├── department.controller.ts
│ │ └── department.service.ts
│ ├── course/
│ │ ├── course.controller.ts
│ │ └── course.service.ts
│ ├── section/
│ │ ├── section.controller.ts
│ │ └── section.service.ts
│ ├── enrollment/
│ │ ├── enrollment.controller.ts
│ │ └── enrollment.service.ts
│ ├── grade/
│ │ ├── grade.controller.ts
│ │ └── grade.service.ts
│ ├── attendance/
│ │ ├── attendance.controller.ts
│ │ └── attendance.service.ts
│ ├── fee/
│ │ ├── fee.controller.ts
│ │ └── fee.service.ts
│ ├── announcement/
│ │ ├── announcement.controller.ts
│ │ └── announcement.service.ts
│ ├── library/
│ │ ├── library.controller.ts
│ │ └── library.service.ts
│ └── exam/
│ ├── exam.controller.ts
│ └── exam.service.ts
├── middleware/
│ ├── auth.middleware.ts # JWT verification, role guard
│ └── error.middleware.ts # Global error handler
├── utils/
│ ├── pagination.ts # Pagination helper
│ └── response.ts # Standardized API response format
└── prisma.ts # Prisma client singleton
