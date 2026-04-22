# Shopify Featured Products with Infinite Scroll

## 📌 Objective

This project implements a custom Shopify collection page where:

* Featured products always appear at the top
* Infinite scrolling loads products dynamically
* Sorting and filtering work without breaking logic

---

## 🚀 Features Implemented

### ✅ Featured Products Handling

* Products with tag `featured` are identified dynamically
* Maximum 15 featured products are displayed at the top
* Featured products are never repeated in later scrolls

---

### ✅ Infinite Scroll

* Products are loaded using Shopify AJAX API
  `/collections/{handle}/products.json`
* 20 products are fetched per request
* On scroll → next batch loads automatically

---

### ✅ Initial Load Logic

* First load:

  * 15 featured products
  * * 5 normal products
  * Total = 20 products

---

### ✅ Duplicate Prevention

* Used a global `Set` (`renderedProductIds`)
* Ensures no product is rendered twice

---

### ✅ Sorting & Filtering

* If `sort_by` or `filter` detected in URL:

  * Custom JS is disabled
  * Shopify default behavior is used

---

### ✅ Performance Optimization

* Used `DocumentFragment` for efficient DOM updates
* Lazy loading enabled for images
* Debounced scroll event

---

## 🧠 Approach

1. Fetch products via Shopify AJAX API
2. Separate:

   * Featured products
   * Non-featured products
3. Store them in different arrays
4. Render:

   * Featured first
   * Then non-featured
5. Infinite scroll loads only non-featured products

---

## ⚙️ Tech Stack

* Shopify Liquid
* JavaScript (Vanilla)
* Shopify AJAX API
* CSS

---

## 📂 Folder Structure

```
assets/
  custom.js
  custom.css

sections/
  custom-collection.liquid
```

---

## ⚠️ Edge Cases Handled

* No featured products → normal infinite scroll
* Featured products in later pages → ignored
* Large collections → scalable approach
* Sorting/filtering → override custom logic

---

## 🔗 Live Preview

(https://im2zaj-iu.myshopify.com/)

---

## 📌 Notes

* Built for scalability and performance
* Handles real-world large product collections
* Designed to avoid duplication and maintain order

---
