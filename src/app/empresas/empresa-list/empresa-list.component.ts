import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';

import { EmpresaService } from '../services/empresa.service';
import { Empresa } from '../models/empresa.model';
import { debounceTime, Subject } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { UserSession } from '../../auth/models/auth.model';

@Component({
  selector: 'app-empresa-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    DropdownModule,
    InputSwitchModule,
    PasswordModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    TagModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './empresa-list.component.html',
  styleUrl: './empresa-list.component.scss'
})
export class EmpresaListComponent implements OnInit {
  empresas: Empresa[] = [];
  allEmpresas: Empresa[] = [];
  loading = false;
  totalRecords = 0;

  // Filtros
  filterNit = '';
  private filterNitChanged$ = new Subject<string>();

  // Modal
  displayModal = false;
  isEditing = false;
  empresaForm: Empresa = this.getEmptyEmpresa();
  saving = false;

  // Opciones de rol
  roles = [
    { label: 'Administrador', value: 'ROL_ADMIN' },
    { label: 'Cliente', value: 'ROL_CLIENTE' }
  ];

  // Paginación
  rows = 10;
  first = 0;

  // Tema
  isDarkMode = false;
  currentUser: UserSession | null = null;

  constructor(
    private readonly empresaService: EmpresaService,
    private readonly authService: AuthService,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly router: Router
  ) {
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    this.applyDarkMode();
    this.currentUser = this.authService.getCurrentUser();
  }

  goToEmpresas(): void {
    this.router.navigate(['/empresas']);
  }

  ngOnInit(): void {
    this.loadEmpresas();
    this.filterNitChanged$.pipe(debounceTime(200)).subscribe((nit) => {
      this.applyNitFilter(nit);
    });
  }

  private applyDarkMode(): void {
    const htmlElement = document.documentElement;
    if (this.isDarkMode) {
      htmlElement.classList.add('app-dark');
    } else {
      htmlElement.classList.remove('app-dark');
    }
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', String(this.isDarkMode));
    this.applyDarkMode();
  }

