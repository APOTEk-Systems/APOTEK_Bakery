
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