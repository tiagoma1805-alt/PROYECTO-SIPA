// src/routes/roleRoutes.jsx
import LayoutInstructor from '@/modules/shared/layouts/LayoutInstructor';
import LayoutCoordinador from '@/modules/shared/layouts/LayoutCoordinador';
import LayoutAprendiz from '@/modules/shared/layouts/LayoutAprendiz';
import LayoutAdmin from '@/modules/shared/layouts/LayoutAdmin';
import LayoutApoyo from '@/modules/shared/layouts/LayoutApoyo';

export const roleRoutes = [
  {
    path: '/admin/*',
    roles: [1],
    element: <LayoutAdmin />
  },
  {
    path: '/coordinador/*',
    roles: [2],
    element: <LayoutCoordinador />
  },
  {
    path: '/instructor/*',
    roles: [3],
    element: <LayoutInstructor />
  },
  {
    path: '/aprendiz/*',
    roles: [4],
    element: <LayoutAprendiz />
  },
  {
    path: '/apoyo/*',
    roles: [5],
    element: <LayoutApoyo />
  }
];

export const getRouteByRole = (rolId) => {
  const routeMap = {
    1: '/admin',
    2: '/coordinador',
    3: '/instructor',
    4: '/aprendiz',
    5: '/apoyo',
  };
  return routeMap[rolId] || '/login';
};