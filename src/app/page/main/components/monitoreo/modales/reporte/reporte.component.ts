import { Component, EventEmitter, Input, Output, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonModule } from 'primeng/button';

export interface TipoReporte {
  valor: string;
  label: string;
  descripcion: string;
  icono: string;
}

export interface ReclamacionRef {
  codigo: string;
}

@Component({
  selector: 'app-reporte',
  imports: [FormsModule, CommonModule, DialogModule, RadioButtonModule, ButtonModule],
  templateUrl: './reporte.component.html',
  styleUrl: './reporte.component.scss'
})
export class ReporteComponent {
  @Input() visible = false;
  @Input() reclamacion: ReclamacionRef | null = null;
  @Input() tipos: TipoReporte[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<{ tipo: string }>();

  tipo = '';

  private tamaños: Record<string, string> = {
    completo: '250',
    resumen: '85',
    seguimiento: '120'
  };

  tamanoEstimado = computed(() => this.tamaños[this.tipo] ?? '100');

  confirmIfValid() {
    if (!this.tipo) return;
    this.confirm.emit({ tipo: this.tipo });
  }
}
