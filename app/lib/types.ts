import type { ReactNode } from "react";

export type ComponentType =
  | "text"
  | "textarea"
  | "email"
  | "number"
  | "checkbox"
  | "radio"
  | "date"
  | "dropdown"
  | "slider"
  | "heading"
  | "divider"
  | "spacer"
  | "table";

// ============================================
// Custom Scripts & Validation Types
// ============================================

export type CustomScript = {
  id: string;
  name: string;
  trigger: "onChange" | "onBlur" | "onFocus" | "onMount" | "onValidate" | "onSubmit";
  code: string; // JavaScript code snippet
  enabled: boolean;
  description?: string;
};

export type ValidationRule = {
  id: string;
  type: "required" | "minLength" | "maxLength" | "min" | "max" | "pattern" | "email" | "custom";
  value?: string | number | boolean;
  message: string;
  customValidator?: string; // JavaScript expression for custom validation
  enabled: boolean;
};

export type ConditionalLogic = {
  id: string;
  action: "show" | "hide" | "enable" | "disable" | "require" | "setValue";
  conditions: {
    field: string; // Field ID to check
    operator: "equals" | "notEquals" | "contains" | "notContains" | "greaterThan" | "lessThan" | "isEmpty" | "isNotEmpty";
    value?: string | number | boolean;
    logic?: "and" | "or"; // For chaining multiple conditions
  }[];
  targetValue?: any; // For setValue action
  enabled: boolean;
};

// ============================================
// Choice & Table Types
// ============================================

export type VueformItem = {
  value: string | number;
  label: string;
  disabled?: boolean;
  description?: string; // Item description/help text
  icon?: string; // Icon identifier
};

export type VueformColumn = {
  name: string;
  label: string;
  type: "text" | "number" | "email" | "dropdown" | "date" | "checkbox" | "textarea" | "radio";
  width?: string;
  placeholder?: string;
  options?: VueformItem[];
  required?: boolean;
  align?: "left" | "center" | "right";
  customFieldId?: string;
  // Textarea specific
  rows?: number;
  // Number specific
  min?: number;
  max?: number;
  step?: number;
};

export type VueformAddon = {
  before?: string;
  after?: string;
};



// ============================================
// Base Component Props
// ============================================

export type BaseVueformProps = {
  name: string;
  id?: string;
  label?: string;
  placeholder?: string;
  default?: any;
  required?: boolean;
  description?: string;
  visible?: boolean;
  conditions?: ConditionalLogic[];
  scripts?: CustomScript[];
  validationRules?: ValidationRule[];




  // ============================================
  // Text Input Props
  // ============================================

  inputType?: "text" | "email";
  addons?: VueformAddon;
};

export type InputVueformProps = BaseVueformProps & {
  inputType?: "text" | "email";
  addons?: VueformAddon;
};

// ============================================
// Number Input Props
// ============================================

export type NumberVueformProps = BaseVueformProps & {
  inputType?: "number";
  addons?: VueformAddon;
};

// ============================================
// Textarea Props
// ============================================

export type TextareaVueformProps = BaseVueformProps & {
  // Display
  rows?: number;
  cols?: number;
  autosize?: boolean; // Auto-grow with content
  minRows?: number;
  maxRows?: number;

  // Features
  spellcheck?: boolean;
  wrap?: "soft" | "hard" | "off";
};

// ============================================
// Choice Props (Checkbox/Radio)
// ============================================

export type ChoiceVueformProps = Omit<BaseVueformProps, "placeholder"> & {
  items: VueformItem[];
};

// ============================================
// Dropdown Props
// ============================================

export type DropdownVueformProps = BaseVueformProps & {
  items: VueformItem[];
};

// ============================================
// Date Props
// ============================================

export type DateVueformProps = BaseVueformProps & {
  format?: string;
  valueFormat?: string;
  addons?: VueformAddon;
};

// ============================================
// Slider Props
// ============================================

