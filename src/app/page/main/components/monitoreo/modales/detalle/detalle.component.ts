import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

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
  fechaRegistro: string;
  responsable?: string;
  descripcion?: string;
  categoria?: string;
  subcategoria?: string;
  telefono?: string;
  direccion?: string;
  padreApoderado?: string;
  detalleReclamo?: string;
  pedido?: string;
  monto?: number;
  bien?: string;
}

@Component({
  selector: 'app-detalle',
  standalone: true,               // ✅ necesario si usas `imports`
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    ToastModule
  ],
  templateUrl: './detalle.component.html',
  styleUrl: './detalle.component.scss',
  providers: [MessageService]
})
export class DetalleComponent {
  @Input() visible = false;
  @Input() reclamacion: ReclamacionCompleta | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() correoEnviado = new EventEmitter<ReclamacionCompleta>();

  // === Presentación ===
  @Input() dialogWidth: string = '56rem';        // controla ancho desde el padre
  @Input() showHeader: boolean = true;           // ver/ocultar header
  @Input() maximizable: boolean = true;          // botón maximizar
  @Input() breakpoints: Record<string, string> = {
    '1400px': '60rem',
    '1200px': '70vw',
    '960px':  '85vw',
    '640px':  '95vw'
  };

  enviandoCorreo = false;

  // Opciones
  campusOptions = [
    { label: 'UCV CAMPUS TRUJILLO', value: 'UCV CAMPUS TRUJILLO' },
    { label: 'UCV CAMPUS LIMA', value: 'UCV CAMPUS LIMA' },
    { label: 'UCV CAMPUS CHICLAYO', value: 'UCV CAMPUS CHICLAYO' },
    { label: 'UCV CAMPUS PIURA', value: 'UCV CAMPUS PIURA' }
  ];

  clasificacionOptions = [
    { label: 'SIN CLASIFICACIÓN', value: 'SIN CLASIFICACIÓN' },
    { label: 'ACADÉMICO', value: 'ACADÉMICO' },
    { label: 'ADMINISTRATIVO', value: 'ADMINISTRATIVO' },
    { label: 'FINANCIERO', value: 'FINANCIERO' },
    { label: 'SERVICIOS', value: 'SERVICIOS' }
  ];

  unidadOptions = [
    { label: 'Asignar unidad :', value: '' },
    { label: 'Escuela de Idiomas', value: 'Escuela de Idiomas' },
    { label: 'Escuela de Psicología', value: 'Escuela de Psicología' },
    { label: 'Secretaría Académica', value: 'Secretaría Académica' },
    { label: 'Área Administrativa', value: 'Área Administrativa' },
    { label: 'Dirección de Carrera', value: 'Dirección de Carrera' }
  ];

  constructor(private messageService: MessageService) {}

  async enviarCorreo() {
    if (!this.reclamacion) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No hay información de reclamación para enviar'
      });
      return;
    }

    this.enviandoCorreo = true;

    try {
      await this.simularEnvioCorreo();
      this.messageService.add({
        severity: 'success',
        summary: 'Correo Enviado',
        detail: `Se ha enviado la notificación de la reclamación ${this.reclamacion.codigo} al correo ${this.reclamacion.correo}`
      });
      this.correoEnviado.emit(this.reclamacion);
    } catch (error) {
      console.error('Error al enviar correo:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo enviar el correo. Inténtalo nuevamente.'
      });
    } finally {
      this.enviandoCorreo = false;
    }
  }

  private simularEnvioCorreo(): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const success = Math.random() > 0.1;
        success ? resolve() : reject(new Error('Error simulado'));
      }, 2000);
    });
  }

  private async enviarCorreoReal() {
    if (!this.reclamacion) return;
    const emailData = {
      to: this.reclamacion.correo,
      subject: `Reclamación ${this.reclamacion.codigo} - Notificación`,
      template: 'reclamacion-detalle',
      data: {
        codigo: this.reclamacion.codigo,
        usuario: this.reclamacion.usuario,
        tipo: this.reclamacion.tipo,
        estado: this.reclamacion.estado,
        fechaRegistro: this.reclamacion.fechaRegistro,
        detalleReclamo: this.reclamacion.detalleReclamo,
        campus: this.reclamacion.campus
      }
    };
    // return this.emailService.enviarCorreo(emailData);
  }
}
