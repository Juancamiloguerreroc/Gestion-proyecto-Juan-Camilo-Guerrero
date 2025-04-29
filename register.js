// Definir una base de datos simple usando localStorage
const db = {
  users: [],
  
  init: function() {
    // Cargar usuarios existentes
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      this.users = JSON.parse(storedUsers);
    }
    return true;
  },
  
  saveUsers: function() {
    localStorage.setItem('users', JSON.stringify(this.users));
  },
  
  createUser: function(userData) {
    // Verificar si el email ya existe
    const existingUser = this.users.find(user => user.email === userData.email);
    if (existingUser) {
      throw new Error('El correo ya está registrado');
    }
    
    // Crear nuevo usuario con ID
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    
    // Guardar usuario
    this.users.push(newUser);
    this.saveUsers();
    
    return newUser;
  },
  
  checkEmailExists: function(email) {
    return this.users.some(user => user.email === email);
  }
};

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

// Función para verificar si un email ya existe
function checkEmailExists(email) {
  const database = new Database();
  return database.checkEmailExists(email);
}

// Función para registrar usuario (versión final)
async function registerUser(userData) {
  try {
    // Crear instancia de la base de datos
    const database = new Database();
    
    // Verificar si el email ya existe
    const emailExists = database.checkEmailExists(userData.email);
    if (emailExists) {
      throw new Error('El correo ya está registrado');
    }
    
    // Luego intentar crear el usuario
    const user = database.createUser(userData);
    return user;
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    throw error;
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('registerForm');
  if (!form) return;
  
  // Inicializar la base de datos
  const database = new Database();
  await database.initDatabase();
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Obtener valores del formulario
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = document.getElementById('role').value;
    
    // Limpiar errores previos
    const emailError = document.getElementById('emailError');
    if (emailError) emailError.textContent = '';
    
    // Validaciones básicas
    if (!name || !email || !password || !confirmPassword || !role) {
      showNotification('Todos los campos son obligatorios', 'error');
      return;
    }
    
    if (password !== confirmPassword) {
      showNotification('Las contraseñas no coinciden', 'error');
      return;
    }
    
    try {
      // Verificar si el email ya existe
      const emailExists = await database.checkEmailExists(email);
      if (emailExists) {
        showNotification('El correo ya está registrado', 'error');
        return;
      }
      
      // Crear usuario
      const userData = {
        name,
        email,
        password,
        role,
        createdAt: new Date().toISOString(),
        stats: {
          totalRequests: 0,
          pendingRequests: 0,
          completedRequests: 0
        }
      };
      
      await database.addUser(userData);
      
      // Mostrar mensaje de éxito
      showNotification('¡Registro exitoso!', 'success');
      
      // Redirigir al login después de un tiempo
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
      
    } catch (error) {
      showNotification(`Error: ${error.message}`, 'error');
    }
  });
  
  // Toggle menú móvil
  document.querySelector('.menu-toggle').addEventListener('click', () => {
    document.querySelector('#main-nav').classList.toggle('active');
  });
});

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
  const messageContainer = document.createElement('div');
  messageContainer.className = `message ${type}`;
  messageContainer.textContent = message;
  
  document.body.appendChild(messageContainer);
  
  // Mostrar mensaje
  setTimeout(() => {
    messageContainer.classList.add('show');
  }, 10);
  
  // Ocultar después de 3 segundos
  setTimeout(() => {
    messageContainer.classList.remove('show');
    setTimeout(() => {
      messageContainer.remove();
    }, 300);
  }, 3000);
}