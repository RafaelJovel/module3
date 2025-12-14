# Work Item 002: Create Application Feature

## Story Details

> As a **system administrator**, I want **to be able to create new applications that the Configuration Service will cater for**, so that **I can manage the configurations for each one of those new applications**

### Notes
Implement the API and UI to be able to create applications that are to have configuration files managed by the configuration service. Create integration and unit tests as necessary.

---

## Acceptance Criteria (Tasks)

### Task 1: Backend - Create Application Endpoint
**Given** the Configuration Service needs to accept new applications  
**When** a POST request is made to `/api/v1/applications` with valid application data (name and optional description)  
**Then** the API creates the application in the database and returns the created application with a 201 status code

**Status**: ✅ COMPLETE

### Task 2: Backend - Validation and Error Handling
**Given** the Configuration Service must enforce data integrity  
**When** a POST request is made with invalid data (duplicate name, invalid format, missing required fields)  
**Then** the API returns appropriate error responses (409 for conflicts, 422 for validation errors)

**Status**: ✅ COMPLETE

### Task 3: Frontend - Create Application Form Component
**Given** administrators need a way to create new applications  
**When** the administrator interacts with the UI  
**Then** they see a form with fields for application name and description, with a submit button

**Status**: ⚪ NOT STARTED

### Task 4: Frontend - Form Validation and Submission
**Given** the create application form is displayed  
**When** the administrator submits the form with valid data  
**Then** the form calls the API, shows loading state, and displays success/error messages appropriately

**Status**: ⚪ NOT STARTED

### Task 5: Frontend - Integration with Application List
**Given** a new application has been successfully created  
**When** the form submission completes  
**Then** the application list refreshes to show the new application and the form is reset

**Status**: ⚪ NOT STARTED

---

## Current Task: Task 1 - Backend Create Application Endpoint

### Current Stage: 🔵 PLAN

---

## PLAN Stage Details

### Test Strategy

#### Unit Tests (Backend - with mocked database)
1. **ApplicationRepository Tests** (`svc.Tests/Repositories/ApplicationRepositoryTests.cs`)
   - `CreateApplication_WithValidData_ReturnsCreatedApplication`
   - `CreateApplication_WithDuplicateName_ThrowsException`
   - `CreateApplication_GeneratesULID_ForNewApplication`
   - `CreateApplication_SetsCreatedAtTimestamp`
   - `CreateApplication_CreatesDefaultConfiguration`

2. **ApplicationsController Tests** (`svc.Tests/Controllers/ApplicationsControllerTests.cs`)
   - `CreateApplication_WithValidData_Returns201Created`
   - `CreateApplication_WithValidData_ReturnsCreatedApplication`
   - `CreateApplication_WithInvalidName_Returns422UnprocessableEntity`
   - `CreateApplication_WithDuplicateName_Returns409Conflict`
   - `CreateApplication_WithMissingName_Returns422UnprocessableEntity`
   - `CreateApplication_IncludesLocationHeader_WithNewResourceUrl`

3. **Validation Tests** (`svc.Tests/Validation/CreateApplicationRequestValidatorTests.cs`)
   - `Validator_WithValidName_PassesValidation`
   - `Validator_WithEmptyName_FailsValidation`
   - `Validator_WithInvalidCharacters_FailsValidation`
   - `Validator_WithNameTooLong_FailsValidation`
   - `Validator_WithDescriptionTooLong_FailsValidation`
   - `Validator_WithNullDescription_PassesValidation`

#### Integration Tests (Backend - with real database)
1. **Applications Endpoint Integration Tests** (`svc.Tests/Integration/ApplicationsEndpointTests.cs`)
   - `CreateApplication_EndToEnd_CreatesInDatabase`
   - `CreateApplication_WithDuplicateName_Returns409Conflict`
   - `CreateApplication_CreatesDefaultConfiguration`
   - `CreateApplication_ThenGetById_ReturnsCreatedApplication`

### File Changes Needed

#### Backend Core Files
- `svc/Models/Requests/CreateApplicationRequest.cs` - DTO for create request
- `svc/Validation/CreateApplicationRequestValidator.cs` - FluentValidation validator
- `svc/Controllers/ApplicationsController.cs` - Add POST endpoint method
- `svc/Repositories/IApplicationRepository.cs` - Add CreateAsync method signature
- `svc/Repositories/ApplicationRepository.cs` - Implement CreateAsync method

#### Backend Test Files
- `svc.Tests/Controllers/ApplicationsControllerTests.cs` - Add create endpoint tests
- `svc.Tests/Repositories/ApplicationRepositoryTests.cs` - Add repository create tests (NEW FILE)
- `svc.Tests/Validation/CreateApplicationRequestValidatorTests.cs` - Validator tests (NEW FILE)
- `svc.Tests/Integration/ApplicationsEndpointTests.cs` - Add integration tests for create

### Implementation Order
1. Create CreateApplicationRequest DTO with validation attributes
2. Create FluentValidation validator for CreateApplicationRequest
3. Add CreateAsync method to IApplicationRepository interface
4. Implement CreateAsync in ApplicationRepository with database insert
5. Add POST endpoint to ApplicationsController
6. Write unit tests for validator
7. Write unit tests for repository (mocked database)
8. Write unit tests for controller (mocked repository)
9. Write integration tests with real database
10. Run all quality validation checks

---

## BUILD & ASSESS Stage Details
*To be filled when entering this stage*

---

## REFLECT & ADAPT Stage Details
*To be filled when entering this stage*

---

## COMMIT & PICK NEXT Stage Details
*To be filled when entering this stage*