export type SliderVueformProps = BaseVueformProps & {
  min: number;
  max: number;
  step?: number;

  // Display
  showTooltip?: boolean | "always" | "drag";
  showValue?: boolean;
  orientation?: "horizontal" | "vertical";

  // Range
  range?: boolean; // Dual handle for range selection

  // Formatting
  format?: (value: number) => string;
  tooltipFormat?: string;

  // Marks
  marks?: { [key: number]: string } | boolean;
};

// ============================================
// Heading Props
// ============================================

export type HeadingVueformProps = {
  name: string;

  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  align?: "left" | "center" | "right";
  width?: "full" | "half";



  // Section behavior
  collapsible?: boolean;
  collapsed?: boolean;

  // Custom scripts
  scripts?: CustomScript[];
};

// ============================================
// Divider Props
// ============================================

export type DividerVueformProps = {
  name: string;
  width?: "full" | "half";
  marginTop?: string;
  marginBottom?: string;
};

// ============================================
// Spacer Props
// ============================================

export type SpacerVueformProps = DividerVueformProps & {
  height?: string;
  minHeight?: string;
  maxHeight?: string;
};

// ============================================
// Table Props
// ============================================

export type TableVueformProps = BaseVueformProps & {
  columns: VueformColumn[];
  tableRows?: Record<string, any>[];
};

// ============================================
// Combined Props Type
// ============================================

export type VueformProps =
  | InputVueformProps
  | NumberVueformProps
  | TextareaVueformProps
  | ChoiceVueformProps
  | ChoiceVueformProps
  | DropdownVueformProps
  | DateVueformProps
  | SliderVueformProps
  | HeadingVueformProps
  | DividerVueformProps
  | SpacerVueformProps
  | TableVueformProps;

// ============================================
// Form Field Type (Main)
// ============================================

// LOV Item type for custom fields
export type LOVItem = {
  code: string;
  shortName: string;
  description?: string;
  seamlessMapping?: string;
  status: 'Active' | 'Inactive';
};

export type FormField = {
  id: string;
  type: ComponentType;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: string[];
  width?: "full" | "half";
  widthPercent?: number;
  widthColumns?: number; // 1-12 column grid system
  name?: string;
  default?: any;
  visible?: boolean;

  inputType?: string;
  addons?: VueformAddon;

  // Custom field reference for LOV-based fields (dropdown, checkbox, radio)
  customFieldId?: string;
  lovItems?: LOVItem[];

  // Textarea specific
  textareaRows?: number;
  cols?: number;
  autosize?: boolean;
  minRows?: number;
  maxRows?: number;
  spellcheck?: boolean;
  wrap?: "soft" | "hard" | "off";

  // Date specific
  format?: string;
  valueFormat?: string;

  // Choice specific
  items?: VueformItem[];

  // Slider specific
  showTooltip?: boolean | "always" | "drag";
  showValue?: boolean;
  orientation?: "horizontal" | "vertical";
  range?: boolean;
  tooltipFormat?: string;
  sliderMarks?: { value: number; label?: string }[];

  // Heading specific
  content?: string;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  align?: "left" | "center" | "right";
  color?: string;
  fontSize?: string;
  fontWeight?: "normal" | "medium" | "semibold" | "bold";
  marginTop?: string;
  marginBottom?: string;
  collapsible?: boolean;
  collapsed?: boolean;

  // Spacer specific
  height?: string;

  // Table specific
  columns?: VueformColumn[];
  tableRows?: Record<string, any>[];



  // Text slots
  before?: string;
  between?: string;
  after?: string;

  // Loading state
  loading?: boolean;

  // Conditions & Logic
  conditions?: ConditionalLogic[];

  // Custom Scripts (for validation, dynamic behavior)
  scripts?: CustomScript[];

  // Validation Rules
  validationRules?: ValidationRule[];

  [key: string]: any;
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

export interface FormData {
  _id: string;
  collectionName: string;
  formName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionData {
  _id: string;
  name: string;
  description?: string;
}