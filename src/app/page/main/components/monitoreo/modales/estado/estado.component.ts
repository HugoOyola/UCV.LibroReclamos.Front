import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';

export interface ReclamacionRef {
  codigo: string;
  estado: string;
  servicio?: string;
  fechaRegistro?: string | Date;
}

@Component({
  selector: 'app-estado',
  imports: [
    FormsModule,
    CommonModule,
    DialogModule,
    ButtonModule,
    TextareaModule,
    DatePickerModule
  ],
  templateUrl: './estado.component.html',
  styleUrl: './estado.component.scss'
})
export class EstadoComponent implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() reclamacion: ReclamacionRef | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<{
    comentario: string;
    fechaRegistro: Date | null;
  }>();

  comentario = '';
  fechaRegistro: Date | null = null;

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['reclamacion'] && this.reclamacion) {
      this.initializeForm();
    }
  }

  private initializeForm() {
    this.comentario = '';

    // Convertir fecha de string a Date si es necesario
    if (this.reclamacion?.fechaRegistro) {
      if (typeof this.reclamacion.fechaRegistro === 'string') {
        this.fechaRegistro = this.parseStringToDate(this.reclamacion.fechaRegistro);
      } else {
        this.fechaRegistro = this.reclamacion.fechaRegistro;
      }
    } else {
      this.fechaRegistro = new Date(); // Fecha actual por defecto
    }
  }

  private parseStringToDate(dateString: string): Date {
    // Asumiendo formato dd/mm/yyyy o similar
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Los meses en JS van de 0-11
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(dateString);
  }

  limpiarComentario() {
    this.comentario = '';
  }

  confirmIfValid() {
    if (!this.fechaRegistro) {
      this.fechaRegistro = new Date();
    }

    this.confirm.emit({
      comentario: this.comentario,
      fechaRegistro: this.fechaRegistro
    });

    this.resetForm();
  }

  private resetForm() {
    this.comentario = '';
    this.fechaRegistro = null;
  }

  onHide() {
    this.resetForm();
    this.close.emit();
  }
}