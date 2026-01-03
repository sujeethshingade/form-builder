import type { ElementDefinition } from "./types";
import {
  TextIcon,
  NumberIcon,
  EmailIcon,
  UrlIcon,
  CheckboxIcon,
  RadioIcon,
  DateIcon,
  HeadingIcon,
  DividerIcon,
  SpacerIcon,
  TableIcon,
} from "./icons";

export const elements: ElementDefinition[] = [
  // Text Component
  {
    type: "text",
    label: "Text",
    icon: <TextIcon />,
    defaultProps: {
      name: "text_field",   
      label: "Text Field",
      placeholder: "Enter text",
      default: "",
      required: false,
      disabled: false,
      readonly: false,
      inputType: "text",
      addons: { before: "", after: "" },
      size: "md",
      width: "full",
    },
  },
  
  // Number Component 
  {
    type: "number",
    label: "Number",
    icon: <NumberIcon />,
    defaultProps: {
      name: "number_field",
      label: "Number",
      placeholder: "0",
      default: null,
      required: false,
      disabled: false,
      readonly: false,
      inputType: "number",
      min: null,
      max: null,
      step: 1,
      addons: { before: "", after: "" },
      size: "md",
      width: "full",
    },
  },
  
  // Email Component
  {
    type: "email",
    label: "Email",
    icon: <EmailIcon />,
    defaultProps: {
      name: "email_field",
      label: "Email Address",
      placeholder: "name@example.com",
      default: "",
      required: false,
      disabled: false,
      readonly: false,
      inputType: "email",
      size: "md",
      width: "full",
    },
  },
  
  // URL Component
  {
    type: "url",
    label: "URL",
    icon: <UrlIcon />,
    defaultProps: {
      name: "url_field",
      label: "Website URL",
      placeholder: "https://example.com",
      default: "",
      required: false,
      disabled: false,
      readonly: false,
      inputType: "url",
      size: "md",
      width: "full",
    },
  },
  
  // Single Choice (Radio) Component
  {
    type: "radio",
    label: "Single choice",
    icon: <RadioIcon />,
    defaultProps: {
      name: "radio_field",
      label: "Choose One",
      default: null,
      required: false,
      disabled: false,
      readonly: false,
      items: [
        { value: "option_1", label: "Option 1", disabled: false },
        { value: "option_2", label: "Option 2", disabled: false },
        { value: "option_3", label: "Option 3", disabled: false },
      ],
      view: "default",
      labelPosition: "right",
      size: "md",
      width: "full",
    },
  },
  
  // Multiple Choice (Checkbox) Component
  {
    type: "checkbox",
    label: "Multiple choice",
    icon: <CheckboxIcon />,
    defaultProps: {
      name: "checkbox_field",
      label: "Select Options",
      default: [],
      required: false,
      disabled: false,
      readonly: false,
      items: [
        { value: "option_1", label: "Option 1", disabled: false },
        { value: "option_2", label: "Option 2", disabled: false },
        { value: "option_3", label: "Option 3", disabled: false },
      ],
      view: "default",
      labelPosition: "right",
      size: "md",
      width: "full",
    },
  },
  
  // Date Component
  {
    type: "date",
    label: "Date",
    icon: <DateIcon />,
    defaultProps: {
      name: "date_field",
      label: "Date",
      placeholder: "Select date",
      default: null,
      required: false,
      disabled: false,
      readonly: false,
      format: "YYYY-MM-DD",
      minDate: null,
      maxDate: null,
      addons: { before: "", after: "" },
      size: "md",
      width: "full",
    },
  },
  
  // Heading Component
  {
    type: "heading",
    label: "Heading",
    icon: <HeadingIcon />,
    defaultProps: {
      name: "heading",
      content: "Section Heading",
      tag: "h2",
      align: "left",
      width: "full",
    },
  },
  
  // Divider Component
  {
    type: "divider",
    label: "Divider",
    icon: <DividerIcon />,
    defaultProps: {
      name: "divider",
      width: "full",
    },
  },
  
  // Spacer Component
  {
    type: "spacer",
    label: "Spacer",
    icon: <SpacerIcon />,
    defaultProps: {
      name: "spacer",
      height: "1rem",
      width: "full",
    },
  },
  
  // Table Component
  {
    type: "table",
    label: "Table",
    icon: <TableIcon />,
    defaultProps: {
      name: "table_field",
      label: "Table",
      default: [],
      required: false,
      disabled: false,
      readonly: false,
      columns: [
        { name: "column_1", label: "Column 1", type: "text", placeholder: "", width: "auto" },
      ],
      rows: [
        { column_1: "" },
      ],
      size: "md",
      width: "full",
    },
  },
];

// Keep for backward compatibility
export const fieldElements = elements;
export const pageElements: ElementDefinition[] = [];
