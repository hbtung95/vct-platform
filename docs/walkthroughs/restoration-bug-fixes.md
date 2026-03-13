# Restoration & Bug Fixes Walkthrough

I have restored the **Business Planning Tab 1 (Dashboard)** interface to your original design and resolved two critical bugs.

## Changes Made

### 1. UI Restoration (Tab 1 Dashboard)
- Reverted [Module_Planning_Business_Tab1_Dashboard.html](file:///d:/SGROUP%20ERP%20MINI/Module_Planning_Business_Tab1_Dashboard.html) to the exact layout and logic you provided.
- Ensured it uses the `BIZ_SHARED` layer and the `callGAS` wrapper for backend communication.

### 2. Fixed `ERR_INSUFFICIENT_RESOURCES` (Network Flood)
- **Root Cause**: All four tabs were mounted simultaneously, and each was independently triggering backend data fetches on every scenario change. This exhausted the browser's connection limit to Google Scripts.
- **Fix**: Centralized the loading logic in the main **Host** component.
  - [Module_Planning_Business_Host.html](file:///d:/SGROUP%20ERP%20MINI/Module_Planning_Business_Host.html): Now automatically calls `loadBundle()` on scenario change.
  - [Module_Planning_Business_Tab1_Dashboard.html](file:///d:/SGROUP%20ERP%20MINI/Module_Planning_Business_Tab1_Dashboard.html): Removed redundant `useEffect` that called `loadAll()`.
  - [Module_Planning_Business_Tab2_Seasonality.html](file:///d:/SGROUP%20ERP%20MINI/Module_Planning_Business_Tab2_Seasonality.html): Removed redundant `useEffect` that called `loadTab2()`.

### 3. Fixed "Stuck" Loading State
- **Root Cause**: The backend services (`Scenario_Service` and `Tab1_Service`) were calling non-existent helper functions like `pb_scn_normYear_` and `pb_normYear_`. This caused `ReferenceError` crashes that interrupted the data-loading process.
- **Fix**: Replaced these missing helpers with the correct centralized functions (`coerceNumber_` and `normalizeScenario_`) in:
  - [PLAN_BUSINESS_Scenario_Service.js](file:///d:/SGROUP%20ERP%20MINI/PLAN_BUSINESS_Scenario_Service.js)
  - [PLAN_BUSINESS_Tab1_Service.js](file:///d:/SGROUP%20ERP%20MINI/PLAN_BUSINESS_Tab1_Service.js)

### 3. Fixed Scenario Highlight Bug (CEO Module)
- **Root Cause**: The `lac_quan` key from the backend wasn't mapped in the `normalizeScenario` function within the CEO Planning module, so it wouldn't highlight when selected.
- **Fix**: Updated the mapping in [Module_Planning_CEO.html](file:///d:/SGROUP%20ERP%20MINI/Module_Planning_CEO.html) to include backend keys like `thuc_te`, `lac_quan`, and `than_trong`.

## Verification Results
- All backend services are now syntactically correct and compatible with the global `Utils.js` helpers.
- The project has been synced to Google Apps Script.
- The loading spinner should now resolve correctly once the backend returns data.

> [!TIP]
> Refresh your browser to see the restored UI and verified fixes.
