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
  resueltas: number;
  enProceso: number;
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
      estado: 'Atendido',
      prioridad: 'Media',
      campus: 'LIMA NORTE',
      fechaRegistro: '04/07/2025 23:15:33',
      descripcion: 'Problema con la plataforma virtual, no puede acceder al aula virtual para entregar trabajos.'
    },
    {
      codigo: '22188',
      usuario: 'VALDIVIA SALVADOR VALERIA NICOLE',
      nivel: 'Apoderado',
      dni: '73138113',
      correo: 'vvaldiviasa@ucvvirtual.edu.pe',
      tipo: 'RECLAMO',
      estado: 'Atendido',
      prioridad: 'Media',
      campus: 'LIMA NORTE',
      fechaRegistro: '04/07/2025 21:10:56',
      descripcion: 'Solicita revisión de calificación en el curso de matemática básica.'
    },
    {
      codigo: '22187',
      usuario: 'CASTILLO ACUNA ETHEL SOLANGE',
      nivel: 'Alumno',
      dni: '72965669',
      correo: 'ethel.castillo01@gmail.com',
      tipo: 'RECLAMO',
      estado: 'Conforme',
      prioridad: 'Alta',
      campus: 'TARAPOTO',
      fechaRegistro: '04/07/2025 18:46:59',
      descripcion: 'Reclamo sobre horarios de clase que se superponen entre cursos.'
    },
    {
      codigo: '22186',
      usuario: 'CASTRO GUTIERREZ EVELINY ELIDA',
      nivel: 'Alumno',
      dni: '04078882',
      correo: 'evelinyelida_85@hotmail.com',
      tipo: 'QUEJA',
      estado: 'Atendido',
      prioridad: 'Baja',
      campus: 'LIMA ESTE',
      fechaRegistro: '04/07/2025 17:15:15',
      descripcion: 'Queja sobre la atención en ventanilla de pagos, demora excesiva.'
    },
    {
      codigo: '22185',
      usuario: 'SOLIS CARDENAS KATHERIN YANINA',
      nivel: 'Externo',
      dni: '45476405',
      correo: 'soliskaty29@gmail.com',
      tipo: 'RECLAMO',
      estado: 'Atendido',
      prioridad: 'Media',
      campus: 'LIMA NORTE',
      fechaRegistro: '04/07/2025 13:33:58',
      descripcion: 'Problema con el sistema de matrícula online, no permite seleccionar cursos.'
    },
    {
      codigo: '22184',
      usuario: 'RIVAS GAMBINI JOSE ALBERTO',
      nivel: 'Egresado',
      dni: '74816768',
      correo: 'joserivasgambini23@gmail.com',
      tipo: 'RECLAMO',
      estado: 'Atendido',
      prioridad: 'Alta',
      campus: 'TRUJILLO',
      fechaRegistro: '04/07/2025 11:32:39',
      descripcion: 'Solicitud de duplicado de diploma, proceso demorado más de lo establecido.'
    },
    {
      codigo: '22183',
      usuario: 'DAMIAN HUAMAN MARICARMEN',
      nivel: 'Alumno',
      dni: '76801592',
      correo: 'ddamianhu28@ucvvirtual.edu.pe',
      tipo: 'QUEJA',
      estado: 'Pendiente',
      prioridad: 'Media',
      campus: 'LIMA NORTE',
      fechaRegistro: '04/07/2025 10:21:49',
      descripcion: 'Queja sobre las condiciones de la biblioteca, falta de espacios para estudio.'
    }
  ];

  // ============= CATÁLOGOS =============
  estadosDisponibles: EstadoOption[] = [
    { valor: 'Pendiente', label: 'Pendiente', descripcion: 'Reclamación pendiente de revisión' },
    { valor: 'En Proceso', label: 'En Proceso', descripcion: 'Se está trabajando en la solución' },
    { valor: 'Atendido', label: 'Atendido', descripcion: 'Reclamación atendida' },
    { valor: 'Conforme', label: 'Conforme', descripcion: 'Cliente conforme con la solución' },
    { valor: 'No-Conforme', label: 'No-Conforme', descripcion: 'Cliente no conforme' },
    { valor: 'Cerrado', label: 'Cerrado', descripcion: 'Caso cerrado definitivamente' }
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

  // ============= OPCIONES DE SELECTS =============
  estadoOptions = [
    { label: 'Todos', value: 'todos' },
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'En Proceso', value: 'en proceso' },
    { label: 'Atendido', value: 'atendido' },
    { label: 'Conforme', value: 'conforme' },
    { label: 'No-Conforme', value: 'no-conforme' },
    { label: 'Vencido', value: 'vencido' },
    { label: 'Cerrado', value: 'cerrado' },
    { label: 'Inválido', value: 'inválido' }
  ];

  prioridadOptions = [
    { label: 'Todas', value: 'todos' },
    { label: 'A Tiempo', value: 'alta' },
    { label: 'Por Vencer', value: 'media' },
    { label: 'Vencido', value: 'baja' },
    { label: 'Atendido Fuera de fecha', value: 'baja' }
  ];

  campusOptionsTabla = [
    { label: 'Todos', value: 'todos' },
    { label: 'LIMA NORTE', value: 'LIMA NORTE' },
    { label: 'TRUJILLO', value: 'TRUJILLO' },
    { label: 'CHICLAYO', value: 'CHICLAYO' },
    { label: 'PIURA', value: 'PIURA' },
    { label: 'CHEPEN', value: 'CHEPEN' },
    { label: 'MOYOBAMBA', value: 'MOYOBAMBA' },
    { label: 'TARAPOTO', value: 'TARAPOTO' }
  ];

  campusOptions = [
    { label: 'Todos los Campus', value: 'todos' },
    { label: 'UCV CAMPUS LIMA NORTE', value: 'lima_norte' },
    { label: 'UCV CAMPUS TRUJILLO', value: 'trujillo' },
    { label: 'UCV CAMPUS CHICLAYO', value: 'chiclayo' },
    { label: 'UCV CAMPUS PIURA', value: 'piura' },
    { label: 'UCV CAMPUS CHEPEN', value: 'chepen' },
    { label: 'UCV CAMPUS MOYOBAMBA', value: 'moyobamba' }
  ];

  // ============= CONSTRUCTOR =============
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
      estadoEnProceso: [false],
      estadoConforme: [false],
      estadoNoConforme: [false],
      estadoPendiente: [false],
      estadoAtendido: [false],
      estadoVencido: [false],
      estadoInvalido: [false]
    });

    this.quickSearchForm = this.fb.group({
      searchType: ['dni'],
      searchValue: ['', Validators.required]
    });
  }

  // ============= LIFECYCLE =============
  ngOnInit(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    this.searchForm.patchValue({ fechaRango: [thirtyDaysAgo, today] });
    this.reclamaciones = [...this.reclamacionesCompletas];
  }

  // ============= NAVEGACIÓN Y TABS =============
  setActiveTab(tab: 'advanced' | 'quick'): void {
    this.activeTab = tab;
    this.showResults = false;
  }

  volverAlInicio(): void {
    this.router.navigate(['/dashboard'])
      .catch(error => console.error('Error al navegar:', error));
  }

  // ============= FILTROS DE FORMULARIO =============
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
        estadoEnProceso: false, estadoConforme: false, estadoNoConforme: false,
        estadoPendiente: false, estadoAtendido: false, estadoVencido: false, estadoInvalido: false
      });
      return;
    }
    this.searchForm.patchValue({ estadoTodos: false });
    const seleccionados = [
      this.searchForm.get('estadoEnProceso')?.value,
      this.searchForm.get('estadoConforme')?.value,
      this.searchForm.get('estadoNoConforme')?.value,
      this.searchForm.get('estadoPendiente')?.value,
      this.searchForm.get('estadoAtendido')?.value,
      this.searchForm.get('estadoVencido')?.value,
      this.searchForm.get('estadoInvalido')?.value
    ].filter(Boolean);
    if (seleccionados.length === 0) this.searchForm.patchValue({ estadoTodos: true });
  }

  // ============= BÚSQUEDA =============
  buscarReclamaciones(): void {
    this.reclamaciones = [...this.reclamacionesCompletas];
    this.showResults = true;
  }

  buscarAhora(): void {
    if (this.quickSearchForm.valid) this.buscarReclamaciones();
  }

  nuevaBusqueda(): void {
    this.showResults = false;
  }

  limpiar(): void {
    this.limpiarFiltros();
  }

  limpiarFiltros(): void {
    if (this.activeTab === 'advanced') {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
      this.searchForm.reset({
        campus: 'todos',
        fechaRango: [thirtyDaysAgo, today],
        tipoTodos: true,
        tipoReclamo: false,
        tipoQueja: false,
        tipoConsulta: false,
        estadoTodos: true,
        estadoEnProceso: false,
        estadoConforme: false,
        estadoNoConforme: false,
        estadoPendiente: false,
        estadoAtendido: false,
        estadoVencido: false,
        estadoInvalido: false
      });
    } else {
      this.quickSearchForm.reset({ searchType: 'dni', searchValue: '' });
    }
    this.showResults = false;
    this.searchTerm = '';
    this.selectedEstado = 'todos';
    this.selectedPrioridad = 'todos';
    this.selectedCampus = 'todos';
    this.reclamaciones = [];
  }

  actualizarDatos(): void {
    this.reclamaciones = [...this.reclamacionesCompletas];
  }

  // ============= HELPERS PARA BÚSQUEDA RÁPIDA =============
  getPlaceholder(): string {
    const t = this.quickSearchForm.get('searchType')?.value;
    if (t === 'dni') return 'Ej: 41630253';
    if (t === 'codigo') return 'Ej: REC-2025-001';
    if (t === 'nombre') return 'Ej: Juan Pérez';
    return '';
  }

  getSearchLabel(): string {
    const t = this.quickSearchForm.get('searchType')?.value;
    if (t === 'dni') return 'DNI';
    if (t === 'codigo') return 'Código';
    if (t === 'nombre') return 'Nombre';
    return '';
  }

  getSearchIcon(searchType: string): string {
    if (searchType === 'dni' || searchType === 'nombre') return 'pi pi-user';
    if (searchType === 'codigo') return 'pi pi-tag';
    return 'pi pi-search';
  }

  // ============= GETTERS CALCULADOS =============
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
      data = data.filter(r => r.estado.toLowerCase() === this.selectedEstado);
    }

    if (this.selectedPrioridad !== 'todos') {
      data = data.filter(r => r.prioridad.toLowerCase() === this.selectedPrioridad);
    }

    if (this.selectedCampus !== 'todos') {
      data = data.filter(r => (r.campus || '').toUpperCase() === this.selectedCampus.toUpperCase());
    }

    return data;
  }

  get stats(): ReclamacionStats {
    const data = this.filteredReclamaciones;
    return {
      total: data.length,
      pendientes: data.filter(r => r.estado.toLowerCase() === 'pendiente').length,
      resueltas: data.filter(r => ['atendido', 'resuelto', 'conforme'].includes(r.estado.toLowerCase())).length,
      enProceso: data.filter(r => r.estado.toLowerCase() === 'en proceso').length
    };
  }

  // ============= CLASES CSS Y ESTILOS =============
  getEstadoClass(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'atendido':
      case 'conforme':
        return 'text-green-700 bg-green-50 ring-1 ring-green-600/20';
      case 'pendiente':
        return 'text-yellow-700 bg-yellow-50 ring-1 ring-yellow-600/20';
      case 'en proceso':
        return 'text-blue-700 bg-blue-50 ring-1 ring-blue-600/20';
      case 'rechazado':
      case 'no-conforme':
      case 'vencido':
        return 'text-red-700 bg-red-50 ring-1 ring-red-600/20';
      case 'cerrado':
      case 'inválido':
        return 'text-gray-700 bg-gray-50 ring-1 ring-gray-600/20';
      default:
        return 'text-gray-700 bg-gray-50 ring-1 ring-gray-600/20';
    }
  }

  getEstadoDotClass(estado: string): string {
    const clases: Record<string, string> = {
      'Pendiente': 'bg-yellow-400',
      'En Proceso': 'bg-blue-400',
      'Atendido': 'bg-green-400',
      'Conforme': 'bg-green-400',
      'Cerrado': 'bg-gray-400',
      'No-Conforme': 'bg-red-400',
      'Vencido': 'bg-red-400'
    };
    return clases[estado] || 'bg-gray-400';
  }

  getPrioridadClass(prioridad: string): string {
    switch (prioridad.toLowerCase()) {
      case 'alta':
      case 'urgente':
        return 'text-red-700 bg-red-100';
      case 'media':
        return 'text-yellow-700 bg-yellow-100';
      case 'baja':
        return 'text-green-700 bg-green-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  }

  getPrioridadIcon(prioridad: string): string {
    switch (prioridad.toLowerCase()) {
      case 'alta':
      case 'urgente':
        return 'pi pi-exclamation-triangle text-red-600';
      case 'media':
      case 'normal':
        return 'pi pi-exclamation-circle text-yellow-600';
      case 'baja':
        return 'pi pi-minus-circle text-green-600';
      default:
        return 'pi pi-info text-gray-600';
    }
  }

  // ============= ESTILOS PARA TIPOS DE USUARIO =============
  getUserIcon(nivel: string): string {
    switch (nivel) {
      case 'Alumno':
        return 'pi pi-user';
      case 'Egresado':
        return 'pi pi-graduation-cap';
      case 'Apoderado':
        return 'pi pi-users';
      case 'Externo':
        return 'pi pi-globe';
      default:
        return 'pi pi-user';
    }
  }

  getUserAvatarClass(nivel: string): string {
    switch (nivel) {
      case 'Alumno':
        return 'bg-gradient-to-br from-blue-400 to-blue-600';
      case 'Egresado':
        return 'bg-gradient-to-br from-green-400 to-green-600';
      case 'Apoderado':
        return 'bg-gradient-to-br from-purple-400 to-purple-600';
      case 'Externo':
        return 'bg-gradient-to-br from-orange-400 to-orange-600';
      default:
        return 'bg-gradient-to-br from-gray-400 to-gray-600';
    }
  }

  getUserBadgeClass(nivel: string): string {
    switch (nivel) {
      case 'Alumno':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Egresado':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Apoderado':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'Externo':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  }

  // ============= MODALES =============
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

  // ============= EVENTOS DE MODALES =============
  onEstadoConfirm(event: any): void {
    if (event && this.reclamacionSeleccionada) {
      this.reclamacionSeleccionada.estado = event.nuevoEstado;
      this.cerrarModalEstado();
    }
  }

  onReporteConfirm(_event: any): void {
    this.cerrarModalReporte();
  }

  onAsignacionConfirm(_event: any): void {
    this.cerrarModalResponsable();
  }

  // ============= POPOVER =============
  openPopover(event: Event, reclamo: any): void {
    this.selectedReclamo = reclamo;
    this.tempEstatus = reclamo?.estatus ?? null;
    this.op.toggle(event);
  }

  setEstatus(valor: 'Conforme' | 'Inválido' | 'No-Conforme'): void {
    this.tempEstatus = valor;
    if (this.selectedReclamo) {
      this.selectedReclamo.estatus = valor;
      this.op.hide();
    }
  }
}