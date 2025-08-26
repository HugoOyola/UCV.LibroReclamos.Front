import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

export interface KpiData {
  totalReclamaciones: number;
  pendientes: number;
  resueltas: number;
  tiempoPromedio: number;
  porcentajePendientes: number;
  porcentajeResueltas: number;
  variacionMensual: number;
}

export interface TipoData {
  tipo: string;
  cantidad: number;
  porcentaje: number;
  color: string;
}

export interface CampusData {
  nombre: string;
  cantidad: number;
  porcentaje: number;
}

export interface AccesoRapido {
  label: string;
  icono: string;
  ruta: string; // Ruta para navegación
}

@Component({
  selector: 'app-dashboard',
  imports: [SelectModule, CommonModule, FormsModule, ButtonModule, CardModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  @Output() periodoChanged = new EventEmitter<string>();
  @Output() exportar = new EventEmitter<void>();
  @Input() data: KpiData = {
    totalReclamaciones: 2847,
    pendientes: 156,
    resueltas: 2691,
    tiempoPromedio: 1.8,
    porcentajePendientes: 5.5,
    porcentajeResueltas: 94.5,
    variacionMensual: 6.5
  };
  @Input() tiposData: TipoData[] = [
    { tipo: 'RECLAMO', cantidad: 1587, porcentaje: 55.7, color: '#ef4444' },
    { tipo: 'QUEJA', cantidad: 824, porcentaje: 28.9, color: '#6b7280' },
    { tipo: 'CONSULTA / SUGERENCIA', cantidad: 436, porcentaje: 15.3, color: '#3b82f6' }
  ];
  @Input() campusData: CampusData[] = [
    { nombre: 'UCV CAMPUS LIMA NORTE', cantidad: 189, porcentaje: 6.6 },
    { nombre: 'UCV CAMPUS TRUJILLO', cantidad: 156, porcentaje: 5.5 },
    { nombre: 'UCV CAMPUS CHICLAYO', cantidad: 134, porcentaje: 4.7 },
    { nombre: 'UCV CAMPUS PIURA', cantidad: 89, porcentaje: 3.1 },
    { nombre: 'UCV CAMPUS CHEPEN', cantidad: 45, porcentaje: 1.6 },
    { nombre: 'UCV CAMPUS MOYOBAMBA', cantidad: 27, porcentaje: 0.9 }
  ];

  reclamacionesRecientes = [
    { codigo: 22286, tipo: 'RECLAMO', estado: 'Atendido', prioridad: 'Alta', campus: 'CHICLAYO', fecha: '14/07/2025' },
    { codigo: 22285, tipo: 'QUEJA', estado: 'Pendiente', prioridad: 'Media', campus: 'PIURA', fecha: '14/07/2025' },
    { codigo: 22284, tipo: 'RECLAMO', estado: 'En Proceso', prioridad: 'Media', campus: 'CALLAO', fecha: '14/07/2025' },
  ];

  accesosRapidos: AccesoRapido[] = [
    { label: 'Monitoreo de Reclamaciones', icono: 'pi pi-search', ruta: '/monitoreo' },
    { label: 'Reportes', icono: 'pi pi-chart-bar', ruta: '/reportes' },
    { label: 'Gestión de Usuarios', icono: 'pi pi-users', ruta: '/usuarios' },
    { label: 'Configuración', icono: 'pi pi-cog', ruta: '/configuracion' },
    { label: 'Reportar a Indecopi', icono: 'pi pi-check-circle', ruta: '/indecopi' },
  ];

  periodos = [
    { label: '30 días', value: '30' },
    { label: '90 días', value: '90' },
    { label: '6 meses', value: '180' },
    { label: '1 año', value: '365' }
  ];

  indicadores = {
    satisfaccion: 94.2,
    resolucion: 92.8,
    pendientes: 7.2
  };

  periodoSeleccionado = '30';

  constructor(private router: Router) {}

  onPeriodoChange(event: any): void {
    this.periodoChanged.emit(event.value);
  }

  onExportar(): void {
    this.exportar.emit();
  }

  onAccesoRapidoClick(acceso: AccesoRapido): void {
    // Navegar a la ruta especificada
    this.router.navigate([acceso.ruta]);
  }

  estadoClass(estado: string) {
    switch (estado) {
      case 'Atendido': return 'bg-green-100 text-green-800';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'En Proceso': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  prioridadClass(prioridad: string) {
    switch (prioridad) {
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Media': return 'bg-yellow-100 text-yellow-800';
      case 'Baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  get totalSolicitudesPorTipo(): number {
    return this.tiposData?.reduce((acc, curr) => acc + curr.cantidad, 0) || 0;
  }

  get totalReclamacionesPorCampus(): number {
    return this.campusData?.reduce((sum, campus) => sum + campus.cantidad, 0) ?? 0;
  }
}