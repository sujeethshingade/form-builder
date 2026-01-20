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
  type: "text" | "number" | "email" | "dropdown" | "date" | "checkbox" | "phone" | "textarea" | "radio";
  width?: string;
  placeholder?: string;
  options?: VueformItem[];
  required?: boolean;
  align?: "left" | "center" | "right";
  customFieldId?: string;
  // Phone specific
  phoneConfig?: {
    defaultCountry?: string;
    showCountryCode?: boolean;
  };
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
  disabled?: boolean;
  readonly?: boolean;
  width?: "full" | "half";
  widthPercent?: number;
  size?: "sm" | "md" | "lg";
  helper?: string;
  description?: string;
  info?: string; // Tooltip info text

  // Visibility & Conditions
  visible?: boolean;
  conditions?: ConditionalLogic[];

  // Custom Scripts
  scripts?: CustomScript[];

  // Validation
  validationRules?: ValidationRule[];

  // Text slots
  before?: string;
  between?: string;
  after?: string;

  // Floating label
  floating?: boolean | string;

  // Loading state
  loading?: boolean;

  // Autocomplete
  autocomplete?: string;
  autofocus?: boolean;
};

// ============================================
// Text Input Props
// ============================================

export type InputVueformProps = BaseVueformProps & {
  inputType?: "text" | "email";
  addons?: VueformAddon;

  // Validation
  minLength?: number;
  maxLength?: number;
  pattern?: string; // Regex pattern

  // Display
  inputmode?: "text" | "email" | "tel" | "numeric" | "decimal" | "search";

  // Formatting
  mask?: string; // Input mask pattern
  transform?: "lowercase" | "uppercase" | "capitalize" | "none";

  // Features
  debounce?: number; // Delay for validation/updates
  counter?: boolean; // Show character counter
  clearable?: boolean; // Show clear button
  prefix?: string;
  suffix?: string;
};

// ============================================
// Number Input Props
// ============================================

export type NumberVueformProps = BaseVueformProps & {
  inputType?: "number";
  min?: number | null;
  max?: number | null;
  step?: number;
  addons?: VueformAddon;

  // Formatting
  decimals?: number; // Number of decimal places
  decimalSeparator?: "." | ",";
  thousandsSeparator?: "," | "." | " " | "";
  prefix?: string;
  suffix?: string;

  // Behavior
  allowNegative?: boolean;
  controls?: boolean; // Show +/- buttons

  // Display
  displayFormat?: string;
};

// ============================================
// Textarea Props
// ============================================

export type TextareaVueformProps = BaseVueformProps & {
  // Validation
  minLength?: number;
  maxLength?: number;

  // Display
  rows?: number;
  cols?: number;
  autosize?: boolean; // Auto-grow with content
  minRows?: number;
  maxRows?: number;

  // Features
  counter?: boolean;
  clearable?: boolean;
  spellcheck?: boolean;
  wrap?: "soft" | "hard" | "off";
};

// ============================================
// Choice Props (Checkbox/Radio)
// ============================================

export type ChoiceVueformProps = Omit<BaseVueformProps, "placeholder"> & {
  items: VueformItem[];
  view?: "tabs" | "blocks" | "default";
  labelPosition?: "left" | "right";

  // Validation (for checkbox)
  min?: number; // Minimum selections
  max?: number; // Maximum selections

  // Display
  columns?: number; // Grid columns for options
  inline?: boolean; // Inline layout
  inlineOptions?: boolean; // Display options inline

  // Features
  selectAll?: boolean; // Show "Select All" option
  search?: boolean; // Search within options
  hasOther?: boolean; // "Other" option with text input
  otherText?: string;
  clearable?: boolean; // Allow radio deselection
};

// ============================================
// Dropdown Props
// ============================================

export type DropdownVueformProps = BaseVueformProps & {
  items: VueformItem[];

  // Behavior
  multiple?: boolean;
  search?: boolean; // Searchable dropdown
  canClear?: boolean;
  canDeselect?: boolean;
  closeOnSelect?: boolean;

  // Display
  native?: boolean; // Use native select
  maxHeight?: number; // Dropdown max height

  // Features
  create?: boolean; // Allow creating new options
  taggable?: boolean; // Show selected as tags
  groups?: boolean; // Grouped options
  groupLabel?: string;
  appendNewOption?: boolean;

  // Async loading
  async?: boolean;
  searchMinLength?: number;
  delay?: number;

  // Limits
  max?: number; // Max selections for multiple
};

// ============================================
// Date Props
// ============================================

