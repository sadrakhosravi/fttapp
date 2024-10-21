import { observable } from '@legendapp/state';
import { Navigate, Outlet } from 'react-router-dom';

// Store
import { store$ } from '@/modules/store/store';
import { AppRoutes } from './routes';

export const PrivateRoutes = observable(() => {
  return store$.auth.token.get() ? <Outlet /> : <Navigate to={AppRoutes.AUTH.LOGIN} />;
});
