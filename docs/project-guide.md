# School Admin Portal - Project Guide

## Section 1: Executive Summary
The School Admin Portal is a comprehensive, modern management system designed specifically for school administrators. It provides a centralized digital environment to handle the complexities of tracking student records, managing teacher schedules, overseeing academic performance, and facilitating internal school communications. Designed for schools that may face unreliable internet connectivity, the application is built to ensure uninterrupted administrative workflows, guaranteeing that data is never lost and always accessible when it's needed most.

## Section 2: What the System Does
1. **Student and Teacher Management:** Staff can easily add new students or teachers, edit their information, and import entire class lists from Excel spreadsheets.
2. **Class Scheduling:** Administrators can create class structures, assign teachers, allocate rooms, and define daily schedules.
3. **Academic Tracking:** The system allows for the logging and monitoring of student grades and daily attendance records.
4. **Internal Communication:** A built-in messaging platform lets the principal, office workers, and teachers communicate securely without leaving the application.
5. **AI Assistance:** When importing records, the system can automatically infer a student's gender from their name using AI, saving hours of manual data entry.
6. **Offline Resilience:** If the school loses internet access, staff can continue working normally. The system saves everything locally and automatically synchronizes with the cloud when the connection is restored.

## Section 3: How the System is Structured
The architecture is split into three main parts:
- **The Frontend (The Face):** This is what the user sees and interacts with. It's like the storefront where all the business happens.
- **The Backend (The Engine):** This handles the heavy lifting, securing passwords, validating data, and making sure the right people see the right information. It acts as the security guard for the database.
- **The Database (The Filing Cabinet):** A highly secure cloud storage system that permanently remembers every student record, grade, and message.

## Section 4: User Roles and Permissions

| Role | What they see | What they can do |
|---|---|---|
| **Admin (Principal)** | Everything | Full access: create classes, add users, change system settings, import/export data. |
| **Office Worker** | Everything except system configuration | Manage students, view schedules, enter grades, send messages. |
| **Teacher** | Only their assigned classes and students | Take attendance, enter grades for their specific subjects, send messages. |

## Section 5: How Data is Handled
All school data is securely transmitted and stored in a cloud database. The system protects sensitive student information by ensuring that only authorized staff members can view or alter it. Passwords are mathematically scrambled (hashed) so that even system administrators cannot read them. The data is backed up continuously to prevent accidental loss.

## Section 6: Testing and Quality
The system has over 500 automated health checks that run constantly to verify everything is working correctly. It has been reviewed for security vulnerabilities, and accessibility audits confirm that the application is fully usable by staff members who rely on keyboard navigation or screen readers.

## Section 7: Deployment Checklist
- [x] All automated tests passing — confirmed by VERA
- [x] Security review complete — confirmed by ALICE
- [x] Accessibility audit complete — confirmed by ECHO
- [x] Infrastructure and deployment packages ready — confirmed by ROOK
- [ ] Environment variables configured on the production server
- [ ] Database migrations run on the production database
- [ ] Health check endpoint responding
- [ ] Deployment approved by Stakeholders

## Section 8: Known Limitations
- Currently, the system does not support direct parent or student login access. This is an administrative-only tool.
- The messaging system does not currently support group chats; it is limited to direct one-on-one communication.

## Section 9: Glossary
- **Dashboard:** The main home screen that shows a quick summary of school statistics.
- **Sync Engine:** The hidden system that saves work while offline and uploads it when online.
- **AI Inference:** The system's ability to automatically guess missing information (like gender) to speed up data entry.

## Section 10: Contact and Support
For technical issues, lost passwords, or questions regarding system usage, please contact the IT Administrator or the system vendor.
