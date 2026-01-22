import type { ElementDefinition } from "./types";
import {
  TextIcon,
  NumberIcon,
  EmailIcon,
  CheckboxIcon,
  RadioIcon,
  DropdownIcon,
  DateIcon,
  SliderIcon,
  HeadingIcon,
  DividerIcon,
  SpacerIcon,
  TableIcon,
  TextareaIcon,
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
      inputType: "text",
      addons: { before: "", after: "" },
      width: "full",
      description: "",
      // Scripts
      scripts: [],
      conditions: [],
    },
  },
  
  // Textarea Component
  {
    type: "textarea",
    label: "Textarea",
    icon: <TextareaIcon />,
    defaultProps: {
      name: "textarea_field",
      label: "Textarea",
      placeholder: "Enter text...",
      default: "",
      required: false,
      width: "full",
      rows: 3,
      cols: undefined,
      autosize: false,
      minRows: 2,
      maxRows: 10,
      spellcheck: true,
      wrap: "soft",
      description: "",
      scripts: [],
      conditions: [],
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
      inputType: "number" as any,
      addons: { before: "", after: "" },
      width: "full",
      description: "",
      scripts: [],
      conditions: [],
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
      inputType: "email",
      width: "full",
      description: "",
      scripts: [],
      conditions: [],
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
      items: [
        { value: "option_1", label: "Option 1", disabled: false },
        { value: "option_2", label: "Option 2", disabled: false },
        { value: "option_3", label: "Option 3", disabled: false },
      ],
      description: "",
      scripts: [],
      conditions: [],
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
      items: [
        { value: "option_1", label: "Option 1", disabled: false },
        { value: "option_2", label: "Option 2", disabled: false },
        { value: "option_3", label: "Option 3", disabled: false },
      ],
      width: "full",
      description: "",
      scripts: [],
      conditions: [],
    },
  },
  
  // Dropdown Component
  {
    type: "dropdown",
    label: "Dropdown",
    icon: <DropdownIcon />,
    defaultProps: {
      name: "dropdown_field",
      label: "Select Option",
      placeholder: "Select an option...",
      default: null,
      required: false,
      items: [
        { value: "option_1", label: "Option 1", disabled: false },
        { value: "option_2", label: "Option 2", disabled: false },
        { value: "option_3", label: "Option 3", disabled: false },
      ],
      width: "full",
      description: "",
      scripts: [],
      conditions: [],
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
      format: "YYYY-MM-DD",
      valueFormat: "",
      addons: { before: "", after: "" },
      width: "full",
      description: "",
      scripts: [],
      conditions: [],
    },
  },

  // Slider Component
  {
    type: "slider",
    label: "Slider",
    icon: <SliderIcon />,
    defaultProps: {
      name: "slider_field",
      label: "Slider",
      default: 50,
      required: false,
      width: "full",
      min: 0,
      max: 100,
      step: 1,
      showTooltip: true,
      showValue: true,
      orientation: "horizontal",
      range: false,
      tooltipFormat: "",
      marks: false,
      description: "",
      scripts: [],
      conditions: [],
    },
  },
  
  // Heading Component
  {
    type: "heading",
    label: "Heading",
    icon: <HeadingIcon />,
    defaultProps: {
      name: "heading",
      tag: "h2",
      align: "left",
      width: "full",
      collapsible: false,
      collapsed: false,
      scripts: [],
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
      marginTop: "",
      marginBottom: "",
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
      minHeight: "",
      maxHeight: "",
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
      columns: [
        { name: "column_1", label: "Column 1", type: "text", placeholder: "", width: "auto" },
      ],
      tableRows: [
        { column_1: "" },
      ],
      width: "full",
      description: "",
      scripts: [],
      conditions: [],
    },
  },
];
