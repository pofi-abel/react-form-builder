# Form Builder Project - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview

This is a React-based form builder application that mimics Google Forms functionality. It uses Vite, TypeScript, Tailwind CSS, shadcn-ui components, and react-dnd for drag-and-drop functionality.

## Key Features

- **Drag-and-drop form builder**: Add questions by dragging from the sidebar
- **Multiple question types**: Short text, long text, single choice, multiple choice, date, file upload, number, email, phone
- **Conditional logic**: Show/hide questions based on previous answers
- **Multi-step forms**: Support for single-page or multi-step forms with customizable step names
- **Form preview**: Real-time preview of the form as users would see it
- **JSON export**: Export form configuration as JSON for use in other systems

## Technical Architecture

### Types (`src/types/form.ts`)

- `Question`: Individual form question with type, validation, and conditional logic
- `Step`: Collection of questions for multi-step forms
- `FormConfig`: Complete form configuration including settings
- `FormResponse`: User responses to form questions
- `ConditionalLogic`: Rules for showing/hiding questions

### Components

- `QuestionRenderer`: Renders different question types based on configuration
- `QuestionSidebar`: Draggable question types palette
- `FormBuilder`: Main builder interface with drag-and-drop
- `FormPreview`: Live preview of the form
- `App`: Main application with view switching

### State Management

- Form configuration is managed as a single FormConfig object
- Responses are stored in FormResponse object with questionId as keys
- Conditional logic is evaluated in real-time to show/hide questions

## Coding Guidelines

- Use TypeScript with strict type checking
- Follow React best practices with functional components and hooks
- Use Tailwind CSS for styling with shadcn-ui component patterns
- Implement proper drag-and-drop with react-dnd
- Ensure responsive design for mobile and desktop
- Use proper error handling and validation

## Key Libraries

- **React**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **shadcn-ui**: UI components
- **react-dnd**: Drag and drop
- **react-hook-form**: Form handling
- **zod**: Schema validation
- **lucide-react**: Icons

## Conditional Logic Implementation

Questions can have conditional logic that determines when they should be shown:

- Support for equals, not-equals, contains, not-contains conditions
- Can reference any previous question's response
- Supports both single values and arrays for multi-select conditions

## Sample JSON Output

The application exports forms as JSON with this structure:

```json
{
  "id": "sample-form",
  "title": "Sample Medical Form",
  "isMultiStep": true,
  "steps": [...],
  "settings": {
    "allowBack": true,
    "showProgress": true,
    "submitButtonText": "Submit Form",
    "successMessage": "Thank you!"
  }
}
```
