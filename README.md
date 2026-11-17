# IIPS Digital Examination & Assessment Management System (IIPS-DEAMS)

> **Institution:** International Institute of Professional Studies (IIPS), Devi Ahilya Vishwavidyalaya (DAVV), Indore  
> **Tech Stack:** Frontend: React + Tailwind CSS | Backend: Java 21 + Spring Boot 3.3.2 | Database: MongoDB  

---

## 🏛️ System Overview

**IIPS-DEAMS** is an enterprise-grade digital examination and assessment platform designed for higher education institutions. The system supports full-lifecycle exam management, including question banking, automated paper generation with random shuffling, proctored live testing with anti-cheating enforcement, automated objective grading with negative marking, subjective answer evaluation against rubrics, and result analytics.

The system is configured in **Clean Slate Production Mode**:
- Zero hardcoded mock users, mock questions, or mock seeds.
- The MongoDB database starts completely clean.
- Role-based accounts (Administrators, Faculty Examiners, and Student Candidates) are registered dynamically via the portal or REST API.

---

## 💎 Full-Stack Object-Oriented Architecture & Design Patterns

The entire codebase—both frontend and backend—strictly adheres to **Object-Oriented Programming (OOP)** principles, domain-driven patterns, and SOLID design rules:

### 1. Frontend Object-Oriented Architecture

The React client is architected around strong domain encapsulation, polymorphic factories, stateful engines, and class-based service layers:

#### A. Domain Model Hierarchy (`frontend/src/models/`)
- **`User.js`**: Rich domain model encapsulating identity and institutional role queries:
  - Methods: `isAdmin()`, `isFaculty()`, `isStudent()`, `getInitials()`, `toJSON()`.
- **`Question.js`**: Polymorphic question hierarchy:
  - Base class: `BaseQuestion` (encapsulating common attributes: ID, prompt, marks, difficulty, subject).
  - Derived classes:
    - `McqQuestion` (manages options, correct options, explanation, negative marks).
    - `DescriptiveQuestion` (manages model answers, evaluation rubrics).
    - `CodeQuestion` (manages programming language, starter code template, unit test cases).
  - **`QuestionFactory`**: Implements the Factory Method pattern to instantiate the appropriate concrete question class dynamically from API responses.
- **`Exam.js`**: Encapsulates exam schedule status, duration formatting (`formatDuration()`), live state determination (`isLive()`, `isUpcoming()`, `isCompleted()`), and negative marking policies.
- **`ExamAttempt.js`**: Encapsulates student submission state, total score computation, percentage calculation (`getPercentage()`), and letter grade badge formatting.

#### B. Class-Based Service Layer (`frontend/src/services/`)
- **`HttpService.js`**: Base HTTP client encapsulating base endpoints, JWT authentication tokens, and request serialization.
- **Domain Services**:
  - `AuthService.js`: Encapsulates login, registration, session persistence, and current user retrieval.
  - `AdminService.js`: Encapsulates user management, course management, exam scheduling, center allocation, and audit logs.
  - `FacultyService.js`: Encapsulates question bank CRUD, automated paper generation, subjective answer grading, and result analytics.
  - `StudentService.js`: Encapsulates student dashboard data, exam session loading, answer auto-saving, anti-cheating alert dispatch, and marksheet generation.

#### C. Dedicated Stateful Engines (`frontend/src/engine/`)
- **`AntiCheatingEngine.js`**:
  - Encapsulates event-driven proctoring via browser listeners (`visibilitychange`, `blur`, `fullscreenchange`, keyboard copy/paste prevention).
  - Maintains violation counts, threshold checks (strike limits), and triggers decoupled callback handlers (`onWarning`, `onDisqualify`).
- **`ExamSession.js`**:
  - Stateful exam engine managing the live countdown timer (`tick()`, `getTimeRemaining()`), answer dictionary, review bookmarks, and question navigation (`nextQuestion()`, `prevQuestion()`, `goToQuestion()`).
  - Encapsulates question palette status computation (answered, unattempted, marked for review).

