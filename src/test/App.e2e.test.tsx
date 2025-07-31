import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

describe("Form Builder E2E Workflow", () => {
  describe("Complete Form Creation and Testing Workflow", () => {
    it("should allow creating a form and testing it end-to-end", async () => {
      const user = userEvent.setup();

      render(<App />);

      // Start in builder view
      expect(screen.getByText("Form Builder")).toBeInTheDocument();
      expect(screen.getByText("Drag questions here to build your form")).toBeInTheDocument();

      // Test form title editing
      const titleInput = screen.getByDisplayValue("Untitled Form");
      await user.clear(titleInput);
      await user.type(titleInput, "Customer Feedback Survey");
      expect(titleInput).toHaveValue("Customer Feedback Survey");

      // Test adding form description
      const descriptionTextarea = screen.getByPlaceholderText("Enter form description...");
      await user.type(descriptionTextarea, "Please provide your feedback to help us improve our services.");

      // Test dragging a question from sidebar
      // Note: This would require more complex drag-and-drop testing setup
      // For now, we'll test the basic UI elements are present
      expect(screen.getByText("Short Text")).toBeInTheDocument();
      expect(screen.getByText("Single Choice")).toBeInTheDocument();
      expect(screen.getByText("Multiple Choice")).toBeInTheDocument();

      // Switch to preview mode
      await user.click(screen.getByText("Preview"));

      // Verify the form appears in preview with our changes
      expect(screen.getByText("Customer Feedback Survey")).toBeInTheDocument();
      expect(screen.getByText("Please provide your feedback to help us improve our services.")).toBeInTheDocument();

      // Switch back to builder
      await user.click(screen.getByText("Builder"));

      // Verify we're back in builder mode
      expect(screen.getByText("Drag questions here to build your form")).toBeInTheDocument();
    });

    it("should handle multi-step form configuration", async () => {
      const user = userEvent.setup();

      render(<App />);

      // Enable multi-step mode
      const multiStepCheckbox = screen.getByLabelText("Multi-step form");
      await user.click(multiStepCheckbox);

      // Check that step management appears
      expect(screen.getByText("Step 1")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /add step/i })).toBeInTheDocument();

      // Add a new step
      await user.click(screen.getByRole("button", { name: /add step/i }));

      // Should now have 2 steps
      const stepTabs = screen.getAllByText(/^Step \d+$/);
      expect(stepTabs).toHaveLength(2);

      // Test step editing
      const editButton = screen.getAllByRole("button", { name: /edit/i })[0];
      await user.click(editButton);

      // Should show edit interface (input field should appear)
      const editInput = screen.getByDisplayValue("Step 1");
      await user.clear(editInput);
      await user.type(editInput, "Personal Information");

      // Save the edit (click outside or press Enter)
      await user.keyboard("{Enter}");

      // Verify the step was renamed
      expect(screen.getByText("Personal Information")).toBeInTheDocument();
    });

    it("should export form configuration correctly", async () => {
      const user = userEvent.setup();

      render(<App />);

      // Modify form title
      const titleInput = screen.getByDisplayValue("Untitled Form");
      await user.clear(titleInput);
      await user.type(titleInput, "Test Export Form");

      // Enable multi-step
      await user.click(screen.getByLabelText("Multi-step form"));

      // Switch to export view
      await user.click(screen.getByText("Export"));

      // Verify export view shows JSON
      expect(screen.getByText("Form JSON Configuration")).toBeInTheDocument();

      // The JSON should contain our form title
      const jsonContent = screen.getByRole("textbox", { name: /json configuration/i });
      expect(jsonContent).toHaveValue(expect.stringContaining("Test Export Form"));
      expect(jsonContent).toHaveValue(expect.stringContaining('"isMultiStep": true'));
    });

    it("should maintain state when switching between views", async () => {
      const user = userEvent.setup();

      render(<App />);

      // Modify form in builder
      const titleInput = screen.getByDisplayValue("Untitled Form");
      await user.clear(titleInput);
      await user.type(titleInput, "State Persistence Test");

      const descriptionTextarea = screen.getByPlaceholderText("Enter form description...");
      await user.type(descriptionTextarea, "Testing state persistence across views.");

      // Switch to preview
      await user.click(screen.getByText("Preview"));
      expect(screen.getByText("State Persistence Test")).toBeInTheDocument();
      expect(screen.getByText("Testing state persistence across views.")).toBeInTheDocument();

      // Switch to export
      await user.click(screen.getByText("Export"));
      const jsonContent = screen.getByRole("textbox", { name: /json configuration/i });
      expect(jsonContent).toHaveValue(expect.stringContaining("State Persistence Test"));

      // Switch back to builder
      await user.click(screen.getByText("Builder"));

      // Verify state is preserved
      expect(screen.getByDisplayValue("State Persistence Test")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Testing state persistence across views.")).toBeInTheDocument();
    });

    it("should handle form settings correctly", async () => {
      const user = userEvent.setup();

      render(<App />);

      // Enable multi-step to access more settings
      await user.click(screen.getByLabelText("Multi-step form"));

      // Test allow back setting
      const allowBackCheckbox = screen.getByLabelText("Allow going back to previous steps");
      expect(allowBackCheckbox).toBeChecked(); // Should be checked by default

      await user.click(allowBackCheckbox);
      expect(allowBackCheckbox).not.toBeChecked();

      // Test show progress setting
      const showProgressCheckbox = screen.getByLabelText("Show progress indicator");
      expect(showProgressCheckbox).toBeChecked(); // Should be checked by default

      await user.click(showProgressCheckbox);
      expect(showProgressCheckbox).not.toBeChecked();

      // Test custom submit button text
      const submitButtonInput = screen.getByDisplayValue("Submit Form");
      await user.clear(submitButtonInput);
      await user.type(submitButtonInput, "Send Feedback");
      expect(submitButtonInput).toHaveValue("Send Feedback");

      // Test custom success message
      const successMessageInput = screen.getByDisplayValue("Thank you for your submission!");
      await user.clear(successMessageInput);
      await user.type(successMessageInput, "Feedback received! We appreciate your input.");
      expect(successMessageInput).toHaveValue("Feedback received! We appreciate your input.");

      // Switch to preview to verify settings take effect
      await user.click(screen.getByText("Preview"));

      // Check that custom submit button text appears
      expect(screen.getByRole("button", { name: /send feedback/i })).toBeInTheDocument();

      // Check that progress indicator is hidden when disabled
      expect(screen.queryByText("%")).not.toBeInTheDocument();
    });

    it("should validate form configuration before export", async () => {
      const user = userEvent.setup();

      render(<App />);

      // Start with empty form title
      const titleInput = screen.getByDisplayValue("Untitled Form");
      await user.clear(titleInput);

      // Switch to export view
      await user.click(screen.getByText("Export"));

      // Should still generate valid JSON even with empty title
      const jsonContent = screen.getByRole("textbox", { name: /json configuration/i }) as HTMLTextAreaElement;
      expect(jsonContent.value).toBeTruthy();

      // Parse JSON to ensure it's valid
      expect(() => JSON.parse(jsonContent.value)).not.toThrow();
    });
  });

  describe("Responsive Design and Accessibility", () => {
    it("should have proper heading structure", () => {
      render(<App />);

      // Check for proper heading hierarchy
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    });

    it("should have proper form labels and inputs", () => {
      render(<App />);

      // Check that form inputs have proper labels
      const titleInput = screen.getByDisplayValue("Untitled Form");
      expect(titleInput).toHaveAttribute("id");

      const multiStepCheckbox = screen.getByLabelText("Multi-step form");
      expect(multiStepCheckbox).toHaveAttribute("type", "checkbox");
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();

      render(<App />);

      // Test tab navigation through main interface elements
      await user.tab();
      expect(document.activeElement).toHaveAttribute("type", "text"); // Title input

      await user.tab();
      expect(document.activeElement).toHaveAttribute("placeholder", "Enter form description..."); // Description

      await user.tab();
      expect(document.activeElement).toHaveAttribute("type", "checkbox"); // Multi-step checkbox
    });
  });
});
