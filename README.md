# Shopify Featured Products with Infinite Scroll

## 📌 Assignment Overview

This project is built as part of a Shopify Developer assignment.

The goal is to create a collection page where:
- Featured products always appear at the top
- Infinite scroll loads products dynamically
- Sorting and filtering work correctly
- No duplicate products appear

---

## ⚙️ Features Implemented

### ✅ 1. Featured Products on Top
- Products with tag `featured` are identified
- All 15 featured products are shown at the top
- Their original position in collection does not matter

---

### ✅ 2. Initial Load Behavior
- First load shows:
  - 15 featured products
  - 5 normal products
- Total = 20 products

---

### ✅ 3. Infinite Scroll
- Loads next 20 products when user scrolls
- Only non-featured products are loaded in next pages
- Smooth loading experience using JavaScript

---

### ✅ 4. No Duplicate Products
- A Set is used to track already rendered product IDs
- Prevents duplicates across pages and scroll loads

---

### ✅ 5. Sorting & Filtering Support
- When sorting or filtering is applied:
  - Shopify default behavior is used
  - Featured logic is disabled (as required)

- Implemented using:
  - Query parameters (`sort_by`, `filter.v.price`)
  - Hidden fallback grid rendered using Liquid

---

### ✅ 6. UI Consistency Fix
- Same HTML structure is used for:
  - Custom infinite scroll
  - Shopify default rendering

- Prevents layout issues during sorting/filtering

---

### ✅ 7. Image Handling
- Fixed image distortion using:
  - `object-fit: contain`
  - Centered layout using flexbox

- Ensures all product images are visible properly

---

## 🧠 Approach & Logic

### 1. Product Separation
- Products are fetched using Shopify AJAX API
- Split into:
  - Featured products
  - Non-featured products

---

### 2. Rendering Strategy
- Featured products rendered first
- Remaining slots filled with non-featured products

---

### 3. Infinite Scroll Logic
- Triggered when user reaches bottom
- Fetch next page using AJAX
- Append only non-featured products

---

### 4. Duplicate Prevention
- Used JavaScript `Set`
- Stores product IDs already rendered
- Skips duplicates while rendering

---

### 5. Handling Edge Cases

#### 🔹 Case: Featured products appear in later pages
- Ignored if already shown

#### 🔹 Case: No featured products
- Normal infinite scroll works

#### 🔹 Case: Filters or sorting applied
- Switch to Shopify default rendering
- No custom logic applied (as required)

---

## ⚡ Performance & Scalability

- Uses lazy loading
- Fetches products in batches (20 per request)
- Avoids re-rendering same products
- Efficient for large collections

---

## ⚠️ Limitations

- Shopify Liquid cannot fully control dynamic reordering
- Hence, JavaScript (AJAX API) is used for full control

---

## 🔗 Links

### Live Preview
https://im2zaj-iu.myshopify.com/collections/demo-collection

Password: ahwhia

---

### GitHub Repository
https://github.com/MrSoham24/shopify-featured-infinite-scroll

---

## 🙌 Conclusion

This solution ensures:
- Correct product ordering
- Smooth infinite scroll experience
- Proper handling of sorting and filtering
- Scalable and clean implementation
