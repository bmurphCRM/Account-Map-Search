# Account Map Search Component

A Lightning Web Component that enables users to search for service provider accounts and display them on an interactive map with color-coded pins.

## Features

- **Multi-criteria Search**: Filter accounts by name, type, category, and ZIP code
- **Interactive Map**: Display search results on a map using Salesforce's `lightning-map` component
- **Color-coded Pins**: Each provider type has a distinct color for easy visual identification
- **Clickable Markers**: Click on map pins to view provider details or navigate to the account record
- **Results Table**: View detailed provider information in a sortable table below the map
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Prerequisites

### Required Fields on Account Object

1. **Standard Fields**:
   - `Type` (standard picklist field)
   - `ShippingStreet`
   - `ShippingCity`
   - `ShippingState`
   - `ShippingPostalCode`
   - `ShippingCountry`
   - `ShippingLatitude` (automatically populated when geocoding is enabled)
   - `ShippingLongitude` (automatically populated when geocoding is enabled)

2. **Custom Fields** (if not already created):
   - `Category__c` (Text or Picklist field)

### Create Custom Field

If the `Category__c` field doesn't exist on the Account object, create it:

1. Go to **Setup** → **Object Manager** → **Account**
2. Click **Fields & Relationships** → **New**
3. Choose **Picklist** (or **Text**)
4. Field Label: `Category`
5. Field Name: `Category__c`
6. Add values as needed (e.g., "Primary Care", "Emergency", "Outpatient")
7. Save

### Enable Address Geocoding

To ensure latitude/longitude values are populated:

1. Go to **Setup** → **Data Integration Rules**
2. Activate the **Geocodes for Account** rule
3. This will automatically geocode existing and new Account shipping addresses

## Installation

### Option 1: Deploy via Salesforce CLI

```bash
# Deploy the component and Apex controller
sf project deploy start --source-dir force-app/main/default/lwc/accountMapSearch
sf project deploy start --source-dir force-app/main/default/classes/AccountMapController.cls
sf project deploy start --source-dir force-app/main/default/classes/AccountMapController.cls-meta.xml
```

### Option 2: Deploy All Files

```bash
# Deploy everything at once
sf project deploy start --source-dir force-app/main/default
```

## Configuration

### Account Type Color Mapping

The component uses predefined colors for different provider types. To customize colors, edit the `typeColorMap` object in `accountMapSearch.js`:

```javascript
typeColorMap = {
    'Food Provider': '#FF6B6B',
    'Shelter Provider': '#4ECDC4',
    'Medical Provider': '#45B7D1',
    'Housing Provider': '#FFA07A',
    'Mental Health Provider': '#9B59B6',
    'Employment Services': '#F39C12',
    'Legal Services': '#3498DB',
    'Other': '#95A5A6'
};
```

### Customizing Type Values

Update the standard `Type` picklist values on the Account object to match your organization's needs:

1. Go to **Setup** → **Object Manager** → **Account**
2. Click **Fields & Relationships** → **Type**
3. Scroll to **Picklist Values**
4. Add, edit, or deactivate values as needed

Suggested values for homeless services providers:
- Food Provider
- Shelter Provider
- Medical Provider
- Housing Provider
- Mental Health Provider
- Employment Services
- Legal Services
- Transportation Services
- Education Services

## Usage

### Add to Lightning App Page

1. Go to **Setup** → **Lightning App Builder**
2. Create a new App Page or edit an existing one
3. Drag the **Account Map Search** component from the custom components section
4. Place it in your desired location
5. Save and activate the page

### Add to Lightning Home Page

1. Click the gear icon → **Edit Page**
2. Drag the **Account Map Search** component to the page
3. Save and activate

### Add to Experience Cloud Site

1. In Experience Builder, navigate to the desired page
2. Add the **Account Map Search** component
3. Publish the site

## Sample Data Setup

To test the component, create sample Account records with:

1. **Complete Shipping Address** (required for map pins):
   ```
   Shipping Street: 123 Main St
   Shipping City: San Francisco
   Shipping State: CA
   Shipping Postal Code: 94102
   Shipping Country: United States
   ```

2. **Type**: Select from your configured picklist values (e.g., "Food Provider")
3. **Category**: Add a category value if using the custom field

### Example Test Accounts

```
Account 1:
- Name: Community Food Bank
- Type: Food Provider
- Category: Emergency Food
- Shipping Address: 123 Mission St, San Francisco, CA 94102

Account 2:
- Name: Hope Shelter
- Type: Shelter Provider
- Category: Overnight Shelter
- Shipping Address: 456 Market St, San Francisco, CA 94103

Account 3:
- Name: Free Health Clinic
- Type: Medical Provider
- Category: Primary Care
- Shipping Address: 789 Valencia St, San Francisco, CA 94110
```

## Geocoding Notes

- Salesforce automatically geocodes addresses when Data Integration Rules are active
- Existing accounts may need to be updated (modify a field and save) to trigger geocoding
- The component only displays accounts with valid latitude/longitude values
- Geocoding requires Clean for Salesforce or similar data service

## Troubleshooting

### No Results Appearing

1. **Check Geocoding**: Verify that ShippingLatitude and ShippingLongitude are populated
2. **Check Field API Names**: Ensure the `Category__c` field exists if using categories
3. **Check Permissions**: Ensure users have read access to Account object and all required fields
4. **Check Data**: Run this SOQL query to verify data:
   ```sql
   SELECT Id, Name, Type, Category__c, ShippingLatitude, ShippingLongitude 
   FROM Account 
   WHERE ShippingLatitude != null AND ShippingLongitude != null
   ```

### Map Not Displaying

1. Verify that at least one account has valid latitude/longitude values
2. Check browser console for JavaScript errors
3. Ensure the user has access to the Salesforce map component

### Custom Field Errors

If you get errors about `Category__c`:
1. Either create the field as described in Prerequisites
2. Or modify the Apex controller to remove references to `Category__c`

## Component Files

- `accountMapSearch.js` - Component logic and data handling
- `accountMapSearch.html` - Component markup and UI structure
- `accountMapSearch.css` - Component styling
- `accountMapSearch.js-meta.xml` - Component metadata and configuration
- `AccountMapController.cls` - Apex controller for server-side logic
- `AccountMapController.cls-meta.xml` - Apex class metadata

## API Version

- LWC API Version: 62.0
- Apex API Version: 62.0

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This component is provided as-is for demonstration purposes.