  loadEmpresas(): void {
    this.loading = true;
    // Trae todas las empresas (sin filtro de nit)
    this.empresaService.getEmpresas({ page: 0, size: 1000 }).subscribe({
      next: (response) => {
        this.allEmpresas = response.content;
        this.applyNitFilter(this.filterNit);
        this.loading = false;
      },
      error: (error: Error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message
        });
      }
    });
  }

  applyNitFilter(nit: string): void {
    if (!nit) {
      this.empresas = [...this.allEmpresas];
    } else {
      const nitLower = nit.toLowerCase();
      this.empresas = this.allEmpresas.filter(e => (e.nit || '').toLowerCase().includes(nitLower));
    }
    this.totalRecords = this.empresas.length;
    // Si la página actual queda vacía, volver a la primera página
    if (this.first >= this.totalRecords) {
      this.first = 0;
    }
  }

  onNitInput(): void {
    // Aceptar solo dígitos en el campo de búsqueda NIT
    if (this.filterNit) {
      this.filterNit = this.filterNit.replace(/\D/g, '');
    }
    this.filterNitChanged$.next(this.filterNit);
  }

  onNitKeyDown(event: KeyboardEvent): void {
    const allowedControlKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (allowedControlKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return;
    }

    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  onNitPaste(event: ClipboardEvent): void {
    const pastedText = event.clipboardData?.getData('text') ?? '';
    if (!/^\d+$/.test(pastedText)) {
      event.preventDefault();
    }
  }

  clearFilters(): void {
    this.filterNit = '';
    this.applyNitFilter('');
  }

  onPageChange(event: { first: number; rows: number }): void {
    this.first = event.first;
    this.rows = event.rows;
    // Si la página actual queda vacía, volver a la primera página
    if (this.first >= this.totalRecords) {
      this.first = 0;
    }
  }

  // Getter pagedEmpresas eliminado. PrimeNG manejará la paginación internamente.
  openNew(): void {
    this.empresaForm = this.getEmptyEmpresa();
    this.isEditing = false;
    this.displayModal = true;
  }

  editEmpresa(empresa: Empresa): void {
    this.empresaForm = { ...empresa, clave: '' };
    this.isEditing = true;
    this.displayModal = true;
  }

  closeModal(): void {
    this.displayModal = false;
    this.empresaForm = this.getEmptyEmpresa();
  }

  saveEmpresa(): void {
    if (!this.validateForm()) {
      return;
    }

    this.saving = true;

    const empresaToSave = { ...this.empresaForm };
    
    // Si está editando y no puso nueva contraseña, no enviarla
    if (this.isEditing && !empresaToSave.clave) {
      delete (empresaToSave as any).clave;
    }

    // No codificamos la clave en el frontend; el backend debe manejar el hash/cifrado apropiado.
    // Además, no permitimos cambiar el rol desde este modal: si estamos editando, no enviar el campo `rol`.
  

    const operation = this.isEditing
      ? this.empresaService.updateEmpresa(this.empresaForm.id!, empresaToSave)
      : this.empresaService.createEmpresa(empresaToSave);

    operation.subscribe({
      next: () => {
        this.saving = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.isEditing ? 'Empresa actualizada correctamente' : 'Empresa creada correctamente'
        });
        this.closeModal();
        this.loadEmpresas();
      },
      error: (error: Error) => {
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message
        });
      }
    });
  }

  // Used for template to enable/disable save button without showing validation messages
  isFormValid(): boolean {
    if (!this.empresaForm) return false;
    if (!this.empresaForm.nit || !this.empresaForm.nombre || !this.empresaForm.usuario || !this.empresaForm.rol) {
      return false;
    }
    if (!this.isEditing && !this.empresaForm.clave) {
      return false;
    }
    return true;
  }

  // Sanitize NIT input in modal: keep only digits
  sanitizeNitInput(): void {
    if (this.empresaForm && this.empresaForm.nit) {
      this.empresaForm.nit = this.empresaForm.nit.replace(/\D/g, '');
    }
  }

  // Funcionalidad de eliminar empresa eliminada

  private validateForm(): boolean {
    if (!this.empresaForm.nit || !this.empresaForm.nombre || !this.empresaForm.usuario || !this.empresaForm.rol) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos requeridos',
        detail: 'Por favor complete todos los campos obligatorios'
      });
      return false;
    }
    // Validar longitud del NIT
    const nit = this.empresaForm.nit || '';
    if (nit.length < 5 || nit.length > 20) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Longitud de NIT',
        detail: 'El NIT debe tener entre 5 y 20 caracteres.'
      });
      return false;
    }

    // Validar clave en creación y edición
    const clave = this.empresaForm.clave || '';
    if ((!this.isEditing && !clave) || (this.isEditing && clave)) {
      if (clave.length < 6) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Longitud de clave',
          detail: 'La clave debe tener mínimo 6 caracteres.'
        });
        return false;
      }
    }

    if (!this.isEditing && !clave) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'La contraseña es obligatoria para nuevas empresas'
      });
      return false;
    }

    return true;
  }

  private getEmptyEmpresa(): Empresa {
    return {
      nit: '',
      nombre: '',
      usuario: '',
      clave: '',
      rol: 'ROL_CLIENTE',
      pago: false
    };
  }

  

  goToFormulario(): void {
    this.router.navigate(['/formulario']);
  }

  logout(): void {
    this.confirmationService.confirm({
      message: '¿Estás seguro que deseas cerrar sesión?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Si',
      rejectLabel: 'No',
      accept: () => {
        this.authService.logout();
      }
    });
  }

  getRolLabel(rol: string): string {
    return rol === 'ROL_ADMIN' ? 'Admin' : 'Cliente';
  }

  getRolSeverity(rol: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    return rol === 'ROL_ADMIN' ? 'danger' : 'info';
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
