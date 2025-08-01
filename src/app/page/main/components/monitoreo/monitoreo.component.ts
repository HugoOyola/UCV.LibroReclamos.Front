import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
// AGREGAR: Importes necesarios para la tabla PrimeNG
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';

interface ReclamacionStats {
  total: number;
  pendientes: number;
  resueltas: number;
  enProceso: number;
}

interface FilterOption {
  label: string;
  value: string;
  checked: boolean;
}

// MODIFICAR: Interface más completa para la tabla
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
  // AGREGAR: Campos adicionales para la gestión
  responsable?: string;
  descripcion?: string;
  categoria?: string;
  subcategoria?: string;
}

// MANTENER: Interface original para compatibilidad
interface ResultadoBusqueda {
  codigo: string;
  tipo: string;
  estado: string;
  prioridad: string;
  campus: string;
  fecha: string;
  reclamante?: string;
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
    CardModule,
    CheckboxModule,
    RadioButtonModule,
    InputTextModule,
    DatePickerModule,
    // AGREGAR: Nuevos imports para la tabla
    TableModule,
    TooltipModule,
    DialogModule,
  ],
  templateUrl: './monitoreo.component.html',
  styleUrl: './monitoreo.component.scss'
})
export class MonitoreoComponent implements OnInit {
  activeTab: string = 'advanced';
  searchForm: FormGroup;
  quickSearchForm: FormGroup;
  showResults: boolean = false;

  // AGREGAR: Variables para la tabla
  reclamaciones: ReclamacionCompleta[] = [];
  searchTerm: string = '';
  selectedFilter: string = 'todos';
  selectedEstado: string = 'todos';
  selectedPrioridad: string = 'todos';

  stats: ReclamacionStats = {
    total: 2847,
    pendientes: 156,
    resueltas: 2691,
    enProceso: 89
  };

  campusOptions = [
    { label: 'Todos los Campus', value: 'todos' },
    { label: 'UCV CAMPUS LIMA NORTE', value: 'lima_norte' },
    { label: 'UCV CAMPUS TRUJILLO', value: 'trujillo' },
    { label: 'UCV CAMPUS CHICLAYO', value: 'chiclayo' },
    { label: 'UCV CAMPUS PIURA', value: 'piura' },
    { label: 'UCV CAMPUS CHEPEN', value: 'chepen' },
    { label: 'UCV CAMPUS MOYOBAMBA', value: 'moyobamba' }
  ];

  tipoReclamacionOptions: FilterOption[] = [
    { label: 'Todos los tipos', value: 'todos', checked: true },
    { label: 'RECLAMO', value: 'reclamo', checked: false },
    { label: 'QUEJA', value: 'queja', checked: false },
    { label: 'CONSULTA / SUGERENCIA', value: 'consulta', checked: false }
  ];

  estadosProcesoOptions: FilterOption[] = [
    { label: 'Todos', value: 'todos', checked: true },
    { label: 'En Proceso', value: 'en_proceso', checked: false },
    { label: 'Conforme', value: 'conforme', checked: false },
    { label: 'No-Conforme', value: 'no_conforme', checked: false },
    { label: 'Pendiente', value: 'pendiente', checked: false },
    { label: 'Atendido', value: 'atendido', checked: false },
    { label: 'Vencido', value: 'vencido', checked: false },
    { label: 'Inválido', value: 'invalido', checked: false }
  ];

  searchTypeOptions = [
    { label: 'DNI del Reclamante', value: 'dni' },
    { label: 'Código de Reclamación', value: 'codigo' },
    { label: 'Nombre del Reclamante', value: 'nombre' }
  ];

  // MANTENER: Resultados originales para compatibilidad
  resultados: ResultadoBusqueda[] = [
    {
      codigo: '22286',
      tipo: 'RECLAMO',
      estado: 'Atendido',
      prioridad: 'Alta',
      campus: 'CHICLAYO',
      fecha: '14/07/2025',
      reclamante: 'Juan Pérez García'
    },
    {
      codigo: '22285',
      tipo: 'QUEJA',
      estado: 'Pendiente',
      prioridad: 'Media',
      campus: 'PIURA',
      fecha: '14/07/2025',
      reclamante: 'María Rodríguez López'
    },
    {
      codigo: '22284',
      tipo: 'RECLAMO',
      estado: 'En Proceso',
      prioridad: 'Media',
      campus: 'LIMA NORTE',
      fecha: '13/07/2025',
      reclamante: 'Carlos Mendoza Silva'
    }
  ];

