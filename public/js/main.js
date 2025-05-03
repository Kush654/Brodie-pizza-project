/**
 * Main JavaScript file for the Pizza Restaurant website
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function(tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  
  // Flash messages auto-dismissal
  const flashMessages = document.querySelectorAll('.alert-dismissible');
  flashMessages.forEach(function(alert) {
    setTimeout(function() {
      const closeButton = alert.querySelector('.btn-close');
      if (closeButton) {
        closeButton.click();
      }
    }, 5000); // Dismiss after 5 seconds
  });
  
  // Add to cart button functionality
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
  addToCartButtons.forEach(function(button) {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      const menuItemId = this.getAttribute('data-item-id');
      const quantityInput = document.querySelector(`#quantity-${menuItemId}`);
      const notesInput = document.querySelector(`#notes-${menuItemId}`);
      
      const quantity = quantityInput ? quantityInput.value : 1;
      const notes = notesInput ? notesInput.value : '';
      
      addToCart(menuItemId, quantity, notes);
    });
  });
  
  // Function to add items to cart
  function addToCart(menuItemId, quantity, notes) {
    fetch('/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        menuItemId,
        quantity,
        notes
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        showToast('Success', 'Item added to cart', 'success');
        updateCartCount(data.cartCount);
      } else {
        showToast('Error', data.message || 'Failed to add item to cart', 'danger');
      }
    })
    .catch(error => {
      console.error('Error adding to cart:', error);
      showToast('Error', 'An error occurred while adding to cart', 'danger');
    });
  }
  
  // Update quantity in cart
  const cartItemQuantities = document.querySelectorAll('.cart-item-quantity');
  cartItemQuantities.forEach(function(input) {
    input.addEventListener('change', function() {
      const itemId = this.getAttribute('data-item-id');
      const quantity = parseInt(this.value);
      
      if (quantity < 1) {
        this.value = 1;
        return;
      }
      
      updateCartItem(itemId, quantity);
    });
  });
  
  // Function to update cart item
  function updateCartItem(itemId, quantity) {
    fetch(`/cart/api/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        quantity
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Refresh the page to show updated cart
        window.location.reload();
      } else {
        showToast('Error', data.error, 'danger');
      }
    })
    .catch(error => {
      console.error('Error updating cart:', error);
      showToast('Error', 'An error occurred while updating cart', 'danger');
    });
  }
  
  // Remove item from cart
  const removeFromCartButtons = document.querySelectorAll('.remove-from-cart-btn');
  removeFromCartButtons.forEach(function(button) {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      const itemId = this.getAttribute('data-item-id');
      removeFromCart(itemId);
    });
  });
  
  // Function to remove from cart
  function removeFromCart(itemId) {
    fetch(`/cart/api/items/${itemId}`, {
      method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Refresh the page to show updated cart
        window.location.reload();
      } else {
        showToast('Error', data.error, 'danger');
      }
    })
    .catch(error => {
      console.error('Error removing from cart:', error);
      showToast('Error', 'An error occurred while removing from cart', 'danger');
    });
  }
  
  // Function to update cart count in the navbar
  function updateCartCount(cartCount) {
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
      cartCountElement.textContent = cartCount;
      cartCountElement.style.display = cartCount > 0 ? 'inline-block' : 'none';
    }
  }
  
  // Function to show toast notifications
  function showToast(title, message, type) {
    // Check if a toast container exists, if not, create one
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastElement = document.createElement('div');
    toastElement.className = `toast align-items-center text-white bg-${type} border-0`;
    toastElement.setAttribute('role', 'alert');
    toastElement.setAttribute('aria-live', 'assertive');
    toastElement.setAttribute('aria-atomic', 'true');
    
    // Create toast content
    toastElement.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          <strong>${title}</strong>: ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;
    
    // Append toast to container
    toastContainer.appendChild(toastElement);
    
    // Initialize and show toast
    const toast = new bootstrap.Toast(toastElement, { autohide: true, delay: 5000 });
    toast.show();
  }
  
  // Order status update handler (for employee order management)
  const orderStatusForm = document.getElementById('orderStatusForm');
  if (orderStatusForm) {
    orderStatusForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const orderId = this.getAttribute('data-order-id');
      const statusSelect = document.getElementById('orderStatus');
      const status = statusSelect.value;
      
      // Submit form
      this.submit();
    });
  }
  
  // Category filter for menu page
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', function() {
      const category = this.value;
      
      if (category === 'all') {
        window.location.href = '/menu';
      } else {
        window.location.href = `/menu?category=${category}`;
      }
    });
  }
  
  // Menu item availability toggle (for employee menu management)
  const availabilityToggles = document.querySelectorAll('.availability-toggle');
  availabilityToggles.forEach(function(button) {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      const form = this.closest('form');
      if (form) {
        form.submit();
      }
    });
  });
}); 