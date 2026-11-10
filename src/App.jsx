import React, { useState } from 'react';
import { 
  Calendar, Clock, User, ShieldCheck, Activity, 
  Stethoscope, AlertTriangle, CheckCircle, Database, 
  Server, Cpu, ArrowRight, LogIn, Send, BookOpen, ExternalLink
} from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [userRole, setUserRole] = useState(null);
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [showArchitectureModal, setShowArchitectureModal] = useState(false);
  const [notification, setNotification] = useState(null);

  const docsUrl = "https://el-eden-riwi.github.io/clinicared-docs/";

  const [bookingData, setBookingData] = useState({
    patientName: '',
    specialty: 'Medicina General',
    doctor: 'Dra. Elena Gómez',
    date: '2026-11-15',
    time: '09:00 AM'
  });

  const [patientsRisk, setPatientsRisk] = useState([
    { id: 1, name: 'Carlos Mendoza', specialty: 'Cardiología', time: '08:30 AM', risk: 'HIGH', score: '87%' },
    { id: 2, name: 'Beatriz Castro', specialty: 'Medicina General', time: '09:15 AM', risk: 'MEDIUM', score: '45%' },
    { id: 3, name: 'Andrés Morales', specialty: 'Dermatología', time: '10:00 AM', risk: 'LOW', score: '12%' },
    { id: 4, name: 'Diana Quintero', specialty: 'Pediatría', time: '11:00 AM', risk: 'HIGH', score: '91%' },
  ]);

  const startBooking = () => {
    const uniqueKey = 'idemp_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    setIdempotencyKey(uniqueKey);
    setCurrentView('booking');
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setNotification({
      title: '¡Cita Agendada Exitosamente!',
      message: `Registrada en PostgreSQL (RDS) con Header X-Idempotency-Key: ${idempotencyKey}. Evento publicado en RabbitMQ.`,
      type: 'success'
    });
    setTimeout(() => setNotification(null), 6000);
    setCurrentView('home');
  };

  const triggerCeleryTask = (patient) => {
    setNotification({
      title: 'Tarea Asíncrona en Celery',
      message: `Evento de recordatorio prioritario para ${patient.name} despachado a la cola RabbitMQ.`,
      type: 'info'
    });
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      
      {/* 1. HUD de Infraestructura Activa en AWS */}
      <div className="bg-slate-950 border-b border-slate-800 text-xs px-4 py-2 flex flex-wrap justify-between items-center text-slate-400">
        <div className="flex items-center space-x-4">
          <span className="flex items-center text-emerald-400 font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
            AWS Fargate (us-east-2)
          </span>
          <span className="flex items-center"><Server className="w-3.5 h-3.5 mr-1 text-sky-400" /> FastAPI</span>
          <span className="flex items-center"><Database className="w-3.5 h-3.5 mr-1 text-indigo-400" /> PostgreSQL RDS</span>
          <span className="flex items-center"><Cpu className="w-3.5 h-3.5 mr-1 text-orange-400" /> RabbitMQ Broker</span>
        </div>
        <button 
          onClick={() => setShowArchitectureModal(true)}
          className="text-sky-400 hover:text-sky-300 underline font-medium cursor-pointer"
        >
          Ver Estado de Arquitectura
        </button>
      </div>

      {/* 2. Barra de Navegación Principal */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('home')}>
          <div className="bg-sky-500 p-2 rounded-xl text-white">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">ClínicaRed</h1>
            <p className="text-xs text-sky-400 font-medium">Salud Conectada & Arquitectura Distribuida</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Botón directo a Docusaurus Docs */}
          <a
            href={docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 text-sm bg-slate-800/80 hover:bg-slate-700 text-sky-400 border border-slate-700 hover:border-sky-500 px-3.5 py-2 rounded-lg transition"
          >
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span className="font-medium">Docs Arquitectura</span>
            <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
          </a>

          {userRole ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm px-3 py-1 bg-slate-800 rounded-lg text-slate-300 border border-slate-700">
                Rol: <strong className="capitalize text-sky-400">{userRole}</strong>
              </span>
              {userRole === 'doctor' && (
                <button 
                  onClick={() => setCurrentView('doctor-portal')}
                  className={`text-sm px-3 py-1.5 rounded-lg border transition ${currentView === 'doctor-portal' ? 'bg-sky-600 border-sky-500 text-white' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                >
                  Portal Médico
                </button>
              )}
              <button 
                onClick={() => { setUserRole(null); setCurrentView('home'); }}
                className="text-xs text-rose-400 hover:text-rose-300 underline ml-2"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setCurrentView('auth')}
              className="flex items-center space-x-2 text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2 rounded-lg transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesión / Registro</span>
            </button>
          )}
        </div>
      </nav>

      {/* 3. Notificación Flotante (Toast) */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-800 border border-sky-500/50 shadow-2xl rounded-xl p-4 flex items-start space-x-3 text-sm">
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
          ) : (
            <Server className="w-5 h-5 text-sky-400 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <h4 className="font-semibold text-slate-100">{notification.title}</h4>
            <p className="text-slate-300 text-xs mt-0.5 leading-relaxed">{notification.message}</p>
          </div>
        </div>
      )}

      {/* 4. Vistas */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6">
        {currentView === 'home' && (
          <div className="space-y-12 py-8">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sky-950 text-sky-300 border border-sky-800">
                Reserva Inteligente & Control de Ausentismo
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                Gestión Clínica con Analítica Predictiva en Tiempo Real
              </h2>
              <p className="text-slate-400 text-base md:text-lg">
                Agendamiento transaccional protegido con idempotencia y predicción de inasistencia impulsado por PySpark y Apache Airflow.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <button 
                  onClick={startBooking}
                  className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-sky-500/20 flex items-center space-x-2 transition cursor-pointer"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Agendar Cita Médica</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
                <button 
                  onClick={() => { setUserRole('doctor'); setCurrentView('doctor-portal'); }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-6 py-3 rounded-xl border border-slate-700 flex items-center space-x-2 transition cursor-pointer"
                >
                  <Stethoscope className="w-5 h-5 text-sky-400" />
                  <span>Ingresar como Médico</span>
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-6">
              <div className="bg-slate-800/50 border border-slate-800 p-6 rounded-2xl">
                <div className="p-3 bg-indigo-500/10 rounded-xl w-fit text-indigo-400 mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Idempotencia Garantizada</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Evita dobles cobros y duplicados en PostgreSQL usando claves únicas generadas antes del envío.
                </p>
              </div>

              <div className="bg-slate-800/50 border border-slate-800 p-6 rounded-2xl">
                <div className="p-3 bg-amber-500/10 rounded-xl w-fit text-amber-400 mb-4">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Semáforo de Riesgo (No-Show)</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Pipelines analíticos procesan datos históricos para calcular la probabilidad de ausencia médica.
                </p>
              </div>

              <div className="bg-slate-800/50 border border-slate-800 p-6 rounded-2xl">
                <div className="p-3 bg-sky-500/10 rounded-xl w-fit text-sky-400 mb-4">
                  <Server className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Asincronismo con RabbitMQ</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Desacople completo entre el registro de citas y el procesamiento de alertas en segundo plano.
                </p>
              </div>
            </div>
          </div>
        )}

        {currentView === 'booking' && (
          <div className="max-w-xl mx-auto bg-slate-800/70 border border-slate-700 p-8 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white">Agendar Cita Médica</h3>
                <p className="text-xs text-slate-400">Transacción síncrona en FastAPI + PostgreSQL</p>
              </div>
              <button onClick={() => setCurrentView('home')} className="text-slate-400 hover:text-white text-sm cursor-pointer">
                Cancelar
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl mb-6 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">X-Idempotency-Key:</span>
              <span className="text-emerald-400 font-bold truncate ml-2">{idempotencyKey}</span>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej. Juan Pérez"
                  value={bookingData.patientName}
                  onChange={(e) => setBookingData({...bookingData, patientName: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Especialidad</label>
                  <select 
                    value={bookingData.specialty}
                    onChange={(e) => setBookingData({...bookingData, specialty: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                  >
                    <option>Medicina General</option>
                    <option>Cardiología</option>
                    <option>Dermatología</option>
                    <option>Pediatría</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Especialista</label>
                  <select 
                    value={bookingData.doctor}
                    onChange={(e) => setBookingData({...bookingData, doctor: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                  >
                    <option>Dra. Elena Gómez</option>
                    <option>Dr. Roberto Suárez</option>
                    <option>Dra. Patricia Ortiz</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Fecha</label>
                  <input 
                    type="date" 
                    value={bookingData.date}
                    onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Hora</label>
                  <input 
                    type="text" 
                    value={bookingData.time}
                    onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full mt-4 bg-sky-500 hover:bg-sky-400 text-white font-semibold py-3 rounded-xl transition cursor-pointer"
              >
                Confirmar Cita
              </button>
            </form>
          </div>
        )}

        {currentView === 'doctor-portal' && (
          <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs text-sky-400 font-semibold tracking-wide uppercase">Capa Analítica (PySpark)</span>
                <h3 className="text-2xl font-bold text-white">Semáforo de Riesgo No-Show</h3>
              </div>
            </div>

            <div className="bg-slate-800/40 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700">
                    <th className="p-4">Hora</th>
                    <th className="p-4">Paciente</th>
                    <th className="p-4">Especialidad</th>
                    <th className="p-4">Riesgo Calculado</th>
                    <th className="p-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {patientsRisk.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-4 text-slate-300 font-mono flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                        {p.time}
                      </td>
                      <td className="p-4 font-semibold text-white">{p.name}</td>
                      <td className="p-4 text-slate-300">{p.specialty}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          p.risk === 'HIGH' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                          p.risk === 'MEDIUM' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                          'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}>
                          {p.risk === 'HIGH' && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {p.risk === 'LOW' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {p.risk} ({p.score})
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => triggerCeleryTask(p)}
                          className="inline-flex items-center space-x-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-600 transition cursor-pointer"
                        >
                          <Send className="w-3 h-3 text-sky-400" />
                          <span>Notificar Celery</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentView === 'auth' && (
          <div className="max-w-md mx-auto bg-slate-800/70 border border-slate-700 p-8 rounded-2xl shadow-xl text-center">
            <h3 className="text-xl font-bold text-white mb-2">Acceso a ClínicaRed</h3>
            <p className="text-xs text-slate-400 mb-6">Selecciona el perfil para interactuar con la plataforma</p>

            <div className="space-y-3">
              <button 
                onClick={() => { setUserRole('patient'); setCurrentView('home'); }}
                className="w-full bg-slate-900 hover:bg-slate-700 border border-slate-700 p-4 rounded-xl text-left flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-sky-400" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Soy Paciente</h4>
                    <p className="text-xs text-slate-400">Agendar citas médicas</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>

              <button 
                onClick={() => { setUserRole('doctor'); setCurrentView('doctor-portal'); }}
                className="w-full bg-slate-900 hover:bg-slate-700 border border-slate-700 p-4 rounded-xl text-left flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <Stethoscope className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Soy Especialista Médico</h4>
                    <p className="text-xs text-slate-400">Ver semáforo de riesgo predictivo</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Arquitectura */}
      {showArchitectureModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-lg w-full rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white flex items-center space-x-2">
                <Server className="w-5 h-5 text-sky-400" />
                <span>Arquitectura Distribuida</span>
              </h3>
              <button onClick={() => setShowArchitectureModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>
            
            <div className="text-xs space-y-3 text-slate-300">
              <div className="p-3 bg-slate-800/60 rounded-xl">
                <span className="font-semibold text-sky-400 block mb-0.5">Capa Transaccional (OLTP)</span>
                FastAPI en AWS Fargate conectado a PostgreSQL RDS.
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl">
                <span className="font-semibold text-orange-400 block mb-0.5">Mensajería Asíncrona</span>
                RabbitMQ para desacoplar tareas en segundo plano.
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl">
                <span className="font-semibold text-indigo-400 block mb-0.5">Capa Analítica (OLAP)</span>
                PySpark procesando métricas de ausentismo.
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <a
                href={docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center space-x-1"
              >
                <span>Ver documentación técnica completa</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button 
                onClick={() => setShowArchitectureModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-1.5 px-4 rounded-lg text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-4 flex flex-wrap justify-between items-center text-xs text-slate-500">
        <span>ClínicaRed Citas • AWS Fargate Serverless Architecture</span>
        <a 
          href={docsUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-slate-400 hover:text-sky-400 flex items-center space-x-1 transition"
        >
          <span>Docusaurus Docs</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </footer>
    </div>
  );
}