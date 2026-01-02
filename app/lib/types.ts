import type { ReactNode } from "react";

export type ComponentType =
  | "text"
  | "textarea"
  | "email"
  | "number"
  | "url"
  | "checkbox"
  | "radio"
  | "date"
  | "heading"
  | "divider"
  | "spacer"
  | "table";

export type VueformItem = {
  value: string | number;
  label: string;
  disabled?: boolean;
};

export type VueformColumn = {
  name: string;
  label: string;
  type: "text" | "number" | "email" | "select" | "date";
  width?: string;
  placeholder?: string;
  options?: VueformItem[];
};

export type VueformAddon = {
  before?: string;
  after?: string;
};

export type BaseVueformProps = {
  name: string;
  id?: string;
  label?: string;
  placeholder?: string;
  default?: any;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  width?: "full" | "half";
  size?: "sm" | "md" | "lg";
};

export type InputVueformProps = BaseVueformProps & {
  inputType?: "text" | "email" | "url";
  addons?: VueformAddon;
};

export type NumberVueformProps = BaseVueformProps & {
  inputType?: "number";
  min?: number | null;
  max?: number | null;
  step?: number;
  addons?: VueformAddon;
};

export type ChoiceVueformProps = Omit<BaseVueformProps, "placeholder"> & {
  items: VueformItem[];
  view?: "tabs" | "blocks" | "default";
  labelPosition?: "left" | "right";
};

export type DateVueformProps = BaseVueformProps & {
  format?: string;
  minDate?: string | null;
  maxDate?: string | null;
  addons?: VueformAddon;
};

export type HeadingVueformProps = {
  name: string;
  content: string;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  align?: "left" | "center" | "right";
  width?: "full" | "half";
};

export type DividerVueformProps = {
  name: string;
  width?: "full" | "half";
};

export type SpacerVueformProps = DividerVueformProps & {
  height?: string;
};

export type TableVueformProps = BaseVueformProps & {
  columns: VueformColumn[];
  rows?: Record<string, any>[];
};

export type VueformProps =
  | InputVueformProps
  | NumberVueformProps
  | ChoiceVueformProps
  | DateVueformProps
  | HeadingVueformProps
  | DividerVueformProps
  | SpacerVueformProps
  | TableVueformProps;

export type FormField = {
  id: string;
  type: ComponentType;
  label: string;
  placeholder?: string;
  helper?: string;
  required?: boolean;
  options?: string[];
  width?: "full" | "half";
  widthPercent?: number; // 25-100 percentage width
  name?: string;
  default?: any;
  disabled?: boolean;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  inputType?: string;
  addons?: VueformAddon;
  min?: number | string | null;
  max?: number | string | null;
  step?: number;
  format?: string;
  minDate?: string;
  maxDate?: string;
  items?: VueformItem[];
  view?: "tabs" | "blocks" | "default";
  labelPosition?: "left" | "right";
  content?: string;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  align?: "left" | "center" | "right";
  height?: string;
  columns?: VueformColumn[];
  rows?: Record<string, any>[];
  [key: string]: any; // Allow additional properties
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
  defaultProps: Partial<VueformProps> & { width?: "full" | "half" };
};

export type WorkspaceView = "edit" | "json" | "preview";
