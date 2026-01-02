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
  | "location"
  | "heading"
  | "divider"
  | "spacer"
  | "table";

// Vueform-inspired property types
export type VueformCondition = {
  field: string;
  operator: "==" | "!=" | ">" | "<" | ">=" | "<=";
  value: any;
};

export type VueformRule = string | { [key: string]: any };

export type VueformItem = {
  value: string | number;
  label: string;
  disabled?: boolean;
};

export type VueformColumn = {
  name: string;
  label: string;
  type: "text" | "number" | "email" | "select";
  width?: string;
};

// Base properties shared by most components
export type BaseVueformProps = {
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  default?: any;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  width?: "full" | "half";
  rules?: VueformRule[];
  conditions?: VueformCondition[];
  attrs?: Record<string, any>;
  addClass?: string;
  removeClasses?: string[];
  replaceClasses?: Record<string, string>;
  overrideClasses?: Record<string, string>;
};

// Input field properties (text, email, url, location)
export type InputVueformProps = BaseVueformProps & {
  autocomplete?: string;
  inputType?: string;
};

// Number field properties
export type NumberVueformProps = BaseVueformProps & {
  min?: number | null;
  max?: number | null;
  step?: number;
};

// Choice field properties (radio, checkbox)
export type ChoiceVueformProps = Omit<BaseVueformProps, "placeholder"> & {
  items: VueformItem[];
  view?: "tabs" | "blocks" | "default";
};

// Date field properties
export type DateVueformProps = BaseVueformProps & {
  displayFormat?: string;
  valueFormat?: string;
  loadFormat?: string;
  hour24?: boolean;
  min?: string | null;
  max?: string | null;
  disables?: string[];
};

// Heading properties
export type HeadingVueformProps = {
  name: string;
  content: string;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  width?: "full" | "half";
  conditions?: VueformCondition[];
  attrs?: Record<string, any>;
  addClass?: string;
  removeClasses?: string[];
  replaceClasses?: Record<string, string>;
  overrideClasses?: Record<string, string>;
};

// Divider properties
export type DividerVueformProps = {
  name: string;
  width?: "full" | "half";
  conditions?: VueformCondition[];
  attrs?: Record<string, any>;
  addClass?: string;
  removeClasses?: string[];
  replaceClasses?: Record<string, string>;
  overrideClasses?: Record<string, string>;
};

// Spacer properties
export type SpacerVueformProps = DividerVueformProps & {
  height?: string;
};

// Table field properties
export type TableVueformProps = BaseVueformProps & {
  columns: VueformColumn[];
  addLabel?: string;
  removeLabel?: string;
};

// Union type for all Vueform props
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
  // Add Vueform properties
  name?: string;
  description?: string;
  default?: any;
  disabled?: boolean;
  readonly?: boolean;
  rules?: VueformRule[];
  conditions?: VueformCondition[];
  attrs?: Record<string, any>;
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
