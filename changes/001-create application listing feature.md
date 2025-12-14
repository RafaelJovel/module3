# Work Item 001: Create Application Listing Feature

## Story Details

> As a **system administrator**, I want **to be able to see all the applications that the Configuration Service caters for**, so that **I can manage the configurations for each one of those applications**

### Notes
Implement the API and UI to be able to see all the applications that have configuration files managed by the configuration service. Create integration and unit tests as necessary.

This is a fresh project start - we'll create the entire Configuration Service codebase from scratch with this feature as the foundation.

---

## Acceptance Criteria (Tasks)

### Task 1: Backend - List Applications Endpoint
**Given** the Configuration Service has an applications database table  
**When** a GET request is made to `/api/v1/applications`  
**Then** the API returns a JSON array of all applications with their id, name, and description

**Status**: ✅ COMPLETE

### Task 2: Frontend - Application List Display
**Given** the backend API provides an applications listing endpoint  
**When** the administrator opens the Configuration Service UI  
**Then** they see a list of all applications with their names and descriptions

**Status**: 🔵 IN PROGRESS

### Task 3: Frontend - Empty State Handling
**Given** there are no applications in the database  
**When** the administrator opens the Configuration Service UI  
**Then** they see a friendly empty state message

**Status**: ⚪ Not Started

---

## Current Task: Task 2 - Frontend Application List Display

### Current Stage: 🔵 BUILD & ASSESS

---

## BUILD & ASSESS Stage Details

### Build Progress
- [x] Initialize Vite React TypeScript project structure
- [x] Create TypeScript types/interfaces matching backend DTOs
- [x] Implement API service with `getApplications()` method
- [x] Write API service unit tests with mocked fetch
- [x] Create ApplicationList component with loading/error/data states
- [x] Write ApplicationList component unit tests
- [x] Set up Vite proxy configuration to backend API
- [x] Add UI commands to Makefile (install-ui, run-ui, test-ui)
- [x] Update .gitignore
- [ ] Integration tests (deferred - not critical for initial implementation)
- [ ] Test full workflow: run backend → run UI → view applications list

### Quality Validation Status
- [x] API service tests passing (5/5 tests pass)
- [ ] Component tests have TypeScript configuration issue with jest-dom matchers (logic is correct, TS types need adjustment)
- [ ] TypeScript compilation check needed
- [ ] Manual browser verification needed

### Known Issues
- Jest-dom matcher types not recognized by TypeScript in test files (toBeInTheDocument)
- Tests execute correctly at runtime, but TS compilation fails during test run
- API service tests all pass successfully

---

## PLAN Stage Details (Completed)

### Test Strategy

#### Unit Tests (with mocked API calls)
1. **API Service Tests** (`ui/src/services/__tests__/api.test.ts`)
   - `getApplications_CallsCorrectEndpoint_WithGETMethod`
   - `getApplications_ReturnsApplicationsList_OnSuccess`
   - `getApplications_ThrowsError_On404Response`
   - `getApplications_ThrowsError_On500Response`
   - `getApplications_ThrowsError_OnNetworkFailure`

2. **ApplicationList Component Tests** (`ui/src/components/__tests__/ApplicationList.test.tsx`)
   - `ApplicationList_ShowsLoadingState_Initially`
   - `ApplicationList_DisplaysApplications_WhenDataLoaded`
   - `ApplicationList_DisplaysMultipleApplications_Correctly`
   - `ApplicationList_ShowsErrorMessage_OnAPIFailure`
   - `ApplicationList_ShowsApplicationNames_InList`
   - `ApplicationList_ShowsApplicationDescriptions_InList`

3. **Type Safety Tests**
   - `ApplicationResponse_TypeMatchesBackendContract`
   - `API_Service_ReturnsCorrectTypes`

#### Integration Tests (with real backend or MSW)
1. **End-to-End Component Tests** (`ui/src/components/__tests__/ApplicationList.integration.test.tsx`)
   - `ApplicationList_FetchesAndDisplaysRealData_FromBackend`
   - `ApplicationList_HandlesRealAPIErrors_Gracefully`
   - `ApplicationList_UpdatesWhenDataChanges`

