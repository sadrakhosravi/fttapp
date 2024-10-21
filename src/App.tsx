import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { QueryClientProvider } from 'react-query';
import { PrivateRoutes } from './router/ProtectedRoute';

// Store and Globals
import { queryClient } from './modules/store/store';
import { AppRoutes } from './router/routes';

// Modules
import AuthenticationPage from './modules/auth/components/view';
import { SignInForm } from './modules/auth/components/signin-form';
import { SignUpForm } from './modules/auth/components/signup-form';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen w-screen p-2">
        <Router>
          <Routes>
            {/* @ts-ignore */}
            <Route element={<PrivateRoutes />}>
              <Route path={AppRoutes.HOME} element={<></>} />
              <Route path={AppRoutes.NOT_FOUND} element={<Navigate to="/" />} />
            </Route>
            <Route path={AppRoutes.AUTH.BASE} element={<AuthenticationPage />}>
              <Route path={AppRoutes.AUTH.LOGIN} element={<SignInForm />} />
              <Route path={AppRoutes.AUTH.REGISTER} element={<SignUpForm />} />
            </Route>
          </Routes>
        </Router>
      </div>
    </QueryClientProvider>
  );
}

export default App;
