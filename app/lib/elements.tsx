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
  BoxLayoutIcon,
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
      // New properties
      minLength: undefined,
      maxLength: undefined,
      pattern: "",
      inputmode: "text",
      mask: "",
      transform: "none",
      debounce: 0,
      counter: false,
      clearable: false,
      prefix: "",
      suffix: "",
      autocomplete: "",
      autofocus: false,
      helper: "",
      description: "",
      info: "",
      floating: false,
      before: "",
      between: "",
      after: "",
      // Validation & Scripts
      validationRules: [],
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
      disabled: false,
      readonly: false,
      size: "md",
      width: "full",
      // Textarea specific
      rows: 3,
      cols: undefined,
      autosize: false,
      minRows: 2,
      maxRows: 10,
      minLength: undefined,
      maxLength: undefined,
      counter: false,
      clearable: false,
      spellcheck: true,
      wrap: "soft",
      helper: "",
      description: "",
      // Validation & Scripts
      validationRules: [],
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
      disabled: false,
      readonly: false,
      inputType: "number",
      min: null,
      max: null,
      step: 1,
      addons: { before: "", after: "" },
      size: "md",
      width: "full",
      // New properties
      decimals: undefined,
      decimalSeparator: ".",
      thousandsSeparator: ",",
      prefix: "",
      suffix: "",
      allowNegative: true,
      controls: false,
      displayFormat: "",
      helper: "",
      description: "",
      // Validation & Scripts
      validationRules: [],
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
      disabled: false,
      readonly: false,
      inputType: "email",
      size: "md",
      width: "full",
      // New properties
      minLength: undefined,
      maxLength: undefined,
      pattern: "",
      inputmode: "email",
      clearable: false,
      autocomplete: "email",
      helper: "",
      description: "",
      // Validation & Scripts
      validationRules: [],
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
      // New properties
      columns: undefined,
      inlineOptions: false,
      hasOther: false,
      otherText: "Other",
      clearable: false,
      helper: "",
      description: "",
      // Validation & Scripts
      validationRules: [],
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
      // New properties
      min: undefined, // Minimum selections
      max: undefined, // Maximum selections
      columns: undefined,
      inlineOptions: false,
      selectAll: false,
      search: false,
      hasOther: false,
      otherText: "Other",
      helper: "",
      description: "",
      // Validation & Scripts
      validationRules: [],
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
      disabled: false,
      readonly: false,
      items: [
        { value: "option_1", label: "Option 1", disabled: false },
        { value: "option_2", label: "Option 2", disabled: false },
        { value: "option_3", label: "Option 3", disabled: false },
      ],
      size: "md",
      width: "full",
      // Dropdown specific
      multiple: false,
      search: false,
      canClear: true,
      canDeselect: false,
      closeOnSelect: true,
      native: false,
      maxHeight: 300,
      create: false,
      taggable: false,
      groups: false,
      groupLabel: "",
      appendNewOption: false,
      async: false,
      searchMinLength: 0,
      delay: 300,
      max: undefined,
      helper: "",
      description: "",
      // Validation & Scripts
      validationRules: [],
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
      disabled: false,
      readonly: false,
      format: "YYYY-MM-DD",
      displayFormat: "",
      valueFormat: "",
      minDate: null,
      maxDate: null,
      addons: { before: "", after: "" },
      size: "md",
      width: "full",
      // New properties
      mode: "date",
      locale: "en",
      disabledDates: [],
      disabledDays: [],
      minYear: undefined,
      maxYear: undefined,
      clearable: true,
      closeOnSelect: true,
      inline: false,
      multipleMode: "single",
      shortcuts: [],
      helper: "",
      description: "",
      // Validation & Scripts
      validationRules: [],
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
      disabled: false,
      readonly: false,
      size: "md",
      width: "full",
      // Slider specific
      min: 0,
      max: 100,
      step: 1,
      showTooltip: true,
      showValue: true,
      orientation: "horizontal",
      range: false,
      tooltipFormat: "",
      marks: false,
      helper: "",
      description: "",
      // Validation & Scripts
      validationRules: [],
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
      content: "Section Heading",
      tag: "h2",
      align: "left",
      width: "full",
      // New properties
      description: "",
      color: "",
      fontSize: "",
      fontWeight: "bold",
      marginTop: "",
      marginBottom: "",
      collapsible: false,
      collapsed: false,
      // Scripts for dynamic behavior
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
      // New properties
      dividerStyle: "solid",
      color: "",
      thickness: 1,
      marginTop: "",
      marginBottom: "",
      content: "",
      contentPosition: "center",
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
      // New properties
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
      // New properties
      minRowsTable: undefined,
      maxRowsTable: undefined,
      showHeader: true,
      striped: false,
      bordered: true,
      hover: true,
      compact: false,
      addable: true,
      removable: true,
      sortable: false,
      reorderable: false,
      resizable: false,
      pagination: false,
      rowsPerPage: 10,
      addRowLabel: "Add Row",
      removeRowLabel: "Remove",
      emptyText: "No rows added",
      helper: "",
      description: "",
      // Validation & Scripts
      validationRules: [],
      scripts: [],
      conditions: [],
    },
  },
  
  // Box Layout Component
  {
    type: "box-layout",
    label: "Box Layout",
    icon: <BoxLayoutIcon />,
    defaultProps: {
      name: "box_layout",
      label: "Box Layout",
      width: "full",
      size: "md",
      disabled: false,
      readonly: false,
      // Box layout sections with rows and columns
      sections: [
        {
          id: "section_1",
          title: "Section 1",
          collapsed: false,
          columns: [
            { name: "field1", label: "Field 1", type: "text", placeholder: "Enter value" },
            { name: "field2", label: "Field 2", type: "text", placeholder: "Enter value" },
            { name: "field3", label: "Field 3", type: "text", placeholder: "Enter value" },
          ],
          rows: [
            { id: "row_1", data: { field1: "", field2: "", field3: "" } },
          ],
        },
      ],
      helper: "",
      description: "",
      // Validation & Scripts
      validationRules: [],
      scripts: [],
      conditions: [],
    },
  },
];

// Keep for backward compatibility
export const fieldElements = elements;
export const pageElements: ElementDefinition[] = [];
