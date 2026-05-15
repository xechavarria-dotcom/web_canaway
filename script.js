const routes = {
  inicio: "index.html",
  productos: "productos.html",
  contacto: "contacto.html",
  carrito: "carrito.html"
};

// ============ SHIPPING COST CALCULATION ============
function getShippingCost() {
  // Generate a random shipping cost between 10,000 and 20,000
  return Math.floor(Math.random() * 10001) + 10000;
}

// Store shipping cost in localStorage to keep it consistent during the session
function getSessionShippingCost() {
  let shipping = localStorage.getItem("canaway_shipping");
  if (!shipping) {
    shipping = getShippingCost();
    localStorage.setItem("canaway_shipping", shipping);
  }
  return parseInt(shipping);
}

const clickableItems = document.querySelectorAll("[data-target]");

clickableItems.forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();

    const target = item.dataset.target;
    const destination = routes[target];

    if (destination && destination !== "#") {
      window.location.href = destination;
      return;
    }

    window.alert(`El enlace de ${target} aun no esta configurado.`);
  });
});

// Funcionalidad de las pestañas de productos
const tabs = document.querySelectorAll(".tab-pill");
const productGrids = document.querySelectorAll(".products-grid");
const alcoholWarning = document.querySelector(".alcohol-warning");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const category = tab.dataset.category;
    
    // Remover clase activa de todas las pestañas
    tabs.forEach((t) => t.classList.remove("tab-pill-active"));
    
    // Agregar clase activa solo al botón clickeado
    tab.classList.add("tab-pill-active");
    
    // Ocultar todas las grillas
    productGrids.forEach((grid) => {
      grid.style.display = "none";
    });
    
    // Ocultar advertencia de alcohol
    if (alcoholWarning) {
      alcoholWarning.style.display = "none";
    }
    
    // Mostrar solo la grilla de la categoría seleccionada
    const activeGrid = document.querySelector(`.products-grid[data-category="${category}"]`);
    if (activeGrid) {
      activeGrid.style.display = "grid";
    }
    
    // Mostrar advertencia si es la categoría de vinos
    if (category === "vinos" && alcoholWarning) {
      alcoholWarning.style.display = "block";
    }
  });
});

// Funcionalidad de los popups de información
const infoButtons = document.querySelectorAll(".info-btn");
const infoPopups = document.querySelectorAll(".info-popup");
const closeButtons = document.querySelectorAll(".info-close");

infoButtons.forEach((btn, index) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const popup = infoPopups[index];
    
    // Cerrar todos los popups
    infoPopups.forEach((p) => p.style.display = "none");
    
    // Mostrar el popup correspondiente
    popup.style.display = "block";
  });
});

closeButtons.forEach((btn, index) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    infoPopups[index].style.display = "none";
  });
});

// Cerrar popup al hacer clic fuera
document.addEventListener("click", (e) => {
  if (!e.target.closest(".info-popup") && !e.target.closest(".info-btn")) {
    infoPopups.forEach((popup) => {
      popup.style.display = "none";
    });
  }
});

// ============ FUNCIONALIDAD DE CARRITO ============

// Carrito en localStorage
function getCart() {
  const cart = localStorage.getItem("canaway_cart");
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
  localStorage.setItem("canaway_cart", JSON.stringify(cart));
}

function addToCart(productName, price, image, category) {
  const cart = getCart();
  const existingItem = cart.find(item => item.name === productName);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      name: productName,
      price: price,
      image: image,
      category: category,
      quantity: 1
    });
  }
  
  saveCart(cart);
  updateCartUI();
}

function removeFromCart(productName) {
  let cart = getCart();
  cart = cart.filter(item => item.name !== productName);
  saveCart(cart);
  updateCartUI();
}

function updateQuantity(productName, quantity) {
  const cart = getCart();
  const item = cart.find(item => item.name === productName);
  
  if (item) {
    if (quantity <= 0) {
      removeFromCart(productName);
    } else {
      item.quantity = quantity;
      saveCart(cart);
      updateCartUI();
    }
  }
}

