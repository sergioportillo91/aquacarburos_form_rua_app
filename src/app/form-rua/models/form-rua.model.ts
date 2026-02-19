export interface FormRuaPayload {
  // Datos básicos
  nit: string;
  nombreEmpresa: string;
  direccion: string;
  telefono: string;
  correo: string;
  fechaInicioActividades: string;
  usuarioActivosRua: string;
  contrasenaActivosRua: string;
  areaTotalMetrosCuadrados: number;
  numeroEmpleados: number;
  contingenciasAnoReporte: string;
  promedioHorasDiaFuncionamiento: number;

  // Campos generales
  numeroSemanasFuncionamientoPeriodoBalance: string;
  promedioNumeroDiasSemanaFuncionamiento: string;
  promedioNumeroTurnosDia: string;
  tipoTramite: string;
  tramiteTitularidadTercero: string;
  ventasCombustibleGalonesAnoMiles: string;
  comprasCombustibleGalonesAnoMiles: string;
  existenciasCombustible31Diciembre: string;
  otrasMateriasPrimasAceitesConsumiblesUreaComprasVentas: string;
  consumoAnualEnergiaElectricaKwh: string;
  equiposCombustionDescripcion: string;
  nombreEquipo: string;
  descripcionEquipo: string;
  capacidadNominal: string;
  unidadMedida: string;
  tiempoOperacionHorasAno: string;
  marcaEquipo: string;
  modeloFabricacion: string;
  anoFabricacion: string;
  fuenteCaptacionAgua: string;
  consumoAnualAguaM3: string;
  nombreEmpresaAcueducto: string;
  salidasAgua: string;
  tramiteAmbientalReportado: string;
  nombreReceptorDescargaAgua: string;
  nombreEmpresaTerceroKg: string;
  areaTratamientoSuelo: string;
  descripcionPuntoDescarga: string;
  coordenadasPuntoDescarga: string;
  tipoSalida: string;
  procedenciaVertimientoDescarga: string;
  claseVertimientoDescarga: string;
  periodoDescargaDiasAno: string;
  horasVertimientoPeriodoBalance: string;
  volumenMensualVertidoM3: string;
  metodoDeterminacionVolumenVertido: string;
  tieneSistemaTratamiento: string;
  volumenTotalTratadoAnualM3: string;
  sistemaTratamiento: string;
  informeCaracterizacion: string;
  sistemaTratamientoAguasResiduales: string;
  trampaGrasasCaudal: string;
  caudalEntradaSalidaLs: string;
  pozoSepticoEntradaSalidaAgua: string;
  reporteFiltrosContaminados: string;
  reporteTraposAbsorbentesContaminados: string;
  medioTransporteResiduos: string;
  realizaEmisionesAire: string;
  aprovechamientoForestal: string;

  // Documentos (Base64)
  usoSuelo: string | null;
  diagramaActividadPdf: string | null;
  certificadoGeneradorRespel2025: string | null;
  contratoGestorResiduosPeligrosos: string | null;
  documentoSoportePdf: string | null;
  tipoVertimientoDocumento: string | null;
  permisoVertimientosDocumento: string | null;
  radicadoTramiteVertimientosDocumento: string | null;
  caracterizacionVertimientosDocumento: string | null;
  planGestionIntegralResiduosPeligrosos: string | null;
  medioAlmacenamientoResiduosPeligrosos: string | null;
  areaDisposicionFinal: string | null;
  longitudRejillasPerimetrales: string | null;
  areaCanopy: string | null;
  areaTanques: string | null;

  [key: string]: unknown;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface FormField {
  name: string;
  label: string;
  placeholder?: string;
  type: 'text' | 'email' | 'date' | 'number' | 'select' | 'password';
  required: boolean;
  step?: string;
  options?: SelectOption[];
  pattern?: string;
  patternMessage?: string;
}

export interface DocumentField {
  key: string;
  label: string;
}

export interface FormRuaResponse {
  success: boolean;
  message?: string;
  details?: Record<string, string>;
}
