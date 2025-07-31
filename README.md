# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Form Builder - Google Forms Clone

A comprehensive web form builder application built with Vite, TypeScript, Tailwind CSS, and shadcn-ui that mimics Google Forms functionality with advanced features like conditional logic and drag-and-drop interface.

## 🚀 Features

### Core Functionality

- **Drag-and-Drop Builder**: Intuitive sidebar with draggable question types
- **Multiple Question Types**:
  - Short Text (single line input)
  - Long Text (textarea)
  - Single Choice (radio buttons)
  - Multiple Choice (checkboxes)
  - Date Picker
  - File Upload
  - Number Input
  - Email Input
  - Phone Input

### Advanced Features

- **Conditional Logic**: Show/hide questions based on previous answers
- **Multi-Step Forms**: Switch between single-page and multi-step modes
- **Real-Time Preview**: Live preview of forms as users will see them
- **JSON Export**: Export form configurations for integration with other systems
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Form Capabilities

- **Form Validation**: Required field validation and custom validation rules
- **Question Management**: Add, edit, duplicate, reorder, and delete questions
- **Progress Tracking**: Visual progress indicators for multi-step forms
- **Customizable Settings**: Form titles, descriptions, button text, and success messages

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4 with custom CSS variables
- **UI Components**: shadcn-ui (Radix UI primitives)
- **Drag & Drop**: react-dnd with HTML5 backend
- **Form Handling**: react-hook-form with zod validation
- **Icons**: Lucide React
- **Package Manager**: pnpm

## 📋 Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

## 🚀 Getting Started

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd poc-quizbuilder
   pnpm install
   ```

2. **Start the development server:**

   ```bash
   pnpm dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173`

## 🎯 Usage Guide

### Building a Form

1. **Start Building**: Use the Builder tab to create your form
2. **Add Questions**: Drag question types from the sidebar to the form area
3. **Configure Questions**: Click the settings icon to customize each question
4. **Set Conditional Logic**: Add conditions to show/hide questions based on responses
5. **Preview**: Use the Preview tab to test your form
6. **Export**: Download the JSON configuration when ready

### Sample Conditional Logic

The application includes a sample medical form demonstrating conditional logic:

- "Are you an amputee?" with Yes/No options
- "Select amputee area(s)?" appears only when "Yes" is selected
- Multiple areas can be selected with checkboxes

### JSON Configuration Example

```json
{
  "id": "sample-form",
  "title": "Sample Medical Form",
  "description": "A sample form showcasing conditional logic",
  "isMultiStep": true,
  "steps": [
    {
      "id": "step-1",
      "title": "Basic Information",
      "questions": [
        {
          "id": "question-2",
          "type": "single-choice",
          "title": "Are you an amputee?",
          "required": true,
          "options": [
            { "id": "yes-option", "label": "Yes", "value": "yes" },
            { "id": "no-option", "label": "No", "value": "no" }
          ]
        },
        {
          "id": "question-3",
          "type": "multiple-choice",
          "title": "Select amputee area(s)?",
          "conditionalLogic": [
            {
              "questionId": "question-2",
              "condition": "equals",
              "value": "yes"
            }
          ],
          "options": [
            { "id": "right-arm", "label": "Right arm", "value": "right-arm" },
            { "id": "left-arm", "label": "Left arm", "value": "left-arm" },
            { "id": "right-leg", "label": "Right leg", "value": "right-leg" },
            { "id": "left-leg", "label": "Left leg", "value": "left-leg" }
          ]
        }
      ]
    }
  ],
  "settings": {
    "allowBack": true,
    "showProgress": true,
    "submitButtonText": "Submit Form",
    "successMessage": "Thank you! Your form has been submitted."
  }
}
```

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # shadcn-ui components
│   ├── FormBuilder.tsx  # Main form builder interface
│   ├── FormPreview.tsx  # Form preview component
│   ├── QuestionRenderer.tsx # Question display logic
│   └── QuestionSidebar.tsx  # Draggable question palette
├── types/
│   └── form.ts          # TypeScript type definitions
├── lib/
│   └── utils.ts         # Utility functions
└── App.tsx              # Main application component
```

## 🔧 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

## 🎨 Customization

### Adding New Question Types

1. Add the new type to `QuestionType` in `src/types/form.ts`
2. Add handling in `QuestionRenderer.tsx`
3. Add the draggable item to `QuestionSidebar.tsx`
4. Update the default question creator in `FormBuilder.tsx`

### Styling

The application uses Tailwind CSS with custom CSS variables for theming. Modify `src/index.css` to customize colors and styling.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions, please open an issue on GitHub.

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
