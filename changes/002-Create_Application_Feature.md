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

**Status**: 🔵 IN PROGRESS

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

## Current Task: Task 3 - Frontend Create Application Form Component

### Current Stage: 🔵 BUILD & ASSESS

---

## PLAN Stage Details

### Test Strategy

#### Unit Tests (Frontend - with mocked API)
1. **CreateApplicationForm Component Tests** (`ui/src/components/__tests__/CreateApplicationForm.test.tsx`)
   - `Renders_FormWithNameField`
   - `Renders_FormWithDescriptionField`
   - `Renders_SubmitButton`
   - `NameField_HasCorrectLabel`
   - `DescriptionField_HasCorrectLabel`
   - `SubmitButton_HasCorrectText`
   - `Form_HasAccessibleLabels` (accessibility)

### File Changes Needed

#### Frontend Core Files
- `ui/src/components/CreateApplicationForm.tsx` - New form component
- `ui/src/components/CreateApplicationForm.module.css` - Component styles
- `ui/src/App.tsx` - Import and render the form component

#### Frontend Test Files
- `ui/src/components/__tests__/CreateApplicationForm.test.tsx` - Component tests (NEW FILE)

### Implementation Order
1. Create CreateApplicationForm.tsx with basic form structure (name input, description textarea, submit button)
2. Create CreateApplicationForm.module.css with form styling
3. Update App.tsx to include the form component
4. Write unit tests for component rendering
5. Run quality validation (npm test, type-check)

**Note**: This task focuses ONLY on rendering the form UI. Form submission logic, validation, and API integration will be handled in Task 4.

---

## BUILD & ASSESS Stage Details

### Implementation Summary

#### Files Created
1. **ui/src/components/CreateApplicationForm.tsx** - Form component with:
   - Application Name input field (text input, required)
   - Description textarea field (optional)
   - Submit button
   - Semantic HTML with proper accessibility (id/label associations)

2. **ui/src/components/CreateApplicationForm.module.css** - Component styling with:
   - Clean, modern form design matching ApplicationList styling
   - Proper form field spacing and layout
   - Focus states with visual feedback
   - Responsive button styling with hover/active states
   - Disabled state styling for future use

3. **ui/src/components/__tests__/CreateApplicationForm.test.tsx** - Unit tests covering:
   - Form renders with name field
   - Form renders with description field
   - Form renders with submit button
   - Correct labels for both fields
   - Submit button has correct text
   - Accessible label associations (via htmlFor/id)

#### Files Modified
1. **ui/src/App.tsx** - Added CreateApplicationForm component above ApplicationList

### Quality Validation Results
✅ **Frontend Tests**: All 21 tests passed (7 new tests for CreateApplicationForm)
✅ **TypeScript**: Type checking passed with no errors
✅ **Implementation**: Matches acceptance criteria - form displays with name field, description field, and submit button

### Notes
- This implementation focuses ONLY on rendering the form UI elements
- No form submission logic, validation, or API integration included (deferred to Task 4)
- Form follows existing component patterns from ApplicationList
- Accessible design with proper label associations for screen readers

---

## REFLECT & ADAPT Stage Details
*To be filled when entering this stage*

---

## COMMIT & PICK NEXT Stage Details
*To be filled when entering this stage*
