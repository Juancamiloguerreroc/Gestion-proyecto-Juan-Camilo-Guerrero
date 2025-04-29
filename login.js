// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
  const messageContainer = document.getElementById('messageContainer');
  if (!messageContainer) return;
  
  messageContainer.textContent = message;
  messageContainer.className = `message ${type}`;
  messageContainer.classList.remove('hidden');
  
  // Ocultar después de 3 segundos
  setTimeout(() => {
    messageContainer.classList.add('hidden');
  }, 3000);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Obtener valores del formulario
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Validaciones básicas
    if (!email || !password) {
      showNotification('Todos los campos son obligatorios', 'error');
      return;
    }
    
    // Obtener usuarios del localStorage
    const storedUsers = localStorage.getItem('users');
    if (!storedUsers) {
      showNotification('No hay usuarios registrados', 'error');
      return;
    }
    
    const users = JSON.parse(storedUsers);
    
    // Buscar usuario por email y contraseña
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      showNotification('Credenciales incorrectas', 'error');
      return;
    }
    
    // Guardar información de sesión
    localStorage.setItem('currentUser', JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }));
    
    // Mostrar mensaje de éxito
    showNotification('¡Inicio de sesión exitoso!', 'success');
    
    // Redirigir según el rol
    setTimeout(() => {
      if (user.role === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'viewer.html';
      }
    }, 1000);
  });
});