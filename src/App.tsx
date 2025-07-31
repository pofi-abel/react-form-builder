import { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionSidebar } from "@/components/QuestionSidebar";
import { FormBuilder } from "@/components/FormBuilder";
import { FormPreview } from "@/components/FormPreview";
import { FormRendererDemo } from "@/components/FormRendererDemo";
import type { FormConfig } from "@/types/form";
import { Eye, Edit, Download, Settings, Play } from "lucide-react";

const initialFormConfig: FormConfig = {
  id: "sample-form",
  title: "Sample Medical Form",
  description: "A sample form showcasing conditional logic and multi-step functionality",
  isMultiStep: true,
  steps: [
    {
      id: "step-1",
      title: "Basic Information",
      description: "Please provide your basic information",
      questions: [
        {
          id: "question-1",
          type: "short-text",
          title: "What is your full name?",
          description: "Please enter your first and last name",
          required: true,
          placeholder: "John Doe",
        },
        {
          id: "question-2",
          type: "single-choice",
          title: "Are you an amputee?",
          description: "This will determine additional questions to show",
          required: true,
          options: [
            { id: "yes-option", label: "Yes", value: "yes" },
            { id: "no-option", label: "No", value: "no" },
          ],
        },
        {
          id: "question-3",
          type: "multiple-choice",
          title: "Select amputee area(s)?",
          description: "Choose all areas that apply",
          required: true,
          options: [
            { id: "right-arm", label: "Right arm", value: "right-arm" },
            { id: "left-arm", label: "Left arm", value: "left-arm" },
            { id: "right-leg", label: "Right leg", value: "right-leg" },
            { id: "left-leg", label: "Left leg", value: "left-leg" },
          ],
          conditionalLogic: [
            {
              questionId: "question-2",
              condition: "equals",
              value: "yes",
            },
          ],
        },
      ],
    },
    {
      id: "step-2",
      title: "Additional Information",
      description: "Please provide additional details",
      questions: [
        {
          id: "question-4",
          type: "date",
          title: "Date of birth",
          required: true,
        },
        {
          id: "question-5",
          type: "email",
          title: "Email address",
          required: true,
          placeholder: "john.doe@example.com",
        },
        {
          id: "question-6",
          type: "long-text",
          title: "Additional comments",
          description: "Any additional information you would like to share",
          required: false,
          placeholder: "Enter your comments here...",
        },
      ],
    },
  ],
  settings: {
    allowBack: true,
    showProgress: true,
    submitButtonText: "Submit Form",
    successMessage: "Thank you! Your form has been submitted successfully.",
  },
};

type ViewMode = "builder" | "preview" | "settings" | "demo";

function App() {
  const [formConfig, setFormConfig] = useState<FormConfig>(initialFormConfig);
  const [viewMode, setViewMode] = useState<ViewMode>("builder");

  const exportFormConfig = () => {
    const blob = new Blob([JSON.stringify(formConfig, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formConfig.title.toLowerCase().replace(/\s+/g, "-")}-config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderContent = () => {
    switch (viewMode) {
      case "builder":
        return (
          <DndProvider backend={HTML5Backend}>
            <div className="flex h-full">
              <QuestionSidebar />
              <FormBuilder formConfig={formConfig} onFormConfigChange={setFormConfig} />
            </div>
          </DndProvider>
        );

      case "preview":
        return (
          <div className="min-h-full">
            <FormPreview formConfig={formConfig} />
          </div>
        );

      case "settings":
        return (
          <div className="min-h-full py-6">
            <div className="max-w-2xl mx-auto p-6">
              <Card>
                <CardHeader>
                  <CardTitle>Form Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Form Title</label>
                    <input type="text" value={formConfig.title} onChange={(e) => setFormConfig({ ...formConfig, title: e.target.value })} className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea value={formConfig.description || ""} onChange={(e) => setFormConfig({ ...formConfig, description: e.target.value })} className="w-full p-2 border rounded" rows={3} />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" checked={formConfig.isMultiStep} onChange={(e) => setFormConfig({ ...formConfig, isMultiStep: e.target.checked })} />
                      <span>Multi-step form</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formConfig.settings.allowBack}
                        onChange={(e) =>
                          setFormConfig({
                            ...formConfig,
                            settings: { ...formConfig.settings, allowBack: e.target.checked },
                          })
                        }
                      />
                      <span>Allow going back to previous steps</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formConfig.settings.showProgress}
                        onChange={(e) =>
                          setFormConfig({
                            ...formConfig,
                            settings: { ...formConfig.settings, showProgress: e.target.checked },
                          })
                        }
                      />
                      <span>Show progress indicator</span>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "demo":
        return <FormRendererDemo />;

      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Form Builder</h1>
            <p className="text-sm text-muted-foreground">Create dynamic forms with conditional logic</p>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant={viewMode === "builder" ? "default" : "outline"} onClick={() => setViewMode("builder")} className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Builder
            </Button>

            <Button variant={viewMode === "preview" ? "default" : "outline"} onClick={() => setViewMode("preview")} className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </Button>

            <Button variant={viewMode === "settings" ? "default" : "outline"} onClick={() => setViewMode("settings")} className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </Button>

            <Button variant={viewMode === "demo" ? "default" : "outline"} onClick={() => setViewMode("demo")} className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Demo
            </Button>

            <Button variant="outline" onClick={exportFormConfig} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export JSON
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className={`flex-1 ${viewMode === "preview" || viewMode === "settings" || viewMode === "demo" ? "overflow-y-auto" : "overflow-hidden"}`}>{renderContent()}</main>
    </div>
  );
}

export default App;
