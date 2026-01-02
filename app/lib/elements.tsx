import type { ElementDefinition } from "./types";
import {
  TextIcon,
  NumberIcon,
  EmailIcon,
  UrlIcon,
  CheckboxIcon,
  RadioIcon,
  DateIcon,
  LocationIcon,
  HeadingIcon,
  DividerIcon,
  SpacerIcon,
  TableIcon,
} from "./icons";

// All components in a single array with Vueform-inspired properties
export const elements: ElementDefinition[] = [
  // Text Component
  {
    type: "text",
    label: "Text",
    icon: <TextIcon />,
    defaultProps: {
      name: "text_field",   
      label: "Text Field",
      placeholder: "Enter text...",
      default: "",
      required: false,
      disabled: false,
      readonly: false,
      autocomplete: "off",
      inputType: "text",
      width: "full",
      rules: [],
      conditions: [],
      attrs: {},
      addClass: "",
      removeClasses: [],
      replaceClasses: {},
      overrideClasses: {},
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
      min: null,
      max: null,
      step: 1,
      width: "full",
      rules: [],
      conditions: [],
      attrs: {},
      addClass: "",
      removeClasses: [],
      replaceClasses: {},
      overrideClasses: {},
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
      autocomplete: "email",
      width: "full",
      rules: ["email"],
      conditions: [],
      attrs: {},
      addClass: "",
      removeClasses: [],
      replaceClasses: {},
      overrideClasses: {},
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
      autocomplete: "url",
      width: "full",
      rules: ["url"],
      conditions: [],
      attrs: {},
      addClass: "",
      removeClasses: [],
      replaceClasses: {},
      overrideClasses: {},
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
      items: [
        { value: "option_1", label: "Option 1" },
        { value: "option_2", label: "Option 2" },
        { value: "option_3", label: "Option 3" },
      ],
      view: "tabs", // tabs, blocks, or default
      width: "full",
      rules: [],
      conditions: [],
      attrs: {},
      addClass: "",
      removeClasses: [],
      replaceClasses: {},
      overrideClasses: {},
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
      items: [
        { value: "option_1", label: "Option 1" },
        { value: "option_2", label: "Option 2" },
        { value: "option_3", label: "Option 3" },
      ],
      view: "tabs", // tabs, blocks, or default
      width: "full",
      rules: [],
      conditions: [],
      attrs: {},
      addClass: "",
      removeClasses: [],
      replaceClasses: {},
      overrideClasses: {},
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
      placeholder: "Select date...",
      default: null,
      required: false,
      disabled: false,
      readonly: false,
      displayFormat: "YYYY-MM-DD",
      valueFormat: "YYYY-MM-DD",
      loadFormat: "YYYY-MM-DD",
      hour24: true,
      min: null,
      max: null,
      disables: [],
      width: "full",
      rules: [],
      conditions: [],
      attrs: {},
      addClass: "",
      removeClasses: [],
      replaceClasses: {},
      overrideClasses: {},
    },
  },
  
  // Location Component
  {
    type: "location",
    label: "Location",
    icon: <LocationIcon />,
    defaultProps: {
      name: "location_field",
      label: "Location",
      placeholder: "Enter location...",
      default: "",
      required: false,
      disabled: false,
      readonly: false,
      autocomplete: "street-address",
      width: "full",
      rules: [],
      conditions: [],
      attrs: {},
      addClass: "",
      removeClasses: [],
      replaceClasses: {},
      overrideClasses: {},
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
      tag: "h2", // h1, h2, h3, h4, h5, h6
      width: "full",
      conditions: [],
      attrs: {},
      addClass: "",
      removeClasses: [],
      replaceClasses: {},
      overrideClasses: {},
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
      conditions: [],
      attrs: {},
      addClass: "",
      removeClasses: [],
      replaceClasses: {},
      overrideClasses: {},
    },
  },
  
  // Spacer Component
  {
    type: "spacer",
    label: "Spacer",
    icon: <SpacerIcon />,
    defaultProps: {
      name: "spacer",
      height: "1rem", // Custom height value
      width: "full",
      conditions: [],
      attrs: {},
      addClass: "",
      removeClasses: [],
      replaceClasses: {},
      overrideClasses: {},
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
        { name: "column_1", label: "Column 1", type: "text" },
        { name: "column_2", label: "Column 2", type: "text" },
      ],
      addLabel: "Add row",
      removeLabel: "Remove",
      width: "full",
      rules: [],
      conditions: [],
      attrs: {},
      addClass: "",
      removeClasses: [],
      replaceClasses: {},
      overrideClasses: {},
    },
  },
];

// Keep for backward compatibility
export const fieldElements = elements;
export const pageElements: ElementDefinition[] = [];
