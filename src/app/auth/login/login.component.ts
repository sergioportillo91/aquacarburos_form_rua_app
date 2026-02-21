import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';

import { AuthService } from '../services/auth.service';
import { LoginRequest } from '../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    ToastModule,
    CardModule
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  credentials: LoginRequest = {
    usuario: '',
    clave: ''
  };
  
  isLoading = false;
  isDarkMode = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly messageService: MessageService
  ) {
    this.initDarkMode();
  }

  private initDarkMode(): void {
    const savedMode = localStorage.getItem('darkMode');
    this.isDarkMode = savedMode === 'true';
    this.applyDarkMode();
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', String(this.isDarkMode));
    this.applyDarkMode();
  }

  private applyDarkMode(): void {
    const htmlElement = document.documentElement;
    if (this.isDarkMode) {
      htmlElement.classList.add('app-dark');
    } else {
      htmlElement.classList.remove('app-dark');
    }
  }

  onSubmit(): void {
    if (!this.credentials.usuario || !this.credentials.clave) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos requeridos',
        detail: 'Por favor ingresa usuario y contraseña.'
      });
      return;
    }

    this.isLoading = true;

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Bienvenido',
          detail: `Hola, ${response.nombreEmpresa}`
        });
      
        this.credentials = { usuario: '', clave: '' };
        setTimeout(() => {
          this.router.navigate(['/formulario']);
        }, 500);
      },
      error: (error: Error) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error de autenticación',
          detail: error.message
        });
      }
    });
  }
}