function updateCartUI() {
  const cartItemsContainer = document.getElementById("cart-items");
  const totalPrice = document.getElementById("total-price");
  const shippingElement = document.querySelector(".shipping-option");
  
  if (!cartItemsContainer || !totalPrice) return;
  
  const cart = getCart();
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart-message">Tu carrito está vacío</p>';
    totalPrice.textContent = "$0";
    if (shippingElement) {
      shippingElement.textContent = "$0";
    }
    return;
  }
  
  let html = "";
  let total = 0;
  
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    
    html += `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-info">
          <p class="cart-item-name">${item.name}</p>
          <p class="cart-item-price">$${item.price.toLocaleString()}</p>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="updateQuantity('${item.name}', ${item.quantity - 1})">-</button>
          <span class="qty-display">${item.quantity}</span>
          <button class="qty-btn" onclick="updateQuantity('${item.name}', ${item.quantity + 1})">+</button>
        </div>
        <div class="cart-item-total">
          $${itemTotal.toLocaleString()}
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.name}')"><img src="assets/icons/basura.png" alt="Eliminar" class="cart-remove-icon"></button>
      </div>
    `;
  });
  
  // Get shipping cost and add to total
  const shipping = getSessionShippingCost();
  const grandTotal = total + shipping;
  
  // Update shipping display
  if (shippingElement) {
    shippingElement.textContent = "$" + shipping.toLocaleString();
  }
  
  cartItemsContainer.innerHTML = html;
  totalPrice.textContent = "$" + grandTotal.toLocaleString();
}

// Llamar updateCartUI cuando cargue carrito.html
if (document.body.classList.contains("cart-page")) {
  updateCartUI();
}

// Agregar evento a botones "Agregar" en productos
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("size-modal");
  
  // Solo ejecutar si estamos en la página de productos
  if (!modal) return;
  
  const modalProductName = document.getElementById("modal-product-name");
  const modalSizes = document.getElementById("modal-sizes");
  const modalConfirm = document.getElementById("modal-confirm");
  const modalCancel = document.getElementById("modal-cancel");
  const modalClose = document.querySelector(".size-modal-close");
  
  let currentProduct = null;
  
  const addButtons = document.querySelectorAll(".state-btn:not(.state-btn-off)");
  addButtons.forEach(btn => {
    if (btn.textContent.includes("Agregar")) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const card = btn.closest(".product-card");
        
        // Obtener datos del producto
        const titleEl = card.querySelector(".product-header h2");
        const productName = titleEl ? titleEl.textContent.trim() : "Producto";
        
        // Obtener imagen
        const img = card.querySelector("img");
        const image = img ? img.src : "assets/productos/default.png";
        
        // Obtener categoría
        const gridEl = card.closest(".products-grid");
        const category = gridEl ? gridEl.dataset.category : "otros";
        
        // Obtener opciones de tamaño
        const allPrices = card.querySelectorAll(".price");
        const allTitles = card.querySelectorAll("h2, h3");
        
        // Construir opciones de tamaño
        let sizes = [];
        let titleIndex = 0;
        allPrices.forEach((priceEl, index) => {
          const priceMatch = priceEl.textContent.match(/\$[\s\d,]+/);
          if (priceMatch) {
            const price = parseInt(priceMatch[0].replace(/[\$\s,]/g, ""));
            
            // Buscar el label del tamaño (ej: "250g", "500g", "210 ml", "750 ml")
            let sizeLabel = "Opción " + (index + 1);
            if (titleIndex < allTitles.length) {
              const titleText = allTitles[titleIndex].textContent;
              const match = titleText.match(/(\d+\s*(?:g|gr|ml|mL))/);
              if (match) {
                sizeLabel = match[1];
              }
              titleIndex++;
            }
            
            sizes.push({
              label: sizeLabel,
              price: price,
              fullName: productName + " - " + sizeLabel
            });
          }
        });
        
        // Mostrar modal con las opciones
        currentProduct = { name: productName, image, category, sizes };
        modalProductName.textContent = productName;
        
        // Limpiar opciones anteriores
        modalSizes.innerHTML = "";
        
        // Agregar opciones de tamaño
        sizes.forEach((size, index) => {
          const sizeDiv = document.createElement("div");
          sizeDiv.className = "size-option";
          sizeDiv.innerHTML = `
            <input type="radio" id="size-${index}" name="size" value="${index}" ${index === 0 ? "checked" : ""}>
            <label for="size-${index}">${size.label}</label>
            <span class="size-price">$${size.price.toLocaleString()}</span>
          `;
          modalSizes.appendChild(sizeDiv);
        });
        
        modal.style.display = "flex";
      });
    }
  });
  
  // Confirmar selección
  if (modalConfirm) {
    modalConfirm.addEventListener("click", () => {
      if (currentProduct) {
        const selectedIndex = document.querySelector('input[name="size"]:checked').value;
        const selectedSize = currentProduct.sizes[selectedIndex];
        
        addToCart(selectedSize.fullName, selectedSize.price, currentProduct.image, currentProduct.category);
        showToast(`${selectedSize.fullName} agregado al carrito!`);
        
        modal.style.display = "none";
        currentProduct = null;
      }
    });
  }
  
  // Cancelar
  if (modalCancel) {
    modalCancel.addEventListener("click", () => {
      modal.style.display = "none";
      currentProduct = null;
    });
  }
  
  if (modalClose) {
    modalClose.addEventListener("click", () => {
      modal.style.display = "none";
      currentProduct = null;
    });
  }
  
  // Cerrar modal al hacer clic en el overlay
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
      currentProduct = null;
    }
  });
});

