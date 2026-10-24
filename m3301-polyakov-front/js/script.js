let cart = JSON.parse(localStorage.getItem('pollosCart')) || [];

function saveCart() {
    localStorage.setItem('pollosCart', JSON.stringify(cart));
}

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }

    saveCart();
    updateCartDisplay();
    showNotification(`"${name}" добавлен в корзину!`);

    const button = event.target;
    button.classList.add('added');
    setTimeout(() => {
        button.classList.remove('added');
    }, 300);
}

function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    saveCart();
    updateCartDisplay();
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartDisplay();
    showNotification('Корзина очищена!');
}

function makeOrder() {
    cart = [];
    saveCart();
    updateCartDisplay();
    showNotification('Заказ сделан!');
}

function updateCartDisplay() {
    const cartItemsElement = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');

    if (!cartItemsElement || !cartTotalElement) return;

    if (cart.length === 0) {
        cartItemsElement.innerHTML = '<p class="cart-empty">Ваша корзина пуста</p>';
        cartTotalElement.textContent = 'Общая сумма: $0.00';
        return;
    }

    let cartHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const safeName = item.name.replace(/'/g, "\\'");

        cartHTML += `
            <div class="cart-item">
                <div class="cart-item__info">
                    <span class="cart-item__name">${item.name}</span>
                    <span class="cart-item__price">$${item.price.toFixed(2)} × ${item.quantity}</span>
                </div>
                <div class="cart-item__total">
                    <span>$${itemTotal.toFixed(2)}</span>
                    <button class="button button--secondary" onclick="removeFromCart('${safeName}')">Удалить</button>
                </div>
            </div>
        `;
    });

    cartItemsElement.innerHTML = cartHTML;
    cartTotalElement.textContent = `Общая сумма: $${total.toFixed(2)}`;
}

function checkout() {
    if (cart.length === 0) {
        showNotification('Ваша корзина пуста!');
        return;
    }

    let orderDetails = 'Ваш заказ:\n';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        orderDetails += `${item.name} - $${item.price.toFixed(2)} x ${item.quantity} = $${itemTotal.toFixed(2)}\n`;
    });

    orderDetails += `\nОбщая сумма: $${total.toFixed(2)}`;
    orderDetails += '\n\nСпасибо за заказ в Los Pollos Hermanos!';

    alert(orderDetails);
    makeOrder();
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--color-primary);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius);
        box-shadow: 0 4px 15px var(--color-shadow);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function createRecipe() {
    const ingredients = Array.from(document.querySelectorAll('input[name="ingredient"]:checked'))
        .map(input => input.value);

    const spices = Array.from(document.querySelectorAll('input[name="spice"]:checked'))
        .map(input => input.value);

    const secret = document.querySelector('select[name="secret"]').value;

    let recipe = "Твой рецепт панировки: ";

    if (ingredients.length > 0) {
        recipe += ingredients.join(" + ");
    } else {
        recipe += "основа (выбери ингредиенты)";
    }

    if (spices.length > 0) {
        recipe += " + " + spices.join(" + ");
    }

    if (secret) {
        recipe += " + секретный ингредиент: " + secret;
    }

    let verdict = "";
    if (ingredients.length >= 2 && spices.length >= 3 && secret) {
        verdict = "🎉 Идеально! Твой рецепт достоин Los Pollos Hermanos!";
    } else if (ingredients.length >= 1 && spices.length >= 2) {
        verdict = "👍 Хорошо! Но можно добавить больше специй.";
    } else {
        verdict = "👎 Неплохо, но попробуй добавить больше ингредиентов!";
    }

    const recipeResult = document.getElementById('recipeResult');
    document.getElementById('recipeText').textContent = recipe;
    document.getElementById('recipeVerdict').textContent = verdict;

    recipeResult.style.display = 'block';
    recipeResult.style.opacity = '0';
    recipeResult.style.transform = 'translateY(20px)';

    setTimeout(() => {
        recipeResult.style.transition = 'all 0.5s ease';
        recipeResult.style.opacity = '1';
        recipeResult.style.transform = 'translateY(0)';
    }, 100);
}

function toggleChat() {
    const chatContent = document.querySelector('.chat-widget__content');
    chatContent.classList.toggle('chat-widget__content--open');
}

document.addEventListener('click', function (event) {
    const chatWidget = document.querySelector('.chat-widget');
    const chatContent = document.querySelector('.chat-widget__content');

    if (chatWidget && chatContent && !chatWidget.contains(event.target) && chatContent.classList.contains('chat-widget__content--open')) {
        chatContent.classList.remove('chat-widget__content--open');
    }
});

window.addDOMContentLoadedHandler(function () {
    console.log('Cart initialized:', cart);
    updateCartDisplay();
});

function debugCart() {
    console.log('Current cart:', cart);
    console.log('LocalStorage:', localStorage.getItem('pollosCart'));
}