2. **Browser Tests**
   - `UI_RendersApplicationList_InBrowser`
   - `UI_HandlesEmptyState_InBrowser` (handled in Task 3)

### File Changes Needed

#### Frontend Core Files (ui/)
- `ui/package.json` - NPM project config with React, TypeScript, Vite, Jest dependencies
- `ui/tsconfig.json` - TypeScript strict mode configuration
- `ui/vite.config.ts` - Vite configuration with proxy to backend
- `ui/index.html` - Entry HTML file
- `ui/src/main.tsx` - React application entry point
- `ui/src/App.tsx` - Main App component
- `ui/src/vite-env.d.ts` - Vite TypeScript declarations

#### Frontend Service Layer
- `ui/src/services/api.ts` - API service with `getApplications()` method
- `ui/src/types/Application.ts` - TypeScript interfaces matching backend DTOs

#### Frontend Components
- `ui/src/components/ApplicationList.tsx` - Component to fetch and display applications
- `ui/src/components/ApplicationList.module.css` - Component-scoped styles

#### Frontend Test Files
- `ui/jest.config.js` - Jest configuration for TypeScript and React
- `ui/src/setupTests.ts` - Jest setup file (testing-library config)
- `ui/src/services/__tests__/api.test.ts` - API service unit tests
- `ui/src/components/__tests__/ApplicationList.test.tsx` - Component unit tests
- `ui/src/components/__tests__/ApplicationList.integration.test.tsx` - Integration tests

#### Project Infrastructure Updates
- `Makefile` - Add UI commands (install-ui, run-ui, test-ui, ui-build)
- `.gitignore` - Add ui/node_modules/, ui/dist/, ui/coverage/
- `README.md` - Add UI setup and development instructions

### Dependencies Required

**Frontend (NPM packages)**:
- `react` (^18.3.0) - React framework
- `react-dom` (^18.3.0) - React DOM rendering
- `typescript` (^5.5.0) - TypeScript compiler
- `vite` (^5.4.0) - Build tool and dev server
- `@vitejs/plugin-react` (^4.3.0) - Vite React plugin

**Development (NPM packages)**:
- `@types/react` (^18.3.0) - React type definitions
- `@types/react-dom` (^18.3.0) - React DOM type definitions
- `eslint` (^9.0.0) - Linting
- `@typescript-eslint/eslint-plugin` (^8.0.0) - TypeScript ESLint rules
- `@typescript-eslint/parser` (^8.0.0) - TypeScript ESLint parser

**Testing (NPM packages)**:
- `jest` (^29.7.0) - Test framework
- `@testing-library/react` (^16.0.0) - React testing utilities
- `@testing-library/jest-dom` (^6.5.0) - DOM matchers
- `@testing-library/user-event` (^14.5.0) - User interaction simulation
- `@types/jest` (^29.5.0) - Jest type definitions
- `jest-environment-jsdom` (^29.7.0) - DOM environment for Jest
- `ts-jest` (^29.2.0) - TypeScript Jest transformer

### Implementation Order
1. Initialize Vite React TypeScript project structure
2. Create TypeScript types/interfaces matching backend DTOs
3. Implement API service with `getApplications()` method
4. Write API service unit tests with mocked fetch
5. Create ApplicationList component with loading/error/data states
6. Write ApplicationList component unit tests
7. Set up Vite proxy configuration to backend API
8. Write integration tests with real API calls or MSW
9. Add UI commands to Makefile (install-ui, run-ui, test-ui)
10. Update .gitignore and README.md
11. Test full workflow: run backend → run UI → view applications list

---

## BUILD & ASSESS Stage Details
*To be filled when entering this stage*

---

## REFLECT & ADAPT Stage Details
*To be filled when entering this stage*

---

## COMMIT & PICK NEXT Stage Details
```markdown
- [ ] Remove BUILD & ASSESS, REFLECT & ADAPT, and COMMIT & PICK NEXT sections
- [ ] Update task status (⚪ → ✅)
- [ ] Update "Current Task" and "Current Stage" sections
- [ ] Update memory/WORKFLOW_STATUS.md "Current Status"
```
