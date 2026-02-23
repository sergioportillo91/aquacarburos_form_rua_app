import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormRuaService } from './services/form-rua.service';
import { FormField, FormRuaPayload } from './models/form-rua.model';
import { AuthService } from '../auth/services/auth.service';
import { UserSession } from '../auth/models/auth.model';

@Component({
  selector: 'app-form-rua',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    ConfirmDialogModule,
    DropdownModule,
    FileUploadModule,
    PasswordModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './form-rua.component.html',
  styleUrl: './form-rua.component.scss'
})
export class FormRuaComponent {
  private readonly darkModeStorageKey = 'rua_dark_mode';
  private readonly maxBytes = 5 * 1024 * 1024;
  private readonly acceptedMime = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  readonly acceptedFileTypes = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  readonly fileLabel = 'Solo se acepta PDF (máx. 5MB)';
  isDarkMode = false;

  readonly basicFields: FormField[] = [
    { name: 'nit', label: 'NIT (sin dígito de verificación y sin puntos ni comas)', placeholder: 'NIT', type: 'text', required: true, disabled: true },
    { name: 'nombreEmpresa', label: 'Nombre de la empresa', placeholder: 'Nombre de la empresa', type: 'text', required: true, disabled: true },
    { name: 'direccion', label: 'Dirección', placeholder: 'Dirección', type: 'text', required: true },
    { name: 'telefono', label: 'Teléfono', placeholder: 'Teléfono', type: 'text', required: true },
    { name: 'correo', label: 'Correo', placeholder: 'ejemplo@dominio.com', type: 'email', required: true, pattern: String.raw`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`, patternMessage: 'Ingresa un correo válido (ej: usuario@dominio.com)' },
    { name: 'fechaInicioActividades', label: 'Fecha inicio actividades', type: 'date', required: true },
    { name: 'usuarioActivosRua', label: 'Usuario activo RUA', placeholder: 'Usuario activo RUA', type: 'text', required: true },
    { name: 'contrasenaActivosRua', label: 'Contraseña activa RUA', placeholder: 'Contraseña activa RUA', type: 'password', required: true },
    { name: 'areaTotalMetrosCuadrados', label: 'Área total m²', placeholder: 'Área total m²', type: 'number', step: '0.01', required: true },
    { name: 'numeroEmpleados', label: 'Número de empleados', placeholder: 'Número de empleados', type: 'number', required: true },
    { name: 'contingenciasAnoReporte', label: 'Contingencias año reporte', placeholder: 'Contingencias año reporte', type: 'text', required: true },
    { name: 'promedioHorasDiaFuncionamiento', label: 'Promedio horas/día', placeholder: 'Promedio horas/día', type: 'number', step: '0.01', required: true }
  ];

