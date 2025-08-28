import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';

export interface ResponsableOption {
  id: string;
  nombre: string;
  cargo: string;
  departamento: string;
  casosActivos?: number;
}

export interface ReclamacionRef {
  codigo: string;
  usuario: string;
}

@Component({
  selector: 'app-responsable',
  imports: [FormsModule, CommonModule, DialogModule, SelectModule, ButtonModule, TextareaModule],
  templateUrl: './responsable.component.html',
  styleUrl: './responsable.component.scss'
})
export class ResponsableComponent {
  @Input() visible = false;
  @Input() reclamacion: ReclamacionRef | null = null;
  @Input() responsables: ResponsableOption[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<{ responsableId: string; comentario: string }>();

  responsableId = '';
  comentario = '';

  responsableSel = computed(() =>
    this.responsables.find(r => r.id === this.responsableId)
  );

  confirmIfValid() {
    if (!this.responsableId) return;
    this.confirm.emit({ responsableId: this.responsableId, comentario: this.comentario });
  }
}
