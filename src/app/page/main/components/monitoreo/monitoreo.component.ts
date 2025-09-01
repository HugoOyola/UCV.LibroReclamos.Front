import { Component, OnInit } from '@angular/core';
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
import { MessageService, ConfirmationService } from 'primeng/api';

import { DetalleComponent } from './modales/detalle/detalle.component';
import { EstadoComponent } from './modales/estado/estado.component';
import { ResponsableComponent } from './modales/responsable/responsable.component';
import { ReporteComponent } from './modales/reporte/reporte.component';

interface ReclamacionStats {
  total: number;
  pendientes: number;
  resueltas: number;
  enProceso: number;
}

interface ReclamacionCompleta {
  codigo: string;
  usuario: string;
  nivel: string; // 'Alumno' | 'Egresado'
  dni: string;
  correo: string;
  tipo: string;
  estado: string;
  prioridad: string;
  campus: string;
  fecha: string;
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
    ReporteComponent
  ],
  templateUrl: './monitoreo.component.html',
  styleUrl: './monitoreo.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class MonitoreoComponent implements OnInit {
  // Tabs y formularios
  activeTab: 'advanced' | 'quick' = 'advanced';
  searchForm: FormGroup;
  quickSearchForm: FormGroup;
  showResults = false;

  // Datos
  reclamaciones: ReclamacionCompleta[] = [];
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
      fecha: '04/07/2025',
      fechaRegistro: '04/07/2025 23:15:33',
      descripcion: 'Problema con la plataforma virtual, no puede acceder al aula virtual para entregar trabajos.'
    },
    {
      codigo: '22188',
      usuario: 'VALDIVIA SALVADOR VALERIA NICOLE',
      nivel: 'Alumno',
      dni: '73138113',
      correo: 'vvaldiviasa@ucvvirtual.edu.pe',
      tipo: 'RECLAMO',
      estado: 'Atendido',
      prioridad: 'Media',
      campus: 'LIMA NORTE',
      fecha: '04/07/2025',
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
      fecha: '04/07/2025',
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
      fecha: '04/07/2025',
      fechaRegistro: '04/07/2025 17:15:15',
      descripcion: 'Queja sobre la atención en ventanilla de pagos, demora excesiva.'
    },
    {
      codigo: '22185',
      usuario: 'SOLIS CARDENAS KATHERIN YANINA',
      nivel: 'Alumno',
      dni: '45476405',
      correo: 'soliskaty29@gmail.com',
      tipo: 'RECLAMO',
      estado: 'Atendido',
      prioridad: 'Media',
      campus: 'LIMA NORTE',
      fecha: '04/07/2025',
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
      fecha: '04/07/2025',
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
      fecha: '04/07/2025',
      fechaRegistro: '04/07/2025 10:21:49',
      descripcion: 'Queja sobre las condiciones de la biblioteca, falta de espacios para estudio.'
    }
  ];

  // Barra de filtros en tabla
  searchTerm = '';
  selectedEstado: string = 'todos';
  selectedPrioridad: string = 'todos';
  selectedCampus: string = 'todos';

  // Catálogos
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

  // Opciones selects en barra de filtros
  estadoOptions = [
    { label: 'Todos', value: 'todos' },
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'En Proceso', value: 'en proceso' },
    { label: 'Atendido', value: 'atendido' },
    { label: 'Conforme', value: 'conforme' },
    { label: 'No-Conforme', value: 'no-conforme' },
    { label: 'Vencido', value: 'vencido' },
    { label: 'Cerrado', value: 'cerrado' },
    { label: 'Inválido', value: 'inválido' },
  ];

  prioridadOptions = [
    { label: 'Todas', value: 'todos' },
    { label: 'Alta', value: 'alta' },
    { label: 'Media', value: 'media' },
    { label: 'Baja', value: 'baja' },
  ];

  campusOptionsTabla = [
    { label: 'Todos', value: 'todos' },
    { label: 'LIMA NORTE', value: 'LIMA NORTE' },
    { label: 'TRUJILLO', value: 'TRUJILLO' },
    { label: 'CHICLAYO', value: 'CHICLAYO' },
    { label: 'PIURA', value: 'PIURA' },
    { label: 'CHEPEN', value: 'CHEPEN' },
    { label: 'MOYOBAMBA', value: 'MOYOBAMBA' },
    { label: 'TARAPOTO', value: 'TARAPOTO' },
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

  // Modales
  mostrarModalDetalles = false;
  mostrarModalEstado = false;
  mostrarModalResponsable = false;
  mostrarModalReporte = false;
  reclamacionSeleccionada: ReclamacionCompleta | null = null;

  // Estado / Responsable / Reporte
  nuevoEstado = '';
  comentarioEstado = '';
  responsableSeleccionado = '';
  comentarioAsignacion = '';
  tipoReporteSeleccionado = '';
  generandoReporte = false;

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

  ngOnInit(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    this.searchForm.patchValue({ fechaRango: [thirtyDaysAgo, today] });
    this.reclamaciones = [...this.reclamacionesCompletas];
  }

  // Tabs
  setActiveTab(tab: 'advanced' | 'quick'): void {
    this.activeTab = tab;
    this.showResults = false;
  }

  // Filtros (checkbox grupos)
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

  // Búsqueda
  buscarReclamaciones(): void {
    // Aquí podrías aplicar los filtros avanzados a tu fuente real de datos.
    // Para demo, solo mostramos resultados simulados.
    this.reclamaciones = [...this.reclamacionesCompletas];
    this.showResults = true;
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

    // Resetea filtros de barra de tabla
    this.searchTerm = '';
    this.selectedEstado = 'todos';
    this.selectedPrioridad = 'todos';
    this.selectedCampus = 'todos';

    this.reclamaciones = [];
  }

  nuevaBusqueda(): void { this.showResults = false; }
  buscarAhora(): void { if (this.quickSearchForm.valid) this.buscarReclamaciones(); }
  limpiar(): void { this.limpiarFiltros(); }

  actualizarDatos(): void {
    // Aquí podrías reconsultar al backend
    this.reclamaciones = [...this.reclamacionesCompletas];
  }

  volverAlInicio(): void {
    this.router.navigate(['/dashboard'])
      .catch(error => console.error('Error al navegar:', error));
  }

  // Placeholders/labels/icons búsqueda rápida
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

  // Clases / íconos (únicas versiones)
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
        return 'pi pi-minus-circle  text-green-600';
      default:
        return 'pi pi-info text-gray-600';
    }
  }

  // Filtro centralizado para la tabla
  get filteredReclamaciones(): ReclamacionCompleta[] {
    let data = [...this.reclamaciones];

    // Búsqueda global
    const term = this.searchTerm?.toLowerCase().trim();
    if (term) {
      data = data.filter(rec =>
        rec.codigo.toLowerCase().includes(term) ||
        rec.usuario.toLowerCase().includes(term) ||
        rec.dni.includes(term) ||
        rec.correo.toLowerCase().includes(term)
      );
    }

    // Estado
    if (this.selectedEstado !== 'todos') {
      data = data.filter(r => r.estado.toLowerCase() === this.selectedEstado);
    }

    // Prioridad
    if (this.selectedPrioridad !== 'todos') {
      data = data.filter(r => r.prioridad.toLowerCase() === this.selectedPrioridad);
    }

    // Campus (en datos viene en MAYÚSCULAS)
    if (this.selectedCampus !== 'todos') {
      data = data.filter(r => (r.campus || '').toUpperCase() === this.selectedCampus.toUpperCase());
    }

    return data;
  }

  // Stats calculados en base a los filtrados (para no depender de llamadas manuales)
  get stats(): ReclamacionStats {
    const data = this.filteredReclamaciones;
    return {
      total: data.length,
      pendientes: data.filter(r => r.estado.toLowerCase() === 'pendiente').length,
      resueltas: data.filter(r => ['atendido', 'resuelto', 'conforme'].includes(r.estado.toLowerCase())).length,
      enProceso: data.filter(r => r.estado.toLowerCase() === 'en proceso').length
    };
  }

  // Acciones
  mostrarOpciones(reclamacion: ReclamacionCompleta): void {
    console.log('Mostrar opciones para:', reclamacion.codigo);
  }

  // Modales (abrir/cerrar)
  verDetalles(r: ReclamacionCompleta): void {
    this.reclamacionSeleccionada = r;
    this.mostrarModalDetalles = true;
  }

  editarEstado(r: ReclamacionCompleta): void {
    this.reclamacionSeleccionada = r;
    this.nuevoEstado = '';
    this.comentarioEstado = '';
    this.mostrarModalEstado = true;
  }

  asignarResponsable(r: ReclamacionCompleta): void {
    this.reclamacionSeleccionada = r;
    this.responsableSeleccionado = '';
    this.comentarioAsignacion = '';
    this.mostrarModalResponsable = true;
  }

  generarReporte(r: ReclamacionCompleta): void {
    this.reclamacionSeleccionada = r;
    this.tipoReporteSeleccionado = '';
    this.generandoReporte = false;
    this.mostrarModalReporte = true;
  }

  cerrarModalDetalles(): void { this.mostrarModalDetalles = false; this.reclamacionSeleccionada = null; }
  cerrarModalEstado(): void { this.mostrarModalEstado = false; this.nuevoEstado = ''; this.comentarioEstado = ''; }
  cerrarModalResponsable(): void { this.mostrarModalResponsable = false; this.responsableSeleccionado = ''; this.comentarioAsignacion = ''; }
  cerrarModalReporte(): void { this.mostrarModalReporte = false; this.tipoReporteSeleccionado = ''; this.generandoReporte = false; }

  // Confirmaciones
  confirmarCambioEstado(): void {
    if (!this.nuevoEstado || !this.reclamacionSeleccionada) return;
    this.confirmationService.confirm({
      message: `¿Está seguro de cambiar el estado a "${this.nuevoEstado}"?`,
      header: 'Confirmar Cambio de Estado',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const code = this.reclamacionSeleccionada!.codigo;
        const i1 = this.reclamaciones.findIndex(r => r.codigo === code);
        const i2 = this.reclamacionesCompletas.findIndex(r => r.codigo === code);
        if (i1 !== -1) this.reclamaciones[i1].estado = this.nuevoEstado;
        if (i2 !== -1) this.reclamacionesCompletas[i2].estado = this.nuevoEstado;

        this.messageService.add({ severity: 'success', summary: 'Estado Actualizado', detail: `El estado ha sido cambiado a "${this.nuevoEstado}".` });
        this.agregarAlHistorial(code, 'Cambio de estado', `A "${this.nuevoEstado}". ${this.comentarioEstado || ''}`);
        this.cerrarModalEstado();
      }
    });
  }

  confirmarAsignacion(): void {
    if (!this.responsableSeleccionado || !this.reclamacionSeleccionada) return;
    const responsable = this.responsablesDisponibles.find(r => r.id === this.responsableSeleccionado);
    this.confirmationService.confirm({
      message: `¿Desea asignar la reclamación a ${responsable?.nombre}?`,
      header: 'Confirmar Asignación',
      icon: 'pi pi-user-plus',
      accept: () => {
        const code = this.reclamacionSeleccionada!.codigo;
        const nombre = responsable?.nombre || 'No asignado';
        const i1 = this.reclamaciones.findIndex(r => r.codigo === code);
        const i2 = this.reclamacionesCompletas.findIndex(r => r.codigo === code);
        if (i1 !== -1) this.reclamaciones[i1].responsable = nombre;
        if (i2 !== -1) this.reclamacionesCompletas[i2].responsable = nombre;

        this.messageService.add({ severity: 'success', summary: 'Responsable Asignado', detail: `La reclamación ha sido asignada a ${nombre}.` });
        this.agregarAlHistorial(code, 'Asignación', `Asignado a ${nombre}. ${this.comentarioAsignacion || ''}`);
        this.cerrarModalResponsable();
      }
    });
  }

  confirmarGenerarReporte(): void {
    if (!this.tipoReporteSeleccionado || !this.reclamacionSeleccionada) return;
    this.generandoReporte = true;
    setTimeout(() => {
      this.generandoReporte = false;
      this.messageService.add({ severity: 'success', summary: 'Reporte Generado', detail: 'El reporte ha sido generado y descargado exitosamente.' });
      this.agregarAlHistorial(this.reclamacionSeleccionada!.codigo, 'Reporte', `Generado: ${this.tipoReporteSeleccionado}`);
      this.cerrarModalReporte();
    }, 800);
  }

  // Auxiliares modales
  getResponsableInfo(id: string): ResponsableOption | undefined {
    return this.responsablesDisponibles.find(r => r.id === id);
  }
  obtenerNombreResponsable(id: string): string { return this.getResponsableInfo(id)?.nombre || 'No asignado'; }
  validarCambioEstado(): boolean { return !!this.nuevoEstado; }
  validarAsignacion(): boolean { return !!this.responsableSeleccionado; }
  validarReporte(): boolean { return !!this.tipoReporteSeleccionado; }

  agregarAlHistorial(reclamacionId: string, accion: string, detalle: string): void {
    const entrada = {
      fecha: new Date().toLocaleString('es-ES'),
      accion,
      detalle,
      usuario: 'Usuario Actual'
    };
    console.log('Historial:', reclamacionId, entrada);
  }

  // Eventos desde modales (ejemplos mínimos)
  onEstadoConfirm(event: any): void {
    if (event && this.reclamacionSeleccionada) {
      this.reclamacionSeleccionada.estado = event.nuevoEstado;
      this.cerrarModalEstado();
    }
  }
  onReporteConfirm(_event: any): void { this.cerrarModalReporte(); }
  onAsignacionConfirm(_event: any): void { this.cerrarModalResponsable(); }
}
