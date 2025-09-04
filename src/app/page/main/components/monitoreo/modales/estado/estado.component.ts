import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { EditorModule } from 'primeng/editor';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface ReclamacionRef {
  codigo: string;
  estado: string;
  servicio?: string;
  fechaRegistro?: string | Date;
}

@Component({
  selector: 'app-estado',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    DialogModule,
    ButtonModule,
    TextareaModule,
    DatePickerModule,
    EditorModule
  ],
  templateUrl: './estado.component.html',
  styleUrl: './estado.component.scss'
})
export class EstadoComponent implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() reclamacion: ReclamacionRef | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<{ comentario: string; fechaRegistro: Date | null }>();

  // === Presentación (mismo patrón que el otro modal) ===
  @Input() dialogWidth: string = '36rem';
  @Input() showHeader: boolean = true;
  @Input() maximizable: boolean = true;
  @Input() breakpoints: Record<string, string> = {
    '1400px': '48rem',
    '1200px': '60vw',
    '960px':  '80vw',
    '640px':  '95vw'
  };

  comentario = '';
  fechaRegistro: Date | null = null;

  constructor(private sanitizer: DomSanitizer) {}

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

    if (this.reclamacion?.fechaRegistro) {
      if (typeof this.reclamacion.fechaRegistro === 'string') {
        this.fechaRegistro = this.parseStringToDate(this.reclamacion.fechaRegistro);
      } else {
        this.fechaRegistro = this.reclamacion.fechaRegistro;
      }
    } else {
      this.fechaRegistro = new Date();
    }
  }

  private parseStringToDate(dateString: string): Date {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(dateString);
  }

  limpiarComentario() {
    this.comentario = '';
  }

  confirmIfValid() {
    if (!this.fechaRegistro) this.fechaRegistro = new Date();

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

  // === Utils para saber si el editor está realmente vacío ===
  isComentarioVacio(): boolean {
    const plain = this.stripHtml(this.comentario || '');
    return plain.trim().length === 0;
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .trim();
  }

  // === Método para obtener HTML sanitizado para la vista previa ===
  getSafePreviewHtml(): SafeHtml {
    if (!this.comentario) return '';
    return this.sanitizer.bypassSecurityTrustHtml(this.comentario);
  }

  // === Método para obtener texto plano para la vista previa alternativa ===
  getPlainTextPreview(): string {
    if (!this.comentario) return '';
    return this.stripHtml(this.comentario);
  }
}