---

### 2. Backend Architecture & High-Density Optimization

The Spring Boot backend is optimized for **maximum LOC efficiency and zero dead code** while strictly preserving 100% of domain features, REST contracts, and OOP design patterns:

#### A. Backend Architecture & Size Metrics
| Metric | Original State | Optimized State | Delta / Improvement |
| :--- | :--- | :--- | :--- |
| **Java Files** | 69 files | **62 files** | **-7 files** (pruned 1:1 interfaces and mock seeder) |
| **Total Backend LOC** | ~3,850 lines | **2,073 lines** | **-46% reduction** (~1,777 LOC eliminated) |
| **Mock / Seed Data** | Hardcoded seeds | **0 mock lines** | Clean slate, dynamic registration |
| **Backend Build Status** | Clean Compile | **BUILD SUCCESS** | 0 warnings, clean package |
| **Frontend Production Build** | Clean Build | **BUILD SUCCESS** | `npm run build` in <1000ms |

#### B. Key Backend Refactorings
1. **Java 21 `record`s for DTOs & Events:**
   - Converted all DTOs and events (`ApiResponse`, `AuthResponse`, `LoginRequest`, `RegisterRequest`, `PaperGenerationRequest`, `SubjectiveEvaluationRequest`, `ExamSubmissionRequest`, `ProctorAlertRequest`, `ProctorInfractionEvent`, `GradingResult`) to Java 21 canonical `record` components.
   - Built-in record getters with backward-compatible alias getters eliminated hundreds of boilerplate lines while preserving Jackson JSON serialization.
2. **Interface Consolidation:**
   - Pruned redundant 1-to-1 interfaces while retaining polymorphic contracts where genuine variation exists (Strategy Pattern: `GradingStrategy`, `EvaluationStrategy`).
3. **Removal of Mock Seeder:**
   - `DataInitializer.java` removed; no artificial records are injected into the database.
4. **Direct Controller Returns:**
   - Cleaned controller methods by returning typed payloads directly, allowing Spring Boot's HTTP message converter to handle 200 OK responses cleanly without verbose `ResponseEntity.ok(...)` wrappers.
5. **Strategy & Factory Pattern Retention:**
   - **Strategy Pattern:** `EvaluationStrategyRegistry` selects `McqEvaluationStrategy`, `DescriptiveEvaluationStrategy`, or `CodeEvaluationStrategy` at runtime.
   - **Grading Strategy:** `UgcCbcsGradingStrategy` computes 10-point UGC Choice-Based Credit System grades (O, A+, A, B+, B, C, F).
   - **Factory Method:** `QuestionFactory` and `UserFactory` encapsulate instance creation.

---

## 🚀 Key Modules & Functional Specifications

### A. Admin Module
- **Manage Students:** Enroll students, assign courses (BCA, MCA, M.Tech IT), track active/inactive statuses, and filter by semester.
- **Manage Faculty:** Appoint faculty examiners, assign subject papers, and manage credentials.
- **Courses & Curriculum Structure:** Configure academic programs (BCA, MCA, M.Tech) with semester breakdowns, subject codes, and course credits.
- **Exam Scheduling:** Define examination dates, time windows, durations, total marks, passing marks, and negative marking factors.
- **Center Allocation:** Assign computer laboratories (e.g. Lab 101, Lab 102), seat capacities, candidate roll number blocks, and invigilator faculty.
- **Security & Audit Logs:** Immutable audit trail recording user logins, examination submissions, and candidate infractions (tab switches, fullscreen exits).

### B. Faculty Module
- **Question Bank Repository:**
  - **Multiple Choice Questions (MCQ):** 4-option questions, correct answer selection, positive marks (+2), negative marks penalty (-0.5), and answer explanations.
  - **Descriptive / Subjective Questions:** Comprehensive theory problems with model answer rubrics and scoring criteria (up to 10 marks).
  - **Code-Based Questions:** Programming problem statements with starter code templates and sample input/output test cases.
