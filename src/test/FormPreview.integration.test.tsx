import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormPreview } from "../components/FormPreview";
import { createMockMultiStepForm, createMockFormConfig } from "./test-utils";

describe("FormPreview Integration Tests", () => {
  describe("Single Step Form", () => {
    it("should render a single step form correctly", () => {
      const formConfig = createMockFormConfig({
        title: "Test Survey",
        description: "A test survey form",
        isMultiStep: false,
      });

      render(<FormPreview formConfig={formConfig} />);

      expect(screen.getByText("Test Survey")).toBeInTheDocument();
      expect(screen.getByText("A test survey form")).toBeInTheDocument();
      expect(screen.getByText("Test Question")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
    });

    it("should not show progress indicator for single step forms", () => {
      const formConfig = createMockFormConfig({ isMultiStep: false });

      render(<FormPreview formConfig={formConfig} />);

      expect(screen.queryByText(/step \d+ of \d+/i)).not.toBeInTheDocument();
    });
  });

  describe("Multi-Step Form", () => {
    it("should render multi-step form with progress indicator", () => {
      const formConfig = createMockMultiStepForm();

      render(<FormPreview formConfig={formConfig} />);

      expect(screen.getByText("Multi-Step Test Form")).toBeInTheDocument();
      expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
      expect(screen.getByText("Personal Information")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /previous/i })).toBeDisabled();
    });

    it("should navigate between steps", async () => {
      const user = userEvent.setup();
      const formConfig = createMockMultiStepForm();

      render(<FormPreview formConfig={formConfig} />);

      // Fill required field on first step
      const nameInput = screen.getByRole("textbox");
      await user.type(nameInput, "John Doe");

      // Click Next button
      await user.click(screen.getByRole("button", { name: /next/i }));

      // Should be on step 2
      expect(screen.getByText("Step 2 of 2")).toBeInTheDocument();
      expect(screen.getByText("Contact Details")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /previous/i })).not.toBeDisabled();
    });

    it("should go back to previous step", async () => {
      const user = userEvent.setup();
      const formConfig = createMockMultiStepForm();

      render(<FormPreview formConfig={formConfig} />);

      // Fill required field and go to step 2
      const nameInput = screen.getByRole("textbox");
      await user.type(nameInput, "John Doe");
      await user.click(screen.getByRole("button", { name: /next/i }));

      // Go back to step 1
      await user.click(screen.getByRole("button", { name: /previous/i }));

      expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
      expect(screen.getByText("Personal Information")).toBeInTheDocument();
    });

    it("should disable next button when required fields are empty", () => {
      const formConfig = createMockMultiStepForm();

      render(<FormPreview formConfig={formConfig} />);

      const nextButton = screen.getByRole("button", { name: /next/i });
      expect(nextButton).toBeDisabled();
    });

    it("should enable next button when required fields are filled", async () => {
      const user = userEvent.setup();
      const formConfig = createMockMultiStepForm();

      render(<FormPreview formConfig={formConfig} />);

      const nameInput = screen.getByRole("textbox");
      await user.type(nameInput, "John Doe");

      const nextButton = screen.getByRole("button", { name: /next/i });
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe("Conditional Logic", () => {
    it("should show conditional questions when condition is met", async () => {
      const user = userEvent.setup();
      const formConfig = createMockMultiStepForm();

      render(<FormPreview formConfig={formConfig} />);

      // Fill required name field
      const nameInput = screen.getByRole("textbox");
      await user.type(nameInput, "John Doe");

      // Select "Yes" for has-email question
      await user.click(screen.getByLabelText("Yes"));

      // Move to next step
      await user.click(screen.getByRole("button", { name: /next/i }));

      // The conditional email question should be visible
      expect(screen.getByText("Conditional Email Question")).toBeInTheDocument();
    });

    it("should hide conditional questions when condition is not met", async () => {
      const user = userEvent.setup();
      const formConfig = createMockMultiStepForm();

      render(<FormPreview formConfig={formConfig} />);

      // Fill required name field
      const nameInput = screen.getByRole("textbox");
      await user.type(nameInput, "John Doe");

      // Select "No" for has-email question
      await user.click(screen.getByLabelText("No"));

      // Move to next step
      await user.click(screen.getByRole("button", { name: /next/i }));

      // The conditional email question should be hidden
      expect(screen.queryByText("Conditional Email Question")).not.toBeInTheDocument();
      // But other questions should still be visible
      expect(screen.getByText("Your interests")).toBeInTheDocument();
    });

    it("should clear values when conditional questions become hidden", async () => {
      const user = userEvent.setup();
      const formConfig = createMockMultiStepForm();

      render(<FormPreview formConfig={formConfig} />);

      // Fill required name field
      const nameInput = screen.getByRole("textbox");
      await user.type(nameInput, "John Doe");

      // Select "Yes" for has-email question to show conditional field
      await user.click(screen.getByLabelText("Yes"));

      // Move to next step
      await user.click(screen.getByRole("button", { name: /next/i }));

      // Fill the conditional email question
      const emailInput = screen.getByRole("textbox");
      await user.type(emailInput, "test@example.com");

      // Go back to previous step
      await user.click(screen.getByRole("button", { name: /previous/i }));

      // Change answer to "No" - this should hide the email field and clear its value
      await user.click(screen.getByLabelText("No"));

      // Go forward again
      await user.click(screen.getByRole("button", { name: /next/i }));

      // The conditional email question should be hidden
      expect(screen.queryByText("Conditional Email Question")).not.toBeInTheDocument();

      // If we switch back to "Yes", the email field should be empty
      await user.click(screen.getByRole("button", { name: /previous/i }));
      await user.click(screen.getByLabelText("Yes"));
      await user.click(screen.getByRole("button", { name: /next/i }));

      // Now the email field should be visible but empty
      expect(screen.getByText("Conditional Email Question")).toBeInTheDocument();
      const newEmailInput = screen.getByRole("textbox");
      expect(newEmailInput).toHaveValue("");
    });

    it("should support multiple values in equals conditions (OR logic)", async () => {
      const user = userEvent.setup();

      // Create a form with multiple choice question and conditional logic
      const formConfig = createMockFormConfig({
        steps: [
          {
            id: "step-1",
            title: "Vision",
            questions: [
              {
                id: "vision-aid",
                type: "single-choice",
                title: "Do you use glasses or contact lenses?",
                required: true,
                options: [
                  { id: "glasses", label: "Glasses", value: "glasses" },
                  { id: "contacts", label: "Contact lenses", value: "contact-lense" },
                  { id: "none", label: "None", value: "none" },
                ],
              },
              {
                id: "eye-care",
                type: "short-text",
                title: "Please describe your eye care routine",
                required: false,
                conditionalLogic: [
                  {
                    questionId: "vision-aid",
                    condition: "equals",
                    value: ["glasses", "contact-lense"],
                  },
                ],
              },
            ],
          },
        ],
      });

      render(<FormPreview formConfig={formConfig} />);

      // Initially, the conditional question should not be visible
      expect(screen.queryByText("Please describe your eye care routine")).not.toBeInTheDocument();

      // Select "Glasses" - should show the conditional question
      await user.click(screen.getByLabelText("Glasses"));
      expect(screen.getByText("Please describe your eye care routine")).toBeInTheDocument();

      // Switch to "Contact lenses" - should still show the conditional question
      await user.click(screen.getByLabelText("Contact lenses"));
      expect(screen.getByText("Please describe your eye care routine")).toBeInTheDocument();

      // Switch to "None" - should hide the conditional question
      await user.click(screen.getByLabelText("None"));
      expect(screen.queryByText("Please describe your eye care routine")).not.toBeInTheDocument();
    });
  });

  describe("Form Submission", () => {
    it("should submit form and show success message", async () => {
      const user = userEvent.setup();
      const formConfig = createMockFormConfig({
        isMultiStep: false,
        settings: {
          allowBack: true,
          showProgress: true,
          submitButtonText: "Send Form",
          successMessage: "Thank you for your submission!",
        },
      });

      render(<FormPreview formConfig={formConfig} />);

      // Fill the form
      const input = screen.getByRole("textbox");
      await user.type(input, "Test Response");

      // Submit the form
      await user.click(screen.getByRole("button", { name: /send form/i }));

      // Should show success message
      expect(screen.getByText("Thank you for your submission!")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /fill form again/i })).toBeInTheDocument();
    });

    it('should reset form when "Fill Form Again" is clicked', async () => {
      const user = userEvent.setup();
      const formConfig = createMockFormConfig({ isMultiStep: false });

      render(<FormPreview formConfig={formConfig} />);

      // Fill and submit form
      const input = screen.getByRole("textbox");
      await user.type(input, "Test Response");
      await user.click(screen.getByRole("button", { name: /submit/i }));

      // Click "Fill Form Again"
      await user.click(screen.getByRole("button", { name: /fill form again/i }));

      // Should be back to the form
      expect(screen.getByText("Test Question")).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toHaveValue("");
    });
  });

  describe("Form Validation", () => {
    it("should prevent submission when required fields are empty", () => {
      const formConfig = createMockFormConfig({
        steps: [
          {
            id: "test-step",
            title: "Test Step",
            questions: [
              {
                id: "required-question",
                type: "short-text",
                title: "Required Question",
                required: true,
              },
            ],
          },
        ],
      });

      render(<FormPreview formConfig={formConfig} />);

      const submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).toBeDisabled();
    });

    it("should allow submission when all required fields are filled", async () => {
      const user = userEvent.setup();
      const formConfig = createMockFormConfig({
        steps: [
          {
            id: "test-step",
            title: "Test Step",
            questions: [
              {
                id: "required-question",
                type: "short-text",
                title: "Required Question",
                required: true,
              },
            ],
          },
        ],
      });

      render(<FormPreview formConfig={formConfig} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "Required answer");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe("Progress Indicator", () => {
    it("should show progress bar when enabled", () => {
      const formConfig = createMockMultiStepForm();

      render(<FormPreview formConfig={formConfig} />);

      expect(screen.getByText("50%")).toBeInTheDocument();
      // Look for progress bar by its role or aria attributes
      const progressBar = screen.getByRole("progressbar", { hidden: true });
      expect(progressBar).toBeInTheDocument();
    });

    it("should not show progress bar when disabled", () => {
      const formConfig = createMockMultiStepForm();
      formConfig.settings.showProgress = false;

      render(<FormPreview formConfig={formConfig} />);

      expect(screen.queryByText("50%")).not.toBeInTheDocument();
    });

    it("should update progress as user moves through steps", async () => {
      const user = userEvent.setup();
      const formConfig = createMockMultiStepForm();

      render(<FormPreview formConfig={formConfig} />);

      // Initially at 50% (step 1 of 2)
      expect(screen.getByText("50%")).toBeInTheDocument();

      // Fill required field and go to next step
      const nameInput = screen.getByRole("textbox");
      await user.type(nameInput, "John Doe");
      await user.click(screen.getByRole("button", { name: /next/i }));

      // Should be at 100% (step 2 of 2)
      expect(screen.getByText("100%")).toBeInTheDocument();
    });
  });
});