  readonly generalFields: FormField[] = [
    { name: 'numeroSemanasFuncionamientoPeriodoBalance', label: 'N° semanas funcionamiento', placeholder: 'N° semanas funcionamiento', type: 'text', required: true },
    { name: 'promedioNumeroDiasSemanaFuncionamiento', label: 'Promedio horas/semana', placeholder: 'Promedio días/semana', type: 'text', required: true },
    { name: 'promedioNumeroTurnosDia', label: 'Promedio turnos/día (información sgsst)', placeholder: 'Promedio turnos/día (información sgsst)', type: 'text', required: true },
    {
      name: 'tipoTramite',
      label: 'Tipo de trámite',
      type: 'select',
      required: true,
      options: [
        { label: 'Seleccione tipo de trámite', value: '' },
        { label: 'Concesión de aguas subterráneas', value: 'Concesión de aguas subterráneas' },
        { label: 'Concesión de aguas superficiales', value: 'Concesión de aguas superficiales' },
        { label: 'Licencia Ambiental', value: 'Licencia Ambiental' },
        { label: 'Licencia ambiental de importación de Sustancias Controladas por el Protocolo de Montreal (SCPM)', value: 'Licencia ambiental de importación de Sustancias Controladas por el Protocolo de Montreal (SCPM)' },
        { label: 'Permiso de emisiones atmosféricas de fuentes fijas', value: 'Permiso de emisiones atmosféricas de fuentes fijas' },
        { label: 'Permiso de ocupación de playas, cauces y lechos', value: 'Permiso de ocupación de playas, cauces y lechos' },
        { label: 'Permiso de vertimiento de aguas residuales', value: 'Permiso de vertimiento de aguas residuales' },
        { label: 'Permiso o autorización de aprovechamiento forestal de árboles aislados, y de tipo persistente o único de bosques naturales', value: 'Permiso o autorización de aprovechamiento forestal de árboles aislados, y de tipo persistente o único de bosques naturales' },
        { label: 'Permiso para la recolección de especímenes de especies silvestres de la diversidad biológica con fines de investigación científica no comercial', value: 'Permiso para la recolección de especímenes de especies silvestres de la diversidad biológica con fines de investigación científica no comercial' },
        { label: 'Plan de manejo ambiental (primera vez, renovación, modificación, prorroga)', value: 'Plan de manejo ambiental (primera vez, renovación, modificación, prorroga)' }
      ]
    },
    {
      name: 'tramiteTitularidadTercero',
      label: 'Trámite titularidad tercero',
      type: 'select',
      required: true,
      options: [
        { label: 'Seleccione una opción', value: '' },
        { label: 'Sí', value: 'SI' },
        { label: 'No', value: 'NO' }
      ]
    },
    { name: 'ventasCombustibleGalonesAnoMiles', label: 'Ventas combustible (galones)', placeholder: 'Ventas combustible (galones)', type: 'text', required: true },
    { name: 'comprasCombustibleGalonesAnoMiles', label: 'Compras combustible (galones)', placeholder: 'Compras combustible (galones)', type: 'text', required: true },
    { name: 'existenciasCombustible31Diciembre', label: 'Existencias al 31 dic', placeholder: 'Existencias al 31 dic', type: 'text', required: true },
    { name: 'otrasMateriasPrimasAceitesConsumiblesUreaComprasVentas', label: 'Otras materias primas y sus cantidades', placeholder: 'Otras materias primas', type: 'text', required: true },
    { name: 'consumoAnualEnergiaElectricaKwh', label: 'Consumo anual energía', placeholder: 'Consumo anual energía', type: 'text', required: true },
    { name: 'equiposCombustionDescripcion', label: 'Equipos combustión', placeholder: 'Equipos combustión', type: 'text', required: true },
    { name: 'nombreEquipo', label: 'Nombre equipo', placeholder: 'Nombre equipo', type: 'text', required: true },
    { name: 'descripcionEquipo', label: 'Descripción equipo', placeholder: 'Descripción equipo', type: 'text', required: true },
    { name: 'capacidadNominal', label: 'Capacidad nominal', placeholder: 'Capacidad nominal', type: 'text', required: true },
    { name: 'unidadMedida', label: 'Unidad medida', placeholder: 'Unidad medida', type: 'text', required: true },
    { name: 'tiempoOperacionHorasAno', label: 'Tiempo operación h/año', placeholder: 'Tiempo operación h/año', type: 'text', required: true },
    { name: 'marcaEquipo', label: 'Marca', placeholder: 'Marca', type: 'text', required: true },
    { name: 'modeloFabricacion', label: 'Modelo fabricación', placeholder: 'Modelo fabricación', type: 'text', required: true },
    { name: 'anoFabricacion', label: 'Año fabricación', placeholder: 'Año fabricación', type: 'text', required: true },
    { name: 'fuenteCaptacionAgua', label: 'Fuente captación agua', placeholder: 'Fuente captación agua', type: 'text', required: true },
    { name: 'consumoAnualAguaM3', label: 'Consumo anual agua m3', placeholder: 'Consumo anual agua m3', type: 'text', required: true },
    { name: 'nombreEmpresaAcueducto', label: 'Empresa de acueducto', placeholder: 'Empresa de acueducto', type: 'text', required: true },
    { name: 'salidasAgua', label: 'Salidas de agua', placeholder: 'Salidas de agua', type: 'text', required: true },
    {
      name: 'tramiteAmbientalReportado',
      label: 'Trámite ambiental reportado',
      type: 'select',
      required: true,
      options: [
        { label: 'Seleccione trámite ambiental reportado', value: '' },
        { label: 'Licencia ambiental', value: 'Licencia ambiental' },
        { label: 'Plan de manejo ambiental', value: 'Plan de manejo ambiental' },
        { label: 'Permiso de vertimiento de aguas residuales', value: 'Permiso de vertimiento de aguas residuales' }
      ]
    },
    { name: 'nombreReceptorDescargaAgua', label: 'Receptor descarga', placeholder: 'Receptor descarga', type: 'text', required: true },
    { name: 'nombreEmpresaTerceroKg', label: 'Nombre empresa tercero', placeholder: 'Nombre empresa tercero', type: 'text', required: true },
    { name: 'areaTratamientoSuelo', label: 'Área tratamiento suelo', placeholder: 'Área tratamiento suelo', type: 'text', required: true },
    { name: 'descripcionPuntoDescarga', label: 'Descripción punto descarga', placeholder: 'Descripción punto descarga', type: 'text', required: true },
    { name: 'coordenadasPuntoDescarga', label: 'Coordenadas punto descarga', placeholder: 'Coordenadas punto descarga', type: 'text', required: true },
    { name: 'tipoSalida', label: 'Tipo salida', placeholder: 'Tipo salida', type: 'text', required: true },
    { name: 'procedenciaVertimientoDescarga', label: 'Procedencia vertimiento', placeholder: 'Procedencia vertimiento', type: 'text', required: true },
    { name: 'claseVertimientoDescarga', label: 'Clase vertimiento', placeholder: 'Clase vertimiento', type: 'text', required: true },
    { name: 'periodoDescargaDiasAno', label: 'Periodo descarga (días/año)', placeholder: 'Periodo descarga (días/año)', type: 'text', required: true },
    { name: 'horasVertimientoPeriodoBalance', label: 'Horas vertimiento', placeholder: 'Horas vertimiento', type: 'text', required: true },
    { name: 'volumenMensualVertidoM3', label: 'Volumen mensual vertido (m3 )', placeholder: 'Volumen mensual vertido (m3 )', type: 'text', required: true },
    { name: 'metodoDeterminacionVolumenVertido', label: 'Método determinación volumen', placeholder: 'Método determinación volumen', type: 'text', required: true },
    {
      name: 'tieneSistemaTratamiento',
      label: '¿Tiene sistema de tratamiento?',
      type: 'select',
      required: true,
      options: [
        { label: 'Seleccione una opción', value: '' },
        { label: 'Sí', value: 'true' },
        { label: 'No', value: 'false' }
      ]
    },
    { name: 'volumenTotalTratadoAnualM3', label: 'Volumen total tratado anual (m3)', placeholder: 'Volumen total tratado anual (m3)', type: 'text', required: true },
    { name: 'sistemaTratamiento', label: 'Sistema tratamiento', placeholder: 'Sistema tratamiento', type: 'text', required: true },
    { name: 'informeCaracterizacion', label: 'Informe caracterización', placeholder: 'Informe caracterización', type: 'text', required: true },
    { name: 'sistemaTratamientoAguasResiduales', label: 'Sistema tratamiento aguas', placeholder: 'Sistema tratamiento aguas', type: 'text', required: true },
    { name: 'trampaGrasasCaudal', label: 'Trampa grasas caudal (l/s)', placeholder: 'Trampa grasas caudal (l/s)', type: 'text', required: true },
    { name: 'caudalEntradaLs', label: 'Caudal entrada', placeholder: 'Caudal entrada', type: 'text', required: true },
    { name: 'caudalSalidaLs', label: 'Caudal salida', placeholder: 'Caudal salida', type: 'text', required: true },
    { name: 'pozoSepticoEntradaSalidaAgua', label: 'Pozo séptico entrada/salida', placeholder: 'Pozo séptico entrada/salida', type: 'text', required: true },
    { name: 'reporteFiltrosContaminados', label: 'Reporte filtros', placeholder: 'Reporte filtros', type: 'text', required: true },
    { name: 'reporteTraposAbsorbentesContaminados', label: 'Reporte trapos/absorbentes', placeholder: 'Reporte trapos/absorbentes', type: 'text', required: true },
    { name: 'medioTransporteResiduos', label: 'Medio transporte residuos', placeholder: 'Medio transporte residuos', type: 'text', required: true },
    {
      name: 'realizaEmisionesAire',
      label: '¿Emisiones al aire?',
      type: 'select',
      required: true,
      options: [
        { label: 'Seleccione una opción', value: '' },
        { label: 'Sí', value: 'true' },
        { label: 'No', value: 'false' }
      ]
    },
    
      { name: 'aprovechamientoForestal',
        label: '¿Aprovechamiento forestal?',
        type: 'select',
        required: true,
        options: [
          { label: 'Seleccione una opción', value: '' },
          { label: 'Sí', value: 'true' },
          { label: 'No', value: 'false' }
        ]
      },
      // Nuevos campos solicitados
      { name: 'usoSuelo', label: 'Uso del suelo', placeholder: 'Describe el uso del suelo', type: 'text', required: true },
      { name: 'diagramaActividadPdf', label: '¿Diagrama de actividad?', type: 'select', required: true, options: [ { label: 'Seleccione una opción', value: '' }, { label: 'Sí', value: 'SI' }, { label: 'No', value: 'NO' } ] },
      { name: 'certificadoGeneradorRespel2025', label: '¿Certificado de generador de RESPEL año 2025?', type: 'select', required: true, options: [ { label: 'Seleccione una opción', value: '' }, { label: 'Sí', value: 'SI' }, { label: 'No', value: 'NO' } ] },
      { name: 'planGestionIntegralResiduosPeligrosos', label: '¿Cómo se gestiona la recolección de residuos peligrosos?', placeholder: 'Describa la gestión de residuos peligrosos', type: 'text', required: true }
    ];

