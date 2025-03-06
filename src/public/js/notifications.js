const notifications = {

  init: () => {
    window.toastr.options = {
      "closeButton": true,
      "debug": false,
      "newestOnTop": false,
      "progressBar": true,
      "positionClass": "toast-bottom-right", 
      "preventDuplicates": false,
      "onclick": null,
      "showDuration": "300",
      "hideDuration": "1000",
      "timeOut": "5000",
      "extendedTimeOut": "1000",
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut"
    };
  },

  success: (message) => {
    notifications.init();
    window.toastr.success(message);
  },
  
  error: (message) => {
    notifications.init();
    window.toastr.error(message);
  },
  
  warning: (message, title) => {
    notifications.init();
    window.toastr.warning(message, title);
  },

  showLoginAlert: async () => {
    const result = await window.Swal.fire({
      title: 'Debes iniciar sesión',
      text: 'Para acceder al carrito necesitas estar logueado',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Iniciar sesión',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      return notifications.showLoginForm();
    }

    return result;
  },

  showLogoutConfirm: async () => {
    try {
      
      const response = await fetch('/api/sessions/current', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      const user = await response.json();
      const userName = user.first_name || 'Usuario';

      return window.Swal.fire({
        title: userName,
        html: '<h2 style="font-size: 1.5em; margin-top: 0;">¿Seguro que quieres desloguearte?</h2>',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, desloguearme',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
      });
    } catch (error) {
      console.error('Error getting user:', error);
      return window.Swal.fire({
        title: 'Usuario',
        html: '<h2 style="font-size: 1.5em; margin-top: 0;">¿Seguro que quieres desloguearte?</h2>',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, desloguearme',
        cancelButtonText: 'Cancelar'
      });
    }
  },

  showAlert: (options) => {
    return window.Swal.fire(options);
  },

  showLoginForm: () => {
    return window.Swal.fire({
      title: 'Iniciar sesión',
      html: `
      <p>Para acceder al carrito necesitas estar logueado</p>
              <input type="email" id="email" class="swal2-input" placeholder="Email">
        <input type="password" id="password" class="swal2-input" placeholder="Password">
      <div style="margin-top: 15px; text-align: left; padding-left: 20px;">
        <p style="font-weight: bold;">USUARIO ADMIN</p>
        <p style="font-weight: bold;">user: admin</p>
        <p style="font-weight: bold;">pass: admin</p>
      </div>

      `,
      showCancelButton: true,
      confirmButtonText: 'Iniciar sesión',
      cancelButtonText: 'Registrar',
      preConfirm: () => {
        const email = window.Swal.getPopup().querySelector('#email').value;
        const password = window.Swal.getPopup().querySelector('#password').value;
        if (!email || !password) {
          window.Swal.showValidationMessage('Por favor ingrese email y contraseña');
        }
        return { email, password };
      }
    });
  }
};

// Inicializar configuración
notifications.init();

window.notifications = notifications;
export default notifications;