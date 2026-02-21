import { Routes } from '@angular/router';
import { FormRuaComponent } from './form-rua/form-rua.component';
import { LoginComponent } from './auth/login/login.component';
import { EmpresaListComponent } from './empresas/empresa-list/empresa-list.component';
import { authGuard, loginGuard, adminGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
	{ path: 'login', component: LoginComponent, canActivate: [loginGuard] },
	{ path: 'formulario', component: FormRuaComponent, canActivate: [authGuard] },
	{ path: 'empresas', component: EmpresaListComponent, canActivate: [adminGuard] },
	{ path: '', redirectTo: '/login', pathMatch: 'full' },
	{ path: '**', redirectTo: '/login' }
];
