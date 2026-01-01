import type { ReactNode } from "react";

export type ComponentType =
  | "text"
  | "email"
  | "number"
  | "phone"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "date"
  | "time"
  | "file"
  | "password"
  | "url"
  | "location"
  | "rating"
  | "signature"
  | "heading"
  | "h1"
  | "h2"
  | "h3"
  | "paragraph"
  | "divider"
  | "spacer"
  | "table";

export type FormField = {
  id: string;
  type: ComponentType;
  label: string;
  placeholder?: string;
  helper?: string;
  required?: boolean;
  options?: string[];
  width?: "full" | "half";
};

export type LibraryItem = {
  type: ComponentType;
  label: string;
  icon: string;
  category: "input" | "choice" | "layout" | "advanced";
};


export type FormStyles = {
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
  borderRadius: number;
  fontFamily: string;
};

export type ElementDefinition = {
  type: ComponentType;
  label: string;
  icon: ReactNode;
  description: string;
  defaultProps: {
    label: string;
    placeholder?: string;
    helper?: string;
    required?: boolean;
    options?: string[];
    width?: "full" | "half";
  };
};

export type WorkspaceView = "edit" | "json" | "preview";
