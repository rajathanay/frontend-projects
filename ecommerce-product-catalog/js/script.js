// ==========================================
// ELEMENTS
// ==========================================

const body =
    document.body;


const themeToggle =
    document.getElementById(
        "theme-toggle"
    );


const priceRange =
    document.getElementById(
        "price-range"
    );


const priceValue =
    document.getElementById(
        "price-value"
    );


const categoryChips =
    document.querySelectorAll(
        ".category-chip"
    );


const productGrid =
    document.getElementById(
        "product-grid"
    );


const productCards =
    Array.from(
        document.querySelectorAll(
            ".product-card"
        )
    );


const productCount =
    document.getElementById(
        "product-count"
    );


const sortProducts =
    document.getElementById(
        "sort-products"
    );


const clearFilters =
    document.getElementById(
        "clear-filters"
    );


const noProducts =
    document.getElementById(
        "no-products"
    );


const quickViewButtons =
    document.querySelectorAll(
        ".quick-view-button"
    );


const modal =
    document.getElementById(
        "quick-view-modal"
    );


const closeModal =
    document.getElementById(
        "close-modal"
    );


const modalProductName =
    document.getElementById(
        "modal-product-name"
    );



// ==========================================
// FILTER STATE
// ==========================================

let selectedCategory =
    "all";



// ==========================================
// DARK / LIGHT MODE
// ==========================================

themeToggle.addEventListener(
    "click",
    function () {

        body.classList.toggle(
            "dark-theme"
        );


        const darkModeEnabled =
            body.classList.contains(
                "dark-theme"
            );


        if (darkModeEnabled) {

            themeToggle.textContent =
                "Light Mode";

            themeToggle.setAttribute(
                "aria-label",
                "Switch to light mode"
            );

        } else {

            themeToggle.textContent =
                "Dark Mode";

            themeToggle.setAttribute(
                "aria-label",
                "Switch to dark mode"
            );
        }
    }
);



// ==========================================
// PRICE RANGE
// ==========================================

priceRange.addEventListener(
    "input",
    function () {

        priceValue.textContent =
            `$${priceRange.value}`;


        filterProducts();
    }
);



// ==========================================
// CATEGORY FILTER
// ==========================================

categoryChips.forEach(
    chip => {

        chip.addEventListener(
            "click",
            function () {

                categoryChips.forEach(
                    currentChip => {

                        currentChip.classList
                            .remove(
                                "active"
                            );
                    }
                );


                chip.classList.add(
                    "active"
                );


                selectedCategory =
                    chip.dataset.category;


                filterProducts();
            }
        );
    }
);



// ==========================================
// FILTER PRODUCTS
// ==========================================

function filterProducts() {

    const maximumPrice =
        Number(
            priceRange.value
        );


    let visibleProducts = 0;


    productCards.forEach(
        card => {

            const category =
                card.dataset.category;


            const price =
                Number(
                    card.dataset.price
                );


            const categoryMatches =
                selectedCategory === "all"
                ||
                category
                === selectedCategory;


            const priceMatches =
                price <= maximumPrice;


            if (
                categoryMatches
                &&
                priceMatches
            ) {

                card.hidden =
                    false;

                visibleProducts++;

            } else {

                card.hidden =
                    true;
            }
        }
    );


    updateProductCount(
        visibleProducts
    );
}



// ==========================================
// PRODUCT COUNT
// ==========================================

function updateProductCount(
    count
) {

    productCount.textContent =
        `${count} ${
            count === 1
                ? "Product"
                : "Products"
        }`;


    noProducts.hidden =
        count !== 0;
}



// ==========================================
// SORT PRODUCTS
// ==========================================

sortProducts.addEventListener(
    "change",
    function () {

        const value =
            sortProducts.value;


        const sortedCards =
            [...productCards];


        if (
            value === "price-low"
        ) {

            sortedCards.sort(
                (a, b) =>
                    Number(
                        a.dataset.price
                    )
                    -
                    Number(
                        b.dataset.price
                    )
            );
        }


        if (
            value === "price-high"
        ) {

            sortedCards.sort(
                (a, b) =>
                    Number(
                        b.dataset.price
                    )
                    -
                    Number(
                        a.dataset.price
                    )
            );
        }


        if (
            value === "name"
        ) {

            sortedCards.sort(
                (a, b) =>
                    a.dataset.name
                        .localeCompare(
                            b.dataset.name
                        )
            );
        }


        if (
            value === "featured"
        ) {

            sortedCards.sort(
                (a, b) =>
                    productCards.indexOf(a)
                    -
                    productCards.indexOf(b)
            );
        }


        sortedCards.forEach(
            card => {

                productGrid.appendChild(
                    card
                );
            }
        );
    }
);



// ==========================================
// CLEAR FILTERS
// ==========================================

clearFilters.addEventListener(
    "click",
    function () {

        selectedCategory =
            "all";


        categoryChips.forEach(
            chip => {

                chip.classList.remove(
                    "active"
                );


                if (
                    chip.dataset.category
                    === "all"
                ) {

                    chip.classList.add(
                        "active"
                    );
                }
            }
        );


        priceRange.value =
            200;


        priceValue.textContent =
            "$200";


        document
            .querySelectorAll(
                'input[name="size"]'
            )
            .forEach(
                checkbox => {

                    checkbox.checked =
                        false;
                }
            );


        sortProducts.value =
            "featured";


        filterProducts();
    }
);



// ==========================================
// QUICK VIEW
// ==========================================

quickViewButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function () {

                modalProductName.textContent =
                    button.dataset.product;


                modal.classList.add(
                    "open"
                );


                modal.setAttribute(
                    "aria-hidden",
                    "false"
                );


                closeModal.focus();
            }
        );
    }
);



// ==========================================
// CLOSE MODAL
// ==========================================

function closeQuickView() {

    modal.classList.remove(
        "open"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );
}


closeModal.addEventListener(
    "click",
    closeQuickView
);


modal.addEventListener(
    "click",
    function (event) {

        if (event.target === modal) {

            closeQuickView();
        }
    }
);


document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
            &&
            modal.classList.contains(
                "open"
            )
        ) {

            closeQuickView();
        }
    }
);



// ==========================================
// ADD TO CART DEMO
// ==========================================

document
    .querySelectorAll(
        ".cart-button"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    const originalText =
                        button.textContent;


                    button.textContent =
                        "Added ✓";


                    setTimeout(
                        () => {

                            button.textContent =
                                originalText;

                        },
                        1200
                    );
                }
            );
        }
    );



// ==========================================
// INITIALIZE
// ==========================================

filterProducts();