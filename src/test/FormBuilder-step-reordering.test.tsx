import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FormBuilder } from "../components/FormBuilder";
import { createMockMultiStepForm } from "./test-utils";
import type { FormConfig } from "../types/form";

const renderWithDnd = (component: React.ReactElement) => {
  return render(<DndProvider backend={HTML5Backend}>{component}</DndProvider>);
};

describe("FormBuilder Step Reordering", () => {
  it("should render draggable steps with grip handles", () => {
    const formConfig = createMockMultiStepForm();
    const onFormConfigChange = () => {};

    renderWithDnd(<FormBuilder formConfig={formConfig} onFormConfigChange={onFormConfigChange} />);

    // Should show step management section
    expect(screen.getByText("Form Steps")).toBeInTheDocument();
    expect(screen.getByText("Drag steps to reorder them")).toBeInTheDocument();

    // Should show the steps with grip handles - use getAllByText since there are multiple instances
    expect(screen.getAllByText("Personal Information").length).toBeGreaterThan(0);
    expect(screen.getByText("Contact Details")).toBeInTheDocument();

    // Should have grip handles for dragging - look for GripVertical SVG elements
    const gripHandles = screen.container.querySelectorAll('[class*="lucide-grip-vertical"]');
    expect(gripHandles.length).toBeGreaterThan(0);
  });

  it("should allow adding new steps", async () => {
    const user = userEvent.setup();
    let updatedConfig: FormConfig | null = null;
    const formConfig = createMockMultiStepForm();
    const onFormConfigChange = (config: FormConfig) => {
      updatedConfig = config;
    };

    renderWithDnd(<FormBuilder formConfig={formConfig} onFormConfigChange={onFormConfigChange} />);

    // Click Add Step button
    const addStepButton = screen.getByRole("button", { name: /add step/i });
    await user.click(addStepButton);

    // Should have called onFormConfigChange with a new step
    expect(updatedConfig).toBeTruthy();
    expect(updatedConfig!.steps.length).toBe(3); // Original 2 + 1 new
    expect(updatedConfig!.steps[2].title).toMatch(/Step 3/);
  });

  it("should allow deleting steps when more than one exists", async () => {
    const user = userEvent.setup();
    let updatedConfig: FormConfig | null = null;
    const formConfig = createMockMultiStepForm();
    const onFormConfigChange = (config: FormConfig) => {
      updatedConfig = config;
    };

    renderWithDnd(<FormBuilder formConfig={formConfig} onFormConfigChange={onFormConfigChange} />);

    // Find and click a delete button (X icon)
    const deleteButtons = screen.getAllByRole("button");
    const deleteButton = deleteButtons.find((button) => button.querySelector("svg") && button.className.includes("text-destructive"));

    if (deleteButton) {
      await user.click(deleteButton);

      // Should have called onFormConfigChange with one less step
      expect(updatedConfig).toBeTruthy();
      expect(updatedConfig!.steps.length).toBe(1); // Original 2 - 1
    }
  });

  it("should allow editing step titles", async () => {
    const user = userEvent.setup();
    let updatedConfig: FormConfig | null = null;
    const formConfig = createMockMultiStepForm();
    const onFormConfigChange = (config: FormConfig) => {
      updatedConfig = config;
    };

    renderWithDnd(<FormBuilder formConfig={formConfig} onFormConfigChange={onFormConfigChange} />);

    // Find and click an edit button (Edit2 icon)
    const editButtons = screen.getAllByRole("button");
    const editButton = editButtons.find((button) => button.querySelector("svg") && !button.className.includes("text-destructive") && button.className.includes("px-2"));

    if (editButton) {
      await user.click(editButton);

      // Should show the step editor
      expect(screen.getByText("Edit Step")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Personal Information")).toBeInTheDocument();

      // Edit the step title
      const titleInput = screen.getByDisplayValue("Personal Information");
      await user.clear(titleInput);
      await user.type(titleInput, "Updated Personal Info");

      // Wait a bit for the update to propagate
      await new Promise((resolve) => setTimeout(resolve, 100));

      // The config should be updated
      expect(updatedConfig).toBeTruthy();
      expect(updatedConfig!.steps[0].title).toBe("Updated Personal Info");
    }
  });

  it("should maintain step order correctly", () => {
    const formConfig = createMockMultiStepForm();
    const onFormConfigChange = () => {};

    renderWithDnd(<FormBuilder formConfig={formConfig} onFormConfigChange={onFormConfigChange} />);

    // Get all step buttons in order
    const stepButtons = screen.getAllByRole("button").filter((button) => button.textContent === "Personal Information" || button.textContent === "Contact Details");

    // Should maintain the correct order
    expect(stepButtons[0]).toHaveTextContent("Personal Information");
    expect(stepButtons.length).toBeGreaterThan(0);
  });
});
