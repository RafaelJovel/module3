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

**Status**: ✅ COMPLETE

### Task 4: Frontend - Form Validation and Submission
**Given** the create application form is displayed  
**When** the administrator submits the form with valid data  
**Then** the form calls the API, shows loading state, and displays success/error messages appropriately

**Status**: 🔵 IN PROGRESS

---

## Task 4: BUILD & ASSESS Stage

### Test Strategy

#### Unit Tests (ui/src/components/__tests__/CreateApplicationForm.test.tsx)

**Form State Management Tests:**
1. Test that form fields update state when user types
2. Test that form validation prevents submission with invalid name format
3. Test that form validation allows submission with valid name and optional description

**Form Submission Tests:**
4. Test form submission with valid data calls API with correct payload
5. Test form shows loading state during submission (button disabled, loading indicator)
6. Test form displays success message after successful API response
7. Test form displays error message after API failure (network error, validation error, conflict error)
8. Test form remains enabled after successful submission (ready for another entry)

**Edge Case Tests:**
9. Test form handles empty description correctly (sends null or empty string)
10. Test form handles whitespace-only name correctly (validation error)
11. Test form trims whitespace from name before submission

**Accessibility Tests:**
12. Test form has proper ARIA attributes during loading state
13. Test error messages are announced to screen readers

#### Integration Tests (if needed)
- May defer integration tests to Task 5 which handles list refresh
- Focus on component behavior with mocked API in unit tests

### File Changes

#### Files to Modify

1. **ui/src/types/Application.ts**
   - Add `CreateApplicationRequest` interface with name and description fields
   - Ensure ErrorResponse type is exported

2. **ui/src/services/api.ts**
   - Add `createApplication(request: CreateApplicationRequest): Promise<ApplicationResponse>` method
   - Method should POST to `/api/v1/applications`
   - Handle HTTP status codes appropriately (201 success, 409 conflict, 422 validation error)
   - Return ApplicationResponse on success
   - Throw appropriate errors on failure

3. **ui/src/components/CreateApplicationForm.tsx**
   - Add React state for:
     - Form fields (name, description)
     - Loading state
     - Success/error messages
   - Add form submission handler:
     - Validate name format (alphanumeric, underscores, hyphens only)
     - Call api.createApplication()
     - Show loading state during API call
     - Display success message on success
     - Display error message on failure
     - Keep form enabled after submission
   - Add onChange handlers for form fields
   - Update submit button to show loading state
   - Add UI for success/error messages

4. **ui/src/components/__tests__/CreateApplicationForm.test.tsx**
   - Add all tests from test strategy above
   - Mock api.createApplication() using jest.mock
   - Use @testing-library/user-event for realistic user interactions
   - Test loading states, success/error messages

5. **ui/src/components/CreateApplicationForm.module.css** (if needed)
   - Add styles for loading state (disabled button, spinner)
   - Add styles for success/error messages
   - Add styles for validation errors

#### Files NOT to Change (Task Scope Control)
- **ui/src/App.tsx**: Do NOT integrate with ApplicationList yet (that's Task 5)
- **ui/src/services/__tests__/api.test.ts**: Do NOT add API service tests yet (can be done in Task 5 or separately)

### Implementation Notes

**Client-Side Validation Rules:**
- Name: Required, 1-255 characters, alphanumeric/underscore/hyphen only (regex: `^[a-zA-Z0-9_-]+$`)
- Description: Optional, max 1000 characters
- Trim whitespace from name before submission

**API Response Handling:**
- 201 Created: Success - show success message
- 409 Conflict: Duplicate name - show error message
- 422 Validation Error: Invalid data - show error message with details
- 500 Server Error: Show generic error message
- Network Error: Show network error message

**User Experience:**
- Show loading indicator during submission (disabled button + loading text/spinner)
- Clear, user-friendly error messages
- Success message confirms application was created
- Form remains filled after submission (user can edit and resubmit or clear manually)
- Consider auto-clearing form after successful submission (debatable - could be Task 5)

### Dependencies
- @testing-library/user-event (should already be installed)
- No new external dependencies required

### Questions/Decisions Needed
None - requirements are clear from acceptance criteria

---

### Task 5: Frontend - Integration with Application List
**Given** a new application has been successfully created  
**When** the form submission completes  
**Then** the application list refreshes to show the new application and the form is reset

**Status**: ⚪ NOT STARTED