export type DateVueformProps = BaseVueformProps & {
  format?: string;
  displayFormat?: string;
  valueFormat?: string;
  minDate?: string | null;
  maxDate?: string | null;
  addons?: VueformAddon;

  // Type
  mode?: "date" | "datetime" | "time" | "month" | "year" | "range";

  // Locale
  locale?: string;

  // Restrictions
  disabledDates?: string[];
  disabledDays?: number[]; // 0-6 for weekdays
  minYear?: number;
  maxYear?: number;

  // Behavior
  clearable?: boolean;
  closeOnSelect?: boolean;

  // Display
  inline?: boolean; // Show calendar inline
  multipleMode?: "single" | "multiple" | "range";
  shortcuts?: { label: string; value: string }[];
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
  content: string;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  align?: "left" | "center" | "right";
  width?: "full" | "half";

  // Additional content
  description?: string; // Subheading text

  // Styling
  color?: string;
  fontSize?: string;
  fontWeight?: "normal" | "medium" | "semibold" | "bold";
  marginTop?: string;
  marginBottom?: string;

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

  // Styling
  style?: "solid" | "dashed" | "dotted";
  dividerStyle?: "solid" | "dashed" | "dotted";
  color?: string;
  thickness?: number;
  marginTop?: string;
  marginBottom?: string;

  // Content
  content?: string; // Text in divider
  contentPosition?: "left" | "center" | "right";
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

  // Display
  showHeader?: boolean;
  striped?: boolean;
  bordered?: boolean;
  hover?: boolean;
  compact?: boolean;

  // Labels
  emptyText?: string;
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
  helper?: string;
  description?: string;
  info?: string;
  required?: boolean;
  options?: string[];
  width?: "full" | "half";
  widthPercent?: number;
  widthColumns?: number; // 1-12 column grid system
  name?: string;
  default?: any;
  disabled?: boolean;
  readonly?: boolean;
  visible?: boolean;
  size?: "sm" | "md" | "lg";
  inputType?: string;
  addons?: VueformAddon;

  // Custom field reference for LOV-based fields (dropdown, checkbox, radio)
  customFieldId?: string;
  lovItems?: LOVItem[];

  // Text input specific
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  inputmode?: "text" | "email" | "tel" | "numeric" | "decimal" | "search";
  mask?: string;
  transform?: "lowercase" | "uppercase" | "capitalize" | "none";
  debounce?: number;
  counter?: boolean;
  clearable?: boolean;
  prefix?: string;
  suffix?: string;
  autocomplete?: string;
  autofocus?: boolean;

  // Number specific
  min?: number | string | null;
  max?: number | string | null;
  step?: number;
  decimals?: number;
  decimalSeparator?: "." | ",";
  thousandsSeparator?: "," | "." | " " | "";
  allowNegative?: boolean;
  controls?: boolean;
  displayFormat?: string;

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
  minDate?: string;
  maxDate?: string;
  mode?: "date" | "datetime" | "time" | "month" | "year" | "range";
  locale?: string;
  disabledDates?: string[];
  disabledDays?: number[];
  minYear?: number;
  maxYear?: number;
  closeOnSelect?: boolean;
  inline?: boolean;
  multipleMode?: "single" | "multiple" | "range";
  shortcuts?: { label: string; value: string }[];

  // Choice specific
  items?: VueformItem[];
  view?: "tabs" | "blocks" | "default";
  labelPosition?: "left" | "right";
  columns?: number | VueformColumn[];
  inlineOptions?: boolean;
  selectAll?: boolean;
  search?: boolean;
  hasOther?: boolean;
  otherText?: string;

  // Dropdown specific
  multiple?: boolean;
  canClear?: boolean;
  canDeselect?: boolean;
  native?: boolean;
  dropdownMaxHeight?: number;
  create?: boolean;
  taggable?: boolean;
  groups?: boolean;
  groupLabel?: string;
  appendNewOption?: boolean;
  async?: boolean;
  searchMinLength?: number;
  delay?: number;



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

  // Divider specific
  dividerStyle?: "solid" | "dashed" | "dotted";
  thickness?: number;
  contentPosition?: "left" | "center" | "right";

  // Spacer specific
  height?: string;
  minHeight?: string;
  spacerMaxHeight?: string;

  // Table specific
  tableRows?: Record<string, any>[];
  showHeader?: boolean;
  striped?: boolean;
  bordered?: boolean;
  hover?: boolean;
  compact?: boolean;
  emptyText?: string;

  // Text slots
  before?: string;
  between?: string;
  after?: string;

  // Floating label
  floating?: boolean | string;

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