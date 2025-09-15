import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, computed, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TimelineModule } from 'primeng/timeline';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';

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

export interface EventoSeguimiento {
  id: string;
  fecha: string; // ISO o dd/MM/yyyy HH:mm:ss (manejamos ambos)
  tipo: 'registro' | 'asignacion' | 'respuesta' | 'resolucion' | 'contacto' | 'escalamiento' | 'cierre';
  titulo: string;
  descripcion: string;
  responsable?: string;
  adjuntos?: string[];
}

export interface NuevoEvento {
  tipo: string;
  descripcion: string;
  responsable: string;
}

interface SelectOption {
  label: string;
  value: string;
}

type TipoMeta = {
  label: string;
  icon: string;
  markerBg: string;    // clases Tailwind para el fondo del marcador
  tagSeverity: 'success' | 'info' | 'warn' | 'danger' | 'contrast' | undefined;
};

@Component({
  selector: 'app-seguimiento',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    DialogModule,
    ButtonModule,
    SelectModule,
    ToastModule,
    TimelineModule,
    TagModule,
    TooltipModule,
    DividerModule
  ],
  templateUrl: './seguimiento.component.html',
  styleUrl: './seguimiento.component.scss',
  providers: [MessageService]
})
export class SeguimientoComponent implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() reclamacion: ReclamacionCompleta | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() eventoAgregado = new EventEmitter<EventoSeguimiento>();

  // === Presentación ===
  @Input() dialogWidth: string = '60rem';
  @Input() showHeader: boolean = true;
  @Input() maximizable: boolean = true;
  @Input() breakpoints: Record<string, string> = {
    '1400px': '70rem',
    '1200px': '80vw',
    '960px': '90vw',
    '640px': '95vw'
  };

  // === Datos ===
  timelineEventos: EventoSeguimiento[] = [];
  // Copia filtrada/ordenada que se muestra en UI
  eventosFiltrados: EventoSeguimiento[] = [];

  nuevoEvento: NuevoEvento = { tipo: '', descripcion: '', responsable: '' };

  // === Opciones ===
  tipoEventoOptions: SelectOption[] = [
    { label: 'Contacto con Usuario', value: 'contacto' },
    { label: 'Asignación de Responsable', value: 'asignacion' },
    { label: 'Respuesta Enviada', value: 'respuesta' },
    { label: 'Resolución Propuesta', value: 'resolucion' },
    { label: 'Escalamiento', value: 'escalamiento' },
    { label: 'Cierre de Caso', value: 'cierre' }
  ];

  // Filtro/orden
  filtroTipo: string | null = null;
  ordenAsc = true;

  // Opciones para el filtro (incluye "Todos")
  tipoEventoOptionsFiltro: SelectOption[] = [
    { label: 'Todos los tipos', value: null as unknown as string },
    { label: 'Registro', value: 'registro' },
    ...this.tipoEventoOptions
  ];

  // Meta por tipo (colores/íconos/etiquetas)
  private tipoMeta: Record<EventoSeguimiento['tipo'], TipoMeta> = {
    registro:     { label: 'Registro',     icon: 'pi pi-plus',         markerBg: 'bg-blue-600',    tagSeverity: 'info' },
    asignacion:   { label: 'Asignación',   icon: 'pi pi-user',         markerBg: 'bg-purple-600',  tagSeverity: 'contrast' },
    contacto:     { label: 'Contacto',     icon: 'pi pi-phone',        markerBg: 'bg-emerald-600', tagSeverity: 'success' },
    respuesta:    { label: 'Respuesta',    icon: 'pi pi-send',         markerBg: 'bg-amber-600',   tagSeverity: 'warn' },
    resolucion:   { label: 'Resolución',   icon: 'pi pi-check-circle', markerBg: 'bg-indigo-600',  tagSeverity: 'success' },
    escalamiento: { label: 'Escalamiento', icon: 'pi pi-arrow-up',     markerBg: 'bg-rose-600',    tagSeverity: 'danger' },
    cierre:       { label: 'Cierre',       icon: 'pi pi-lock',         markerBg: 'bg-slate-600',   tagSeverity: undefined }
  };

  // Resumen por tipo (chips superiores)
  get resumenTipos() {
    const counts: Record<string, number> = {};
    for (const ev of this.timelineEventos) counts[ev.tipo] = (counts[ev.tipo] || 0) + 1;
    const order: EventoSeguimiento['tipo'][] = ['registro','asignacion','contacto','respuesta','resolucion','escalamiento','cierre'];
    return order
      .filter(t => counts[t])
      .map(t => ({
        label: this.tipoMeta[t].label,
        severity: this.tipoMeta[t].tagSeverity,
        count: counts[t]
      }));
  }

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.cargarEventosSeguimiento();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['reclamacion'] && this.reclamacion) {
      this.cargarEventosSeguimiento();
    }
  }

  // === Carga de datos ===
  private cargarEventosSeguimiento() {
    if (!this.reclamacion) return;
    this.timelineEventos = this.generarEventosMock(this.reclamacion);
    this.aplicarFiltro(true);
  }

  private generarEventosMock(reclamacion: ReclamacionCompleta): EventoSeguimiento[] {
    const eventos: EventoSeguimiento[] = [];
    const fechaRegistro = this.parsearFecha(reclamacion.fechaRegistro);

    // Registro
    eventos.push({
      id: '1',
      fecha: reclamacion.fechaRegistro,
      tipo: 'registro',
      titulo: 'Reclamación Registrada',
      descripcion: `Se registró la ${reclamacion.tipo?.toLowerCase?.()} en el sistema. Usuario: ${reclamacion.usuario}`,
      responsable: 'Sistema Automático'
    });

    const diasDespues = this.calcularDiasTranscurridos(reclamacion.fechaRegistro);

    if (diasDespues >= 1) {
      eventos.push({
        id: '2',
        fecha: this.agregarDias(fechaRegistro, 1),
        tipo: 'asignacion',
        titulo: 'Asignación de Responsable',
        descripcion: 'El caso ha sido asignado al departamento correspondiente para su revisión.',
        responsable: 'Ana García - Coordinadora de Servicios'
      });
    }

    if (diasDespues >= 3 && ['en-proceso', 'atendido', 'conforme', 'no-conforme'].includes(reclamacion.estado)) {
      eventos.push({
        id: '3',
        fecha: this.agregarDias(fechaRegistro, 3),
        tipo: 'contacto',
        titulo: 'Contacto con Usuario',
        descripcion: 'Se estableció contacto telefónico con el usuario para obtener información adicional.',
        responsable: 'Carlos Mendoza - Especialista'
      });
    }

    if (diasDespues >= 5 && ['atendido', 'conforme', 'no-conforme'].includes(reclamacion.estado)) {
      eventos.push({
        id: '4',
        fecha: this.agregarDias(fechaRegistro, 5),
        tipo: 'respuesta',
        titulo: 'Respuesta Enviada',
        descripcion: 'Se envió respuesta formal al usuario con la propuesta de solución.',
        responsable: 'María Elena Vásquez - Supervisora',
        adjuntos: ['Respuesta_Formal.pdf', 'Documentos_Soporte.zip']
      });
    }

    if (['conforme', 'no-conforme'].includes(reclamacion.estado)) {
      const estadoTexto = reclamacion.estado === 'conforme' ? 'conforme' : 'no conforme';
      eventos.push({
        id: '5',
        fecha: this.agregarDias(fechaRegistro, 7),
        tipo: 'cierre',
        titulo: `Caso Cerrado - Cliente ${estadoTexto.charAt(0).toUpperCase() + estadoTexto.slice(1)}`,
        descripcion: `El usuario manifestó estar ${estadoTexto} con la solución proporcionada. Caso cerrado.`,
        responsable: 'Sistema de Seguimiento'
      });
    }

    return eventos.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  }

  // === Helpers de UI ===
  getTipoMeta(tipo: EventoSeguimiento['tipo']): TipoMeta {
    return this.tipoMeta[tipo] || { label: 'Evento', icon: 'pi pi-circle', markerBg: 'bg-slate-400', tagSeverity: undefined };
  }

  // Filtrar + Ordenar
  aplicarFiltro(skipSort = false) {
    const base = this.filtroTipo ? this.timelineEventos.filter(e => e.tipo === this.filtroTipo) : this.timelineEventos.slice();
    this.eventosFiltrados = skipSort ? base : this.ordenar(base, this.ordenAsc);
  }

  limpiarFiltro() {
    this.filtroTipo = null;
    this.aplicarFiltro();
  }

  toggleOrden() {
    this.ordenAsc = !this.ordenAsc;
    this.aplicarFiltro();
  }

  private ordenar(arr: EventoSeguimiento[], asc = true) {
    return arr.sort((a, b) => {
      const ta = new Date(a.fecha).getTime();
      const tb = new Date(b.fecha).getTime();
      return asc ? ta - tb : tb - ta;
    });
  }

  // === Gestión de nuevos eventos ===
  agregarEvento() {
    if (!this.esEventoValido()) {
      this.messageService.add({ severity: 'warn', summary: 'Datos Incompletos', detail: 'Por favor complete todos los campos requeridos' });
      return;
    }

    const nuevoEventoSeguimiento: EventoSeguimiento = {
      id: (this.timelineEventos.length + 1).toString(),
      fecha: new Date().toISOString(),
      tipo: this.nuevoEvento.tipo as any,
      titulo: this.getTituloEvento(this.nuevoEvento.tipo),
      descripcion: this.nuevoEvento.descripcion,
      responsable: this.nuevoEvento.responsable
    };

    this.timelineEventos.push(nuevoEventoSeguimiento);
    this.timelineEventos = this.ordenar(this.timelineEventos, true);
    this.aplicarFiltro();

    this.messageService.add({ severity: 'success', summary: 'Evento Agregado', detail: 'El evento de seguimiento ha sido registrado correctamente' });

    this.eventoAgregado.emit(nuevoEventoSeguimiento);
    this.limpiarNuevoEvento();
  }

  esEventoValido(): boolean {
    return !!(this.nuevoEvento.tipo && this.nuevoEvento.descripcion?.trim() && this.nuevoEvento.responsable?.trim());
  }

  limpiarNuevoEvento() {
    this.nuevoEvento = { tipo: '', descripcion: '', responsable: '' };
  }

  private getTituloEvento(tipo: string): string {
    const titulos: Record<string, string> = {
      'contacto': 'Contacto con Usuario',
      'asignacion': 'Asignación de Responsable',
      'respuesta': 'Respuesta Enviada',
      'resolucion': 'Resolución Propuesta',
      'escalamiento': 'Caso Escalado',
      'cierre': 'Cierre de Caso'
    };
    return titulos[tipo] || 'Evento de Seguimiento';
  }

  // === Métodos de formateo y estilos ===
  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'pendiente': 'Pendiente',
      'en-proceso': 'En Proceso',
      'atendido': 'Atendido',
      'conforme': 'Conforme',
      'no-conforme': 'No Conforme',
      'vencido': 'Vencido',
      'invalido': 'Inválido'
    };
    return labels[estado] || estado;
  }

  getTipoBadgeClass(tipo: string): string {
    const baseClass = 'px-2 py-1 text-xs font-medium rounded-full badge ';
    switch (tipo) {
      case 'RECLAMO':  return baseClass + 'bg-red-100 text-red-800';
      case 'QUEJA':    return baseClass + 'bg-orange-100 text-orange-800';
      case 'CONSULTA': return baseClass + 'bg-blue-100 text-blue-800';
      default:         return baseClass + 'bg-gray-100 text-gray-800';
    }
  }

  getEstadoBadgeClass(estado: string): string {
    const baseClass = 'px-2 py-1 text-xs font-medium rounded-full badge ';
    switch (estado) {
      case 'pendiente':   return baseClass + 'bg-yellow-100 text-yellow-800';
      case 'en-proceso':  return baseClass + 'bg-blue-100 text-blue-800';
      case 'atendido':    return baseClass + 'bg-green-100 text-green-800';
      case 'conforme':    return baseClass + 'bg-emerald-100 text-emerald-800';
      case 'no-conforme': return baseClass + 'bg-red-100 text-red-800';
      case 'vencido':     return baseClass + 'bg-gray-100 text-gray-800';
      case 'invalido':    return baseClass + 'bg-slate-100 text-slate-800';
      default:            return baseClass + 'bg-gray-100 text-gray-800';
    }
  }

  getCampusLabel(campus: string): string {
    return campus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // === Utilidades de fecha ===
  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    try {
      const [datePart, timePart] = fecha.split(' ');
      const [day, month, year] = datePart.split('/');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) + (timePart ? ` ${timePart.substring(0, 5)}` : '');
    } catch {
      return fecha;
    }
  }

  formatearFechaEvento(fecha: string): string {
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return this.formatearFecha(fecha);
    }
  }

  private parsearFecha(fechaTexto: string): Date {
    const [fecha, hora] = (fechaTexto || '').split(' ');
    const [dia, mes, año] = (fecha || '').split('/');
    const [horas, minutos, segundos] = (hora || '00:00:00').split(':');
    return new Date(
      parseInt(año || '0'),
      parseInt(mes || '1') - 1,
      parseInt(dia || '1'),
      parseInt(horas || '0'),
      parseInt(minutos || '0'),
      parseInt(segundos || '0')
    );
  }

  private agregarDias(fecha: Date, dias: number): string {
    const nuevaFecha = new Date(fecha);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    return nuevaFecha.toISOString();
  }

  private calcularDiasTranscurridos(fechaRegistro: string): number {
    const fechaReg = this.parsearFecha(fechaRegistro);
    const fechaActual = new Date();
    const diferenciaTiempo = fechaActual.getTime() - fechaReg.getTime();
    return Math.floor(diferenciaTiempo / (1000 * 3600 * 24));
  }

  // === Acciones ===
  generarReporte() {
    this.messageService.add({
      severity: 'info',
      summary: 'Generando Reporte',
      detail: 'El reporte de seguimiento se está preparando...'
    });

    setTimeout(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Reporte Generado',
        detail: `Reporte de seguimiento para ${this.reclamacion?.codigo} generado correctamente`
      });
    }, 1200);
  }

  onHide() {
    this.limpiarNuevoEvento();
    this.close.emit();
  }
}
