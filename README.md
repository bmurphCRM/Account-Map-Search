# Account Map Search Component - Complete Documentation

A Lightning Web Component that enables users to search for service provider accounts and display them on an interactive map with color-coded indicators.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Setup Instructions](#setup-instructions)
7. [Usage](#usage)
8. [Troubleshooting](#troubleshooting)
9. [Technical Details](#technical-details)

---

## Overview

The Account Map Search component provides a comprehensive solution for searching and visualizing service provider locations on an interactive map. It's designed for organizations that need to help users find nearby services such as food providers, shelters, medical facilities, and other community resources.

### Component Files

- **AccountMapController.cls** - Apex controller handling search logic
- **AccountMapController.cls-meta.xml** - Apex class metadata
- **accountMapSearch.js** - LWC JavaScript logic
- **accountMapSearch.html** - LWC template markup
- **accountMapSearch.css** - Component styling
- **accountMapSearch.js-meta.xml** - Component configuration
- **README.md** - Quick reference documentation

---

## Features

### 🔍 Multi-Criteria Search
- **Name Search**: Find providers by partial or full name
- **Type Filter**: Filter by provider type (Food, Shelter, Medical, etc.)
- **Category Filter**: Additional categorization filtering
- **ZIP Code Search**: Location-based filtering

### 🗺️ Interactive Map Display
- Google Maps integration via Salesforce `lightning-map`
- Automatic map centering based on results
- Dynamic zoom levels (closer for single result, wider for multiple)
- Clickable pins with detailed information popups

### 🎨 Color-Coded Visual System
- 8 distinct colors for different provider types
- Color indicators in map popups
- Color badges in results table
- Matching legend for easy reference

### 📋 Results Table
- Comprehensive provider details
- Sortable columns
- Clickable rows for navigation
- Responsive design

### ♿ Accessibility
- ARIA labels throughout
- Keyboard navigation support
- Screen reader compatible
- Responsive mobile design

---

## Prerequisites

### Required Salesforce Features

1. **Lightning Experience** - Component requires Lightning Experience (or Experience Cloud)
2. **My Domain** - Must be enabled for Lightning components
3. **Data Integration Rules** - Required for geocoding (see setup below)
4. **Experience Cloud** (Optional) - Component works on Experience Cloud sites

### Required Salesforce Licenses

- Salesforce Standard or higher
- Data Integration Rules (included with most licenses)

### Required Account Fields

#### Standard Fields (Already Available)
- `Name`
- `Type` (standard picklist)
- `ShippingStreet`
- `ShippingCity`
- `ShippingState`
- `ShippingPostalCode`
- `ShippingCountry`
- `ShippingLatitude` (auto-populated by geocoding)
- `ShippingLongitude` (auto-populated by geocoding)

#### Custom Fields (Need to be Created)
- `Category__c` (Text or Picklist) - *Optional but recommended*

---

## Installation

### Method 1: Salesforce CLI (Recommended)

```bash
# Deploy the Apex controller
sf project deploy start --source-dir force-app/main/default/classes/AccountMapController.cls
sf project deploy start --source-dir force-app/main/default/classes/AccountMapController.cls-meta.xml

# Deploy the LWC component
sf project deploy start --source-dir force-app/main/default/lwc/accountMapSearch
```

### Method 2: VS Code with Salesforce Extensions

1. Right-click on `force-app/main/default/classes/AccountMapController.cls`
2. Select **SFDX: Deploy Source to Org**
3. Right-click on `force-app/main/default/lwc/accountMapSearch` folder
4. Select **SFDX: Deploy Source to Org**

### Method 3: Manual Deployment

1. Copy the Apex class code from `AccountMapController.cls`
2. In Salesforce Setup, go to **Developer Console**
3. File → New → Apex Class
4. Paste code and save
5. Repeat for the LWC files using Developer Console or VS Code

---

## Configuration

### Step 1: Create Custom Category Field (Optional)

If you want to use the Category filter:

1. Go to **Setup** → **Object Manager** → **Account**
2. Click **Fields & Relationships** → **New**
3. Select **Picklist** (or **Text** for free-form entry)
4. **Field Label**: `Category`
5. **Field Name**: `Category__c` (auto-generated)
6. Click **Next**

#### Suggested Category Values (for Picklist):
- Primary Care
- Emergency Services
- Outpatient Services
- Inpatient Services
- Mental Health
- Substance Abuse Treatment
- Youth Services
- Senior Services
- Family Services

7. Click **Next** → **Next** → **Save**

### Step 2: Configure Account Type Picklist

Update the standard Type field with service provider values:

1. Go to **Setup** → **Object Manager** → **Account**
2. Click **Fields & Relationships** → **Type**
3. Scroll to **Picklist Values**
4. Click **New** to add these values:
   - Food Provider
   - Shelter Provider
   - Medical Provider
   - Housing Provider
   - Mental Health Provider
   - Employment Services
   - Legal Services
   - Transportation Services
   - Education Services

5. Click **Save**

### Step 3: Enable Address Geocoding

**CRITICAL STEP**: Without geocoding, map pins will not appear!

#### Option A: Enable Data Integration Rules (Recommended)

1. Go to **Setup**
2. In Quick Find, search for **Data Integration Rules**
3. Find **Geocodes for Account**
4. Click **Activate**
5. The rule is now active and will:
   - Automatically geocode NEW accounts when saved with complete addresses
   - Require manual trigger for EXISTING accounts

#### Option B: Verify Clean Rules (Alternative for orgs with Data.com)

1. Go to **Setup** → **Data Integration Rules**
2. Check if **Clean Rules** are active
3. If available, activate the **Geocoding** rule

#### Triggering Geocoding for Existing Records

For accounts that existed before activating geocoding:

**Method 1: Individual Records**
1. Open an Account record
2. Click **Edit**
3. Make any minor change (add a space to a field)
4. Click **Save**
5. Geocoding will trigger and populate Lat/Long

**Method 2: Data Loader (Bulk Update)**
```
1. Export accounts with addresses
2. Add a dummy field value to trigger update
3. Re-import using Data Loader
4. Geocoding processes in background
```

**Method 3: Apex Script**
```apex
List<Account> accounts = [SELECT Id FROM Account 
                          WHERE ShippingStreet != null 
                          AND ShippingLatitude = null 
                          LIMIT 200];
update accounts; // Triggers geocoding
```

#### Verifying Geocoding

Check if geocoding worked:

```sql
SELECT Id, Name, ShippingStreet, ShippingCity, 
       ShippingState, ShippingPostalCode,
       ShippingLatitude, ShippingLongitude
FROM Account
WHERE ShippingStreet != null
```

✅ **Success**: ShippingLatitude and ShippingLongitude have decimal values  
❌ **Not Geocoded**: ShippingLatitude and ShippingLongitude are NULL

---

## Setup Instructions

### Create Test Data

#### Option 1: Manual Entry

Create 3-5 test accounts with these details:

**Account 1: Community Food Bank**
- Account Name: `Community Food Bank`
- Type: `Food Provider`
- Category: `Emergency Services`
- Shipping Street: `1234 Mission St`
- Shipping City: `San Francisco`
- Shipping State: `CA`
- Shipping Postal Code: `94103`
- Shipping Country: `United States`

**Account 2: Hope Shelter**
- Account Name: `Hope Shelter`
- Type: `Shelter Provider`
- Category: `Emergency Services`
- Shipping Street: `5678 Market St`
- Shipping City: `San Francisco`
- Shipping State: `CA`
- Shipping Postal Code: `94102`
- Shipping Country: `United States`

**Account 3: Free Health Clinic**
- Account Name: `Free Health Clinic`
- Type: `Medical Provider`
- Category: `Primary Care`
- Shipping Street: `9012 Valencia St`
- Shipping City: `San Francisco`
- Shipping State: `CA`
- Shipping Postal Code: `94110`
- Shipping Country: `United States`

#### Option 2: Data Import

Download the sample CSV template (create this file):

```csv
Name,Type,Category__c,ShippingStreet,ShippingCity,ShippingState,ShippingPostalCode,ShippingCountry
Community Food Bank,Food Provider,Emergency Services,1234 Mission St,San Francisco,CA,94103,United States
Hope Shelter,Shelter Provider,Emergency Services,5678 Market St,San Francisco,CA,94102,United States
Free Health Clinic,Medical Provider,Primary Care,9012 Valencia St,San Francisco,CA,94110,United States
Mental Health Center,Mental Health Provider,Outpatient Services,3456 Hayes St,San Francisco,CA,94117,United States
Legal Aid Society,Legal Services,Family Services,7890 Geary Blvd,San Francisco,CA,94121,United States
```

Import via Data Loader:
1. **Setup** → **Data Import Wizard** or use **Data Loader**
2. Select **Account** object
3. Upload CSV
4. Map fields
5. Import
6. Wait 5-10 minutes for geocoding to complete

### Add Component to Lightning Page

#### Method 1: Lightning App Builder

1. Navigate to **Setup** → **Lightning App Builder**
2. Click **New**
3. Choose **App Page** (or edit existing page)
4. Give it a name: `Service Provider Search`
5. Choose a template (1 region recommended)
6. Click **Done**

7. From the Custom Components panel, drag **Account Map Search** onto the page
8. (Optional) Configure the component title in the properties panel
9. Click **Save**
10. Click **Activate**
11. Choose activation options:
    - Assign as Org Default
    - Add to Lightning Experience navigation
12. Click **Save**

#### Method 2: Home Page

1. Go to any Lightning home page
2. Click the **⚙️ (gear icon)** → **Edit Page**
3. Drag **Account Map Search** from Custom Components
4. Position it where desired
5. **Save** → **Activate** → **Assign as Org Default**

#### Method 3: Record Page

1. Navigate to any Account record
2. Click **⚙️** → **Edit Page**
3. Drag **Account Map Search** onto the page
4. **Save** → **Activate**

#### Method 4: Experience Cloud Site

1. Open **Experience Builder** for your site
2. Navigate to the page where you want to add the component
3. From the **Components** panel, find **Account Map Search** under **Custom Components**
4. Drag the component onto the page
5. Click **Publish** to make changes live

**Important Notes for Experience Cloud:**
- The component works fully on Experience Cloud sites
- Title and Subtitle properties are NOT configurable on Experience Cloud pages
- Default values will be used: "Service Provider Search" (title) with no subtitle
- All search, map, and table functionality works identically to Lightning pages
- Guest users need appropriate sharing rules to see Account data

##### Experience Cloud Guest User Access

To allow guest users to search accounts:

1. Go to **Setup** → **Sharing Settings**
2. Find **Account** in the Object Settings
3. Click **Edit** for the organization-wide default
4. Set **Default External Access** to "Public Read Only" or "Public Read/Write"
5. Click **Save**

Alternatively, create a sharing rule:

1. In Sharing Settings, scroll to **Account Sharing Rules**
2. Click **New**
3. Rule Name: "Service Provider Public Access"
4. Rule Type: **Guest user access, based on criteria**
5. Criteria: Type equals "Food Provider, Shelter Provider..." (or leave blank for all)
6. Share with: **[Your Site Name] Site Guest User**
7. Access Level: **Read Only**
8. Click **Save**

---

## Usage

### Performing a Search

#### Basic Search
1. Open the page with the Account Map Search component
2. Click **Search** (with no filters) to see all providers

#### Filtered Search
1. Enter one or more search criteria:
   - **Provider Name**: Type partial name (e.g., "Hope")
   - **Provider Type**: Select from dropdown
   - **Category**: Select from dropdown
   - **ZIP Code**: Enter ZIP (e.g., "94102")
2. Click **Search**

### Understanding Results

#### Map Section
- **Pins**: Each pin represents one provider location
- **Click Pin**: Shows popup with:
  - Provider name (bold)
  - Address with 📍 icon
  - Type with colored circle indicator
  - Category (if available)
- **Pin Colors**: Standard Google Maps pins (color coding in popups and table)

#### Legend Section
Shows all 8 provider types with their colors:
- 🔴 Food Provider
- 🔵 Shelter Provider
- 💙 Medical Provider
- 🟠 Housing Provider
- 🟣 Mental Health Provider
- 🟡 Employment Services
- 💠 Legal Services
- ⚪ Other

#### Provider Details Table
- **Colored Badges**: Circle next to each type matches legend
- **Click Row**: Navigates to full Account record
- **Columns**: Name, Type, Category, Address, ZIP Code

### Clearing Results
Click the **Clear** button to:
- Reset all search fields
- Clear map
- Clear table results

---

## Troubleshooting

### No Results Appearing

**Issue**: Search returns "No providers found"

**Solutions**:
1. **Check Data**: Run this query in Developer Console:
   ```sql
   SELECT Id, Name, Type, ShippingLatitude, ShippingLongitude 
   FROM Account 
   WHERE ShippingLatitude != null
   ```
   - If no results: Accounts aren't geocoded (see Geocoding setup)

2. **Check Filters**: Ensure your search criteria match existing data
3. **Check Permissions**: Verify user has Read access to Account object

### Map Shows No Pins

**Issue**: Map loads but shows no markers

**Solutions**:
1. **Geocoding Not Active**:
   - Go to Setup → Data Integration Rules
   - Activate "Geocodes for Account"
   
2. **Missing Lat/Long Values**:
   - Query accounts: Check if ShippingLatitude is populated
   - If NULL, manually update records to trigger geocoding
   
3. **Invalid Addresses**:
   - Geocoding fails for incomplete or invalid addresses
   - Ensure all address fields are complete

### Category Field Errors

**Issue**: Error about `Category__c` field

**Solutions**:
1. **Field Doesn't Exist**:
   - Create the Category__c field (see Configuration section)
   - OR modify the Apex controller to remove Category references

2. **Field API Name Different**:
   - Check actual field API name in Object Manager
   - Update `AccountMapController.cls` to use correct name

### Component Not Appearing in App Builder

**Issue**: Can't find component in Lightning App Builder

**Solutions**:
1. **Deployment Failed**: Redeploy the component
2. **Metadata Not Synced**: 
   - Refresh the App Builder page
   - Log out and back in
3. **Wrong Target**: Check `accountMapSearch.js-meta.xml` has correct targets:
   ```xml
   <targets>
       <target>lightning__AppPage</target>
       <target>lightning__RecordPage</target>
       <target>lightning__HomePage</target>
   </targets>
   ```

### Colors Not Matching Legend

**Issue**: Table badges or popup colors don't match legend

**Solution**:
1. **Hard Refresh**: Press Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. **Clear Cache**: 
   - Chrome: Settings → Privacy → Clear browsing data
   - Or use Incognito/Private window
3. **Verify Deployment**: Check latest code is deployed

### Performance Issues

**Issue**: Slow load times or timeouts

**Solutions**:
1. **Too Many Results**: 
   - Component limits to 200 accounts
   - Use more specific search criteria
   
2. **Geocoding In Progress**:
   - Wait 5-10 minutes after creating accounts
   - Geocoding processes in background
   
3. **Network Issues**:
   - Check internet connection
   - Google Maps API may be temporarily unavailable

---

## Technical Details

### Architecture

```
┌─────────────────────────────────────────────┐
│         Lightning Web Component              │
│                                               │
│  ┌─────────────┐      ┌──────────────────┐  │
│  │   Search    │      │   Results        │  │
│  │   Form      │──────│   - Map          │  │
│  │             │      │   - Legend       │  │
│  └─────────────┘      │   - Table        │  │
│         │             └──────────────────┘  │
│         │                                    │
└─────────┼────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────┐
│      AccountMapController (Apex)             │
│                                               │
│  - searchAccounts()                          │
│  - getAccountTypes()                         │
│  - getAccountCategories()                    │
│                                               │
└─────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────┐
│         Salesforce Database                  │
│                                               │
│  Account Object                              │
│  - Standard Fields                           │
│  - Custom Fields                             │
│  - Geocoded Coordinates                      │
│                                               │
└─────────────────────────────────────────────┘
```

### Component Structure

**JavaScript (accountMapSearch.js)**
- Manages component state
- Handles search logic
- Builds map markers with colors
- Enriches account data with color styles
- Provides computed properties for UI

**HTML (accountMapSearch.html)**
- Search form with 4 input fields
- Map display with `lightning-map`
- Color legend
- Results table with colored badges

**CSS (accountMapSearch.css)**
- Responsive layout
- Color indicator styling
- Hover effects
- Mobile optimizations

**Apex Controller (AccountMapController.cls)**
- Dynamic SOQL query building
- Security with `String.escapeSingleQuotes()`
- Picklist value retrieval
- 200 record limit for performance

### Color Mapping

The component uses 8 predefined colors for provider types:

| Provider Type           | Hex Color | RGB             |
|------------------------|-----------|-----------------|
| Food Provider          | #FF6B6B   | rgb(255,107,107)|
| Shelter Provider       | #4ECDC4   | rgb(78,205,196) |
| Medical Provider       | #45B7D1   | rgb(69,183,209) |
| Housing Provider       | #FFA07A   | rgb(255,160,122)|
| Mental Health Provider | #9B59B6   | rgb(155,89,182) |
| Employment Services    | #F39C12   | rgb(243,156,18) |
| Legal Services         | #3498DB   | rgb(52,152,219) |
| Other                  | #95A5A6   | rgb(149,165,166)|

Colors are applied to:
- Legend items
- Map popup indicators
- Table row badges

### Data Flow

1. **User enters search criteria** → Component captures input
2. **User clicks Search** → `handleSearch()` fires
3. **Apex method called** → `searchAccounts()` with parameters
4. **SOQL query executed** → Dynamic WHERE clause built
5. **Results returned** → List of AccountSearchResult objects
6. **Data processed** → `buildMapMarkers()` creates map pins
7. **UI updated** → Map, table, and legend displayed

### Security Considerations

- **SOQL Injection Prevention**: All user inputs sanitized with `String.escapeSingleQuotes()`
- **Field-Level Security**: Uses `with sharing` in Apex
- **Record Limits**: Query limited to 200 records
- **Geocoding Privacy**: Uses standard Salesforce geocoding (no external APIs)

### Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome  | Latest  | ✅ Full |
| Firefox | Latest  | ✅ Full |
| Safari  | Latest  | ✅ Full |
| Edge    | Latest  | ✅ Full |
| IE 11   | N/A     | ❌ No   |

### Mobile Compatibility

- Fully responsive design
- Touch-optimized map interactions
- Mobile-friendly table (horizontal scroll)
- Optimized for iOS and Android

### Limitations

1. **Map Pin Hover**: Salesforce `lightning-map` doesn't support hover events
   - Pins only show info on click
   - No hover tooltip available
   
2. **Custom Pin Colors**: Standard Google Maps pins used
   - Color indicators shown in popups and table instead
   - Cannot customize actual pin appearance
   
3. **Record Limit**: Maximum 200 accounts per search
   - Prevents performance issues
   - Use filters for large datasets
   
4. **Geocoding Dependency**: Requires Data Integration Rules
   - Not available in all Salesforce editions
   - May require additional licenses

5. **Experience Cloud Property Limitations**: Configurable properties (title/subtitle) not supported
   - Lightning pages: ✅ Title and subtitle can be configured in App Builder
   - Experience Cloud: ❌ Properties not available (uses default values)
   - This is a platform limitation, not a component issue

### API Version

- **LWC API**: 62.0
- **Apex API**: 62.0
- **Compatible with**: Spring '26 release and later

---

## Customization Guide

### Changing Colors

Edit `typeColorMap` in `accountMapSearch.js`:

```javascript
typeColorMap = {
    'Food Provider': '#YOUR_COLOR_HERE',
    // ... add more types
};
```

### Adding New Provider Types

1. Update Account Type picklist values
2. Add color to `typeColorMap`
3. Add legend item in HTML

### Modifying Search Fields

To add new search criteria:

1. **Add input field** in HTML
2. **Add handler** in JavaScript
3. **Update Apex method** to accept new parameter
4. **Add to SOQL** where clause

### Changing Record Limit

In `AccountMapController.cls`, modify:
```apex
query += ' ORDER BY Name LIMIT 200'; // Change 200 to desired limit
```

---

## Support and Maintenance

### Reporting Issues

If you encounter issues:
1. Check this documentation first
2. Review Troubleshooting section
3. Check Salesforce status at status.salesforce.com
4. Contact your Salesforce administrator

### Version History

**Version 1.0** (Current)
- Initial release
- Multi-criteria search
- Interactive map with color indicators
- Results table
- Legend
- Responsive design

### Future Enhancements (Potential)

- Export results to CSV
- Print functionality  
- Distance calculations
- Directions integration
- Filter by distance from location
- Save favorite providers
- Mobile app support

---

## License

This component is provided as-is for demonstration and educational purposes.

---

## Credits

Built with:
- Salesforce Lightning Web Components
- Salesforce Lightning Map Component
- Google Maps API (via Salesforce)
- Salesforce SLDS (Lightning Design System)

---

**Documentation Version**: 1.0  
**Last Updated**: April 27, 2026  
**Component Version**: 1.0  
**Author**: Salesforce Development Team
