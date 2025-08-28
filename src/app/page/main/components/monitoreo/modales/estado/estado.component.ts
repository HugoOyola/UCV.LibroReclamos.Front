import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';

export interface EstadoOption {
  valor: string;
  label: string;
  descripcion: string;
}

export interface ReclamacionRef {
  codigo: string;
  estado: string;
}

@Component({
  selector: 'app-estado',
  imports: [FormsModule, CommonModule, DialogModule, RadioButtonModule, ButtonModule, TextareaModule],
  templateUrl: './estado.component.html',
  styleUrl: './estado.component.scss'
})
export class EstadoComponent {
  @Input() visible = false;
  @Input() reclamacion: ReclamacionRef | null = null;
  @Input() estados: EstadoOption[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<{ nuevoEstado: string; comentario: string }>();

  nuevoEstado = '';
  comentario = '';

  confirmIfValid() {
    if (!this.nuevoEstado) return;
    this.confirm.emit({ nuevoEstado: this.nuevoEstado, comentario: this.comentario });
  }
}
