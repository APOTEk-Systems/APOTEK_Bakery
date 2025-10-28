# Reports Refactoring Plan

## Overview
The `src/services/reports.ts` file is 2371 lines long and contains multiple responsibilities. This refactoring will break it down into smaller, focused modules and extract common patterns.

## Current Structure Analysis
- **Types**: Report interfaces (lines 8-242)
- **PDF Utilities**: Company header, test functions (lines 254-384)
- **Data Fetching**: API calls for different reports (lines 386-605)
- **PDF Generation**: Individual PDF generators (lines 618-2371)

## Proposed Module Structure

### 1. `src/types/reports.ts`
- Move all report type definitions
- Export all interfaces for reports

### 2. `src/services/reports/index.ts`
- Main reports service entry point
- Re-exports from sub-modules
- Maintains backward compatibility

### 3. `src/services/reports/data.ts`
- All API data fetching functions
- Report data retrieval logic

### 4. `src/services/reports/pdf-utils.ts`
- Common PDF generation utilities
- Company header function
- Shared formatting helpers

### 5. `src/services/reports/generators/`
- `sales-pdf.ts` - Sales report PDFs
- `purchases-pdf.ts` - Purchases report PDFs
- `production-pdf.ts` - Production report PDFs
- `inventory-pdf.ts` - Inventory report PDFs
- `financial-pdf.ts` - Financial report PDFs

## Common PDF Patterns to Extract
1. **Company Header**: Standardized header with company info
2. **Table Generation**: Common table styling and structure
3. **Formatting**: Currency, date, and number formatting
4. **Summary Sections**: Consistent summary layouts
5. **Error Handling**: PDF generation error patterns

## Implementation Steps
1. Create types file and move interfaces
2. Extract PDF utilities into separate module
3. Split data fetching functions
4. Create individual PDF generator modules
5. Update main reports service to import from modules
6. Test all report generation functions
7. Update imports in components

## Benefits
- Improved maintainability
- Better separation of concerns
- Easier testing of individual modules
- Reduced file size and complexity
- Reusable PDF utilities across reports