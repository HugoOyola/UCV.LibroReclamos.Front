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
  aTiempo: number;
  porVencer: number;
  vencidos: number;
  atendidosFueraFecha: number;
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
  searchPerformed = false; // Nueva variable para controlar las estadísticas

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
    // CASO 1: A TIEMPO (Verde) - Registrado hoy
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

    // CASO 2: A TIEMPO (Verde) - 2 días
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

    // CASO 3: A TIEMPO (Verde) - 4 días y ya atendido
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

    // CASO 4: POR VENCER (Amarillo) - 6 días
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

    // CASO 5: POR VENCER (Amarillo) - 10 días
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

    // CASO 6: POR VENCER (Amarillo) - 14 días pero ya atendido
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

    // CASO 7: VENCIDO (Rojo) - 18 días sin atender
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

    // CASO 8: VENCIDO (Rojo) - 25 días sin atender
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

    // CASO 9: ATENDIDO FUERA DE FECHA (Morado) - 20 días pero atendido
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

    // CASO 10: ATENDIDO FUERA DE FECHA (Morado) - 30 días pero conforme
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

    // CASO 11: NO-CONFORME después de 22 días
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

    // CASO 12: INVÁLIDO - caso especial
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

    // CASO 13: A TIEMPO (Verde) - 3 días, CONSULTA
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

    // CASO 14: POR VENCER (Amarillo) - 8 días
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

    // CASO 15: VENCIDO (Rojo) - 35 días
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

  // Catálogo de estados disponibles para los desplegables y modales
  estadosDisponibles: EstadoOption[] = [
    { valor: 'pendiente', label: 'Pendiente', descripcion: 'Reclamación pendiente de revisión' },
    { valor: 'en-proceso', label: 'En Proceso', descripcion: 'Se está trabajando en la solución' },
    { valor: 'atendido', label: 'Atendido', descripcion: 'Reclamación atendida' },
    { valor: 'conforme', label: 'Conforme', descripcion: 'Cliente conforme con la solución' },
    { valor: 'no-conforme', label: 'No Conforme', descripcion: 'Cliente no conforme' },
    { valor: 'vencido', label: 'Vencido', descripcion: 'Reclamación vencida' },
    { valor: 'invalido', label: 'Inválido', descripcion: 'Reclamación inválida' }
  ];

  // Catálogo de responsables disponibles para asignación
  responsablesDisponibles: ResponsableOption[] = [
    { id: '1', nombre: 'Ana García Martínez', cargo: 'Coordinadora', departamento: 'Servicios Estudiantiles', casosActivos: 12 },
    { id: '2', nombre: 'Carlos Rodriguez López', cargo: 'Especialista', departamento: 'Gestión Académica', casosActivos: 8 },
    { id: '3', nombre: 'María Elena Vásquez', cargo: 'Supervisora', departamento: 'Control de Calidad', casosActivos: 5 },
    { id: '4', nombre: 'Jorge Luis Mendoza', cargo: 'Analista Senior', departamento: 'Soporte Técnico', casosActivos: 15 }
  ];

  // Catálogo de tipos de reporte disponibles
  tiposReporte: TipoReporte[] = [
    { valor: 'completo', label: 'Reporte Completo', descripcion: 'Incluye todos los detalles y historial', icono: 'pi pi-file-o' },
    { valor: 'resumen', label: 'Resumen Ejecutivo', descripcion: 'Información resumida para revisión rápida', icono: 'pi pi-list' },
    { valor: 'seguimiento', label: 'Seguimiento', descripcion: 'Historial de acciones y cambios', icono: 'pi pi-clock' }
  ];

  // Opciones para el filtro de estado en la tabla
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

  // Opciones para el filtro de prioridad por tiempo en la tabla
  prioridadOptions = [
    { label: 'Todas', value: 'todos' },
    { label: 'A Tiempo', value: 'a-tiempo' },
    { label: 'Por Vencer', value: 'por-vencer' },
    { label: 'Vencido', value: 'vencido' },
    { label: 'Atendido Tarde', value: 'atendido-fuera-fecha' }
  ];

  // Opciones de campus para filtros de tabla
  campusOptionsTabla = [
    { label: 'Todos los Campus', value: 'todos' },
    { label: 'UCV LIMA NORTE', value: 'lima_norte' },
    { label: 'UCV TRUJILLO', value: 'trujillo' },
    { label: 'UCV CHICLAYO', value: 'chiclayo' },
    { label: 'UCV PIURA', value: 'piura' },
    { label: 'UCV CHEPEN', value: 'chepen' },
    { label: 'UCV MOYOBAMBA', value: 'moyobamba' }
  ];

  // Opciones de campus para formularios de búsqueda
  campusOptions = [
    { label: 'Todos los Campus', value: 'todos' },
    { label: 'UCV LIMA NORTE', value: 'lima_norte' },
    { label: 'UCV TRUJILLO', value: 'trujillo' },
    { label: 'UCV CHICLAYO', value: 'chiclayo' },
    { label: 'UCV PIURA', value: 'piura' },
    { label: 'UCV CHEPEN', value: 'chepen' },
    { label: 'UCV MOYOBAMBA', value: 'moyobamba' }
  ];

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

  // Inicialización del componente con configuraciones por defecto
  ngOnInit(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    this.searchForm.patchValue({ fechaRango: [thirtyDaysAgo, today] });

    // Aquí puedes cargar los datos desde un servicio
    this.cargarDatos();
  }

  // ============= NAVEGACIÓN Y GESTIÓN DE TABS =============

  // Cambia entre tabs de búsqueda avanzada y rápida
  setActiveTab(tab: 'advanced' | 'quick'): void {
    this.activeTab = tab;
    this.showResults = false;
    this.searchPerformed = false;
  }

  // Navega de vuelta al dashboard principal
  volverAlInicio(): void {
    this.router.navigate(['/dashboard'])
      .catch(error => console.error('Error al navegar:', error));
  }

  // ============= GESTIÓN DE FILTROS DE FORMULARIO =============

  // Maneja la selección de tipos de reclamación en el formulario
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

  // Maneja la selección de estados de proceso en el formulario
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

  // Ejecuta búsqueda avanzada con filtros del formulario
  buscarReclamaciones(): void {
    const formValues = this.searchForm.value;

    // Ejemplo de filtros que puedes pasar al servicio:
    const filtros = {
      campus: formValues.campus !== 'todos' ? formValues.campus : null,
      fechaRango: formValues.fechaRango || null,
      tipos: this.obtenerTiposSeleccionados(),
      estados: this.obtenerEstadosSeleccionados()
    };

    // TODO: Llamar al servicio de reclamaciones
    // this.reclamacionService.buscarReclamaciones(filtros).subscribe(data => {
    //   this.reclamaciones = data;
    // });

    this.searchPerformed = true;
    this.showResults = true;
    this.calcularEstadisticas();
  }

  // Ejecuta búsqueda rápida con criterio específico
  buscarAhora(): void {
    if (this.quickSearchForm.valid) {
      const searchType = this.quickSearchForm.get('searchType')?.value;
      const searchValue = this.quickSearchForm.get('searchValue')?.value;

      // TODO: Implementar búsqueda rápida
      // this.reclamacionService.busquedaRapida(searchType, searchValue).subscribe(data => {
      //   this.reclamaciones = data;
      // });

      this.searchPerformed = true;
      this.showResults = true;
      this.calcularEstadisticas();
    }
  }

  // Inicia una nueva búsqueda limpiando resultados anteriores
  nuevaBusqueda(): void {
    this.showResults = false;
    this.searchPerformed = false;
    this.reclamaciones = [];
    this.limpiarFiltros();
  }

  // Limpia todos los filtros aplicados
  limpiar(): void {
    this.limpiarFiltros();
  }

  // Resetea formularios y filtros a valores por defecto
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

    if (!this.showResults) {
      this.searchPerformed = false;
    }

    this.searchTerm = '';
    this.selectedEstado = 'todos';
    this.selectedPrioridad = 'todos';
    this.selectedCampus = 'todos';
  }

  // Actualiza los datos desde el servidor
  actualizarDatos(): void {
    this.cargarDatos();
  }

  // Limpia específicamente los filtros de la tabla de resultados
  limpiarFiltrosTabla(): void {
    this.searchTerm = '';
    this.selectedEstado = 'todos';
    this.selectedPrioridad = 'todos';
    this.selectedCampus = 'todos';
  }

  // Maneja el evento cuando se limpia un select con la X
  onSelectClear(filtro: 'estado' | 'prioridad' | 'campus'): void {
    switch (filtro) {
      case 'estado':
        this.selectedEstado = 'todos';
        break;
      case 'prioridad':
        this.selectedPrioridad = 'todos';
        break;
      case 'campus':
        this.selectedCampus = 'todos';
        break;
    }
  }

  // Carga datos iniciales (mock o desde servicio)
  private cargarDatos(): void {
    this.reclamaciones = [...this.reclamacionesCompletas];
    // TODO: Implementar carga de datos desde servicio
    // this.reclamacionService.obtenerReclamaciones().subscribe(data => {
    //   this.reclamaciones = data;
    // });
  }

  // ============= HELPERS PARA BÚSQUEDA RÁPIDA =============

  // Retorna el placeholder apropiado según el tipo de búsqueda seleccionado
  getPlaceholder(): string {
    const t = this.quickSearchForm.get('searchType')?.value;
    if (t === 'dni') return 'Ej: 41630253';
    if (t === 'codigo') return 'Ej: REC-2025-001';
    if (t === 'nombre') return 'Ej: Juan Pérez';
    return '';
  }

  // Retorna la etiqueta del campo de búsqueda según el tipo seleccionado
  getSearchLabel(): string {
    const t = this.quickSearchForm.get('searchType')?.value;
    if (t === 'dni') return 'DNI';
    if (t === 'codigo') return 'Código';
    if (t === 'nombre') return 'Nombre';
    return '';
  }

  // Retorna el icono apropiado para el tipo de búsqueda
  getSearchIcon(searchType: string): string {
    if (searchType === 'dni' || searchType === 'nombre') return 'pi pi-user';
    if (searchType === 'codigo') return 'pi pi-tag';
    return 'pi pi-search';
  }

  // Extrae los tipos de reclamación seleccionados del formulario
  private obtenerTiposSeleccionados(): string[] {
    const formValues = this.searchForm.value;
    if (formValues.tipoTodos) return [];

    const tipos: string[] = [];
    if (formValues.tipoReclamo) tipos.push('RECLAMO');
    if (formValues.tipoQueja) tipos.push('QUEJA');
    if (formValues.tipoConsulta) tipos.push('CONSULTA');

    return tipos;
  }

  // Extrae los estados seleccionados del formulario
  private obtenerEstadosSeleccionados(): string[] {
    const formValues = this.searchForm.value;
    if (formValues.estadoTodos) return [];

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

  // ============= GETTERS Y PROPIEDADES CALCULADAS =============

  // Retorna reclamaciones filtradas según los criterios aplicados
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

  // Calcula estadísticas de las reclamaciones filtradas
  get stats(): ReclamacionStats {
    const data = this.filteredReclamaciones;

    let aTiempo = 0;
    let porVencer = 0;
    let vencidos = 0;
    let atendidosFueraFecha = 0;

    data.forEach(rec => {
      const prioridad = this.calcularPrioridadPorTiempo(rec.fechaRegistro, rec.estado);
      switch (prioridad) {
        case 'a-tiempo': aTiempo++; break;
        case 'por-vencer': porVencer++; break;
        case 'vencido': vencidos++; break;
        case 'atendido-fuera-fecha': atendidosFueraFecha++; break;
      }
    });

    return {
      total: data.length,
      pendientes: data.filter(r => r.estado.toLowerCase() === 'pendiente').length,
      resueltas: data.filter(r => ['atendido', 'conforme'].includes(r.estado.toLowerCase())).length,
      enProceso: data.filter(r => r.estado.toLowerCase() === 'en-proceso').length,
      aTiempo,
      porVencer,
      vencidos,
      atendidosFueraFecha
    };
  }

  // Recalcula las estadísticas después de una búsqueda
  calcularEstadisticas(): void {
    if (this.filteredReclamaciones && this.filteredReclamaciones.length > 0) {
      // Las estadísticas se calculan automáticamente en el getter stats
    }
  }

  // ============= UTILIDADES DE FECHAS Y TIEMPO =============

  // Calcula la prioridad de una reclamación basada en tiempo transcurrido
  calcularPrioridadPorTiempo(fechaRegistro: string, estado: string): string {
    const fechaReg = this.parsearFecha(fechaRegistro);
    const fechaActual = new Date();

    const diferenciaTiempo = fechaActual.getTime() - fechaReg.getTime();
    const diasTranscurridos = Math.floor(diferenciaTiempo / (1000 * 3600 * 24));

    const estadosAtendidos = ['atendido', 'conforme', 'no-conforme'];
    const estaAtendido = estadosAtendidos.includes(estado.toLowerCase());

    if (estaAtendido && diasTranscurridos >= 15) {
      return 'atendido-fuera-fecha'; // Morado - Atendido después de los 15 días
    } else if (!estaAtendido && diasTranscurridos >= 15) {
      return 'vencido'; // Rojo - Vencido (más de 15 días sin atender)
    } else if (diasTranscurridos >= 5) {
      return 'por-vencer'; // Amarillo - Por vencer (entre 5-14 días)
    } else {
      return 'a-tiempo'; // Verde - A tiempo (0-4 días)
    }
  }

  // Convierte string de fecha a objeto Date (formato dd/MM/yyyy HH:mm:ss)
  private parsearFecha(fechaTexto: string): Date {
    const [fecha, hora] = fechaTexto.split(' ');
    const [dia, mes, año] = fecha.split('/');
    const [horas, minutos, segundos] = hora.split(':');

    return new Date(
      parseInt(año),
      parseInt(mes) - 1, // Los meses en JS van de 0-11
      parseInt(dia),
      parseInt(horas),
      parseInt(minutos),
      parseInt(segundos)
    );
  }

  // Obtiene información detallada del tiempo transcurrido
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

  // Calcula el ancho de la barra de progreso basado en días transcurridos
  getDiasWidth(dias: number): number {
    return Math.min((dias / 15) * 100, 100);
  }

  // ============= FUNCIONES DE ESTILOS Y CLASES CSS =============

  // Retorna clases CSS para el estado de la reclamación
  getEstadoClass(estado: string): string {
    const estadoNormalizado = estado.toLowerCase();
    switch (estadoNormalizado) {
      case 'en-proceso':
        return 'text-[#5B6AD6] bg-[#EEF0FF] ring-1 ring-[#5B6AD638]';
      case 'conforme':
        return 'text-[#1AAE9F] bg-[#E8FBF8] ring-1 ring-[#1AAE9F38]';
      case 'no-conforme':
        return 'text-[#C01C5A] bg-[#FDEAF1] ring-1 ring-[#C01C5A38]';
      case 'pendiente':
        return 'text-[#A05A00] bg-[#FFF4E8] ring-1 ring-[#A05A0038]';
      case 'atendido':
        return 'text-[#1C7ED6] bg-[#EAF4FF] ring-1 ring-[#1C7ED638]';
      case 'vencido':
        return 'text-[#7A1F1F] bg-[#FBEAEA] ring-1 ring-[#7A1F1F38]';
      case 'invalido':
        return 'text-[#5E5E6D] bg-[#F1F2F6] ring-1 ring-[#5E5E6D38]';
      default:
        return 'text-[#5E5E6D] bg-[#F1F2F6] ring-1 ring-[#5E5E6D38]';
    }
  }

  // Retorna clases CSS para el punto indicador del estado
  getEstadoDotClass(estado: string): string {
    const estadoNormalizado = estado.toLowerCase();
    const clases: Record<string, string> = {
      'pendiente': 'bg-[#F0AA65]',
      'en-proceso': 'bg-[#5B6AD6]',
      'atendido': 'bg-[#1C7ED6]',
      'conforme': 'bg-[#1AAE9F]',
      'no-conforme': 'bg-[#C01C5A]',
      'vencido': 'bg-[#7A1F1F]',
      'invalido': 'bg-[#9AA0B1]'
    };

    return clases[estadoNormalizado] || 'bg-[#9AA0B1]';
  }

  // Retorna clases CSS para la prioridad de la reclamación
  getPrioridadClass(prioridad: string): string {
    switch (prioridad.toLowerCase()) {
      case 'alta':
        return 'text-red-700 bg-red-100';
      case 'media':
        return 'text-yellow-700 bg-yellow-100';
      case 'baja':
        return 'text-green-700 bg-green-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  }

  // Retorna icono apropiado para la prioridad
  getPrioridadIcon(prioridad: string): string {
    switch (prioridad.toLowerCase()) {
      case 'alta':
        return 'pi pi-exclamation-triangle text-red-600';
      case 'media':
        return 'pi pi-exclamation-circle text-yellow-600';
      case 'baja':
        return 'pi pi-minus-circle text-green-600';
      default:
        return 'pi pi-info text-gray-600';
    }
  }

  // Retorna clases CSS para prioridad calculada por tiempo
  getPrioridadPorTiempoClass(fechaRegistro: string, estado: string): string {
    const prioridad = this.calcularPrioridadPorTiempo(fechaRegistro, estado);

    switch (prioridad) {
      case 'a-tiempo':
        return 'text-green-700 bg-green-100 border border-green-300';
      case 'por-vencer':
        return 'text-yellow-700 bg-yellow-100 border border-yellow-300';
      case 'vencido':
        return 'text-red-700 bg-red-100 border border-red-300';
      case 'atendido-fuera-fecha':
        return 'text-purple-700 bg-purple-100 border border-purple-300';
      default:
        return 'text-gray-700 bg-gray-100 border border-gray-300';
    }
  }

  // Retorna icono para prioridad por tiempo
  getPrioridadPorTiempoIcon(fechaRegistro: string, estado: string): string {
    const prioridad = this.calcularPrioridadPorTiempo(fechaRegistro, estado);

    switch (prioridad) {
      case 'a-tiempo':
        return 'pi pi-check-circle text-green-600';
      case 'por-vencer':
        return 'pi pi-clock text-yellow-600';
      case 'vencido':
        return 'pi pi-exclamation-triangle text-red-600';
      case 'atendido-fuera-fecha':
        return 'pi pi-calendar-times text-purple-600';
      default:
        return 'pi pi-info text-gray-600';
    }
  }

  // Retorna texto descriptivo para prioridad por tiempo
  getPrioridadPorTiempoTexto(fechaRegistro: string, estado: string): string {
    const prioridad = this.calcularPrioridadPorTiempo(fechaRegistro, estado);

    switch (prioridad) {
      case 'a-tiempo':
        return 'A Tiempo';
      case 'por-vencer':
        return 'Por Vencer';
      case 'vencido':
        return 'Vencido';
      case 'atendido-fuera-fecha':
        return 'Tardío';
      default:
        return 'Sin Clasificar';
    }
  }

  // ============= FUNCIONES DE USUARIO Y AVATARES =============

  // Retorna icono apropiado según el nivel de usuario
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

  // Retorna clases CSS para avatar del usuario
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

  // Retorna clases CSS para badge del nivel de usuario
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

  // ============= FUNCIONES DE FORMATEO Y DISPLAY =============

  // Convierte valores internos de campus a nombres para mostrar
  getCampusDisplayName(campusValue: string): string {
    const campusMap: { [key: string]: string } = {
      'lima_norte': 'LIMA NORTE',
      'trujillo': 'TRUJILLO',
      'chiclayo': 'CHICLAYO',
      'piura': 'PIURA',
      'chepen': 'CHEPEN',
      'moyobamba': 'MOYOBAMBA',
      'lima_este': 'LIMA ESTE',
      'tarapoto': 'TARAPOTO'
    };

    return campusMap[campusValue.toLowerCase()] || campusValue.toUpperCase();
  }

  // Formatea estado para mostrar en tabla con capitalización correcta
  formatearEstadoParaTabla(estado: string): string {
    const estadoNormalizado = estado.toLowerCase();

    switch (estadoNormalizado) {
      case 'pendiente':
        return 'Pendiente';
      case 'en-proceso':
        return 'En Proceso';
      case 'atendido':
        return 'Atendido';
      case 'conforme':
        return 'Conforme';
      case 'no-conforme':
        return 'No Conforme';
      case 'vencido':
        return 'Vencido';
      case 'invalido':
        return 'Inválido';
      default:
        return estado.charAt(0).toUpperCase() + estado.slice(1);
    }
  }

  // Formatea prioridad para mostrar en chips y otros elementos
  formatearPrioridadParaDisplay(prioridad: string): string {
    switch (prioridad.toLowerCase()) {
      case 'a-tiempo':
        return 'A Tiempo';
      case 'por-vencer':
        return 'Por Vencer';
      case 'vencido':
        return 'Vencido';
      case 'atendido-fuera-fecha':
        return 'Atendido Tarde';
      case 'todos':
        return 'Todas';
      default:
        return prioridad.charAt(0).toUpperCase() + prioridad.slice(1);
    }
  }

  // ============= GESTIÓN DE MODALES =============

  // Abre modal de detalles para una reclamación específica
  verDetalles(r: ReclamacionCompleta): void {
    this.reclamacionSeleccionada = r;
    this.mostrarModalDetalles = true;
  }

  // Abre modal para editar estado de reclamación
  editarEstado(r: ReclamacionCompleta): void {
    this.reclamacionSeleccionada = r;
    this.mostrarModalEstado = true;
  }

  // Abre modal para asignar responsable a reclamación
  asignarResponsable(r: ReclamacionCompleta): void {
    this.reclamacionSeleccionada = r;
    this.mostrarModalResponsable = true;
  }

  // Abre modal para generar reporte de reclamación
  generarReporte(r: ReclamacionCompleta): void {
    this.reclamacionSeleccionada = r;
    this.mostrarModalReporte = true;
  }

  // Cierra modal de detalles y limpia selección
  cerrarModalDetalles(): void {
    this.mostrarModalDetalles = false;
    this.reclamacionSeleccionada = null;
  }

  // Cierra modal de edición de estado
  cerrarModalEstado(): void {
    this.mostrarModalEstado = false;
  }

  // Cierra modal de asignación de responsable
  cerrarModalResponsable(): void {
    this.mostrarModalResponsable = false;
  }

  // Cierra modal de generación de reportes
  cerrarModalReporte(): void {
    this.mostrarModalReporte = false;
  }

  // ============= EVENTOS DE CONFIRMACIÓN DE MODALES =============

  // Procesa confirmación de cambio de estado
  onEstadoConfirm(event: any): void {
    if (event && this.reclamacionSeleccionada) {
      this.reclamacionSeleccionada.estado = event.nuevoEstado;
      this.cerrarModalEstado();

      // TODO: Llamar al servicio para actualizar estado
      // this.reclamacionService.actualizarEstado(this.reclamacionSeleccionada.codigo, event.nuevoEstado)
      //   .subscribe(() => {
      //     this.messageService.add({severity:'success', summary:'Éxito', detail:'Estado actualizado correctamente'});
      //   });
    }
  }

  // Procesa confirmación de generación de reporte
  onReporteConfirm(event: any): void {
    if (event && this.reclamacionSeleccionada) {
      // TODO: Implementar generación de reporte
      // this.reporteService.generarReporte(this.reclamacionSeleccionada.codigo, event.tipoReporte)
      //   .subscribe(blob => {
      //     // Descargar archivo
      //   });
    }
    this.cerrarModalReporte();
  }

  // Procesa confirmación de asignación de responsable
  onAsignacionConfirm(event: any): void {
    if (event && this.reclamacionSeleccionada) {
      this.reclamacionSeleccionada.responsable = event.responsableId;

      // TODO: Llamar al servicio para asignar responsable
      // this.reclamacionService.asignarResponsable(this.reclamacionSeleccionada.codigo, event.responsableId)
      //   .subscribe(() => {
      //     this.messageService.add({severity:'success', summary:'Éxito', detail:'Responsable asignado correctamente'});
      //   });
    }
    this.cerrarModalResponsable();
  }

  // ============= GESTIÓN DE POPOVER =============

  // Abre popover para cambios rápidos de estatus
  openPopover(event: Event, reclamo: any): void {
    this.selectedReclamo = reclamo;
    this.tempEstatus = reclamo?.estatus ?? null;
    this.op.toggle(event);
  }

  // Establece estatus desde el popover
  setEstatus(valor: 'Conforme' | 'Inválido' | 'No-Conforme'): void {
    this.tempEstatus = valor;
    if (this.selectedReclamo) {
      this.selectedReclamo.estatus = valor;

      // TODO: Llamar al servicio para actualizar estatus
      // this.reclamacionService.actualizarEstatus(this.selectedReclamo.codigo, valor)
      //   .subscribe(() => {
      //     this.messageService.add({severity:'success', summary:'Éxito', detail:'Estatus actualizado correctamente'});
      //   });

      this.op.hide();
    }
  }

  // ============= UTILIDADES DE REINICIO =============

  // Reinicia completamente la vista a estado inicial
  reiniciarVista(): void {
    this.showResults = false;
    this.searchPerformed = false;
    this.reclamaciones = [];
    this.limpiarFiltros();
  }
}