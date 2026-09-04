const productGrid =
    document.getElementById("product-grid");

const productCount =
    document.getElementById("product-count");

const cartToggle =
    document.getElementById("cart-toggle");

const cartClose =
    document.getElementById("cart-close");

const cartPanel =
    document.getElementById("cart-panel");

const cartOverlay =
    document.getElementById("cart-overlay");

const cartCount =
    document.getElementById("cart-count");

const cartItems =
    document.getElementById("cart-items");

const emptyCart =
    document.getElementById("empty-cart");

const subtotalText =
    document.getElementById("subtotal");

const discountText =
    document.getElementById("discount");

const totalText =
    document.getElementById("total");

const couponForm =
    document.getElementById("coupon-form");

const couponInput =
    document.getElementById("coupon-input");

const couponMessage =
    document.getElementById("coupon-message");

const clearCartButton =
    document.getElementById("clear-cart");

const statusMessage =
    document.getElementById("status-message");


const STORAGE_KEY =
    "shopflow-cart";

let products = [];

let cart =
    loadCart();

let statusTimer;


/* Product loading */

async function loadProducts() {

    try {

        const response =
            await fetch(
                "data/products.json"
            );

        if (!response.ok) {

            throw new Error(
                "Could not load products."
            );
        }

        products =
            await response.json();

        removeMissingProducts();

        renderProducts();
        renderCart();

    } catch (error) {

        showStatus(
            error.message,
            true
        );
    }
}


function renderProducts() {

    productGrid.innerHTML =
        "";

    productCount.textContent =
        `${products.length} products`;

    products.forEach(
        product => {

            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "product-card";


            const mark =
                document.createElement(
                    "div"
                );

            mark.className =
                "product-mark";

            mark.textContent =
                getProductMark(
                    product.name
                );


            const category =
                document.createElement(
                    "p"
                );

            category.className =
                "product-category";

            category.textContent =
                product.category;


            const name =
                document.createElement(
                    "h3"
                );

            name.textContent =
                product.name;


            const price =
                document.createElement(
                    "p"
                );

            price.className =
                "product-price";

            price.textContent =
                formatMoney(
                    product.price
                );


            const addButton =
                document.createElement(
                    "button"
                );

            addButton.type =
                "button";

            addButton.className =
                "add-button";

            addButton.dataset.productId =
                product.id;

            addButton.textContent =
                "Add to Cart";


            card.append(
                mark,
                category,
                name,
                price,
                addButton
            );

            productGrid.appendChild(
                card
            );
        }
    );
}


/* Cart actions */

productGrid.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                ".add-button"
            );

        if (!button) {
            return;
        }

        addToCart(
            button.dataset.productId
        );
    }
);


cartItems.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                "button[data-action]"
            );

        if (!button) {
            return;
        }

        const productId =
            button.dataset.productId;

        const action =
            button.dataset.action;


        if (
            action === "increase"
        ) {

            changeQuantity(
                productId,
                1
            );
        }


        if (
            action === "decrease"
        ) {

            changeQuantity(
                productId,
                -1
            );
        }


        if (
            action === "remove"
        ) {

            removeFromCart(
                productId
            );
        }
    }
);


function addToCart(productId) {

    const item =
        cart.items.find(
            item =>
                item.productId
                === productId
        );

    if (item) {

        item.quantity++;

    } else {

        cart.items.push({
            productId,
            quantity: 1
        });
    }

    saveCart();
    renderCart();

    showStatus(
        "Item added to cart."
    );
}


function changeQuantity(
    productId,
    amount
) {

    const item =
        cart.items.find(
            item =>
                item.productId
                === productId
        );

    if (!item) {
        return;
    }

    item.quantity +=
        amount;

    if (
        item.quantity <= 0
    ) {

        removeFromCart(
            productId
        );

        return;
    }

    saveCart();
    renderCart();
}


function removeFromCart(
    productId
) {

    cart.items =
        cart.items.filter(
            item =>
                item.productId
                !== productId
        );

    saveCart();
    renderCart();
}


function renderCart() {

    cartItems.innerHTML =
        "";

    const hasItems =
        cart.items.length > 0;

    emptyCart.hidden =
        hasItems;


    cart.items.forEach(
        item => {

            const product =
                products.find(
                    product =>
                        product.id
                        === item.productId
                );

            if (!product) {
                return;
            }


            const row =
                document.createElement(
                    "article"
                );

            row.className =
                "cart-item";


            const details =
                document.createElement(
                    "div"
                );


            const name =
                document.createElement(
                    "h3"
                );

            name.textContent =
                product.name;


            const price =
                document.createElement(
                    "p"
                );

            price.className =
                "cart-item-price";

            price.textContent =
                `${formatMoney(product.price)} each`;


            const controls =
                document.createElement(
                    "div"
                );

            controls.className =
                "quantity-controls";


            const decrease =
                createCartButton(
                    "−",
                    "decrease",
                    product.id
                );


            const quantity =
                document.createElement(
                    "span"
                );

            quantity.textContent =
                item.quantity;


            const increase =
                createCartButton(
                    "+",
                    "increase",
                    product.id
                );


            controls.append(
                decrease,
                quantity,
                increase
            );


            details.append(
                name,
                price,
                controls
            );


            const remove =
                createCartButton(
                    "Remove",
                    "remove",
                    product.id
                );

            remove.classList.add(
                "remove-button"
            );


            row.append(
                details,
                remove
            );

            cartItems.appendChild(
                row
            );
        }
    );


    updateTotals();
}


