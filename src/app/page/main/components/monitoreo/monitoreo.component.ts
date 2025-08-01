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
    DatePickerModule
  ],
  templateUrl: './monitoreo.component.html',
  styleUrl: './monitoreo.component.scss'
})
export class MonitoreoComponent implements OnInit {
  activeTab: string = 'advanced';
  searchForm: FormGroup;
  quickSearchForm: FormGroup;
  showResults: boolean = false;

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

  // Resultados de ejemplo
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

  constructor(private fb: FormBuilder) {
    // Formulario de búsqueda avanzada
    this.searchForm = this.fb.group({
      campus: ['todos'],
      fechaRango: [null], // Cambiar a rango de fechas
      // Agregar controles para los checkboxes
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

    // Formulario de búsqueda rápida
    this.quickSearchForm = this.fb.group({
      searchType: ['dni'],
      searchValue: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Establecer rango de fechas por defecto
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

    this.searchForm.patchValue({
      fechaRango: [thirtyDaysAgo, today]
    });
  }

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

      // Verificar si no hay ningún tipo seleccionado
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

      // Verificar si no hay ningún estado seleccionado
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
      // Búsqueda Avanzada
      const formData = this.searchForm.value;
      console.log('Búsqueda Avanzada:', formData);
      this.realizarBusqueda(formData);
    } else {
      // Búsqueda Rápida
      if (this.quickSearchForm.valid) {
        const quickSearchData = this.quickSearchForm.value;
        console.log('Búsqueda Rápida:', quickSearchData);
        this.realizarBusqueda(quickSearchData);
      }
    }
  }

  realizarBusqueda(criterios: any): void {
    // Simular llamada a servicio
    setTimeout(() => {
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

    this.showResults = false;
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
}