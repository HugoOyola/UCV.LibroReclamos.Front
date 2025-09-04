import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PopoverModule } from 'primeng/popover';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Popover } from 'primeng/popover';

import { DetalleComponent } from './modales/detalle/detalle.component';
import { EstadoComponent } from './modales/estado/estado.component';
import { ResponsableComponent } from './modales/responsable/responsable.component';
import { ReporteComponent } from './modales/reporte/reporte.component';

// ============= INTERFACES =============
interface ReclamacionStats {
  total: number;
  pendientes: number;
  enProceso: number;
  resueltas: number;
  conformes: number;
  noConformes: number;
  vencidas: number;
  invalidas: number;
  atendidas: number;
}

interface ReclamacionCompleta {
  codigo: string;
  usuario: string;
  nivel: string;
  dni: string;
  correo: string;
  tipo: string;
  estado: string;
  prioridad: string;
  campus: string;
  fechaRegistro: string;
  responsable?: string;
  descripcion?: string;
  categoria?: string;
  subcategoria?: string;
}

interface EstadoOption {
  valor: string;
  label: string;
  descripcion: string;
}

interface ResponsableOption {
  id: string;
  nombre: string;
  cargo: string;
  departamento: string;
  casosActivos?: number;
}

interface TipoReporte {
  valor: string;
  label: string;
  descripcion: string;
  icono: string;
}

