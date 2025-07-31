import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuestionRenderer } from "../components/QuestionRenderer";
import { createMockQuestion, createMockSingleChoiceQuestion } from "./test-utils";

describe("QuestionRenderer", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe("Short Text Questions", () => {
    it("should render a short text input", () => {
      const question = createMockQuestion({
        type: "short-text",
        title: "What is your name?",
      });

      render(<QuestionRenderer question={question} value="" onChange={mockOnChange} />);

      expect(screen.getByText("What is your name?")).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("should call onChange when text input value changes", async () => {
      const user = userEvent.setup();
      const question = createMockQuestion({ type: "short-text" });

      render(<QuestionRenderer question={question} value="" onChange={mockOnChange} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "Test");

      // Check that onChange was called (once per character typed)
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe("Single Choice Questions", () => {
    it("should render radio buttons for single choice", () => {
      const question = createMockSingleChoiceQuestion();

      render(<QuestionRenderer question={question} value="" onChange={mockOnChange} />);

      expect(screen.getByText("Choose one option")).toBeInTheDocument();
      expect(screen.getByLabelText("Yes")).toBeInTheDocument();
      expect(screen.getByLabelText("No")).toBeInTheDocument();
    });

    it("should call onChange when radio button is selected", async () => {
      const user = userEvent.setup();
      const question = createMockSingleChoiceQuestion();

      render(<QuestionRenderer question={question} value="" onChange={mockOnChange} />);

      const yesOption = screen.getByLabelText("Yes");
      await user.click(yesOption);

      expect(mockOnChange).toHaveBeenCalledWith("yes");
    });
  });

  describe("Required Questions", () => {
    it("should show required indicator", () => {
      const question = createMockQuestion({
        type: "short-text",
        required: true,
      });

      render(<QuestionRenderer question={question} value="" onChange={mockOnChange} />);

      expect(screen.getByText("*")).toBeInTheDocument();
    });
  });

  describe("Disabled State", () => {
    it("should disable input when disabled prop is true", () => {
      const question = createMockQuestion({ type: "short-text" });

      render(<QuestionRenderer question={question} value="" onChange={mockOnChange} disabled />);

      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();
    });
  });

  describe("Question Description", () => {
    it("should display question description when provided", () => {
      const question = createMockQuestion({
        type: "short-text",
        description: "Please enter your full legal name",
      });

      render(<QuestionRenderer question={question} value="" onChange={mockOnChange} />);

      expect(screen.getByText("Please enter your full legal name")).toBeInTheDocument();
    });
  });
});