  formData: Record<string, unknown> = {};
  statusMessage = '';
  statusType: '' | 'ok' | 'error' = '';
  submitting = false;

  currentUser: UserSession | null = null;
  isAdmin = false;

  constructor(
    private readonly formRuaService: FormRuaService,
    private readonly messageService: MessageService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly confirmationService: ConfirmationService
  ) {
    this.currentUser = this.authService.getCurrentUser();
    [...this.basicFields, ...this.generalFields].forEach((field) => {
      if (field.name === 'nit' && this.currentUser?.nit) {
        this.formData[field.name] = this.currentUser.nit;
      } else if (field.name === 'nombreEmpresa' && this.currentUser?.nombreEmpresa) {
        this.formData[field.name] = this.currentUser.nombreEmpresa;
      } else {
        this.formData[field.name] = null;
      }
    });

    this.isAdmin = this.currentUser?.rol === 'ROL_ADMIN';
  }

  logout(): void {
    this.confirmationService.confirm({
      message: '¿Estás seguro que deseas cerrar sesión?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-success p-button-rounded',
      rejectButtonStyleClass: 'p-button-secondary p-button-rounded',
      accept: () => {
        this.authService.logout();
      }
    });
  }

  goToEmpresas(): void {
    this.router.navigate(['/empresas']);
  }


