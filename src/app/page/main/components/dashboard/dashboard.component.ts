
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-dashboard',
  imports: [SelectModule, CommonModule, FormsModule, ButtonModule, CardModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  @Output() periodoChanged = new EventEmitter<string>();
  @Output() exportar = new EventEmitter<void>();
  @Output() notificaciones = new EventEmitter<void>();
  @Output() configuracion = new EventEmitter<void>();
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

  public periodos = [
    { label: '30 días', value: '30' },
    { label: '90 días', value: '90' },
    { label: '6 meses', value: '180' },
    { label: '1 año', value: '365' }
  ];

  periodoSeleccionado = '30';

  onPeriodoChange(event: any): void {
    this.periodoChanged.emit(event.value);
  }

  onExportar(): void {
    this.exportar.emit();
  }
}
