# SmartERP - MVP Functional Scope & Guardrails

## 1. Authentication & Multi-Tenancy Rules
* **Multi-Company Constraint**: Each user profile is strictly capped at a maximum of 5 company accounts.
* **Isolation Boundary**: Data must be explicitly partitioned by `company_id`. A user cannot view data across multiple companies simultaneously.

## 2. Master Module Minimums
* **Ledgers**: Must support creation of Customer accounts and Supplier accounts.
* **Inventory**: Stock items must be bound to a specific parent Stock Group and Unit of Measure (UOM).

## 3. Transaction Capabilities
* **Sales Voucher**: Generates a standard customer bill reducing stock quantities and increasing customer debit balances.
* **Purchase Voucher**: Records indirect stock entries increasing inventory balances and supplier credit accounts.