  onNitInput(): void {
    const nitValue = typeof this.formData['nit'] === 'string' ? this.formData['nit'] : '';
    this.formData['nit'] = nitValue.replaceAll(/\D/g, '');
  }

  async onSubmit(form: NgForm): Promise<void> {
    this.setStatus('', '');

    if (form.invalid) {
      form.control.markAllAsTouched();
      this.setStatus('Completa todos los campos obligatorios.', 'error');
      return;
    }

    // Validar formato de correo
    const correo = this.formData['correo'];
    if (typeof correo === 'string' && correo && !this.isValidEmail(correo)) {
      this.setStatus('El formato del correo electrónico no es válido.', 'error');
      return;
    }

    const hasMissingRequiredField = [...this.basicFields, ...this.generalFields]
      .filter((field) => field.required)
      .some((field) => {
        const value = this.formData[field.name];
        return value === null || value === undefined || value === '';
      });

    if (hasMissingRequiredField) {
      this.setStatus('Todos los campos del formulario son obligatorios.', 'error');
      return;
    }

    const payload: Record<string, unknown> = {};
    [...this.basicFields, ...this.generalFields].forEach((field) => {
      payload[field.name] = this.parseValue(field.name, this.formData[field.name] ?? '');
    });

    this.submitting = true;

    try {
      await firstValueFrom(this.formRuaService.submit(payload as FormRuaPayload));
      this.resetForm(form);
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Formulario guardado correctamente.',
        life: 5000
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar el formulario.';
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 8000
      });
    } finally {
      this.submitting = false;
    }
  }

  private resetForm(form: NgForm): void {
    // Guardar los valores antes de resetear el formulario
    const nit = this.formData['nit'];
    const nombreEmpresa = this.formData['nombreEmpresa'];
    form.resetForm();
    [...this.basicFields, ...this.generalFields].forEach((field) => {
      if (field.name !== 'nit' && field.name !== 'nombreEmpresa') {
        this.formData[field.name] = null;
      }
    });
    this.formData['nit'] = nit;
    this.formData['nombreEmpresa'] = nombreEmpresa;
    // Reasignar los valores a los controles del formulario para inputs deshabilitados
    if (form.controls['nit']) {
      form.controls['nit'].setValue(nit);
    }
    if (form.controls['nombreEmpresa']) {
      form.controls['nombreEmpresa'].setValue(nombreEmpresa);
    }
    this.setStatus('', '');
  }

  private parseValue(name: string, value: unknown): string | number | boolean | null {
    if (value === '' || value === null || value === undefined) {
      return null;
    }
    if (value instanceof Date) {
      const year = value.getFullYear();
      const month = `${value.getMonth() + 1}`.padStart(2, '0');
      const day = `${value.getDate()}`.padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    if (name === 'nit') {
      return typeof value === 'string' ? value.replaceAll(/\D/g, '') : '';
    }
    if (['areaTotalMetrosCuadrados', 'promedioHorasDiaFuncionamiento', 'numeroEmpleados'].includes(name)) {
      return Number(value);
    }
    if (['tieneSistemaTratamiento', 'realizaEmisionesAire', 'aprovechamientoForestal'].includes(name)) {
      return value === 'true';
    }
    return typeof value === 'string' ? value : '';
  }

  private toDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
      reader.readAsDataURL(file);
    });
  }

  private isValidEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  private setStatus(message: string, type: '' | 'ok' | 'error'): void {
    this.statusMessage = message;
    this.statusType = type;
  }

  // Métodos requeridos por el template
  isMissingRequired(field: FormField): boolean {
    if (!field.required) {
      return false;
    }
    const value = this.formData[field.name];
    if (typeof value === 'string') {
      return value.trim() === '';
    }
    return value === null || value === undefined || value === '';
  }

  onTextValueChange(field: FormField, value: unknown): void {
    this.formData[field.name] = value;
  }

  onFieldKeyDown(field: FormField, event: KeyboardEvent): void {
    // Puedes agregar lógica de validación aquí si lo necesitas
  }

  onFieldPaste(field: FormField, event: ClipboardEvent): void {
    // Puedes agregar lógica de validación aquí si lo necesitas
  }

  isFormReady(form: NgForm): boolean {
    return !!form.valid;
  }
}
