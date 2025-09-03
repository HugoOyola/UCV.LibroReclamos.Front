import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';

export interface EstadoOption {
  valor: string;
  label: string;
  descripcion: string;
}

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
    RadioButtonModule,
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
  @Input() estados: EstadoOption[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<{
    nuevoEstado: string;
    comentario: string;
    fechaRegistro: Date | null;
  }>();

  nuevoEstado = '';
  comentario = '';
  fechaRegistro: Date | null = null;
  mostrarErrorEstado = false;

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['reclamacion'] && this.reclamacion) {
      this.initializeForm();
    }

    if (changes['visible'] && this.visible) {
      this.mostrarErrorEstado = false;
    }
  }

  private initializeForm() {
    this.nuevoEstado = '';
    this.comentario = '';
    this.mostrarErrorEstado = false;

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
    this.mostrarErrorEstado = false;

    if (!this.nuevoEstado) {
      this.mostrarErrorEstado = true;
      return;
    }

    if (!this.fechaRegistro) {
      this.fechaRegistro = new Date();
    }

    this.confirm.emit({
      nuevoEstado: this.nuevoEstado,
      comentario: this.comentario,
      fechaRegistro: this.fechaRegistro
    });

    this.resetForm();
  }

  private resetForm() {
    this.nuevoEstado = '';
    this.comentario = '';
    this.fechaRegistro = null;
    this.mostrarErrorEstado = false;
  }

  onHide() {
    this.resetForm();
    this.close.emit();
  }
}