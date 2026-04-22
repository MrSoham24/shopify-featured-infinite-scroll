document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById('product-container');
    const loader = document.querySelector('.loader');
    const defaultGrid = document.getElementById('shopify-default-grid');

    if (!container) return;

    const collectionHandle = container.dataset.collectionHandle;

    // 🔥 DETECT FILTER / SORT / SEARCH
    const searchParams = new URLSearchParams(window.location.search);

    let hasCustomParams = false;

    for (const key of searchParams.keys()) {
        if (
            key === 'sort_by' ||
            key === 'q' ||
            key.startsWith('filter.')
        ) {
            hasCustomParams = true;
            break;
        }
    }

    // 👉 SHOW SHOPIFY DEFAULT IF FILTER/SORT ACTIVE
    if (hasCustomParams) {
        if (loader) loader.style.display = 'none';
        container.style.display = 'none';
        if (defaultGrid) defaultGrid.style.display = 'block';
        return;
    }

    const ITEMS_PER_SCROLL = 20;
    const MAX_FEATURED = 15;

    let currentPage = 1;
    let isFetching = false;
    let hasMorePages = true;

    const renderedProductIds = new Set();
    const featuredProducts = [];
    const nonFeaturedQueue = [];

    let initialLoadComplete = false;

    function renderProductsToDOM(products, isFeatured = false) {
        const fragment = document.createDocumentFragment();

        products.forEach(product => {
            if (renderedProductIds.has(product.id)) return;

            renderedProductIds.add(product.id);

            const card = document.createElement('div');
            card.className = `product-card ${isFeatured ? 'featured' : ''}`;

            let price = product.variants?.[0]?.price || "0.00";
            let image = product.images?.[0]?.src || 'https://via.placeholder.com/400';

            card.innerHTML = `
                <div class="product-image">
                    <img src="${image}" alt="${product.title}" loading="lazy">
                    ${isFeatured ? '<span class="featured-badge">Featured</span>' : ''}
                </div>
                <div class="product-info">
                    <h3>${product.title}</h3>
                    <span>₹${parseFloat(price).toFixed(2)}</span>
                </div>
            `;

            fragment.appendChild(card);
        });

        container.appendChild(fragment);
    }

    function showLoader() {
        if (loader) loader.style.display = 'flex';
    }

    function hideLoader() {
        if (loader) loader.style.display = 'none';
    }

    async function fetchProducts(page) {
        try {
            const res = await fetch(`/collections/${collectionHandle}/products.json?page=${page}&limit=20`);
            const data = await res.json();
            return data.products || [];
        } catch (error) {
            console.error("Fetch error:", error);
            return [];
        }
    }

    function processProducts(products) {
        products.forEach(product => {

            // 🔥 SAFE FEATURED CHECK
            const tags = product.tags || [];
            const isFeatured = Array.isArray(tags)
                ? tags.some(tag => tag.toLowerCase().includes('featured'))
                : (typeof tags === 'string' && tags.toLowerCase().includes('featured'));

            if (isFeatured) {
                if (
                    featuredProducts.length < MAX_FEATURED &&
                    !renderedProductIds.has(product.id)
                ) {
                    const exists = featuredProducts.some(p => p.id === product.id);
                    if (!exists) {
                        featuredProducts.push(product);
                    }
                }
            } else {
                if (!renderedProductIds.has(product.id)) {
                    const exists = nonFeaturedQueue.some(p => p.id === product.id);
                    if (!exists) {
                        nonFeaturedQueue.push(product);
                    }
                }
            }
        });
    }

    async function initialLoad() {
        isFetching = true;
        showLoader();

        // 🔥 COLLECT FEATURED FROM MULTIPLE PAGES
        while (featuredProducts.length < MAX_FEATURED && hasMorePages) {
            const products = await fetchProducts(currentPage);

            if (!products.length) {
                hasMorePages = false;
                break;
            }

            processProducts(products);
            currentPage++;
        }

        // 🔥 RENDER FEATURED FIRST
        renderProductsToDOM(featuredProducts, true);

        // 🔥 THEN 5 NORMAL PRODUCTS
        renderProductsToDOM(nonFeaturedQueue.splice(0, 5), false);

        initialLoadComplete = true;
        isFetching = false;
        hideLoader();
    }

    async function loadMore() {
        if (isFetching || !hasMorePages) return;

        isFetching = true;
        showLoader();

        const batch = [];

        while (batch.length < ITEMS_PER_SCROLL && hasMorePages) {

            while (nonFeaturedQueue.length && batch.length < ITEMS_PER_SCROLL) {
                const product = nonFeaturedQueue.shift();

                if (!renderedProductIds.has(product.id)) {
                    batch.push(product);
                }
            }

            if (batch.length < ITEMS_PER_SCROLL) {
                const products = await fetchProducts(currentPage);

                if (!products.length) {
                    hasMorePages = false;
                    break;
                }

                processProducts(products);
                currentPage++;
            }
        }

        renderProductsToDOM(batch, false);

        isFetching = false;
        hideLoader();
    }

    // 🔥 SCROLL HANDLER (DEBOUNCED)
    let scrollTimeout;

    function handleScroll() {
        if (!initialLoadComplete || isFetching || !hasMorePages) return;

        clearTimeout(scrollTimeout);

        scrollTimeout = setTimeout(() => {
            const scrollPosition = window.innerHeight + window.scrollY;
            const pageHeight = document.documentElement.scrollHeight;

            if (pageHeight - scrollPosition < 400) {
                loadMore();
            }
        }, 100);
    }

    window.addEventListener('scroll', handleScroll);

    // 🔥 INIT
    initialLoad();
});