  // AGREGAR: Datos completos para la tabla (basados en tu imagen)
  reclamacionesCompletas: ReclamacionCompleta[] = [
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
      fechaRegistro: '04/07/2025 23:15:33'
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
      fechaRegistro: '04/07/2025 21:10:56'
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
      fechaRegistro: '04/07/2025 18:46:59'
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
      fechaRegistro: '04/07/2025 17:15:15'
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
      fechaRegistro: '04/07/2025 13:33:58'
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
      fechaRegistro: '04/07/2025 11:32:39'
    },
    {
      codigo: '22183',
      usuario: 'DAMIAN HUAMAN MARICARMEN',
      nivel: 'Alumno',
      dni: '76801592',
      correo: 'ddamianhu28@ucvvirtual.edu.pe',
      tipo: 'QUEJA',
      estado: 'Atendido',
      prioridad: 'Media',
      campus: 'LIMA NORTE',
      fecha: '04/07/2025',
      fechaRegistro: '04/07/2025 10:21:49'
    }
  ];

  constructor(private fb: FormBuilder) {
    // MANTENER: Formularios existentes
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
    // MANTENER: Configuración inicial
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

    this.searchForm.patchValue({
      fechaRango: [thirtyDaysAgo, today]
    });

    // AGREGAR: Cargar datos iniciales para la tabla
    this.reclamaciones = [...this.reclamacionesCompletas];
  }

  // MANTENER: Métodos existentes
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.showResults = false;
  }

  onCampusChange(event: any): void {
    // El valor ya se actualiza automáticamente por formControlName
  }

  onTipoReclamacionChange(tipo: string): void {
    if (tipo === 'todos') {
      this.searchForm.patchValue({
        tipoTodos: true,
        tipoReclamo: false,
        tipoQueja: false,
        tipoConsulta: false
      });
    } else {
      this.searchForm.patchValue({
        tipoTodos: false
      });

      const tiposSeleccionados = [
        this.searchForm.get('tipoReclamo')?.value,
        this.searchForm.get('tipoQueja')?.value,
        this.searchForm.get('tipoConsulta')?.value
      ].filter(Boolean);

      if (tiposSeleccionados.length === 0) {
        this.searchForm.patchValue({ tipoTodos: true });
      }
    }
  }

  onEstadoProcesoChange(estado: string): void {
    if (estado === 'todos') {
      this.searchForm.patchValue({
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
      this.searchForm.patchValue({
        estadoTodos: false
      });

      const estadosSeleccionados = [
        this.searchForm.get('estadoEnProceso')?.value,
        this.searchForm.get('estadoConforme')?.value,
        this.searchForm.get('estadoNoConforme')?.value,
        this.searchForm.get('estadoPendiente')?.value,
        this.searchForm.get('estadoAtendido')?.value,
        this.searchForm.get('estadoVencido')?.value,
        this.searchForm.get('estadoInvalido')?.value
      ].filter(Boolean);

      if (estadosSeleccionados.length === 0) {
        this.searchForm.patchValue({ estadoTodos: true });
      }
    }
  }

  buscarReclamaciones(): void {
    if (this.activeTab === 'advanced') {
      const formData = this.searchForm.value;
      console.log('Búsqueda Avanzada:', formData);
      this.realizarBusqueda(formData);
    } else {
      if (this.quickSearchForm.valid) {
        const quickSearchData = this.quickSearchForm.value;
        console.log('Búsqueda Rápida:', quickSearchData);
        this.realizarBusqueda(quickSearchData);
      }
    }
  }

  realizarBusqueda(criterios: any): void {
    setTimeout(() => {
      // MODIFICADO: Cargar datos de ejemplo y mostrar resultados
      this.reclamaciones = [...this.reclamacionesCompletas];
      this.showResults = true;
    }, 500);
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
      this.quickSearchForm.reset({
        searchType: 'dni',
        searchValue: ''
      });
    }

    // MODIFICADO: Ocultar resultados y limpiar filtros
    this.showResults = false;
    this.searchTerm = '';
    this.selectedFilter = 'todos';
    this.selectedEstado = 'todos';
    this.selectedPrioridad = 'todos';
    // Limpiar los datos de la tabla
    this.reclamaciones = [];
  }

  // AGREGAR: Nuevo método para mostrar búsqueda inteligente
  nuevaBusqueda(): void {
    this.showResults = false;
    // Mantener los datos pero ocultar resultados para permitir nueva búsqueda
  }

  buscarAhora(): void {
    if (this.quickSearchForm.valid) {
      this.buscarReclamaciones();
    }
  }

  limpiar(): void {
    this.limpiarFiltros();
  }

  actualizarDatos(): void {
    console.log('Actualizando datos...');
    // MODIFICAR: Recargar datos de la tabla
    this.reclamaciones = [...this.reclamacionesCompletas];
  }

  exportarResultados(): void {
    console.log('Exportando resultados...');
  }

  getPorcentaje(valor: number): number {
    return this.stats.total > 0 ? Math.round((valor / this.stats.total) * 100) : 0;
  }

  getPlaceholder(): string {
    const searchType = this.quickSearchForm.get('searchType')?.value;
    switch (searchType) {
      case 'dni':
        return 'Ej: 41630253';
      case 'codigo':
        return 'Ej: REC-2025-001';
      case 'nombre':
        return 'Ej: Juan Pérez';
      default:
        return '';
    }
  }

  getSearchLabel(): string {
    const searchType = this.quickSearchForm.get('searchType')?.value;
    switch (searchType) {
      case 'dni':
        return 'DNI';
      case 'codigo':
        return 'Código';
      case 'nombre':
        return 'Nombre';
      default:
        return '';
    }
  }

  getSearchIcon(searchType: string): string {
    switch (searchType) {
      case 'dni':
      case 'nombre':
        return 'pi pi-user';
      case 'codigo':
        return 'pi pi-tag';
      default:
        return 'pi pi-search';
    }
  }

  // MANTENER: Métodos de clases CSS originales
  estadoClass(estado: string): string {
    switch (estado) {
      case 'Atendido':
        return 'bg-green-100 text-green-800';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'En Proceso':
        return 'bg-blue-100 text-blue-800';
      case 'Conforme':
        return 'bg-green-100 text-green-800';
      case 'No-Conforme':
        return 'bg-red-100 text-red-800';
      case 'Vencido':
        return 'bg-red-100 text-red-800';
      case 'Inválido':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  prioridadClass(prioridad: string): string {
    switch (prioridad) {
      case 'Alta':
        return 'bg-red-100 text-red-800';
      case 'Media':
        return 'bg-yellow-100 text-yellow-800';
      case 'Baja':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // AGREGAR: Métodos necesarios para la tabla PrimeNG
  getFilteredReclamaciones(): ReclamacionCompleta[] {
    let filtered = [...this.reclamaciones];

    // Filtrar por término de búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(rec =>
        rec.codigo.toLowerCase().includes(term) ||
        rec.usuario.toLowerCase().includes(term) ||
        rec.dni.includes(term) ||
        rec.correo.toLowerCase().includes(term)
      );
    }

    // Filtrar por tipo
    if (this.selectedFilter !== 'todos') {
      filtered = filtered.filter(rec => rec.tipo.toLowerCase() === this.selectedFilter.toLowerCase());
    }

    // Filtrar por estado
    if (this.selectedEstado !== 'todos') {
      filtered = filtered.filter(rec => rec.estado.toLowerCase() === this.selectedEstado.toLowerCase());
    }

    // Filtrar por prioridad
    if (this.selectedPrioridad !== 'todos') {
      filtered = filtered.filter(rec => rec.prioridad.toLowerCase() === this.selectedPrioridad.toLowerCase());
    }

    return filtered;
  }

  // Métodos para las clases CSS de la tabla (similares pero optimizados)
  getEstadoClass(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'atendido':
      case 'conforme':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en proceso':
        return 'bg-blue-100 text-blue-800';
      case 'rechazado':
      case 'no-conforme':
      case 'vencido':
        return 'bg-red-100 text-red-800';
      case 'inválido':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getPrioridadClass(prioridad: string): string {
    switch (prioridad.toLowerCase()) {
      case 'alta':
      case 'urgente':
        return 'bg-red-100 text-red-800';
      case 'media':
        return 'bg-yellow-100 text-yellow-800';
      case 'baja':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // AGREGAR: Métodos de acción para la tabla
  verDetalles(reclamacion: ReclamacionCompleta): void {
    console.log('Ver detalles:', reclamacion);
    // Implementar lógica para mostrar modal con detalles
  }

  editarEstado(reclamacion: ReclamacionCompleta): void {
    console.log('Editar estado:', reclamacion);
    // Implementar lógica para cambiar estado
  }

  asignarResponsable(reclamacion: ReclamacionCompleta): void {
    console.log('Asignar responsable:', reclamacion);
    // Implementar lógica para asignar responsable
  }

  generarReporte(reclamacion: ReclamacionCompleta): void {
    console.log('Generar reporte:', reclamacion);
    // Implementar lógica para generar reporte PDF
  }

  mostrarOpciones(reclamacion: ReclamacionCompleta): void {
    console.log('Mostrar opciones:', reclamacion);
    // Implementar lógica para mostrar menú contextual
  }
}