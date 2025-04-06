import notifications from './notifications.js';

// Asegurarse de que las notificaciones estén disponibles globalmente
window.notifications = notifications;

document.addEventListener("DOMContentLoaded", async () => {

  const cartId = localStorage.getItem('cartId');
  const cartLink = document.getElementById('cart-link');
  const cartCount = document.getElementById('cart-count');
  const userIcon = document.querySelector('.user-icon');
  const categoryDropdown = document.getElementById('category-dropdown');
  const changeUserButton = document.getElementById('change-user');

  const updateCartCount = () => {
    fetch(`/api/carts/${cartId}`)
      .then(response => response.json())
      .then(data => {
        const count = data.products.reduce((total, product) => total + product.quantity, 0);
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? 'block' : 'none';
      })
      .catch(error => console.error('Error al obtener el carrito:', error));
  };

  const loadCategories = () => {
    fetch('/api/products/categories')
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success' && Array.isArray(data.payload)) {
          categoryDropdown.innerHTML = '';
          data.payload.forEach(category => {
            const categoryLink = document.createElement('a');
            categoryLink.href = `/realtimeproducts?category=${category}`;
            categoryLink.textContent = category;
            categoryDropdown.appendChild(categoryLink);
          });
        }
      })
      .catch(error => console.error('Error al cargar categorías:', error));
  };

  const showRegisterForm = () => {
    Swal.fire({
      title: 'Registrar',
      html: `
        <input type="text" id="first_name" class="swal2-input" placeholder="First Name">
        <input type="text" id="last_name" class="swal2-input" placeholder="Last Name">
        <input type="email" id="email" class="swal2-input" placeholder="Email">
        <input type="number" id="age" class="swal2-input" placeholder="Age">
        <input type="password" id="password" class="swal2-input" placeholder="Password">
      `,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      preConfirm: () => {
        const first_name = Swal.getPopup().querySelector('#first_name').value;
        const last_name = Swal.getPopup().querySelector('#last_name').value;
        const email = Swal.getPopup().querySelector('#email').value;
        const age = Swal.getPopup().querySelector('#age').value;
        const password = Swal.getPopup().querySelector('#password').value;
        
        if (!first_name || !last_name || !email || !age || !password) {
          Swal.showValidationMessage('Por favor complete todos los campos');
        }
        return { first_name, last_name, email, age, password };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const userData = result.value;
        fetch('/api/sessions/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        })
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            notifications.error(data.error);
          } else {
            notifications.success('Registro exitoso. Por favor inicie sesión.');
            setTimeout(() => showLoginAlert(), 1500);
          }
        })
        .catch(error => notifications.error('Error al registrar'));
      }
    });
  };

  const logoutUser = async () => {
    const result = await notifications.showLogoutConfirm();
    if (result.isConfirmed) {
      try {
        const response = await fetch('/api/sessions/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          localStorage.removeItem('userRole');
          location.reload();
        } else {
          notifications.error('Error al cerrar sesión');
        }
      } catch (error) {
        notifications.error('Error al cerrar sesión');
      }
    }
  };

  // Inicialización
  const userRole = localStorage.getItem('userRole');
  if (userRole === 'admin') {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
    userIcon.classList.add('admin');
  } else if (userRole) {
    userIcon.classList.add('user');
  } else {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    userIcon.classList.remove('admin', 'user');
  }

  // Event Listeners
  changeUserButton.addEventListener('click', async (event) => {
    event.preventDefault();
    if (userRole) {
      await logoutUser();
    } else {
      const result = await notifications.showLoginForm();
      if (result.isConfirmed) {
        const { email, password } = result.value;
        try {
          const response = await fetch('/api/sessions/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          
          const data = await response.json();
          if (data.error) {
            notifications.error(data.error);
          } else {
            localStorage.setItem('userRole', data.user.role);
            location.reload();
          }
        } catch (error) {
          notifications.error('Error al iniciar sesión');
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        showRegisterForm();
      }
    }
  });

  cartLink.addEventListener('click', async (event) => {
    event.preventDefault();
    
    const user = await getCurrentUser();
    if (!user || !user.cart) {
      await notifications.showLoginAlert();
      return;
    }
    
    window.location.href = `/carts/${user.cart}`;
  });

  document.addEventListener('productAddedToCart', updateCartCount);
  
  // Cargar datos iniciales
  loadCategories();

  // Verificar si debe mostrar la alerta de login
  if (document.body.dataset.showLoginAlert === 'true') {
    showLoginAlert();
  }
});

const showLoginAlert = async () => {
  try {
    const result = await notifications.showLoginAlert();
    
    if (result.isConfirmed) {
      try {
        const loginResult = await notifications.showLoginForm();
        if (loginResult.isConfirmed) {
          const { email, password } = loginResult.value;
          const response = await fetch('/api/sessions/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
          });
          
          const data = await response.json();
          if (data.error) {
            notifications.error(data.error);
          } else {
            localStorage.setItem('userRole', data.user.role);
            notifications.success('Inicio de sesión exitoso');
            setTimeout(() => location.reload(), 1500);
          }
        } else if (loginResult.dismiss === Swal.DismissReason.cancel) {
          showRegisterForm();
        }
      } catch (error) {
        console.error('Error in login process:', error);
        notifications.error('Error al iniciar sesión');
      }
    }
  } catch (error) {
    console.error('Error showing alerts:', error);
    notifications.error('Error al mostrar formulario de login');
  }
};

const getCurrentUser = async () => {
  try {
    const response = await fetch('/api/sessions/current', {
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.status === 401) {
      return null;
    }

    if (response.ok) {
      return await response.json();
    }

    throw new Error('Error getting current user');
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    return null;
  }
};

export { showLoginAlert, getCurrentUser };