import { Routes } from '@angular/router';
import { FormRuaComponent } from './form-rua/form-rua.component';

export const routes: Routes = [
	{ path: '', component: FormRuaComponent },
	{ path: '**', redirectTo: '' }
];
