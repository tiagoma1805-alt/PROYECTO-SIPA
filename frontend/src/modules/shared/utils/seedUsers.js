// src/utils/seedUsers.js
export const seedUsers = () => {
  const users = [
    {
      id: 1,
      email: 'coordinador@sena.edu.co',
      nombre: 'Lia Vasquez',
      role: 'coordinador',
      documento: '123456789',
      telefono: '3001234567',
      password: 'coordinador123'
    },
    {
      id: 2,
      email: 'administrador@sena.edu.co',
      nombre: 'Carlos Perez',
      role: 'administrador',
      documento: '987654321',
      telefono: '3007654321',
      password: 'admin123'
    },
    {
      id: 3,
      email: 'instructor@sena.edu.co',
      nombre: 'Maria Rodriguez',
      role: 'instructor',
      documento: '456789123',
      telefono: '3004567891',
      password: 'instructor123'
    },
    {
      id: 4,
      email: 'aprendiz@sena.edu.co',
      nombre: 'Juan Martinez',
      role: 'aprendiz',
      documento: '789123456',
      telefono: '3007891234',
      password: 'aprendiz123'
    }
  ];

  localStorage.setItem('users', JSON.stringify(users));
  console.log('Usuarios de prueba creados:', users);
};

export const initializeUsers = () => {
  const existingUsers = localStorage.getItem('users');
  if (!existingUsers) {
    seedUsers();
  }
};