function createCartButton(
    text,
    action,
    productId
) {

    const button =
        document.createElement(
            "button"
        );

    button.type =
        "button";

    button.textContent =
        text;

    button.dataset.action =
        action;

    button.dataset.productId =
        productId;

    return button;
}


/* Coupon and pricing */

couponForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        const code =
            couponInput.value
                .trim()
                .toUpperCase();


        if (!code) {

            cart.couponCode =
                "";

            couponMessage.textContent =
                "";

            saveCart();
            renderCart();

            return;
        }


        const percent =
            getCouponPercent(
                code
            );


        if (!percent) {

            couponMessage.textContent =
                "Use SAVE followed by 5–30.";

            couponMessage.classList.add(
                "error"
            );

            return;
        }


        cart.couponCode =
            code;

        couponInput.value =
            code;

        couponMessage.textContent =
            `${percent}% discount applied.`;

        couponMessage.classList.remove(
            "error"
        );

        saveCart();
        renderCart();
    }
);


function getCouponPercent(code) {

    const match =
        /^SAVE(\d{1,2})$/i
            .exec(code);

    if (!match) {
        return 0;
    }

    const percent =
        Number(match[1]);

    if (
        percent < 5
        ||
        percent > 30
    ) {

        return 0;
    }

    return percent;
}


function updateTotals() {

    const subtotal =
        cart.items.reduce(
            (sum, item) => {

                const product =
                    products.find(
                        product =>
                            product.id
                            === item.productId
                    );

                if (!product) {
                    return sum;
                }

                return (
                    sum
                    +
                    product.price
                    * item.quantity
                );
            },
            0
        );


    const discountPercent =
        getCouponPercent(
            cart.couponCode
        );


    const discount =
        subtotal
        * discountPercent
        / 100;


    const total =
        subtotal
        - discount;


    subtotalText.textContent =
        formatMoney(
            subtotal
        );

    discountText.textContent =
        discount
            ? `-${formatMoney(discount)}`
            : formatMoney(0);

    totalText.textContent =
        formatMoney(
            total
        );


    const quantity =
        cart.items.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        );

    cartCount.textContent =
        quantity;


    if (
        cart.couponCode
        &&
        discountPercent
    ) {

        couponInput.value =
            cart.couponCode;

        couponMessage.textContent =
            `${discountPercent}% discount applied.`;

        couponMessage.classList.remove(
            "error"
        );
    }
}


/* Mini cart */

cartToggle.addEventListener(
    "click",
    openCart
);

cartClose.addEventListener(
    "click",
    closeCart
);

cartOverlay.addEventListener(
    "click",
    closeCart
);


document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            closeCart();
        }
    }
);


function openCart() {

    cartPanel.classList.add(
        "open"
    );

    cartOverlay.classList.add(
        "open"
    );

    cartPanel.setAttribute(
        "aria-hidden",
        "false"
    );
}


function closeCart() {

    cartPanel.classList.remove(
        "open"
    );

    cartOverlay.classList.remove(
        "open"
    );

    cartPanel.setAttribute(
        "aria-hidden",
        "true"
    );
}


clearCartButton.addEventListener(
    "click",
    function () {

        if (
            cart.items.length === 0
        ) {
            return;
        }

        const confirmed =
            confirm(
                "Clear your cart?"
            );

        if (!confirmed) {
            return;
        }

        cart = {
            items: [],
            couponCode: ""
        };

        couponInput.value =
            "";

        couponMessage.textContent =
            "";

        saveCart();
        renderCart();
    }
);


/* Storage and helpers */

function loadCart() {

    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );

    if (!saved) {

        return {
            items: [],
            couponCode: ""
        };
    }

    try {

        const data =
            JSON.parse(saved);

        return {
            items:
                Array.isArray(data.items)
                    ? data.items
                    : [],

            couponCode:
                typeof data.couponCode
                === "string"
                    ? data.couponCode
                    : ""
        };

    } catch {

        return {
            items: [],
            couponCode: ""
        };
    }
}


function saveCart() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
            cart
        )
    );
}


function removeMissingProducts() {

    const validIds =
        new Set(
            products.map(
                product =>
                    product.id
            )
        );

    cart.items =
        cart.items.filter(
            item =>
                validIds.has(
                    item.productId
                )
        );

    saveCart();
}


function formatMoney(value) {

    return new Intl.NumberFormat(
        "en-US",
        {
            style: "currency",
            currency: "USD"
        }
    ).format(value);
}


function getProductMark(name) {

    return name
        .split(" ")
        .map(
            word => word[0]
        )
        .join("")
        .toUpperCase()
        .slice(0, 2);
}


function showStatus(
    message,
    error = false
) {

    clearTimeout(
        statusTimer
    );

    statusMessage.textContent =
        message;

    statusMessage.classList.toggle(
        "error",
        error
    );

    statusTimer =
        setTimeout(
            function () {

                statusMessage.textContent =
                    "";

            },
            2200
        );
}


loadProducts();