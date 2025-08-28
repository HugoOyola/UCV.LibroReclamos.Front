import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

export interface ReclamacionCompleta {
  codigo: string;
  usuario: string;
  nivel: string;
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
@Component({
  selector: 'app-detalle',
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './detalle.component.html',
  styleUrl: './detalle.component.scss'
})
export class DetalleComponent {
  @Input() visible = false;
  @Input() reclamacion: ReclamacionCompleta | null = null;
  @Output() close = new EventEmitter<void>();
}