- **Auto Paper Randomization:** Blueprint generator allowing faculty to specify counts for MCQs, descriptive, and code questions; automatically shuffles and selects questions matching syllabus criteria.
- **Subjective Answer Evaluation:** Side-by-side grading workbench comparing candidate answers against official rubrics, with awarded marks inputs, examiner feedback, and automatic total & grade re-computation.
- **Result Analytics:** Visual grade frequency distribution (O, A+, A, B+, B, C, F), class average, highest/lowest scores, pass percentage, and anti-cheating summary.

### C. Student Module
- **Secure Authentication & Dashboard:** Overview of enrolled program, active live exams, and past verified marksheet records.
- **Online Proctored Exam Environment:**
  - **Countdown Timer:** Live clock with warning badge when under 5 minutes remaining.
  - **Anti-Cheating Proctor Engine:** Real-time detection of browser tab switches (`visibilitychange`), window blur, and fullscreen exits (`fullscreenchange`). Max 3 strikes before automatic disqualification and submission. Copy/paste and right-click context menu are disabled.
  - **Interactive Question Palette:** Standard color-coded navigation grid (Green: Answered, Red: Not Answered, Purple: Marked for Review, Gray: Not Visited).
  - **Auto-Save Engine:** Answers automatically synchronize with the backend every 20 seconds and on answer selection.
  - **Auto-Submit:** Triggers automatically upon timer expiration (00:00:00) or maximum infraction threshold.
- **Official Digital Marksheet & Transcript:**
  - Formal university marksheet with DAVV/IIPS header, student roll number, paper code, objective vs. subjective breakdown, final letter grade, and passing status.
  - Includes a "Print / Save as PDF" button.

### D. Examination Module (Core Engine)
- **Candidate-Level Shuffling:** Questions and multiple-choice options are dynamically shuffled for every individual student to prevent sequence leakage.
- **Negative Marking Engine:** Configurable negative marks (e.g., -0.25 or -0.5 per wrong MCQ) calculated automatically upon submission.
- **Automatic Grading & Evaluation:**
  - Instant score computation for objective questions.
  - Comprehensive letter grade assignment:
    - $\ge 90\% \rightarrow$ **O** (Outstanding)
    - $\ge 80\% \rightarrow$ **A+** (Excellent)
    - $\ge 70\% \rightarrow$ **A** (Very Good)
    - $\ge 60\% \rightarrow$ **B+** (Good)
    - $\ge 50\% \rightarrow$ **B** (Above Average)
    - $\ge 40\% \rightarrow$ **C** (Pass)
    - $< 40\% \rightarrow$ **F** (Fail)

---

## 📂 Project Structure

