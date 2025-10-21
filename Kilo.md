
- in @SuppliesAdjustmentsTab and @InventroyAdjustmentsTab update the queries remove the replace the name query with search and paginate them using queries page, limit,
- Allow float in adding new inventory and supplies in cost, current quantity min level and max level also make the unit required with the *
- In create inventory, supplies and products leverage the toSentenceCase function on name fields


# Reports

## Sales

### 1. Sales Report
    All Sales

  | S/N | Receipt # | Date | Customer | Sold By | Total |
|-----|------------|------|-----------|----------|--------|


### 2. Cash Report
    Cash Sales Only

  | S/N | Recepit # | Date | Customer | Sold By | Total 
|-----|------------|------|-----------|----------|--------|

### 3. Credit Report
    Cash Sales Only

  | S/N | Recepit # | Date | Customer | Sold By | Total | Status  |
|-----|------------|------|-----------|----------|--------| ---|


### 3. Price List
    List of Products

  | S/N | Recepit # | Price |
|-----|------------|------|


## Purchases

### 1. Sales Report
    All Sales

  | Item Name | Qty | Price | Total | Received Date | Received by |
|-----|------------|------|-----------|----------|--------|

filter by supplier and Date


## Production


### 1. Production Batches


 | S/N | Date | Item Name | Quantity | Ingridients Used (separted by comma) | Cost | Produced By |
|-----|------------|------|-----------|----------|--------|


Based on the handwritten image, the document appears to be an **Inventory Report** outline or a list of required sections for one.

Here is the parsed information, structured logically:

## Inventory Report Outline

1.  **Current Stock**
    * Materials Stock
    * Supplies Stock
    * *Data Columns for Current Stock (Implied):*
        * Item Name
        * Category
        * Quantity
---
2.  **Adjustments**
    * Material
    * Supplies
    * *Data Columns for Stock Adjustments:*
        * Item name
        * Date
        * Type (e.g., Deducted, Increased)
        * Quantity
        * Reason
        * Adj By (Adjusted By/Personnel)
---
3.  **Stock Below Min Level**
    * Material
    * Supplies
    * *Data Columns for Below Min Level:*
        * Item name
        * Min Qty (Minimum Quantity)
        * Available Qty (Available Quantity)
---

5.  **Out of Stock**
    * Supplies
    * Materials

Additional info in the quantity for l amd kg if the vaule is below 1000 convert it to ml and kg respecitvly and the units as well

Currently there is no db implementation so you have to use inventory api

Adjustemnts is the only one that can be filtered by date range the rest are static