@Component({
  selector: 'app-monitoreo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SelectModule,
    ButtonModule,
    CheckboxModule,
    RadioButtonModule,
    InputTextModule,
    DatePickerModule,
    TableModule,
    ToastModule,
    ConfirmDialogModule,
    DetalleComponent,
    EstadoComponent,
    ResponsableComponent,
    ReporteComponent,
    PopoverModule
  ],
  templateUrl: './monitoreo.component.html',
  styleUrl: './monitoreo.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class MonitoreoComponent implements OnInit {

  // ============= VIEWCHILD =============
  @ViewChild('op') op!: Popover;

  // ============= PROPIEDADES DE FORMULARIOS Y ESTADO =============
  activeTab: 'advanced' | 'quick' = 'advanced';
  searchForm: FormGroup;
  quickSearchForm: FormGroup;
  showResults = false;
  searchPerformed = false;

  // ============= DATOS Y FILTROS =============
  reclamaciones: ReclamacionCompleta[] = [];
  searchTerm = '';
  selectedEstado: string = 'todos';
  selectedPrioridad: string = 'todos';
  selectedCampus: string = 'todos';

  // ============= MODALES =============
  mostrarModalDetalles = false;
  mostrarModalEstado = false;
  mostrarModalResponsable = false;
  mostrarModalReporte = false;
  reclamacionSeleccionada: ReclamacionCompleta | null = null;

  // ============= POPOVER =============
  selectedReclamo: any | null = null;
  tempEstatus: 'Conforme' | 'Inválido' | 'No-Conforme' | null = null;

  // ============= DATOS MOCK =============
  private reclamacionesCompletas: ReclamacionCompleta[] = [
    {
      codigo: '22189',
      usuario: 'NUNEZ GUIZADO VIANCA MAHILI',
      nivel: 'Alumno',
      dni: '73075171',
      correo: 'vnunezgu@ucvvirtual.edu.pe',
      tipo: 'RECLAMO',
      estado: 'pendiente',
      prioridad: 'Media',
      campus: 'lima_norte',
      fechaRegistro: '04/09/2025 08:30:15',
      descripcion: 'Problema con la plataforma virtual, no puede acceder al aula virtual para entregar trabajos.'
    },
    {
      codigo: '22188',
      usuario: 'VALDIVIA SALVADOR VALERIA NICOLE',
      nivel: 'Apoderado',
      dni: '73138113',
      correo: 'vvaldiviasa@ucvvirtual.edu.pe',
      tipo: 'QUEJA',
      estado: 'en-proceso',
      prioridad: 'Media',
      campus: 'lima_norte',
      fechaRegistro: '02/09/2025 14:20:45',
      descripcion: 'Solicita revisión de calificación en el curso de matemática básica.'
    },
    {
      codigo: '22187',
      usuario: 'CASTILLO ACUNA ETHEL SOLANGE',
      nivel: 'Alumno',
      dni: '72965669',
      correo: 'ethel.castillo01@gmail.com',
      tipo: 'RECLAMO',
      estado: 'atendido',
      prioridad: 'Alta',
      campus: 'tarapoto',
      fechaRegistro: '31/08/2025 10:15:30',
      descripcion: 'Reclamo sobre horarios de clase que se superponen entre cursos.'
    },
    {
      codigo: '22186',
      usuario: 'CASTRO GUTIERREZ EVELINY ELIDA',
      nivel: 'Alumno',
      dni: '04078882',
      correo: 'evelinyelida_85@hotmail.com',
      tipo: 'RECLAMO',
      estado: 'pendiente',
      prioridad: 'Baja',
      campus: 'lima_este',
      fechaRegistro: '29/08/2025 16:45:22',
      descripcion: 'Queja sobre la atención en ventanilla de pagos, demora excesiva.'
    },
    {
      codigo: '22185',
      usuario: 'SOLIS CARDENAS KATHERIN YANINA',
      nivel: 'Externo',
      dni: '45476405',
      correo: 'soliskaty29@gmail.com',
      tipo: 'QUEJA',
      estado: 'en-proceso',
      prioridad: 'Media',
      campus: 'lima_norte',
      fechaRegistro: '25/08/2025 09:30:18',
      descripcion: 'Problema con el sistema de matrícula online, no permite seleccionar cursos.'
    },
    {
      codigo: '22184',
      usuario: 'RIVAS GAMBINI JOSE ALBERTO',
      nivel: 'Egresado',
      dni: '74816768',
      correo: 'joserivasgambini23@gmail.com',
      tipo: 'RECLAMO',
      estado: 'conforme',
      prioridad: 'Alta',
      campus: 'trujillo',
      fechaRegistro: '21/08/2025 13:20:10',
      descripcion: 'Solicitud de duplicado de diploma, proceso completado satisfactoriamente.'
    },
    {
      codigo: '22183',
      usuario: 'DAMIAN HUAMAN MARICARMEN',
      nivel: 'Alumno',
      dni: '76801592',
      correo: 'ddamianhu28@ucvvirtual.edu.pe',
      tipo: 'RECLAMO',
      estado: 'pendiente',
      prioridad: 'Media',
      campus: 'lima_norte',
      fechaRegistro: '17/08/2025 11:45:30',
      descripcion: 'Queja sobre las condiciones de la biblioteca, falta de espacios para estudio.'
    },
    {
      codigo: '22182',
      usuario: 'TORRES MENDEZ CARLOS ALBERTO',
      nivel: 'Alumno',
      dni: '45789123',
      correo: 'ctorresme@ucvvirtual.edu.pe',
      tipo: 'QUEJA',
      estado: 'vencido',
      prioridad: 'Baja',
      campus: 'chiclayo',
      fechaRegistro: '10/08/2025 15:30:45',
      descripcion: 'Problema con la inscripción de materias electivas sin resolver.'
    },
    {
      codigo: '22181',
      usuario: 'MENDOZA RIOS PATRICIA ELENA',
      nivel: 'Egresado',
      dni: '68712345',
      correo: 'pmendozari@ucvvirtual.edu.pe',
      tipo: 'RECLAMO',
      estado: 'atendido',
      prioridad: 'Alta',
      campus: 'piura',
      fechaRegistro: '15/08/2025 08:15:20',
      descripcion: 'Problema con certificado de estudios resuelto tardíamente.'
    },
    {
      codigo: '22180',
      usuario: 'GARCIA LOPEZ MIGUEL ANGEL',
      nivel: 'Alumno',
      dni: '72845123',
      correo: 'mgarcialo@ucvvirtual.edu.pe',
      tipo: 'RECLAMO',
      estado: 'conforme',
      prioridad: 'Media',
      campus: 'chepen',
      fechaRegistro: '05/08/2025 12:45:15',
      descripcion: 'Reclamo sobre proceso de titulación resuelto satisfactoriamente.'
    },
    {
      codigo: '22179',
      usuario: 'FERNANDEZ SILVA ANA LUCIA',
      nivel: 'Apoderado',
      dni: '41523678',
      correo: 'afernandezsi@gmail.com',
      tipo: 'QUEJA',
      estado: 'no-conforme',
      prioridad: 'Alta',
      campus: 'moyobamba',
      fechaRegistro: '13/08/2025 16:20:30',
      descripcion: 'Queja sobre servicios administrativos, cliente no conforme con la solución.'
    },
    {
      codigo: '22178',
      usuario: 'RODRIGUEZ PEREZ JUAN CARLOS',
      nivel: 'Externo',
      dni: '35678912',
      correo: 'jrodriguezpe@hotmail.com',
      tipo: 'RECLAMO',
      estado: 'invalido',
      prioridad: 'Baja',
      campus: 'lima_este',
      fechaRegistro: '28/08/2025 09:15:45',
      descripcion: 'Reclamo considerado inválido por falta de documentación sustentaria.'
    },
    {
      codigo: '22177',
      usuario: 'HERRERA VEGA SOFIA ISABEL',
      nivel: 'Alumno',
      dni: '76543210',
      correo: 'sherrerave@ucvvirtual.edu.pe',
      tipo: 'CONSULTA',
      estado: 'en-proceso',
      prioridad: 'Baja',
      campus: 'tarapoto',
      fechaRegistro: '01/09/2025 14:30:25',
      descripcion: 'Consulta sobre procedimientos de convalidación de cursos.'
    },
    {
      codigo: '22176',
      usuario: 'MORALES CRUZ DIEGO FERNANDO',
      nivel: 'Alumno',
      dni: '89012345',
      correo: 'dmoralescruz@ucvvirtual.edu.pe',
      tipo: 'RECLAMO',
      estado: 'en-proceso',
      prioridad: 'Media',
      campus: 'trujillo',
      fechaRegistro: '27/08/2025 11:20:10',
      descripcion: 'Reclamo sobre calificaciones inconsistentes en evaluaciones.'
    },
    {
      codigo: '22175',
      usuario: 'CAMPOS TORRES MARIA JOSE',
      nivel: 'Egresado',
      dni: '23456789',
      correo: 'mcampostorres@gmail.com',
      tipo: 'RECLAMO',
      estado: 'vencido',
      prioridad: 'Alta',
      campus: 'lima_norte',
      fechaRegistro: '31/07/2025 13:45:50',
      descripcion: 'Reclamo sobre demora en la entrega de diploma de bachiller.'
    }
  ];

  // ============= CATÁLOGOS Y CONFIGURACIONES =============
  estadosDisponibles: EstadoOption[] = [
    { valor: 'pendiente', label: 'Pendiente', descripcion: 'Reclamación pendiente de revisión' },
    { valor: 'en-proceso', label: 'En Proceso', descripcion: 'Se está trabajando en la solución' },
    { valor: 'atendido', label: 'Atendido', descripcion: 'Reclamación atendida' },
    { valor: 'conforme', label: 'Conforme', descripcion: 'Cliente conforme con la solución' },
    { valor: 'no-conforme', label: 'No Conforme', descripcion: 'Cliente no conforme' },
    { valor: 'vencido', label: 'Vencido', descripcion: 'Reclamación vencida' },
    { valor: 'invalido', label: 'Inválido', descripcion: 'Reclamación inválida' }
  ];

  responsablesDisponibles: ResponsableOption[] = [
    { id: '1', nombre: 'Ana García Martínez', cargo: 'Coordinadora', departamento: 'Servicios Estudiantiles', casosActivos: 12 },
    { id: '2', nombre: 'Carlos Rodriguez López', cargo: 'Especialista', departamento: 'Gestión Académica', casosActivos: 8 },
    { id: '3', nombre: 'María Elena Vásquez', cargo: 'Supervisora', departamento: 'Control de Calidad', casosActivos: 5 },
    { id: '4', nombre: 'Jorge Luis Mendoza', cargo: 'Analista Senior', departamento: 'Soporte Técnico', casosActivos: 15 }
  ];

  tiposReporte: TipoReporte[] = [
    { valor: 'completo', label: 'Reporte Completo', descripcion: 'Incluye todos los detalles y historial', icono: 'pi pi-file-o' },
    { valor: 'resumen', label: 'Resumen Ejecutivo', descripcion: 'Información resumida para revisión rápida', icono: 'pi pi-list' },
    { valor: 'seguimiento', label: 'Seguimiento', descripcion: 'Historial de acciones y cambios', icono: 'pi pi-clock' }
  ];

  // Opciones para filtros
  estadoOptions = [
    { label: 'Todos', value: 'todos' },
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'En Proceso', value: 'en-proceso' },
    { label: 'Atendido', value: 'atendido' },
    { label: 'Conforme', value: 'conforme' },
    { label: 'No Conforme', value: 'no-conforme' },
    { label: 'Vencido', value: 'vencido' },
    { label: 'Inválido', value: 'invalido' }
  ];

  prioridadOptions = [
    { label: 'Todas', value: 'todos' },
    { label: 'A Tiempo', value: 'a-tiempo' },
    { label: 'Por Vencer', value: 'por-vencer' },
    { label: 'Vencido', value: 'vencido' },
    { label: 'Tardío', value: 'atendido-fuera-fecha' }
  ];

  campusOptions = [
    { label: 'Todos los Campus', value: 'todos' },
    { label: 'UCV LIMA NORTE', value: 'lima_norte' },
    { label: 'UCV TRUJILLO', value: 'trujillo' },
    { label: 'UCV CHICLAYO', value: 'chiclayo' },
    { label: 'UCV PIURA', value: 'piura' },
    { label: 'UCV CHEPEN', value: 'chepen' },
    { label: 'UCV MOYOBAMBA', value: 'moyobamba' }
  ];

  campusOptionsTabla = this.campusOptions;

  // ============= CONSTRUCTOR E INICIALIZACIÓN =============
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.searchForm = this.fb.group({
      campus: ['todos'],
      fechaRango: [null],
      tipoTodos: [true],
      tipoReclamo: [false],
      tipoQueja: [false],
      tipoConsulta: [false],
      estadoTodos: [true],
      estadoPendiente: [false],
      estadoEnProceso: [false],
      estadoAtendido: [false],
      estadoConforme: [false],
      estadoNoConforme: [false],
      estadoVencido: [false],
      estadoInvalido: [false]
    });

    this.quickSearchForm = this.fb.group({
      searchType: ['dni'],
      searchValue: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.initializeForm();
    this.cargarDatos();
  }

  // ============= INICIALIZACIÓN PRIVADA =============
  private initializeForm(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    this.searchForm.patchValue({ fechaRango: [thirtyDaysAgo, today] });
  }

  private cargarDatos(): void {
    this.reclamaciones = [...this.reclamacionesCompletas];
  }

  // ============= NAVEGACIÓN Y GESTIÓN DE TABS =============
  setActiveTab(tab: 'advanced' | 'quick'): void {
    this.activeTab = tab;
    this.showResults = false;
    this.searchPerformed = false;
  }

  volverAlInicio(): void {
    this.router.navigate(['/dashboard'])
      .catch(error => console.error('Error al navegar:', error));
  }

  // ============= GESTIÓN DE FILTROS DE FORMULARIO =============
  onTipoReclamacionChange(tipo: string): void {
    if (tipo === 'todos') {
      this.searchForm.patchValue({
        tipoTodos: true, tipoReclamo: false, tipoQueja: false, tipoConsulta: false
      });
      return;
    }
    this.searchForm.patchValue({ tipoTodos: false });
    const seleccionados = [
      this.searchForm.get('tipoReclamo')?.value,
      this.searchForm.get('tipoQueja')?.value,
      this.searchForm.get('tipoConsulta')?.value
    ].filter(Boolean);
    if (seleccionados.length === 0) this.searchForm.patchValue({ tipoTodos: true });
  }

  onEstadoProcesoChange(estado: string): void {
    if (estado === 'todos') {
      this.searchForm.patchValue({
        estadoTodos: true,
        estadoPendiente: false,
        estadoEnProceso: false,
        estadoAtendido: false,
        estadoConforme: false,
        estadoNoConforme: false,
        estadoVencido: false,
        estadoInvalido: false
      });
      return;
    }
    this.searchForm.patchValue({ estadoTodos: false });
    const seleccionados = [
      this.searchForm.get('estadoPendiente')?.value,
      this.searchForm.get('estadoEnProceso')?.value,
      this.searchForm.get('estadoAtendido')?.value,
      this.searchForm.get('estadoConforme')?.value,
      this.searchForm.get('estadoNoConforme')?.value,
      this.searchForm.get('estadoVencido')?.value,
      this.searchForm.get('estadoInvalido')?.value
    ].filter(Boolean);
    if (seleccionados.length === 0) this.searchForm.patchValue({ estadoTodos: true });
  }

  // ============= OPERACIONES DE BÚSQUEDA =============
  buscarReclamaciones(): void {
    const formValues = this.searchForm.value;
    let resultados = [...this.reclamacionesCompletas];

    // Aplicar filtros
    if (formValues.campus && formValues.campus !== 'todos') {
      resultados = resultados.filter(rec =>
        rec.campus.toLowerCase() === formValues.campus.toLowerCase()
      );
    }

    if (formValues.fechaRango && formValues.fechaRango.length === 2) {
      const [fechaInicio, fechaFin] = formValues.fechaRango;
      resultados = resultados.filter(rec => {
        const fechaRec = this.parsearFecha(rec.fechaRegistro);
        return fechaRec >= fechaInicio && fechaRec <= fechaFin;
      });
    }

    if (!formValues.tipoTodos) {
      const tiposSeleccionados = this.obtenerTiposSeleccionados();
      if (tiposSeleccionados.length > 0) {
        resultados = resultados.filter(rec =>
          tiposSeleccionados.includes(rec.tipo.toUpperCase())
        );
      }
    }

    if (!formValues.estadoTodos) {
      const estadosSeleccionados = this.obtenerEstadosSeleccionados();
      if (estadosSeleccionados.length > 0) {
        resultados = resultados.filter(rec =>
          estadosSeleccionados.includes(rec.estado.toLowerCase())
        );
      }
    }

    this.procesarResultados(resultados);
  }

  buscarAhora(): void {
    if (!this.quickSearchForm.valid) return;

    const searchType = this.quickSearchForm.get('searchType')?.value;
    const searchValue = this.quickSearchForm.get('searchValue')?.value?.trim();

    if (!searchValue) {
      this.mostrarMensaje('warn', 'Campo Requerido', 'Por favor ingrese un valor para buscar');
      return;
    }

    let resultados = [...this.reclamacionesCompletas];

    switch (searchType) {
      case 'dni':
        resultados = resultados.filter(rec => rec.dni.includes(searchValue));
        break;
      case 'codigo':
        resultados = resultados.filter(rec =>
          rec.codigo.toLowerCase().includes(searchValue.toLowerCase())
        );
        break;
      case 'nombre':
        resultados = resultados.filter(rec =>
          rec.usuario.toLowerCase().includes(searchValue.toLowerCase())
        );
        break;
      default:
        resultados = [];
    }

    this.procesarResultados(resultados, searchValue);
  }

  // ============= MÉTODOS AUXILIARES DE BÚSQUEDA =============
  private procesarResultados(resultados: ReclamacionCompleta[], searchValue?: string): void {
    this.reclamaciones = resultados;
    this.searchPerformed = true;
    this.showResults = true;

    const mensaje = searchValue
      ? `Se encontraron ${resultados.length} reclamaciones para "${searchValue}"`
      : `Se encontraron ${resultados.length} reclamaciones que coinciden con los criterios`;

    const severity = resultados.length > 0 ? 'success' : 'info';
    const summary = resultados.length > 0 ? 'Búsqueda Exitosa' : 'Sin Resultados';

    this.mostrarMensaje(severity, summary, mensaje);
  }

  private obtenerTiposSeleccionados(): string[] {
    const formValues = this.searchForm.value;
    const tipos: string[] = [];
    if (formValues.tipoReclamo) tipos.push('RECLAMO');
    if (formValues.tipoQueja) tipos.push('QUEJA');
    if (formValues.tipoConsulta) tipos.push('CONSULTA');
    return tipos;
  }

  private obtenerEstadosSeleccionados(): string[] {
    const formValues = this.searchForm.value;
    const estados: string[] = [];
    if (formValues.estadoPendiente) estados.push('pendiente');
    if (formValues.estadoEnProceso) estados.push('en-proceso');
    if (formValues.estadoAtendido) estados.push('atendido');
    if (formValues.estadoConforme) estados.push('conforme');
    if (formValues.estadoNoConforme) estados.push('no-conforme');
    if (formValues.estadoVencido) estados.push('vencido');
    if (formValues.estadoInvalido) estados.push('invalido');
    return estados;
  }

  private mostrarMensaje(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }

  // ============= OPERACIONES DE LIMPIEZA =============
  nuevaBusqueda(): void {
    this.showResults = false;
    this.searchPerformed = false;
    this.reclamaciones = [];
    this.limpiarFiltros();
    this.mostrarMensaje('info', 'Nueva Búsqueda', 'Formularios de búsqueda reiniciados');
  }

  limpiar(): void {
    this.limpiarFiltros();
  }

  limpiarFiltros(): void {
    if (this.activeTab === 'advanced') {
      this.initializeForm();
      this.searchForm.reset({
        campus: 'todos',
        fechaRango: this.searchForm.get('fechaRango')?.value,
        tipoTodos: true,
        tipoReclamo: false,
        tipoQueja: false,
        tipoConsulta: false,
        estadoTodos: true,
        estadoPendiente: false,
        estadoEnProceso: false,
        estadoAtendido: false,
        estadoConforme: false,
        estadoNoConforme: false,
        estadoVencido: false,
        estadoInvalido: false
      });
    } else {
      this.quickSearchForm.reset({ searchType: 'dni', searchValue: '' });
    }

    this.searchTerm = '';
    this.selectedEstado = 'todos';
    this.selectedPrioridad = 'todos';
    this.selectedCampus = 'todos';
  }

  actualizarDatos(): void {
    this.cargarDatos();
    this.mostrarMensaje('success', 'Datos Actualizados', 'La información ha sido actualizada correctamente');
  }

  onSelectClear(filtro: 'estado' | 'prioridad' | 'campus'): void {
    switch (filtro) {
      case 'estado': this.selectedEstado = 'todos'; break;
      case 'prioridad': this.selectedPrioridad = 'todos'; break;
      case 'campus': this.selectedCampus = 'todos'; break;
    }
  }

  // ============= HELPERS PARA BÚSQUEDA RÁPIDA =============
  getPlaceholder(): string {
    const searchType = this.quickSearchForm.get('searchType')?.value;
    const placeholders = {
      'dni': 'Ej: 41630253',
      'codigo': 'Ej: REC-2025-001',
      'nombre': 'Ej: Juan Pérez'
    };
    return placeholders[searchType as keyof typeof placeholders] || '';
  }

  getSearchLabel(): string {
    const searchType = this.quickSearchForm.get('searchType')?.value;
    const labels = { 'dni': 'DNI', 'codigo': 'Código', 'nombre': 'Nombre' };
    return labels[searchType as keyof typeof labels] || '';
  }

  getSearchIcon(searchType: string): string {
    if (['dni', 'nombre'].includes(searchType)) return 'pi pi-user';
    if (searchType === 'codigo') return 'pi pi-tag';
    return 'pi pi-search';
  }

  // ============= GETTERS Y PROPIEDADES CALCULADAS =============
  get filteredReclamaciones(): ReclamacionCompleta[] {
    let data = [...this.reclamaciones];

    const term = this.searchTerm?.toLowerCase().trim();
    if (term) {
      data = data.filter(rec =>
        rec.codigo.toLowerCase().includes(term) ||
        rec.usuario.toLowerCase().includes(term) ||
        rec.dni.includes(term) ||
        rec.correo.toLowerCase().includes(term)
      );
    }

    if (this.selectedEstado !== 'todos') {
      data = data.filter(r => r.estado.toLowerCase() === this.selectedEstado.toLowerCase());
    }

    if (this.selectedPrioridad !== 'todos') {
      data = data.filter(r => {
        const prioridadCalculada = this.calcularPrioridadPorTiempo(r.fechaRegistro, r.estado);
        return prioridadCalculada === this.selectedPrioridad;
      });
    }

    if (this.selectedCampus !== 'todos') {
      data = data.filter(r => (r.campus || '').toLowerCase() === this.selectedCampus.toLowerCase());
    }

    return data;
  }

  // En tu componente, modifica el getter stats:
  get stats(): ReclamacionStats {
    const data = this.filteredReclamaciones;

    // Contadores por estado
    const pendientes = data.filter(r => r.estado.toLowerCase() === 'pendiente').length;
    const enProceso = data.filter(r => r.estado.toLowerCase() === 'en-proceso').length;
    const atendidas = data.filter(r => r.estado.toLowerCase() === 'atendido').length;
    const conformes = data.filter(r => r.estado.toLowerCase() === 'conforme').length;
    const noConformes = data.filter(r => r.estado.toLowerCase() === 'no-conforme').length;
    const vencidas = data.filter(r => r.estado.toLowerCase() === 'vencido').length;
    const invalidas = data.filter(r => r.estado.toLowerCase() === 'invalido').length;

    // Resueltas = Atendidas + Conformes
    const resueltas = atendidas + conformes;

    return {
      total: data.length,
      pendientes,
      enProceso,
      resueltas,
      conformes,
      noConformes,
      vencidas,
      invalidas,
      atendidas
    };
  }

  // ============= UTILIDADES DE FECHAS Y TIEMPO =============
  calcularPrioridadPorTiempo(fechaRegistro: string, estado: string): string {
    const fechaReg = this.parsearFecha(fechaRegistro);
    const fechaActual = new Date();
    const diferenciaTiempo = fechaActual.getTime() - fechaReg.getTime();
    const diasTranscurridos = Math.floor(diferenciaTiempo / (1000 * 3600 * 24));

    const estadosAtendidos = ['atendido', 'conforme', 'no-conforme'];
    const estaAtendido = estadosAtendidos.includes(estado.toLowerCase());

    if (estaAtendido && diasTranscurridos >= 15) {
      return 'atendido-fuera-fecha';
    } else if (!estaAtendido && diasTranscurridos >= 15) {
      return 'vencido';
    } else if (diasTranscurridos >= 5) {
      return 'por-vencer';
    } else {
      return 'a-tiempo';
    }
  }

  private parsearFecha(fechaTexto: string): Date {
    const [fecha, hora] = fechaTexto.split(' ');
    const [dia, mes, año] = fecha.split('/');
    const [horas, minutos, segundos] = hora.split(':');

    return new Date(
      parseInt(año),
      parseInt(mes) - 1,
      parseInt(dia),
      parseInt(horas),
      parseInt(minutos),
      parseInt(segundos)
    );
  }

  getInformacionTiempo(fechaRegistro: string): { dias: number; mensaje: string } {
    const fechaReg = this.parsearFecha(fechaRegistro);
    const fechaActual = new Date();
    const diferenciaTiempo = fechaActual.getTime() - fechaReg.getTime();
    const diasTranscurridos = Math.floor(diferenciaTiempo / (1000 * 3600 * 24));

    let mensaje = '';
    if (diasTranscurridos === 0) {
      mensaje = 'Registrado hoy';
    } else if (diasTranscurridos === 1) {
      mensaje = 'Hace 1 día';
    } else if (diasTranscurridos <= 4) {
      const diasRestantes = 15 - diasTranscurridos;
      mensaje = `Hace ${diasTranscurridos} días (${diasRestantes} días restantes)`;
    } else if (diasTranscurridos <= 14) {
      const diasRestantes = 15 - diasTranscurridos;
      mensaje = `Hace ${diasTranscurridos} días (${diasRestantes} días para vencer)`;
    } else {
      const diasVencidos = diasTranscurridos - 15;
      mensaje = `Hace ${diasTranscurridos} días (${diasVencidos} días vencido)`;
    }

    return { dias: diasTranscurridos, mensaje };
  }

  getDiasWidth(dias: number): number {
    return Math.min((dias / 15) * 100, 100);
  }

  // ============= FUNCIONES DE ESTILOS Y CLASES CSS =============
  getEstadoClass(estado: string): string {
    const estadoNormalizado = estado.toLowerCase();
    const clases = {
      'en-proceso': 'text-[#5B6AD6] bg-[#EEF0FF] ring-1 ring-[#5B6AD638]',
      'conforme': 'text-[#1AAE9F] bg-[#E8FBF8] ring-1 ring-[#1AAE9F38]',
      'no-conforme': 'text-[#C01C5A] bg-[#FDEAF1] ring-1 ring-[#C01C5A38]',
      'pendiente': 'text-[#A05A00] bg-[#FFF4E8] ring-1 ring-[#A05A0038]',
      'atendido': 'text-[#1C7ED6] bg-[#EAF4FF] ring-1 ring-[#1C7ED638]',
      'vencido': 'text-[#7A1F1F] bg-[#FBEAEA] ring-1 ring-[#7A1F1F38]',
      'invalido': 'text-[#5E5E6D] bg-[#F1F2F6] ring-1 ring-[#5E5E6D38]'
    };
    return clases[estadoNormalizado as keyof typeof clases] || 'text-[#5E5E6D] bg-[#F1F2F6] ring-1 ring-[#5E5E6D38]';
  }

  getEstadoDotClass(estado: string): string {
    const estadoNormalizado = estado.toLowerCase();
    const clases = {
      'pendiente': 'bg-[#F0AA65]',
      'en-proceso': 'bg-[#5B6AD6]',
      'atendido': 'bg-[#1C7ED6]',
      'conforme': 'bg-[#1AAE9F]',
      'no-conforme': 'bg-[#C01C5A]',
      'vencido': 'bg-[#7A1F1F]',
      'invalido': 'bg-[#9AA0B1]'
    };
    return clases[estadoNormalizado as keyof typeof clases] || 'bg-[#9AA0B1]';
  }

  getPrioridadPorTiempoClass(fechaRegistro: string, estado: string): string {
    const prioridad = this.calcularPrioridadPorTiempo(fechaRegistro, estado);
    const clases = {
      'a-tiempo': 'text-green-700 bg-green-100 border border-green-300',
      'por-vencer': 'text-yellow-700 bg-yellow-100 border border-yellow-300',
      'vencido': 'text-red-700 bg-red-100 border border-red-300',
      'atendido-fuera-fecha': 'text-purple-700 bg-purple-100 border border-purple-300'
    };
    return clases[prioridad as keyof typeof clases] || 'text-gray-700 bg-gray-100 border border-gray-300';
  }

  getPrioridadPorTiempoIcon(fechaRegistro: string, estado: string): string {
    const prioridad = this.calcularPrioridadPorTiempo(fechaRegistro, estado);
    const iconos = {
      'a-tiempo': 'pi pi-check-circle text-green-600',
      'por-vencer': 'pi pi-clock text-yellow-600',
      'vencido': 'pi pi-exclamation-triangle text-red-600',
      'atendido-fuera-fecha': 'pi pi-calendar-times text-purple-600'
    };
    return iconos[prioridad as keyof typeof iconos] || 'pi pi-info text-gray-600';
  }

  getPrioridadPorTiempoTexto(fechaRegistro: string, estado: string): string {
    const prioridad = this.calcularPrioridadPorTiempo(fechaRegistro, estado);
    const textos = {
      'a-tiempo': 'A Tiempo',
      'por-vencer': 'Por Vencer',
      'vencido': 'Vencido',
      'atendido-fuera-fecha': 'Tardío'
    };
    return textos[prioridad as keyof typeof textos] || 'Sin Clasificar';
  }

  // ============= FUNCIONES DE USUARIO Y AVATARES =============
  getUserIcon(nivel: string): string {
    const iconos = {
      'Alumno': 'pi pi-user',
      'Egresado': 'pi pi-graduation-cap',
      'Apoderado': 'pi pi-users',
      'Externo': 'pi pi-globe'
    };
    return iconos[nivel as keyof typeof iconos] || 'pi pi-user';
  }

  getUserAvatarClass(nivel: string): string {
    const clases = {
      'Alumno': 'bg-gradient-to-br from-blue-400 to-blue-600',
      'Egresado': 'bg-gradient-to-br from-green-400 to-green-600',
      'Apoderado': 'bg-gradient-to-br from-purple-400 to-purple-600',
      'Externo': 'bg-gradient-to-br from-orange-400 to-orange-600'
    };
    return clases[nivel as keyof typeof clases] || 'bg-gradient-to-br from-gray-400 to-gray-600';
  }

  getUserBadgeClass(nivel: string): string {
    const clases = {
      'Alumno': 'bg-blue-100 text-blue-700 border-blue-300',
      'Egresado': 'bg-green-100 text-green-700 border-green-300',
      'Apoderado': 'bg-purple-100 text-purple-700 border-purple-300',
      'Externo': 'bg-orange-100 text-orange-700 border-orange-300'
    };
    return clases[nivel as keyof typeof clases] || 'bg-gray-100 text-gray-700 border-gray-300';
  }

  // ============= FUNCIONES DE FORMATEO Y DISPLAY =============
  getCampusDisplayName(campusValue: string): string {
    const campusMap = {
      'lima_norte': 'LIMA NORTE',
      'trujillo': 'TRUJILLO',
      'chiclayo': 'CHICLAYO',
      'piura': 'PIURA',
      'chepen': 'CHEPEN',
      'moyobamba': 'MOYOBAMBA',
      'lima_este': 'LIMA ESTE',
      'tarapoto': 'TARAPOTO'
    };
    return campusMap[campusValue.toLowerCase() as keyof typeof campusMap] || campusValue.toUpperCase();
  }

  formatearEstadoParaTabla(estado: string): string {
    const estados = {
      'pendiente': 'Pendiente',
      'en-proceso': 'En Proceso',
      'atendido': 'Atendido',
      'conforme': 'Conforme',
      'no-conforme': 'No Conforme',
      'vencido': 'Vencido',
      'invalido': 'Inválido'
    };
    return estados[estado.toLowerCase() as keyof typeof estados] || estado.charAt(0).toUpperCase() + estado.slice(1);
  }

  formatearPrioridadParaDisplay(prioridad: string): string {
    const prioridades = {
      'a-tiempo': 'A Tiempo',
      'por-vencer': 'Por Vencer',
      'vencido': 'Vencido',
      'atendido-fuera-fecha': 'Atendido Tarde',
      'todos': 'Todas'
    };
    return prioridades[prioridad.toLowerCase() as keyof typeof prioridades] ||
      prioridad.charAt(0).toUpperCase() + prioridad.slice(1);
  }

  // ============= GESTIÓN DE MODALES =============
  verDetalles(r: ReclamacionCompleta): void {
    this.reclamacionSeleccionada = r;
    this.mostrarModalDetalles = true;
  }

  editarEstado(r: ReclamacionCompleta): void {
    this.reclamacionSeleccionada = r;
    this.mostrarModalEstado = true;
  }

  asignarResponsable(r: ReclamacionCompleta): void {
    this.reclamacionSeleccionada = r;
    this.mostrarModalResponsable = true;
  }

  generarReporte(r: ReclamacionCompleta): void {
    this.reclamacionSeleccionada = r;
    this.mostrarModalReporte = true;
  }

  cerrarModalDetalles(): void {
    this.mostrarModalDetalles = false;
    this.reclamacionSeleccionada = null;
  }

  cerrarModalEstado(): void {
    this.mostrarModalEstado = false;
  }

  cerrarModalResponsable(): void {
    this.mostrarModalResponsable = false;
  }

  cerrarModalReporte(): void {
    this.mostrarModalReporte = false;
  }

  // ============= EVENTOS DE CONFIRMACIÓN DE MODALES =============
  onEstadoConfirm(event: any): void {
    if (event && this.reclamacionSeleccionada) {
      this.reclamacionSeleccionada.estado = event.nuevoEstado;
      this.cerrarModalEstado();
      this.mostrarMensaje('success', 'Éxito', 'Estado actualizado correctamente');
    }
  }

  onReporteConfirm(event: any): void {
    if (event && this.reclamacionSeleccionada) {
      // TODO: Implementar generación de reporte
      this.mostrarMensaje('success', 'Reporte', 'Generando reporte...');
    }
    this.cerrarModalReporte();
  }

  onAsignacionConfirm(event: any): void {
    if (event && this.reclamacionSeleccionada) {
      this.reclamacionSeleccionada.responsable = event.responsableId;
      this.mostrarMensaje('success', 'Éxito', 'Responsable asignado correctamente');
    }
    this.cerrarModalResponsable();
  }

  // ============= GESTIÓN DE POPOVER =============
  openPopover(event: Event, reclamo: any): void {
    this.selectedReclamo = reclamo;
    this.tempEstatus = reclamo?.estatus ?? null;
    this.op.toggle(event);
  }

  setEstatus(valor: 'Conforme' | 'Inválido' | 'No-Conforme'): void {
    this.tempEstatus = valor;
    if (this.selectedReclamo) {
      this.selectedReclamo.estatus = valor;
      this.mostrarMensaje('success', 'Éxito', 'Estatus actualizado correctamente');
      this.op.hide();
    }
  }
}