# Cundi Development Guide

This guide consolidates the best practices and workflows for developing the Cundi application, covering both the Backend (C#) and Frontend (React/Refine).

---

## Part 1: Backend Development (`cundiapi`)

### 1. Creating a New Model (Business Object)
**Location:** `cundiapi/BusinessObjects/`

1.  **Create Class**: Create a new class inheriting from `BaseObject` (DevExpress XPO).
2.  **Add Properties**: Define properties with appropriate types and attributes.

#### Property Examples

**String**
```csharp
private string _StringValue;
public string StringValue
{
    get { return _StringValue; }
    set { SetPropertyValue<string>(nameof(StringValue), ref _StringValue, value); }
}
```

**Integer**
```csharp
private int _IntValue;
public int IntValue
{
    get { return _IntValue; }
    set { SetPropertyValue<int>(nameof(IntValue), ref _IntValue, value); }
}
```

**Boolean**
```csharp
private bool _BoolValue;
public bool BoolValue
{
    get { return _BoolValue; }
    set { SetPropertyValue<bool>(nameof(BoolValue), ref _BoolValue, value); }
}
```

**Unlimited Text (Long String)**
```csharp
private string _LongStringValue;
[Size(SizeAttribute.Unlimited)] // Maps to nvarchar(max) or text
public string LongStringValue
{
    get { return _LongStringValue; }
    set { SetPropertyValue<string>(nameof(LongStringValue), ref _LongStringValue, value); }
}
```

**Image (Base64)**
```csharp
private byte[] _ImageValue;
[ImageEditor] // XAF Attribute for image handling
public byte[] ImageValue
{
    get { return _ImageValue; }
    set { SetPropertyValue<byte[]>(nameof(ImageValue), ref _ImageValue, value); }
}
```

### 2. Registering in OData API
**Location:** `cundiapi/Startup.cs`

Crucial Step: New business objects must be explicitly registered to be exposed via the API.

1.  Open `cundiapi/Startup.cs`.
2.  Locate `services.AddXafWebApi`.
3.  Add `options.BusinessObject<YourNewObject>();`.

```csharp
builder.ConfigureOptions(options =>
{
    options.BusinessObject<DataTypeExample>();
    // options.BusinessObject<YourObject>();
});
```

### 3. Development Environment Tips
-   **HTTPS Redirection**: In the local development environment (`localhost`), `app.UseHttpsRedirection()` in `Startup.cs` might cause issues (307 Redirects) with the frontend proxy. It is recommended to disable it for local dev.
-   **Run Backend**: `dotnet run --project cundiapi/CundiApi.csproj`

---

## Part 1.5: Using Project Template

For creating new backend projects quickly, use the `cundiapi` template.

### Setup
Run this once to install the template:
```bash
dotnet new install ./cundiapi
```

### Usage
Create a new project (e.g., `MyStoreApi`):
```bash
dotnet new cundiapi -n MyStoreApi
```

This ensures all namespaces (`CundiApi` -> `MyStoreApi`) and project references are correctly renamed.

---

## Part 2: Frontend Development (`cundiweb`)

### 1. Login & Authentication
-   **Default Credentials**:
    -   Username: `Admin`
    -   Password: `Admin123`
-   **Mechanism**: The app uses `authProvider.ts` to handle JWT authentication against the backend.

### 2. Backend Connection
-   **API URL**: Defined in `.env` (or `vite.config.ts`) as `VITE_API_URL`.
-   **OData Provider**: The app uses a custom `odataProvider.ts` to communicate with the XAF OData endpoints.

### 3. Creating Frontend Pages for a New Resource

#### Step A: Define Interface
**Location:** `cundiweb/src/interfaces/index.ts`
Update the TypeScript interface to match the backend property.

```typescript
export interface IDataTypeExample {
    Oid: string;
    Name: string;
    StringValue?: string;
    IntValue?: number;
    BoolValue?: boolean;
    LongStringValue?: string;
    ImageValue?: string; // Base64 string from backend
}
```

#### Step B: Create Pages
**Location:** `cundiweb/src/pages/{resource-name}/`
Create `list.tsx`, `create.tsx`, and `edit.tsx`.

**1. List View (`list.tsx`)**
Use **[SmartList](#smartlist)** (from `@cundi/refine-xaf`) for standard functionality. Define columns using `Table.Column`.

*Examples:*

*String/Int:*
```tsx
<Table.Column dataIndex="StringValue" title="String Value" sorter />
```

*Boolean (Checkbox):*
```tsx
<Table.Column 
    dataIndex="BoolValue" 
    title="Boolean" 
    sorter 
    render={(value: boolean) => <Checkbox checked={value} disabled />} 
/>
```

*Long String (Truncated):*
```tsx
<Table.Column 
    dataIndex="LongStringValue" 
    title="Long String" 
    render={(value: string) => value && value.length > 50 ? `${value.substring(0, 50)}...` : value} 
/>
```

*Image:*
```tsx
<Table.Column 
    dataIndex="ImageValue" 
    title="Image" 
    render={(value: string) => (
        value ? <img src={`data:image/png;base64,${value}`} alt="Img" style={{ height: 50, objectFit: 'cover' }} /> : '-'
    )} 
/>
```

**2. Forms (`create.tsx` / `edit.tsx`)**
Use standard Ant Design form components.

*Examples:*

*String:*
```tsx
<Form.Item label="String Value" name="StringValue">
    <Input />
</Form.Item>
```

*Integer:*
```tsx
<Form.Item label="Int Value" name="IntValue">
    <InputNumber />
</Form.Item>
```

*Boolean (Switch):*
```tsx
<Form.Item label="Boolean" name="BoolValue" valuePropName="checked">
    <Switch />
</Form.Item>
```

*Long String (TextArea):*
```tsx
<Form.Item label="Long Description" name="LongStringValue">
    <Input.TextArea rows={4} />
</Form.Item>
```

#### Step C: Register in App.tsx
**Location:** `cundiweb/src/App.tsx`
1.  Import your page components.
2.  Add a new entry to the `resources` array in `<Refine>`.
3.  Add corresponding routes in `<Routes>`.

---

## Part 3: SDK Component Usage

This section documents the reusable components provided by `@cundi/refine-xaf`.

<a id="smartlist"></a>
### 1. SmartList (Main Lists)

`SmartList` is a reusable wrapper around the Ant Design `Table` and Refine's `useTable` hook. It provides standardized features like search, refresh, and unified column visibility management.

#### Features
1.  **Unified Search**: Provides a search input that filters data based on specified fields. Clearing input reloads all data.
2.  **Manual Refresh**: A button to fetch the latest data from the backend.
3.  **Column Visibility Management**:
    -   User selections saved to `localStorage`.
    -   **Actions Column**: Always visible (`dataIndex="actions"`).
    -   **Default Visibility**: Columns are hidden by default unless marked with `defaultVisible`.

#### Usage

**Props**
| Prop | Type | Description |
|---|---|---|
| `resource` | `string` | The resource name (e.g., "DataTypeExamples"). Used for `localStorage` persistence. |
| `searchFields` | `string[]` | Array of field names to search against. |
| `children` | `ReactNode` | `Table.Column` definitions. |

**Example**
```tsx
import { SmartList } from "@cundi/refine-xaf";

<SmartList resource="my_resource" searchFields={["Name", "Description"]}>
    {/* Action Column: Always visible */}
    <Table.Column title="Actions" dataIndex="actions" render={...} />

    {/* Default Visible Column */}
    <Table.Column title="Name" dataIndex="Name" defaultVisible /> {/* @ts-ignore */}

    {/* Default Hidden Column */}
    <Table.Column title="Status" dataIndex="Status" />
</SmartList>
```

<a id="relatedlist"></a>
### 2. RelatedList (Master-Details)

`RelatedList` is a generic component to implement Master-Details CRUD functionality (e.g., Order Lines).

#### Architecture
1.  **Parent Page**: Uses `<RelatedList>`.
2.  **FormFields**: A specific component returning `<Form.Item>`s for the detail object.

#### Usage Steps

**1. Define Form Fields**
Create a component taking `mode` ("create" | "edit") as a prop.

```tsx
export const YourDetailFormFields: React.FC<{ mode: "create" | "edit" }> = ({ mode }) => {
    return (
        <Form.Item label="Name" name="Name" rules={[{ required: true }]}>
            <Input data-testid={`detail-name-input-${mode}`} />
        </Form.Item>
    );
};
```

**2. Implementation in Parent Page**
```tsx
import { RelatedList } from "@cundi/refine-xaf";

<RelatedList<IYourDetailInterface>
    resource="YourDetailResource"   // The resource name in Refine
    masterField="Master"            // The property name linking to the master
    masterId={record?.Oid}          // The ID of the current master record
    dataSource={record?.Details}    // The array of details
    onMutationSuccess={() => query.refetch()} // Refresh logic
    FormFields={YourDetailFormFields} // Your fields component
    modalTitle="Manage Detail"
>
    <Table.Column title="Name" dataIndex="Name" />
</RelatedList>
```

#### Features
-   **Stable UI**: Modals are optimized to prevent freeze bugs.
-   **Late Binding**: Handles async `masterId` loading.
-   **Automation Ready**: Supports `data-testid`.

<a id="tiptapeditor"></a>
### 3. TiptapEditor (Rich Text)

`TiptapEditor` is a feature-rich WYSIWYG editor wrapper around Tiptap.

#### Features
-   **Formatting**: Bold, Italic, Strike, Highlight, Colors.
-   **Structure**: Bullet/Ordered Lists, Task Lists, Code Blocks.
-   **Media**: Image (Base64), YouTube, Tables.
-   **Math**: LaTeX support.

#### Usage

```tsx
import { TiptapEditor } from "@cundi/refine-xaf";

// In a Form
<Form.Item label="Content" name="Content" trigger="onChange" getValueFromEvent={(value) => value}>
    <TiptapEditor />
</Form.Item>

// Read-only Mode (e.g., Show Page)
<TiptapEditor value={record?.Content} disabled={true} />
```

---

## Part 4: Backend Support for SDK Features

The `@cundi/refine-xaf` handles the complex UI logic for User and Role management, but it relies on specific custom endpoints in the backend to handle OData limitations regarding many-to-many relationships and nested permissions.

### 1. User Role Assignment (`UserController.cs`)

Standard OData v4 PATCH requests struggle with replacing collection properties (like `Roles`) in a single transaction easily.

**Required Endpoint:** `POST /api/User/UpdateUserRoles`

**Logic:**
1.  Accepts `UserId` and a list of `RoleIds`.
2.  Fetches the user and target roles.
3.  Synchronizes the collection (Add/Remove) and commits changes.

The SDK's `ApplicationUserEdit` component automatically calls this endpoint when saving.

### 2. Type Permissions (`RoleController.cs`)

Handling `TypePermissions` involves nested object serialization and complex reconciliation logic.

**Required Configuration (`Startup.cs`):**
Ensure `PermissionPolicyTypePermissionObject` is registered:
```csharp
options.BusinessObject<PermissionPolicyTypePermissionObject>();
```

**Required Endpoint:** `POST /api/Role/UpdateRole`

**Logic:**
1.  Accepts a DTO with role details and the full list of `TypePermissions`.
2.  Performs server-side reconciliation (identifying added, modified, and deleted permissions).
3.  Updates the database in a single transaction.

The SDK's `RoleEdit` component is pre-configured to transform the form data and call this endpoint, handling the mismatched field names (e.g., `TargetType` vs `TargetTypeFullName`) internally.

### 3. Dynamic Type Loading (`ModelController.cs`)

The SDK's permission editor needs to know which Business Objects exist in the system.

**Required Endpoint:** `GET /api/Model/BusinessObjects`

**Logic:**
Returns a list of available XAF Business Object types (names and captions) for the frontend dropdowns.