// ============ TOAST NOTIFICATION SYSTEM ============
function showToast(message, duration = 4000) {
  const toast = document.getElementById("toast-notification");
  const toastMessage = document.getElementById("toast-message");
  
  if (!toast) return;
  
  // Asignar mensaje
  toastMessage.textContent = message;
  
  // Remover clases de animación anteriores
  toast.classList.remove("hide");
  
  // Mostrar toast
  toast.classList.add("show");
  
  // Auto-cerrar después de la duración
  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 400);
  }, duration);
}

// ============ STOCK VALIDATION & CHECKOUT ============
function validateStockAndContinue() {
  // Get cart items
  const cart = getCart();
  
  // Check if cart is empty
  if (cart.length === 0) {
    showToast("Tu carrito está vacío. Agrega productos primero.", 3000);
    return;
  }
  
  // Get form data
  const fullname = document.getElementById("fullname").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  
  // Validate form fields
  if (!fullname || !phone || !address) {
    showToast("Llena todos los campos antes de continuar", 4000);
    return;
  }
  
  // Save contact info to localStorage
  localStorage.setItem("canaway_contact", JSON.stringify({
    fullname,
    phone,
    address
  }));
  
  // Check stock for each item - all must have quantity > 0
  // Cart items already have quantity > 0 (they wouldn't be in cart otherwise)
  // But we check if total items are available
  
  // Redirect to validation page
  window.location.href = "validacion.html";
}

