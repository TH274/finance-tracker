import { lazy } from 'react';

const Dashboard = lazy(() => import('./dashboard/Dashboard'));
const Budget = lazy(() => import('./budget/Budget'));
const Settings = lazy(() => import('./settings/Settings'));
const Login = lazy(() => import('./login/Login'));
const Register = lazy(() => import('./register/Register'));
const NotFound = lazy(() => import('./not-found/NotFound'));
const Transactions = lazy(() => import('./transactions/Transactions'));

export { Dashboard, Budget, Settings, Login, Register, NotFound, Transactions };
