document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById('product-container');
    const loader = document.querySelector('.loader');

    if (!container) return;

    const collectionHandle = container.dataset.collectionHandle;

    // 🔥 SORTING & FILTER CHECK (FINAL FIX)
    const searchParams = new URLSearchParams(window.location.search);
    let hasSortOrFilter = false;

    for (const key of searchParams.keys()) {
        if (key === 'sort_by' || key.startsWith('filter.')) {
            hasSortOrFilter = true;
            break;
        }
    }

    if (hasSortOrFilter) {
        if (loader) loader.style.display = 'none';
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

            let priceFormatted = "0.00";
            if (product.variants && product.variants.length > 0) {
                priceFormatted = parseFloat(product.variants[0].price).toFixed(2);
            }

            let imageUrl = 'https://via.placeholder.com/400';
            if (product.images && product.images.length > 0) {
                imageUrl = product.images[0].src;
            }

            card.innerHTML = `
                <div class="product-image">
                    <img src="${imageUrl}" alt="${product.title}" loading="lazy">
                    ${isFeatured ? '<span class="featured-badge">Featured</span>' : ''}
                </div>
                <div class="product-info">
                    <h3>${product.title}</h3>
                    <span>₹${priceFormatted}</span>
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
            const response = await fetch(`/collections/${collectionHandle}/products.json?page=${page}&limit=20`);
            if (!response.ok) throw new Error('Fetch error');

            const data = await response.json();
            return data.products || [];

        } catch (error) {
            console.error(error);
            return [];
        }
    }

    function processProducts(products) {
        products.forEach(product => {

            const tags = product.tags || [];
            const isFeatured = Array.isArray(tags)
                ? tags.some(tag => tag.toLowerCase().includes('featured'))
                : (typeof tags === 'string' && tags.toLowerCase().includes('featured'));

            // 🔥 FINAL FEATURED FIX (WITH RETURN)
            if (isFeatured) {
                if (featuredProducts.length < MAX_FEATURED) {
                    const exists = featuredProducts.some(p => p.id === product.id);
                    if (!exists && !renderedProductIds.has(product.id)) {
                        featuredProducts.push(product);
                    }
                }
                return; // 🚨 prevents leakage into normal queue
            }

            const existsInQueue = nonFeaturedQueue.some(p => p.id === product.id);
            if (!existsInQueue && !renderedProductIds.has(product.id)) {
                nonFeaturedQueue.push(product);
            }
        });
    }

    async function initialLoad() {
        isFetching = true;
        showLoader();

        // 🔥 COLLECT FEATURED ACROSS PAGES
        while (featuredProducts.length < MAX_FEATURED && hasMorePages) {
            const products = await fetchProducts(currentPage);

            if (products.length === 0) {
                hasMorePages = false;
                break;
            }

            processProducts(products);
            currentPage++;
        }

        // 🔥 RENDER FEATURED FIRST
        renderProductsToDOM(featuredProducts, true);

        // 🔥 THEN 5 NORMAL
        const firstBatch = nonFeaturedQueue.splice(0, 5);
        renderProductsToDOM(firstBatch, false);

        initialLoadComplete = true;
        isFetching = false;
        hideLoader();
    }

    async function loadMore() {
        if (isFetching || !hasMorePages) return;

        isFetching = true;
        showLoader();

        const toRender = [];
        let loaded = 0;

        while (loaded < ITEMS_PER_SCROLL && hasMorePages) {

            while (nonFeaturedQueue.length > 0 && loaded < ITEMS_PER_SCROLL) {
                const product = nonFeaturedQueue.shift();

                if (!renderedProductIds.has(product.id)) {
                    toRender.push(product);
                    loaded++;
                }
            }

            if (loaded < ITEMS_PER_SCROLL) {
                const products = await fetchProducts(currentPage);

                if (products.length === 0) {
                    hasMorePages = false;
                    break;
                }

                processProducts(products);
                currentPage++;
            }
        }

        renderProductsToDOM(toRender, false);

        isFetching = false;
        hideLoader();
    }

    let scrollTimeout;

    function handleScroll() {
        if (isFetching || !hasMorePages || !initialLoadComplete) return;

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

    initialLoad();
});
