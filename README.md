# Form Builder

A modern drag-and-drop form builder with MongoDB integration for storing and managing forms.

## Features

- **Forms Management**: Create, edit, delete, and organize forms in collections
- **Drag-and-Drop Builder**: Intuitive interface for building forms
- **Component Library**: Text, number, email, date, checkbox, radio, heading, divider, and more
- **Real-time Preview**: See your form as users will see it
- **JSON Export**: Export forms as JSON for integration
- **MongoDB Storage**: Persist forms and collections in MongoDB
- **Import/Export**: Import and export form configurations

## Usage

### Managing Forms

1. Navigate to the Forms page (http://localhost:3000/forms)
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

### Collections

Collections help organize forms by category. Create collections before creating forms:
1. Click "+ Add Collection" on the Forms page
2. Enter a name and display name
3. Click "Save"

## API Endpoints

### Forms

- `GET /api/forms` - List all forms
- `GET /api/forms?collection=NAME` - Filter forms by collection
- `POST /api/forms` - Create a new form
- `GET /api/forms/[id]` - Get a single form
- `PUT /api/forms/[id]` - Update a form
- `DELETE /api/forms/[id]` - Delete a form

### Collections

- `GET /api/collections` - List all collections
- `POST /api/collections` - Create a new collection
- `GET /api/collections/[id]` - Get a single collection
- `PUT /api/collections/[id]` - Update a collection
- `DELETE /api/collections/[id]` - Delete a collection
