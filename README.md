# Form Builder

A modern drag-and-drop form builder with MongoDB integration for storing and managing forms.

## Features

- **Forms Management**: Create, edit, delete, and organize forms in collections
- **Drag-and-Drop Builder**: Intuitive interface for building forms
- **Component Library**: Text, number, email, date, checkbox, radio, heading, divider, and more
- **Real-time Preview**: See your form as users will see it
- **JSON Export**: Export forms as JSON for integration
- **MongoDB Storage**: Persist forms and collections in MongoDB

## Usage

### Managing Forms

1. Navigate to the Builder page (<http://localhost:3000>)
2. Click "New" to create a new form
3. Select a collection (or create one first)
4. Fill in the form name and label
5. Click "Save" to create the form and open the builder

### Building Forms

1. Click on a saved form to open the builder
2. Drag components from the left sidebar to the canvas
3. Click on a component to edit its properties in the right sidebar
4. Use the Preview tab to see how the form will look
5. Use the JSON tab to see the form configuration
6. Click "Save" to persist your changes

### Inspector Sidebar

- The inspector's Scripts tab no longer includes the example snippets shown previously — custom scripts are still supported and can be added under the `Scripts` tab for applicable fields.
- Layout-only fields (such as `heading`, `divider`, and `spacer`) do not expose scripts; when you select one of these, the inspector will automatically switch back to the `Properties` tab.
