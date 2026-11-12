import { useState, useEffect } from 'react';
import {
  Calendar, Clock, User, ShieldCheck, Activity,
  Stethoscope, AlertTriangle, CheckCircle, Database,
  Server, Cpu, ArrowRight, LogIn, Send, BookOpen, ExternalLink,
  RefreshCw, X
} from 'lucide-react';
import './App.css';

/* ==========================================================================
   Piezas visuales (sin estado ni lógica de negocio)
   ========================================================================== */

// Marca: anillo de reloj + pulso cardíaco que se lee como una cordillera
function BrandMark({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="6" fill="rgb(var(--action))" />
      <circle cx="32" cy="32" r="21" stroke="rgb(var(--surface-elevated))" strokeWidth="3" />
      <path
        d="M13 34h11l5-13 7 22 5-13h10"
        stroke="rgb(var(--accent-night))"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Etiqueta editorial: número de sección + filete + texto
function Eyebrow({ index, children }) {
  return (
    <p className="eyebrow">
      <span className="eyebrow-index" aria-hidden="true">{index}</span>
      <span className="eyebrow-rule" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

// Una capa de la pila arquitectónica del modal
const LAYER_TONES = {
  accent: { text: 'text-accent-glow', ring: 'border-accent-glow' },
  warn: { text: 'text-status-warn-night', ring: 'border-status-warn-night' },
  ok: { text: 'text-status-ok-night', ring: 'border-status-ok-night' },
};

function ArchLayer({ index, tone, title, last = false, children }) {
  const t = LAYER_TONES[tone];
  return (
    <li className="relative grid grid-cols-[1.875rem_1fr] gap-4 pb-6 last:pb-0">
      {!last && <span aria-hidden="true" className="absolute bottom-0 left-[0.9375rem] top-[2.125rem] w-px bg-tactile-night" />}
      <span
        aria-hidden="true"
        className={`flex h-[1.875rem] w-[1.875rem] items-center justify-center rounded-full border bg-surface-night font-mono text-[0.6875rem] font-semibold ${t.text} ${t.ring}`}
      >
        {index}
      </span>
      <div className="rounded-sm border border-tactile-night bg-surface-night-raised p-4">
        <span className={`mb-1 block font-mono text-label uppercase ${t.text}`}>{title}</span>
        <span className="text-[0.9375rem] leading-relaxed text-ink-inverse">{children}</span>
      </div>
    </li>
  );
}

// Geometría de la escena del héroe (puntos de cada cordillera)
const FAR_RIDGE = [[0, 470], [40, 430], [90, 452], [150, 392], [205, 428], [260, 372], [330, 430], [392, 388], [450, 432], [520, 380], [570, 412], [600, 400]];
const MID_RIDGE = [[0, 540], [60, 500], [120, 530], [190, 462], [250, 520], [310, 478], [380, 536], [450, 490], [520, 540], [600, 500]];
const NEAR_RIDGE = [[0, 650], [70, 608], [140, 636], [220, 584], [300, 634], [370, 598], [450, 648], [530, 604], [600, 634]];

const polyline = (pts, dy = 0) => pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y + dy}`).join(' ');
const polygon = (pts) => `${polyline(pts)} L600 900 L0 900 Z`;

const DIAL_TICKS = Array.from({ length: 60 }, (_, i) => {
  const major = i % 5 === 0;
  const a = (i * 6 * Math.PI) / 180;
  const r1 = major ? 104 : 112;
  const r2 = 124;
  return {
    i,
    major,
    x1: (390 + r1 * Math.cos(a)).toFixed(2),
    y1: (290 + r1 * Math.sin(a)).toFixed(2),
    x2: (390 + r2 * Math.cos(a)).toFixed(2),
    y2: (290 + r2 * Math.sin(a)).toFixed(2),
  };
});

// Escena atmosférica: un reloj-sol, cordilleras en capas y una ruta con paradas
function HeroScene() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 600 760"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="scene-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0C1815" />
          <stop offset="0.55" stopColor="#173029" />
          <stop offset="1" stopColor="#2B4B41" />
        </linearGradient>
        <radialGradient id="scene-glow" cx="390" cy="290" r="210" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#E39A6B" stopOpacity="0.5" />
          <stop offset="0.5" stopColor="#E39A6B" stopOpacity="0.12" />
          <stop offset="1" stopColor="#E39A6B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="scene-mist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#EEE8D8" stopOpacity="0" />
          <stop offset="0.5" stopColor="#EEE8D8" stopOpacity="0.13" />
          <stop offset="1" stopColor="#EEE8D8" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="600" height="760" fill="url(#scene-sky)" />
      <circle cx="390" cy="290" r="210" fill="url(#scene-glow)" />

      {/* Capa 0 — el reloj-sol (la más lejana) */}
      <g className="scene-parallax" style={{ '--shift': '110px' }}>
        <g className="scene-layer" style={{ '--d': '0ms' }}>
          <circle cx="390" cy="290" r="92" fill="#E39A6B" fillOpacity="0.14" stroke="#E39A6B" strokeOpacity="0.55" strokeWidth="1.5" />
          <circle cx="390" cy="290" r="140" fill="none" stroke="#EEE8D8" strokeOpacity="0.14" strokeWidth="1" />
          <g className="scene-dial" stroke="#EEE8D8" strokeLinecap="round">
            {DIAL_TICKS.map((t) => (
              <line
                key={t.i}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                strokeWidth={t.major ? 1.8 : 0.9}
                strokeOpacity={t.major ? 0.6 : 0.3}
              />
            ))}
          </g>
          {/* Las 9:00 — la hora por defecto de la reserva */}
          <g stroke="#EEE8D8" strokeWidth="2.5" strokeLinecap="round">
            <line x1="390" y1="290" x2="342" y2="290" />
            <line x1="390" y1="290" x2="390" y2="214" />
          </g>
          <circle cx="390" cy="290" r="4.5" fill="#E39A6B" />
        </g>
      </g>

      {/* Capa 1 — cordillera lejana */}
      <g className="scene-parallax" style={{ '--shift': '90px' }}>
        <g className="scene-layer" style={{ '--d': '180ms' }}>
          <path d={polygon(FAR_RIDGE)} fill="#2F5248" />
          <path
            d="M150 392 L132 470 M260 372 L236 470 M260 372 L300 470 M392 388 L372 470 M392 388 L430 470 M520 380 L496 470"
            stroke="#EEE8D8"
            strokeOpacity="0.12"
            strokeWidth="1"
          />
        </g>
      </g>

      <rect className="scene-mist" x="-120" y="404" width="840" height="110" fill="url(#scene-mist)" />

      {/* Capa 2 — cordillera media con curvas de nivel */}
      <g className="scene-parallax" style={{ '--shift': '55px' }}>
        <g className="scene-layer" style={{ '--d': '380ms' }}>
          <path d={polygon(MID_RIDGE)} fill="#1F3D35" />
          <path
            d="M190 462 L170 560 M190 462 L226 560 M310 478 L290 570 M310 478 L340 570 M450 490 L430 580 M60 500 L90 580"
            stroke="#EEE8D8"
            strokeOpacity="0.1"
            strokeWidth="1"
          />
          {[22, 46, 72].map((dy, n) => (
            <path
              key={dy}
              d={polyline(MID_RIDGE, dy)}
              stroke="#EEE8D8"
              strokeOpacity={0.16 - n * 0.04}
              strokeWidth="1"
              fill="none"
            />
          ))}
        </g>
      </g>

      <rect className="scene-mist scene-mist--b" x="-120" y="520" width="840" height="90" fill="url(#scene-mist)" />

      {/* Capa 3 — primer plano, ruta y paradas */}
      <g className="scene-parallax" style={{ '--shift': '20px' }}>
        <g className="scene-layer" style={{ '--d': '560ms' }}>
          <path d={polygon(NEAR_RIDGE)} fill="#0F211B" />
          <path
            className="scene-route"
            d="M96 752 C150 704 250 708 244 652 S326 612 310 568 S384 532 374 488"
            stroke="#E39A6B"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
          {[[244, 652, '0ms'], [310, 568, '700ms'], [374, 488, '1400ms']].map(([cx, cy, d]) => (
            <g key={`${cx}-${cy}`}>
              <circle className="scene-ping" style={{ '--d': d }} cx={cx} cy={cy} r="5" fill="#E39A6B" />
              <circle cx={cx} cy={cy} r="4.5" fill="#0C1815" stroke="#E39A6B" strokeWidth="1.8" />
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}

// Contenido de la franja de capacidades (solo presentación)
const FEATURES = [
  {
    n: '01',
    Icon: ShieldCheck,
    title: 'Idempotencia Garantizada',
    text: 'Evita duplicados y bloqueos de mensajes en RabbitMQ usando identificadores únicos validados en memoria.',
  },
  {
    n: '02',
    Icon: Activity,
    title: 'Semáforo de Riesgo (No-Show)',
    text: 'FastAPI procesa variables históricas en vivo mediante la ruta /risk/calculate para anticipar inasistencias.',
  },
  {
    n: '03',
    Icon: Server,
    title: 'Asincronismo con RabbitMQ',
    text: 'Desacople completo entre el registro de citas y el procesamiento de recordatorios en colas resilientes.',
  },
];

// Horarios sugeridos del consultorio (formato idéntico al del campo Hora)
const TIME_SLOTS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
];

const normalizeTime = (value) => value.trim().toUpperCase();

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [userRole, setUserRole] = useState(null);
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [showArchitectureModal, setShowArchitectureModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loadingRisk, setLoadingRisk] = useState(false);

  const docsUrl = "https://el-eden-riwi.github.io/clinicared-docs/";

  const [bookingData, setBookingData] = useState({
    patientName: '',
    specialty: 'Medicina General',
    doctor: 'Dra. Elena Gómez',
    date: '2026-11-15',
    time: '09:00 AM'
  });

  // Pacientes de la agenda con sus variables de historial médico
  const [patientsRisk, setPatientsRisk] = useState([
    { id: 1, name: 'Carlos Mendoza', specialty: 'Cardiología', time: '08:30 AM', total_appointments: 10, historical_no_shows: 8, days_since_last_visit: 20, age: 58, risk: 'HIGH', score: '80%' },
    { id: 2, name: 'Beatriz Castro', specialty: 'Medicina General', time: '09:15 AM', total_appointments: 10, historical_no_shows: 4, days_since_last_visit: 60, age: 42, risk: 'MEDIUM', score: '40%' },
    { id: 3, name: 'Andrés Morales', specialty: 'Dermatología', time: '10:00 AM', total_appointments: 10, historical_no_shows: 1, days_since_last_visit: 90, age: 28, risk: 'LOW', score: '10%' },
    { id: 4, name: 'Diana Quintero', specialty: 'Pediatría', time: '11:00 AM', total_appointments: 12, historical_no_shows: 10, days_since_last_visit: 45, age: 34, risk: 'HIGH', score: '83%' },
  ]);

  // Consumo del endpoint analítico /risk/calculate
  const fetchPatientsRisk = async () => {
    setLoadingRisk(true);
    try {
      const updatedPatients = await Promise.all(
        patientsRisk.map(async (p) => {
          try {
            const res = await fetch('http://127.0.0.1:8000/risk/calculate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                total_appointments: p.total_appointments,
                historical_no_shows: p.historical_no_shows,
                days_since_last_visit: p.days_since_last_visit,
                age: p.age
              })
            });

            if (res.ok) {
              const resJson = await res.json();
              return {
                ...p,
                risk: resJson.data.classification,
                score: `${resJson.data.risk_score_percentage}%`
              };
            }
          } catch (err) {
            console.error('Error consultando /risk/calculate para', p.name, err);
          }
          return p;
        })
      );

      setPatientsRisk(updatedPatients);
      setNotification({
        title: 'Semáforo de Riesgo Sincronizado',
        message: 'Métricas analíticas calculadas por FastAPI (/risk/calculate).',
        type: 'success'
      });
    } catch (error) {
      console.error('Fallo en sincronización de riesgos:', error);
    } finally {
      setLoadingRisk(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Recalcular riesgos al acceder al Portal Médico
  useEffect(() => {
    if (currentView === 'doctor-portal') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza con la API externa al abrir el portal (comportamiento original)
      fetchPatientsRisk();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- el efecto depende solo de la vista activa (comportamiento original)
  }, [currentView]);

  const startBooking = () => {
    const uniqueKey = 'idemp_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    setIdempotencyKey(uniqueKey);
    setCurrentView('booking');
  };

  // Un horario sugerido solo rellena el campo Hora; no envía el formulario
  const handleTimeSlotSelect = (slot) => {
    setBookingData((prev) => ({ ...prev, time: slot }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/simulate/messaging/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          recipient: bookingData.patientName,
          message: `Cita confirmada con ${bookingData.doctor} (${bookingData.specialty}) el ${bookingData.date} a las ${bookingData.time}. Key: ${idempotencyKey}`,
          channel: 'SMS'
        })
      });

      const data = await response.json();

      setNotification({
        title: '¡Cita Agendada y Despachada!',
        message: `Inyectada en RabbitMQ en vivo [${data.status || 'QUEUED'}].`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error al conectar con la API:', error);
      setNotification({
        title: '¡Cita Agendada (Modo Local)!',
        message: 'Registrada con idempotencia activa.',
        type: 'success'
      });
    }

    setTimeout(() => setNotification(null), 6000);
    setCurrentView('home');
  };

  const triggerCeleryTask = async (patient) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/simulate/messaging/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: patient.name,
          message: `Recordatorio urgente: Riesgo ${patient.risk} (${patient.score}) en ${patient.specialty}`,
          channel: 'SMS'
        })
      });

      const data = await response.json();

      setNotification({
        title: 'Tarea Asíncrona Despachada',
        message: `Evento para ${patient.name} encolado en RabbitMQ [${data.status || 'QUEUED'}].`,
        type: 'info'
      });
    } catch (error) {
      console.error('Error al notificar:', error);
      setNotification({
        title: 'Tarea Asíncrona Despachada',
        message: `Evento de recordatorio prioritario para ${patient.name} despachado a RabbitMQ.`,
        type: 'info'
      });
    }

    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-surface text-ink">
      <a href="#contenido" className="skip-link">Saltar al contenido</a>

      {/* 1. HUD de Infraestructura Activa en AWS */}
      <div className="on-night border-b border-tactile-night bg-surface-night text-ink-inverse-muted">
        <div className="frame flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2.5 font-mono text-[0.75rem] uppercase tracking-[0.08em]">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
            <li className="flex items-center gap-2 font-semibold text-status-ok-night">
              <span className="live-dot" aria-hidden="true"></span>
              AWS Fargate (us-east-2)
            </li>
            <li className="flex items-center gap-1.5"><Server className="h-3.5 w-3.5 text-accent-glow" aria-hidden="true" /> FastAPI</li>
            <li className="flex items-center gap-1.5"><Database className="h-3.5 w-3.5 text-accent-glow" aria-hidden="true" /> PostgreSQL RDS</li>
            <li className="flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5 text-accent-glow" aria-hidden="true" /> RabbitMQ Broker</li>
          </ul>
          <button
            onClick={() => setShowArchitectureModal(true)}
            className="ulink cursor-pointer font-medium uppercase text-accent-glow"
          >
            Ver Estado de Arquitectura
          </button>
        </div>
      </div>

      {/* 2. Barra de Navegación Principal */}
      <nav className="z-40 sm:sticky sm:top-0 border-b border-tactile bg-surface/90 backdrop-blur-md">
        <div className="frame flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-3 sm:py-4">
          <h1 className="m-0">
            <button
              onClick={() => setCurrentView('home')}
              className="group flex cursor-pointer items-center gap-3 text-left"
            >
              <BrandMark className="h-10 w-10 shrink-0 transition-transform duration-500 ease-out-expo group-hover:-rotate-6" />
              <span className="block">
                <span className="block font-display text-[1.75rem] font-medium leading-none tracking-[-0.03em] text-ink">ClínicaRed</span>
                <span className="mt-1 hidden font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-muted sm:block">Salud Conectada &amp; Arquitectura Distribuida</span>
              </span>
            </button>
          </h1>

          <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-2 sm:w-auto">
            <a
              href={docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              <span>Docusaurus Docs</span>
              <ExternalLink className="h-3 w-3 opacity-70" aria-hidden="true" />
            </a>

            {userRole ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="inline-flex min-h-[2.5rem] items-center gap-2 rounded-sm border border-tactile bg-surface-elevated px-3.5 text-sm text-ink-muted">
                  Rol: <strong className="font-semibold capitalize text-accent-ink">{userRole}</strong>
                </span>
                {userRole === 'doctor' && (
                  <button
                    onClick={() => setCurrentView('doctor-portal')}
                    aria-current={currentView === 'doctor-portal' ? 'page' : undefined}
                    className="btn btn-ghost btn-sm"
                  >
                    Portal Médico
                  </button>
                )}
                <button
                  onClick={() => { setUserRole(null); setCurrentView('home'); }}
                  className="ulink cursor-pointer text-sm font-semibold text-status-danger"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentView('auth')}
                className="btn btn-primary btn-sm"
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                <span>Iniciar Sesión / Registro</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* 3. Notificación Flotante (Toast) */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className="on-night fixed inset-x-4 bottom-4 z-50 sm:inset-x-auto sm:bottom-8 sm:right-8 sm:w-[26rem]"
        >
          <div className="flex animate-toast-in overflow-hidden rounded-sm border border-tactile-night bg-surface-night text-ink-inverse shadow-float">
            <span
              aria-hidden="true"
              className={`w-1 shrink-0 ${notification.type === 'success' ? 'bg-status-ok-night' : 'bg-accent-glow'}`}
            />
            <div className="flex items-start gap-3 p-4">
              {notification.type === 'success' ? (
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-status-ok-night" aria-hidden="true" />
              ) : (
                <Server className="mt-0.5 h-5 w-5 shrink-0 text-accent-glow" aria-hidden="true" />
              )}
              <div className="min-w-0">
                <h4 className="font-display text-lg font-medium leading-snug tracking-[-0.01em]">{notification.title}</h4>
                <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-inverse-muted [overflow-wrap:anywhere]">{notification.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Vistas */}
      <main id="contenido" tabIndex={-1} className="relative flex-1 focus:outline-none">
        {/* Retícula arquitectónica: columnas visibles detrás del contenido */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
          <div className="frame h-full">
            <div className="grid-rules h-full border-x border-tactile/60" />
          </div>
        </div>

        <div className="relative z-10">
          {currentView === 'home' && (
            <div className="animate-fade-in">
              {/* Héroe */}
              <section className="border-b border-tactile">
                <div className="frame grid pt-12 sm:pt-16 lg:grid-cols-12 lg:pt-0">
                  <div className="flex flex-col justify-center lg:col-span-7 lg:py-28 lg:pr-14">
                    <div className="animate-rise">
                      <Eyebrow index="01">Reserva Inteligente &amp; Control de Ausentismo</Eyebrow>
                    </div>
                    <h2 className="mt-7 animate-rise text-balance font-display text-display-xl font-normal [animation-delay:90ms]">
                      Gestión Clínica con{' '}
                      <em className="font-normal italic text-accent-ink">Analítica Predictiva</em>{' '}
                      en Tiempo Real
                    </h2>
                    <p className="mt-7 max-w-xl animate-rise text-pretty text-lg leading-relaxed text-ink-muted [animation-delay:180ms]">
                      Agendamiento transaccional protegido con idempotencia y predicción de inasistencia impulsado por PySpark y FastAPI.
                    </p>
                    <div className="mt-10 flex animate-rise flex-wrap gap-3 [animation-delay:270ms]">
                      <button onClick={startBooking} className="btn btn-primary group">
                        <Calendar className="h-5 w-5" aria-hidden="true" />
                        <span>Agendar Cita Médica</span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => { setUserRole('doctor'); setCurrentView('doctor-portal'); }}
                        className="btn btn-ghost"
                      >
                        <Stethoscope className="h-5 w-5" aria-hidden="true" />
                        <span>Ingresar como Médico</span>
                      </button>
                    </div>
                  </div>

                  {/* Escena: profundidad en capas */}
                  <div className="on-night relative -mx-5 mt-14 min-h-[30rem] overflow-hidden bg-surface-night sm:-mx-8 lg:col-span-5 lg:mx-0 lg:mt-0 lg:min-h-[44rem]">
                    <HeroScene />
                    <p className="absolute left-5 top-5 font-mono text-label uppercase text-ink-inverse-muted">
                      <span className="text-accent-glow">Fig. 01</span> — Agenda · Riesgo · Mensajería
                    </p>
                    <div aria-hidden="true" className="absolute right-5 top-5 h-4 w-4 border-r border-t border-ink-inverse-muted/60" />
                    <div aria-hidden="true" className="absolute bottom-5 left-5 h-4 w-4 border-b border-l border-ink-inverse-muted/60" />
                    <div aria-hidden="true" className="absolute bottom-5 right-5 h-4 w-4 border-b border-r border-ink-inverse-muted/60" />
                  </div>
                </div>
              </section>

              {/* Capacidades: tres estaciones de un mismo recorrido */}
              <section className="border-b border-tactile bg-surface/80">
                <div className="frame">
                  <div className="feature-index grid pt-12 md:grid-cols-3 md:pt-16">
                    {FEATURES.map(({ n, Icon, title, text }, idx) => (
                      <article
                        key={n}
                        className="feature reveal"
                        style={{ animationDelay: `${idx * 60}ms` }}
                      >
                        <div className="mb-8 flex items-start justify-between">
                          <span className="feature-num">{n}</span>
                          <Icon className="feature-icon h-6 w-6 text-accent-ink transition-opacity duration-500" strokeWidth={1.5} aria-hidden="true" />
                        </div>
                        <h3 className="font-display text-display-sm font-normal">{title}</h3>
                        <p className="mt-4 max-w-sm text-[0.9375rem] leading-relaxed text-ink-muted">{text}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {currentView === 'booking' && (
            <section className="frame animate-fade-in py-12 sm:py-16 lg:py-24">
              <div className="grid gap-12 lg:grid-cols-12 lg:gap-0">
                {/* Margen editorial: título y resumen en vivo (la llave de idempotencia viaja solo en el header HTTP) */}
                <aside className="lg:col-span-5 lg:self-start lg:pr-14 lg:sticky lg:top-28">
                  <div className="animate-rise">
                    <Eyebrow index="01">Transacción síncrona en FastAPI + RabbitMQ</Eyebrow>
                  </div>
                  <h3 className="mt-6 animate-rise text-balance font-display text-display-md font-normal [animation-delay:80ms]">
                    Agendar Cita Médica
                  </h3>
                  <button
                    onClick={() => setCurrentView('home')}
                    className="ulink mt-5 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink-muted hover:text-ink"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                    Cancelar
                  </button>

                  <dl className="mt-12 hidden animate-rise gap-y-4 border-t border-tactile-strong pt-8 text-sm [animation-delay:160ms] lg:grid lg:grid-cols-[9rem_1fr]">
                    <dt className="font-mono text-label uppercase text-ink-muted">Paciente</dt>
                    <dd className="font-semibold [overflow-wrap:anywhere]">{bookingData.patientName || '—'}</dd>
                    <dt className="font-mono text-label uppercase text-ink-muted">Especialidad</dt>
                    <dd>{bookingData.specialty}</dd>
                    <dt className="font-mono text-label uppercase text-ink-muted">Especialista</dt>
                    <dd>{bookingData.doctor}</dd>
                    <dt className="font-mono text-label uppercase text-ink-muted">Fecha</dt>
                    <dd className="font-mono">{bookingData.date}</dd>
                    <dt className="font-mono text-label uppercase text-ink-muted">Hora</dt>
                    <dd className="font-mono">{bookingData.time}</dd>
                  </dl>
                </aside>

                {/* Formulario */}
                <div className="animate-rise border border-tactile bg-surface-elevated p-6 shadow-lift [animation-delay:120ms] sm:p-10 lg:col-span-7">
                  <form onSubmit={handleBookingSubmit}>
                    <div className="station">
                      <span className="station-node" aria-hidden="true">01</span>
                      <label htmlFor="booking-name" className="field-label">
                        <span>Nombre Completo</span>
                      </label>
                      <input
                        id="booking-name"
                        type="text"
                        required
                        autoComplete="name"
                        placeholder="Ej. Juan Pérez"
                        value={bookingData.patientName}
                        onChange={(e) => setBookingData({ ...bookingData, patientName: e.target.value })}
                        className="field"
                      />
                    </div>

                    <div className="station">
                      <span className="station-node" aria-hidden="true">02</span>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label htmlFor="booking-specialty" className="field-label">
                            <span>Especialidad</span>
                          </label>
                          <select
                            id="booking-specialty"
                            value={bookingData.specialty}
                            onChange={(e) => setBookingData({ ...bookingData, specialty: e.target.value })}
                            className="field"
                          >
                            <option>Medicina General</option>
                            <option>Cardiología</option>
                            <option>Dermatología</option>
                            <option>Pediatría</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="booking-doctor" className="field-label">
                            <span>Especialista</span>
                          </label>
                          <select
                            id="booking-doctor"
                            value={bookingData.doctor}
                            onChange={(e) => setBookingData({ ...bookingData, doctor: e.target.value })}
                            className="field"
                          >
                            <option>Dra. Elena Gómez</option>
                            <option>Dr. Roberto Suárez</option>
                            <option>Dra. Patricia Ortiz</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="station">
                      <span className="station-node" aria-hidden="true">03</span>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label htmlFor="booking-date" className="field-label">
                            <span>Fecha</span>
                          </label>
                          <input
                            id="booking-date"
                            type="date"
                            value={bookingData.date}
                            onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                            className="field"
                          />
                        </div>

                        <div>
                          <label htmlFor="booking-time" className="field-label">
                            <span>Hora</span>
                          </label>
                          <input
                            id="booking-time"
                            type="text"
                            value={bookingData.time}
                            onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                            className="field font-mono"
                          />
                        </div>
                      </div>

                      <div className="mt-5">
                        <span id="booking-slots-label" className="field-label">
                          <span>Horarios sugeridos</span>
                        </span>
                        <div
                          role="group"
                          aria-labelledby="booking-slots-label"
                          className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                        >
                          {TIME_SLOTS.map((slot) => {
                            const isActive = normalizeTime(bookingData.time) === slot;
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => handleTimeSlotSelect(slot)}
                                aria-pressed={isActive}
                                className={`min-h-[2.5rem] cursor-pointer rounded-sm border px-3 font-mono text-[0.8125rem] font-medium transition-[color,background-color,border-color,transform] duration-300 ease-out-expo active:translate-y-px ${
                                  isActive
                                    ? 'border-action bg-action text-surface-elevated'
                                    : 'border-tactile-strong bg-surface-elevated text-ink hover:border-ink hover:bg-surface-sunken'
                                }`}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary group mt-10 w-full">
                      <span>Confirmar Cita</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" aria-hidden="true" />
                    </button>
                  </form>
                </div>
              </div>
            </section>
          )}

          {currentView === 'doctor-portal' && (
            <section className="frame animate-fade-in py-12 sm:py-16 lg:py-24">
              <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6 pb-10">
                <div className="animate-rise">
                  <Eyebrow index="01">Capa Analítica en Vivo (FastAPI + PySpark)</Eyebrow>
                  <h3 className="mt-6 text-balance font-display text-display-md font-normal">Semáforo de Riesgo No-Show</h3>
                </div>
                <button
                  onClick={fetchPatientsRisk}
                  disabled={loadingRisk}
                  aria-busy={loadingRisk}
                  className="btn btn-ghost btn-sm animate-rise [animation-delay:100ms]"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingRisk ? 'animate-spin' : ''}`} aria-hidden="true" />
                  <span>{loadingRisk ? 'Calculando en FastAPI...' : 'Recalcular con API'}</span>
                </button>
              </div>

              <div className="animate-rise border-t border-ink [animation-delay:160ms]">
                <table className="ledger">
                  <thead>
                    <tr>
                      <th scope="col">Hora</th>
                      <th scope="col">Paciente</th>
                      <th scope="col">Especialidad</th>
                      <th scope="col">Historial (Faltas/Total)</th>
                      <th scope="col">Riesgo Calculado</th>
                      <th scope="col" className="text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientsRisk.map((p) => (
                      <tr key={p.id}>
                        <td data-label="Hora" className="font-mono text-ink-muted">
                          <span className="inline-flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-ink-faint" aria-hidden="true" />
                            {p.time}
                          </span>
                        </td>
                        <td data-label="Paciente" className="font-display text-xl font-medium tracking-[-0.01em]">{p.name}</td>
                        <td data-label="Especialidad" className="text-ink-muted">{p.specialty}</td>
                        <td data-label="Historial" className="font-mono text-[0.8125rem] text-ink-muted">
                          {p.historical_no_shows} / {p.total_appointments} citas ({p.days_since_last_visit}d previas)
                        </td>
                        <td data-label="Riesgo">
                          <div className="w-full max-w-[11rem]">
                            <span className={`pill ${
                              p.risk === 'HIGH' ? 'border-status-danger/40 bg-status-danger-soft text-status-danger' :
                              p.risk === 'MEDIUM' ? 'border-status-warn/40 bg-status-warn-soft text-status-warn' :
                              'border-status-ok/40 bg-status-ok-soft text-status-ok'
                            }`}>
                              {p.risk === 'HIGH' && <AlertTriangle className="h-3 w-3" aria-hidden="true" />}
                              {p.risk === 'MEDIUM' && <Activity className="h-3 w-3" aria-hidden="true" />}
                              {p.risk === 'LOW' && <CheckCircle className="h-3 w-3" aria-hidden="true" />}
                              {p.risk} ({p.score})
                            </span>
                            <span className="meter mt-2.5" aria-hidden="true">
                              <span
                                className={
                                  p.risk === 'HIGH' ? 'bg-status-danger' :
                                  p.risk === 'MEDIUM' ? 'bg-status-warn' :
                                  'bg-status-ok'
                                }
                                style={{ width: p.score }}
                              />
                            </span>
                          </div>
                        </td>
                        <td data-label="Acción" className="md:text-right">
                          <button
                            onClick={() => triggerCeleryTask(p)}
                            className="btn btn-ghost btn-sm"
                          >
                            <Send className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Notificar</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {currentView === 'auth' && (
            <section className="frame animate-fade-in py-12 sm:py-16 lg:py-24">
              <div className="grid gap-12 lg:grid-cols-12 lg:gap-0">
                <div className="animate-rise lg:col-span-5 lg:pr-14">
                  <Eyebrow index="01">Perfil</Eyebrow>
                  <h3 className="mt-6 text-balance font-display text-display-md font-normal">Acceso a ClínicaRed</h3>
                  <p className="mt-5 max-w-sm text-lg leading-relaxed text-ink-muted">Selecciona el perfil para interactuar con la plataforma</p>
                </div>

                <div className="animate-rise border-t border-tactile-strong [animation-delay:120ms] lg:col-span-7">
                  <button
                    onClick={() => { setUserRole('patient'); setCurrentView('home'); }}
                    className="door group"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-tactile-strong bg-surface-elevated text-action transition-colors duration-500 group-hover:border-ink-inverse-muted/50 group-hover:bg-transparent group-hover:text-accent-glow">
                      <User className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-display-sm font-normal transition-colors duration-500 group-hover:text-ink-inverse">Soy Paciente</span>
                      <span className="mt-1 block text-[0.9375rem] text-ink-muted transition-colors duration-500 group-hover:text-ink-inverse-muted">Agendar citas médicas</span>
                    </span>
                    <ArrowRight className="h-5 w-5 shrink-0 text-ink-muted transition-[transform,color] duration-500 ease-out-expo group-hover:translate-x-1.5 group-hover:text-accent-glow" aria-hidden="true" />
                  </button>

                  <button
                    onClick={() => { setUserRole('doctor'); setCurrentView('doctor-portal'); }}
                    className="door group"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-tactile-strong bg-surface-elevated text-action transition-colors duration-500 group-hover:border-ink-inverse-muted/50 group-hover:bg-transparent group-hover:text-accent-glow">
                      <Stethoscope className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-display-sm font-normal transition-colors duration-500 group-hover:text-ink-inverse">Soy Especialista Médico</span>
                      <span className="mt-1 block text-[0.9375rem] text-ink-muted transition-colors duration-500 group-hover:text-ink-inverse-muted">Ver semáforo de riesgo predictivo</span>
                    </span>
                    <ArrowRight className="h-5 w-5 shrink-0 text-ink-muted transition-[transform,color] duration-500 ease-out-expo group-hover:translate-x-1.5 group-hover:text-accent-glow" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Modal de Arquitectura */}
      {showArchitectureModal && (
        <div className="on-night fixed inset-0 z-50 flex animate-fade-in items-end justify-center bg-surface-night/80 backdrop-blur-sm sm:items-center sm:p-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="arquitectura-titulo"
            className="max-h-[92vh] w-full max-w-xl animate-sheet-in overflow-y-auto rounded-t-md border border-tactile-night bg-surface-night text-ink-inverse shadow-float sm:rounded-sm"
          >
            <div className="flex items-start justify-between gap-6 border-b border-tactile-night p-6 sm:p-8">
              <div>
                <Eyebrow index="01">Mapa de capas</Eyebrow>
                <h3 id="arquitectura-titulo" className="mt-4 flex items-center gap-3 font-display text-display-sm font-normal">
                  <Server className="h-5 w-5 text-accent-glow" aria-hidden="true" />
                  <span>Arquitectura Distribuida</span>
                </h3>
              </div>
              <button
                onClick={() => setShowArchitectureModal(false)}
                aria-label="Cerrar"
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-tactile-night text-ink-inverse-muted transition-[color,border-color,transform] duration-300 hover:rotate-90 hover:border-accent-glow hover:text-accent-glow"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <ol className="p-6 sm:p-8">
              <ArchLayer index="1" tone="accent" title="Capa Transaccional (OLTP)">
                FastAPI en AWS Fargate conectado a PostgreSQL RDS.
              </ArchLayer>
              <ArchLayer index="2" tone="warn" title="Mensajería Asíncrona">
                RabbitMQ para desacoplar tareas en segundo plano.
              </ArchLayer>
              <ArchLayer index="3" tone="ok" title="Capa Analítica (OLAP)" last>
                PySpark y motor de reglas procesando métricas de ausentismo.
              </ArchLayer>
            </ol>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-tactile-night p-6 sm:px-8">
              <a
                href={docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ulink flex items-center gap-2 text-sm font-medium text-accent-glow"
              >
                <span>Ver documentación técnica completa</span>
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
              <button
                onClick={() => setShowArchitectureModal(false)}
                className="btn btn-night btn-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="on-night relative overflow-hidden bg-surface-night text-ink-inverse-muted">
        <div className="frame pt-10">
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-b border-tactile-night pb-8 text-[0.8125rem]">
            <span>ClínicaRed Citas • AWS Fargate Serverless Architecture</span>
            <a
              href={docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ulink flex items-center gap-1.5 font-medium text-accent-glow"
            >
              <span>Docusaurus Docs</span>
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </div>
          <p
            aria-hidden="true"
            className="pointer-events-none -mb-[0.14em] select-none pt-6 font-display text-[clamp(4.5rem,19vw,15rem)] font-light leading-[0.82] tracking-[-0.05em] text-ink-inverse/[0.07]"
          >
            ClínicaRed
          </p>
        </div>
      </footer>
    </div>
  );
}