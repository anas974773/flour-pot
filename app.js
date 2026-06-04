// Flour Pot E-commerce Website Logic

// State management
let cart = [];

// DOM Elements
const cartTrigger = document.querySelector('.cart-trigger');
const cartCount = document.querySelector('.cart-count');
const cartItemsList = document.querySelector('.cart-items-list');
const cartSubtotalEl = document.getElementById('cart-subtotal');
const cartTotalEl = document.getElementById('cart-total');
const checkoutForm = document.getElementById('checkout-form');
const successModal = document.getElementById('success-modal');
const modalDetails = document.getElementById('modal-details');
const btnCloseModal = document.getElementById('btn-close-modal');
const toastEl = document.getElementById('toast');
const toastMessageEl = document.getElementById('toast-message');

// Load cart from LocalStorage
function initCart() {
    const savedCart = localStorage.getItem('flourpot_cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            cart = [];
        }
    }
    updateCartUI();
}

// Save cart to LocalStorage
function saveCart() {
    localStorage.setItem('flourpot_cart', JSON.stringify(cart));
}

// Show custom toast notification
function showToast(message) {
    toastMessageEl.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => {
        toastEl.classList.remove('show');
    }, 3000);
}

// Update quantities in DOM
function updateCartUI() {
    // Update Cart Badge Count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';

    // Populate Checkout Cart Section
    if (!cartItemsList) return;

    if (cart.length === 0) {
        cartItemsList.innerHTML = `
            <div class="cart-empty-message">
                <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <p>Your cart is empty. Explore our products and add them to order!</p>
            </div>
        `;
        cartSubtotalEl.textContent = "$0.00";
        cartTotalEl.textContent = "$0.00";
        return;
    }

    cartItemsList.innerHTML = '';
    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const cartItemHTML = `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-meta">Option: ${item.option} | Qty: ${item.quantity}</div>
                    <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
                </div>
                <button class="cart-item-remove" data-index="${index}" title="Remove Item">
                    <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;
        cartItemsList.insertAdjacentHTML('beforeend', cartItemHTML);
    });

    cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    cartTotalEl.textContent = `$${subtotal.toFixed(2)}`;

    // Add remove listeners
    document.querySelectorAll('.cart-item-remove').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(button.getAttribute('data-index'));
            removeFromCart(index);
        });
    });
}

// Add item to cart
function addToCart(id, name, basePrice, option, quantity, image) {
    // Find matching item in cart
    const existingItemIndex = cart.findIndex(item => item.id === id && item.option === option);

    // Dynamic price calculation based on packaging size
    let finalPrice = basePrice;
    if (option.includes('1kg') || option.includes('1L')) {
        finalPrice = basePrice * 1.85; // Discounted double-size
    } else if (option.includes('250g')) {
        finalPrice = basePrice * 0.55; // Smaller size ratio
    }

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push({
            id,
            name,
            price: finalPrice,
            option,
            quantity,
            image
        });
    }

    saveCart();
    updateCartUI();
    showToast(`Added ${quantity}x ${name} (${option}) to your cart!`);
}

// Remove item from cart
function removeFromCart(index) {
    const itemName = cart[index].name;
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
    showToast(`Removed ${itemName} from your cart.`);
}

// Scroll effects & Dynamic Navigation Link highlighting
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    // Highlight active link based on scroll position
    const sections = document.querySelectorAll('section, header');
    const scrollPosition = window.scrollY + 150;

    sections.forEach(section => {
        if (!section.id) return;
        const top = section.offsetTop;
        const height = section.offsetHeight;

        if (scrollPosition >= top && scrollPosition < top + height) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${section.id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// Setup click handlers for products
document.addEventListener('DOMContentLoaded', () => {
    initCart();

    // Quantity selectors in product cards
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = btn.closest('.product-card');
            const input = card.querySelector('.qty-input');
            let val = parseInt(input.value);

            if (btn.classList.contains('plus')) {
                val++;
            } else if (btn.classList.contains('minus') && val > 1) {
                val--;
            }
            input.value = val;
        });
    });

    // Add to cart buttons in product cards
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = btn.closest('.product-card');
            const id = card.getAttribute('data-id');
            const name = card.getAttribute('data-name');
            const basePrice = parseFloat(card.getAttribute('data-price'));
            const image = card.getAttribute('data-image');
            
            const optionSelect = card.querySelector('.product-options');
            const option = optionSelect ? optionSelect.value : 'Standard';
            
            const qtyInput = card.querySelector('.qty-input');
            const qty = parseInt(qtyInput.value);

            addToCart(id, name, basePrice, option, qty, image);
            
            // Reset quantity to 1 after adding
            qtyInput.value = 1;
        });
    });

    // Cart trigger scroll to order section
    if (cartTrigger) {
        cartTrigger.addEventListener('click', () => {
            document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Checkout form validation and processing
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();

            if (cart.length === 0) {
                showToast("Please add items to your cart before placing an order!");
                return;
            }

            const name = document.getElementById('order-name').value.trim();
            const phone = document.getElementById('order-phone').value.trim();
            const address = document.getElementById('order-address').value.trim();
            const note = document.getElementById('order-notes').value.trim();

            if (!name || !phone || !address) {
                showToast("Please fill in all the required field details.");
                return;
            }

            const submitBtn = checkoutForm.querySelector('.btn-place-order');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Placing Order... <i class="fa-solid fa-spinner fa-spin" style="margin-left: 5px;"></i>';

            // Generate an order receipt layout
            const orderId = 'FP-' + Math.floor(100000 + Math.random() * 900000);
            let total = 0;

            let itemsReceiptHTML = '';
            let itemsString = '';
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                itemsReceiptHTML += `
                    <div class="receipt-row">
                        <span>${item.name} (${item.option}) x${item.quantity}</span>
                        <span>$${itemTotal.toFixed(2)}</span>
                    </div>
                `;
                itemsString += `- ${item.name} (${item.option}) x${item.quantity} ($${itemTotal.toFixed(2)})\n`;
            });

            // Format address and details for Google Sheets / Google Form
            let formattedAddress = `Delivery Address: ${address}\n\n--- Order Summary ---\nOrder ID: ${orderId}\nItems:\n${itemsString}Total: $${total.toFixed(2)}`;
            if (note) {
                formattedAddress += `\nNotes: ${note}`;
            }

            // Google Form Config URL
            const formUrl = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSc0bZLJecMieFX8I8U_8yEs7I0V1OzROqgPiEokgOKjs22Svg/formResponse';

            // Submit using a hidden iframe to prevent CORS/protocol errors in local file environments (file:///)
            let iframe = document.getElementById('hidden_iframe');
            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.name = 'hidden_iframe';
                iframe.id = 'hidden_iframe';
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
            }

            const hiddenForm = document.createElement('form');
            hiddenForm.action = formUrl;
            hiddenForm.method = 'POST';
            hiddenForm.target = 'hidden_iframe';
            hiddenForm.style.display = 'none';

            const fields = {
                'entry.2124464187': name,
                'entry.555563620': phone,
                'entry.137620769': formattedAddress
            };

            for (const key in fields) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = fields[key];
                hiddenForm.appendChild(input);
            }

            document.body.appendChild(hiddenForm);

            try {
                hiddenForm.submit();

                // Clean up hidden form element
                setTimeout(() => {
                    hiddenForm.remove();
                }, 1000);

                // Populate Success Modal
                modalDetails.innerHTML = `
                    <div class="receipt-row"><strong>Order ID:</strong> <span>${orderId}</span></div>
                    <div class="receipt-row"><strong>Name:</strong> <span>${name}</span></div>
                    <div class="receipt-row"><strong>Phone:</strong> <span>${phone}</span></div>
                    <div class="receipt-row"><strong>Delivery Address:</strong> <span>${address}</span></div>
                    ${note ? `<div class="receipt-row"><strong>Notes:</strong> <span>${note}</span></div>` : ''}
                    <div style="margin: 1rem 0; border-top: 1px dashed var(--border-color);"></div>
                    ${itemsReceiptHTML}
                    <div class="receipt-row receipt-total">
                        <span>Grand Total:</span>
                        <span>$${total.toFixed(2)}</span>
                    </div>
                `;

                // Open Modal
                successModal.classList.add('active');

                // Reset cart
                cart = [];
                saveCart();
                updateCartUI();
                checkoutForm.reset();
            } catch (error) {
                console.error('Error submitting order via iframe:', error);
                showToast("Failed to place order. Please try again.");
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }

    // Success Modal Close
    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', () => {
            successModal.classList.remove('active');
        });
    }

    // Close modal on background click
    if (successModal) {
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) {
                successModal.classList.remove('active');
            }
        });
    }

    // Interactive Contact Form (submits natively to Google Form targeting hidden_iframe)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            const name = document.getElementById('contact-name').value.trim();
            const submitBtn = contactForm.querySelector('.btn-submit-contact');
            const originalBtnText = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin" style="margin-left: 5px;"></i>';

            // Let the form submit natively to the hidden target iframe,
            // then update the UI feedback after a short delay.
            setTimeout(() => {
                showToast(`Thank you, ${name}! Your inquiry has been received.`);
                contactForm.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }, 1000);
        });
    }

    // Smooth page scrolling for header anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