```
D:\IIPS-DEAMS/
├── backend/                                   # Java 21 + Spring Boot 3.3.2 Backend (2,073 LOC, 62 files)
│   ├── pom.xml                                # Maven build config (Spring Boot, Mongo, Security, JWT)
│   ├── src/main/java/com/iips/deams/
│   │   ├── DeamsApplication.java              # Application main entry point
│   │   ├── config/                            # SecurityConfig, JwtUtils, AuthTokenFilter
│   │   ├── controller/                        # Auth, Admin, Faculty, Student, Public Controllers
│   │   ├── dto/                               # Java 21 Records (ApiResponse, AuthResponse, etc.)
│   │   ├── event/                             # ProctorInfractionEvent (record), ProctorSecurityEventListener
│   │   ├── factory/                           # QuestionFactory, UserFactory
│   │   ├── model/                             # User (Student/Faculty/Admin), Question (MCQ/Descriptive/Code), etc.
│   │   │   └── enums/                         # UserRole, QuestionType, DifficultyLevel, ExamStatus, AttemptStatus, GradeLetter
│   │   ├── repository/                        # Spring Data Repositories (Users, Courses, Subjects, Questions, Schedules, Attempts, Logs)
│   │   ├── service/                           # AuthService, AdminService, FacultyService, StudentService, ExamEngineService, AuditService
│   │   └── strategy/                          # EvaluationStrategyRegistry, McqEvaluation, DescriptiveEvaluation, CodeEvaluation, UgcCbcsGrading
│   └── src/main/resources/
│       └── application.properties             # MongoDB & JWT configurations
├── frontend/                                  # React + Tailwind CSS + Vite (OOP Architecture, 0 mock data)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js                         # Vite config with @tailwindcss/vite and API proxy
│   └── src/
│       ├── App.jsx                            # Routing and role layouts
│       ├── main.jsx
│       ├── index.css                          # Tailwind CSS v4 styling
│       ├── api/                               # Real HTTP client (client.js)
│       ├── models/                            # Domain Entities (User, Question hierarchy, Exam, ExamAttempt, QuestionFactory)
│       ├── services/                          # Class-based Services (HttpService, AuthService, AdminService, FacultyService, StudentService)
│       ├── engine/                            # Stateful Engines (AntiCheatingEngine, ExamSession)
│       ├── context/                           # AuthContext with dynamic login & registration
│       ├── components/                        # Navbar, Sidebar, Modal, StatCard
│       └── pages/
│           ├── auth/                          # Login & Registration Portal
│           ├── admin/                         # AdminDashboard, ManageStudents, ManageFaculty, ManageCourses, ExamSchedules, CenterAllocation, AuditLogs
│           ├── faculty/                       # FacultyDashboard, QuestionBank, PaperGenerator, SubjectiveEvaluation, ResultAnalytics
│           └── student/                       # StudentDashboard, ExamPortal (Anti-cheating, Timer, Palette), ResultsView, MarksheetView
├── docker-compose.yml                         # MongoDB container service
└── README.md                                  # Complete Project Documentation
```

---

## 🔐 User Registration & Authentication (Clean Slate)

Because all preloaded mock accounts and default users have been removed, you can create new institutional accounts directly via the Portal:

1. Open the portal at `http://localhost:5173/login`.
2. Click the **Register New Account** tab.
3. Select the institutional role:
   - **Administrator**: To configure academic courses, exam schedules, and manage users.
   - **Faculty Examiner**: To manage question banks, generate randomized papers, and evaluate subjective exams.
   - **Student Candidate**: To participate in live proctored online exams and download official marksheet transcripts.
4. Enter your institutional credentials (username, email, password, employee ID or student roll number).
5. Click **Create Account & Sign In** to immediately generate your secure JWT session.

---

## 🛠️ How to Run

### Step 1: Start MongoDB
Ensure MongoDB is running (via Docker Compose or local MongoDB instance):
```powershell
cd D:\IIPS-DEAMS
docker compose up -d
```
*(Listening on `localhost:27017`)*

### Step 2: Run the Spring Boot Backend
```powershell
cd D:\IIPS-DEAMS\backend
mvn spring-boot:run
```
*(Or execute the packaged JAR)*:
```powershell
java -jar target/deams-backend-1.0.0-SNAPSHOT.jar
```
Backend starts on `http://localhost:8080`.

### Step 3: Run the Frontend
```powershell
cd D:\IIPS-DEAMS\frontend
npm run dev
```
Frontend starts on `http://localhost:5173`.

---

## 🛡️ Anti-Cheating & Exam Integrity Specifications

1. **Tab Switch & Window Blur Detection:**
   Listens for `visibilitychange` and `blur` events. Triggers warning modal and logs infraction to the database.
2. **Fullscreen Enforcement:**
   Monitors `fullscreenchange`. Exiting full screen records an infraction.
3. **Automated Disqualification:**
   Exceeding 3 infractions sets exam status to `TERMINATED_CHEATING` and auto-submits candidate responses.
4. **Copy-Paste and Context Menu Blocking:**
   Disables right-click and keyboard copy/cut/paste combinations (`Ctrl+C`, `Ctrl+V`, `Ctrl+U`, `Ctrl+P`).
