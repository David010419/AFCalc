// AirConv Pro - Cart System Logic
let cart = JSON.parse(localStorage.getItem('airconv_cart')) || [];

// SVGs inline para evitar dependencia de Lucide en los botones de ingredientes
const SVG_PLUS  = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
const SVG_CHECK = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

function initCart() {
    renderCart();
    updateCartCount();
    syncIngredientButtons();
}

// Obtiene el nombre de un botón de ingrediente de forma fiable
function getIngredientName(btn) {
    // Prioridad 1: data-name (el más fiable)
    if (btn.dataset.name) return btn.dataset.name;
    // Prioridad 2: extraer del onclick
    const onclick = btn.getAttribute('onclick') || '';
    const match = onclick.match(/'([^']+)'/);
    return match ? match[1] : null;
}

// Marca o desmarca visualmente UN botón concreto
function applyButtonState(btn, isAdded) {
    if (isAdded) {
        btn.classList.remove('removing');
        btn.classList.add('added');
        btn.innerHTML = SVG_CHECK;
    } else {
        btn.classList.add('removing');
        btn.classList.remove('added');
        btn.innerHTML = SVG_PLUS;
        // Quitar clase al terminar la animación para que pueda repetirse
        btn.addEventListener('animationend', () => btn.classList.remove('removing'), { once: true });
    }
}

// Sincroniza TODOS los botones de la página con el estado del carrito
function syncIngredientButtons() {
    document.querySelectorAll('.btn-add-ingredient').forEach(btn => {
        const name = getIngredientName(btn);
        if (name) applyButtonState(btn, cart.includes(name));
    });
}

function toggleIngredient(name, btn) {
    const index = cart.indexOf(name);
    const isAdding = index === -1;

    if (isAdding) {
        cart.push(name);
        showToast(`🧺 ${name} añadido`);
    } else {
        cart.splice(index, 1);
    }

    // 1. Feedback visual inmediato en el botón pulsado
    if (btn) applyButtonState(btn, isAdding);

    // 2. Guardar y actualizar el resto de la UI
    saveCart();
    renderCart();
    updateCartCount();

    // 3. Sincronizar el resto de botones (por si el mismo ingrediente
    //    aparece en otro sitio de la página)
    syncIngredientButtons();
}

function saveCart() {
    localStorage.setItem('airconv_cart', JSON.stringify(cart));
}

function updateCartCount() {
    document.querySelectorAll('.cart-count-badge').forEach(badge => {
        badge.innerText = cart.length;
        badge.style.display = cart.length > 0 ? 'flex' : 'none';
    });
}

function renderCart() {
    const list = document.getElementById('cart-items-list');
    if (!list) return;

    if (cart.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:var(--text-secondary); margin-top:2rem; padding: 1rem;">Tu cesta está vacía. ¡Toca los ingredientes para añadirlos!</p>';
        return;
    }

    list.innerHTML = cart.map(item => `
        <div class="cart-item">
            <span>${item}</span>
            <button onclick="toggleIngredient('${item}')"
                    style="background:transparent; border:none; color:#ef4444; cursor:pointer; padding: 0.4rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4h6v2"/>
                </svg>
            </button>
        </div>
    `).join('');
    // NOTA: Ya NO llamamos a lucide.createIcons() aquí para no interferir con los botones de ingredientes
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 2500);
}

function toggleCartSidebar() {
    document.getElementById('cart-sidebar')?.classList.toggle('active');
    document.getElementById('cart-overlay')?.classList.toggle('active');
}

function shareToWhatsApp() {
    if (cart.length === 0) return alert('La cesta está vacía');
    const text = `🛒 *Lista de la Compra - AirConv Pro*\n\n${cart.map(item => `✅ ${item}`).join('\n')}\n\nEnvía desde AirConv Pro 🔥`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function copyToClipboard() {
    if (cart.length === 0) return alert('La cesta está vacía');
    navigator.clipboard.writeText(cart.map(item => `- ${item}`).join('\n'))
        .then(() => showToast('📋 Copiado al portapapeles'));
}

document.addEventListener('DOMContentLoaded', initCart);