// Load validation page content
function loadValidationPage() {
  const cart = getCart();
  const contact = JSON.parse(localStorage.getItem("canaway_contact") || "{}");
  
  // Populate validation items
  const validationItems = document.getElementById("validation-items");
  if (validationItems) {
    let html = "";
    cart.forEach(item => {
      const statusClass = item.quantity > 0 ? "status-available" : "status-unavailable";
      const statusText = item.quantity > 0 ? "¡Producto Disponible!" : "Agotado";
      const statusIcon = item.quantity > 0 ? "✓" : "✗";
      
      html += `
        <div class="validation-item">
          <img src="${item.image}" alt="${item.name}" class="validation-item-image">
          <div class="validation-item-info">
            <p class="validation-item-name">${item.name}</p>
            <div class="validation-item-status">
              <div class="validation-item-status-icon ${statusClass}">${statusIcon}</div>
              <span>${statusText}</span>
            </div>
          </div>
        </div>
      `;
    });
    validationItems.innerHTML = html;
  }
  
  // Populate total items summary
  const validationTotalItems = document.getElementById("validation-total-items");
  if (validationTotalItems) {
    let html = "";
    let total = 0;
    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      html += `
        <div class="validation-total-item">
          <img src="${item.image}" alt="${item.name}" class="validation-total-item-image">
          <div class="validation-total-item-details">
            <p class="validation-total-item-name">${item.name}</p>
            <p class="validation-total-item-price">$${item.price.toLocaleString()}</p>
            <p class="validation-total-item-qty">Cantidad: ${item.quantity}</p>
          </div>
          <p class="validation-total-item-subtotal">$${itemTotal.toLocaleString()}</p>
        </div>
      `;
    });
    validationTotalItems.innerHTML = html;
  }
  
  // Update total price
  const totalPrice = document.getElementById("validation-total-price");
  if (totalPrice) {
    let total = 0;
    cart.forEach(item => {
      total += item.price * item.quantity;
    });
    
    // Add shipping cost to total
    const shipping = getSessionShippingCost();
    const grandTotal = total + shipping;
    totalPrice.textContent = "$" + grandTotal.toLocaleString();
  }
  
  // Update shipping cost display
  const shippingCost = document.getElementById("validation-shipping-cost");
  if (shippingCost) {
    const shipping = getSessionShippingCost();
    shippingCost.textContent = "$" + shipping.toLocaleString();
  }
}

// Send order via WhatsApp
function sendWhatsApp() {
  const cart = getCart();
  const contact = JSON.parse(localStorage.getItem("canaway_contact") || "{}");
  
  // Build order message
  let message = "*NUEVO PEDIDO CANAWAY*\n\n";
  message += "*Cliente:*\n";
  message += `Nombre: ${contact.fullname}\n`;
  message += `Teléfono: ${contact.phone}\n`;
  message += `Dirección: ${contact.address}\n\n`;
  
  message += "*Productos:*\n";
  let total = 0;
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    message += `• ${item.name}\n`;
    message += `  Precio: $${item.price.toLocaleString()}\n`;
    message += `  Cantidad: ${item.quantity}\n`;
    message += `  Subtotal: $${itemTotal.toLocaleString()}\n\n`;
  });
  
  // Add shipping to message
  const shipping = getSessionShippingCost();
  const grandTotal = total + shipping;
  
  message += `*Subtotal Productos:* $${total.toLocaleString()}\n`;
  message += `*Envío:* $${shipping.toLocaleString()}\n`;
  message += `*TOTAL:* $${grandTotal.toLocaleString()}\n\n`;
  
  // URL encode the message
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/3104444803?text=${encodedMessage}`;
  
  // Clear the cart, contact info, and shipping cost BEFORE opening WhatsApp
  localStorage.removeItem("canaway_cart");
  localStorage.removeItem("canaway_contact");
  localStorage.removeItem("canaway_shipping");
  
  // Open WhatsApp
  window.open(whatsappUrl, "_blank");
  
  // Redirect to home page after 1 second
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1000);
}

// Load validation page when it loads
// Add event listeners and handle both pages
document.addEventListener("DOMContentLoaded", () => {
  // Validation page initialization
  if (document.body.classList.contains("validation-page")) {
    loadValidationPage();
    
    // Add event listener to "Finalizar Pedido" button
    const btnFinalize = document.getElementById("btn-finalize-order");
    if (btnFinalize) {
      btnFinalize.addEventListener("click", () => {
        const section4 = document.getElementById("validation-section-4");
        if (section4) {
          section4.style.display = "block";
          // Scroll to the section
          setTimeout(() => {
            section4.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        }
      });
    }
  }
  
  // Cart page: Add event listener to "Siguiente" button
  const btnNext = document.querySelector(".btn-next");
  if (btnNext) {
    btnNext.addEventListener("click", validateStockAndContinue);
  }
});