/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import {
    User,
    Settings,
    LogOut,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    Briefcase
} from 'lucide-react';
import { User as UserType, Appointment, Service } from './types';
import Popup from '../ui/Popup';

interface DashboardProps {
    user: UserType;
    onLogout: () => void;
}

type Tab = 'appointments' | 'services' | 'profile';

// --- MOCK DATA ---
const MOCK_APPOINTMENTS: Appointment[] = [
    {
        id: 101,
        scheduled_date: '2026-02-15 10:00:00',
        status: 'pending',
        service: { id: 1, name: 'Limpieza Dental Profunda', description: '', price: 85, estimated_time: 45, is_active: true },
        user: { name: 'Mariana López', email: 'mariana.l@example.com' },
        clinic: { id: 991, name: 'Smartlabs Central' },
        created_at: '2026-02-01 10:00:00'
    },
    {
        id: 102,
        scheduled_date: '2026-02-15 11:30:00',
        status: 'scheduled',
        service: { id: 2, name: 'Consulta General', description: '', price: 40, estimated_time: 30, is_active: true },
        user: { name: 'Juan Carlos Ruiz', email: 'jc.ruiz@example.com' },
        clinic: { id: 991, name: 'Smartlabs Central' },
        created_at: '2026-02-01 11:00:00'
    },
    {
        id: 103,
        scheduled_date: '2026-02-14 15:00:00',
        status: 'completed',
        service: { id: 3, name: 'Ortodoncia - Ajuste', description: '', price: 60, estimated_time: 20, is_active: true },
        user: { name: 'Elena Gomez', email: 'e.gomez@example.com' },
        clinic: { id: 991, name: 'Smartlabs Central' },
        created_at: '2026-01-20 15:00:00'
    },
    {
        id: 104,
        scheduled_date: '2026-02-16 09:00:00',
        status: 'cancelled',
        service: { id: 2, name: 'Consulta General', description: '', price: 40, estimated_time: 30, is_active: true },
        user: { name: 'Pedro Martinez', email: 'p.martinez@example.com' },
        clinic: { id: 991, name: 'Smartlabs Central' },
        created_at: '2026-02-05 09:00:00'
    }
];

const MOCK_SERVICES: Service[] = [
    { id: 1, name: 'Limpieza Dental Profunda', description: 'Limpieza completa con ultrasonido y pulido.', price: 85, estimated_time: 45, is_active: true },
    { id: 2, name: 'Consulta General', description: 'Revisión general y diagnóstico inicial.', price: 40, estimated_time: 30, is_active: true },
    { id: 3, name: 'Ortodoncia - Ajuste', description: 'Control mensual de brackets.', price: 60, estimated_time: 20, is_active: true },
    { id: 4, name: 'Blanqueamiento Zoom', description: 'Blanqueamiento profesional en 1 sesión.', price: 250, estimated_time: 90, is_active: false },
];

const MOCK_CLINICS = [
    { id: 991, name: 'Smartlabs Central' },
    { id: 992, name: 'Clínica Dental Norte' },
    { id: 993, name: 'Centro Especialidades Sur' },
];

export default function EmployeeDashboard({ user, onLogout }: DashboardProps) {
    const [activeTab, setActiveTab] = useState<Tab>('appointments');
    const [popup, setPopup] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Filter Logic
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'scheduled' | 'completed' | 'cancelled'>('scheduled');

    // MOCK STATES
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loadingAppointments, setLoadingAppointments] = useState(false);
    const [services, setServices] = useState<Service[]>([]);
    const [loadingServices, setLoadingServices] = useState(false);

    // Clinic Selection State
    const [availableClinics, setAvailableClinics] = useState<any[]>(MOCK_CLINICS);
    const [selectedClinicId, setSelectedClinicId] = useState<number | string>(user.employees?.[0]?.clinic?.id || 991);
    const [currentClinicName, setCurrentClinicName] = useState(user.employees?.[0]?.clinic?.name || 'Smartlabs Central');

    // Profile State
    const [profileData, setProfileData] = useState({
        name: user.name || '',
        email: user.email || '',
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    useEffect(() => {
        // Init Mock Data on load (simulating fetch delay)
        const loadMockData = async () => {
            if (activeTab === 'appointments') {
                setLoadingAppointments(true);
                setTimeout(() => {
                    let filtered = [...MOCK_APPOINTMENTS];
                    if (filterStatus !== 'all') {
                        filtered = filtered.filter(a => a.status === filterStatus);
                    }
                    setAppointments(filtered);
                    setLoadingAppointments(false);
                }, 600);
            } else if (activeTab === 'services') {
                setLoadingServices(true);
                setTimeout(() => {
                    setServices([...MOCK_SERVICES]);
                    setLoadingServices(false);
                }, 500);
            }
        };

        loadMockData();
    }, [activeTab, filterStatus, selectedClinicId]); // Reload when tab, filter, or clinic changes

    // Intentar cargar clínicas reales (si falla, usamos los mocks por defecto)
    useEffect(() => {
        const fetchRealClinics = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                // Intentamos /public/clinics que no requiere auth estricta de suscripción
                const res = await fetch(`${apiUrl}/public/clinics`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.data && data.data.length > 0) {
                        setAvailableClinics(data.data);
                    }
                }
            } catch (e) {
                console.log("Using mock clinics due to fetch error");
            }
        };
        fetchRealClinics();
    }, []);

    const handleClinicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newId = e.target.value;
        const clinic = availableClinics.find(c => c.id.toString() === newId.toString());
        setSelectedClinicId(newId);
        if (clinic) setCurrentClinicName(clinic.name);
        showPopup('success', `Cambiando a: ${clinic ? clinic.name : 'Nueva clínica'}`);
    };

    const showPopup = (type: 'success' | 'error', message: string) => {
        setPopup({ type, message });
        setTimeout(() => setPopup(null), 3000);
    };

    // Removed getAuthHeaders, ensureClinicToken, Real Fetchers for now to use Mock Only as requested

    // Mock Update Status
    const updateAppointmentStatus = async (id: number, newStatus: Appointment['status']) => {
        setLoadingAppointments(true);
        setTimeout(() => {
            // Update local state to simulate backend change
            const updated = appointments.filter(a => a.id !== id); // Remove from current view if filtering by specific status
            // Or better logic:
            setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));

            // If we are viewing a specific status (e.g. Pending) and move to Scheduled, it should disappear from view?
            // Usually yes, but for UX let's just refresh list
            if (filterStatus !== 'all' && filterStatus !== newStatus) {
                setAppointments(prev => prev.filter(a => a.id !== id));
            }

            showPopup('success', `Cita marcada como ${newStatus}`);
            setLoadingAppointments(false);
        }, 500);
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        // Simular update
        showPopup('success', 'Perfil actualizado correctamente (Simulación)');
    };

    const clinicName = currentClinicName;

    return (
        <div className="flex min-h-screen bg-gray-50">
            {popup && <Popup type={popup.type} message={popup.message} onClose={() => setPopup(null)} isOpen={false} />}

            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10 font-sans">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-teal-100 p-2 rounded-lg">
                            <Briefcase className="h-6 w-6 text-teal-600" />
                        </div>
                        <div>
                            <span className="font-bold text-gray-800 block text-sm">Portal Empleado</span>
                        </div>
                    </div>

                    {/* Clinic Selector */}
                    <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Clínica Actual</label>
                        <div className="relative">
                            <select
                                value={selectedClinicId}
                                onChange={handleClinicChange}
                                className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2.5 pr-8 focus:ring-teal-500 focus:border-teal-500 block truncate font-medium outline-none cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                                {availableClinics.map(clinic => (
                                    <option key={clinic.id} value={clinic.id}>
                                        {clinic.name}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <button
                        onClick={() => setActiveTab('appointments')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'appointments'
                            ? 'bg-teal-50 text-teal-700 font-semibold shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <Calendar className="h-5 w-5" />
                        Gestionar Citas
                    </button>

                    <button
                        onClick={() => setActiveTab('services')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'services'
                            ? 'bg-teal-50 text-teal-700 font-semibold shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <Settings className="h-5 w-5" />
                        Servicios Clínica
                    </button>

                    <div className="pt-4 mt-4 border-t border-gray-100">
                        <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Mi Cuenta
                        </h3>
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'profile'
                                ? 'bg-teal-50 text-teal-700 font-semibold shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <User className="h-5 w-5" />
                            Mi Perfil
                        </button>
                    </div>
                </nav>

                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                    >
                        <LogOut className="h-4 w-4" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 min-h-screen">
                <header className="bg-white border-b border-gray-200 sticky top-0 z-20 px-8 py-5 flex justify-between items-center shadow-sm">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {activeTab === 'appointments' && 'Gestión de Citas'}
                        {activeTab === 'services' && 'Servicios de la Clínica'}
                        {activeTab === 'profile' && 'Perfil de Empleado'}
                    </h1>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">Bienvenido,</span>
                        <span className="font-semibold text-gray-900">{user.name}</span>
                    </div>
                </header>

                <div className="p-8 max-w-6xl mx-auto">

                    {/* Appointments Tab */}
                    {activeTab === 'appointments' && (
                        <div className="space-y-6">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center justify-between">
                                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                                    <button
                                        onClick={() => setFilterStatus('scheduled')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${filterStatus === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        Pendientes
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('completed')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${filterStatus === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        Completadas
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('cancelled')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${filterStatus === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        Canceladas
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('all')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${filterStatus === 'all' ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        Todas
                                    </button>
                                </div>
                            </div>

                            {loadingAppointments ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl"></div>)}
                                </div>
                            ) : appointments.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">No hay citas en esta categoría.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {appointments.map((app) => (
                                        <div key={app.id} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide
                                                        ${app.status === 'scheduled' || app.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                                                            app.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                                'bg-red-100 text-red-700'}`}>
                                                        {app.status}
                                                    </span>
                                                    <span className="text-sm text-gray-400">ID: #{app.id}</span>
                                                </div>
                                                <h3 className="font-bold text-lg text-gray-900">{app.service?.name || 'Servicio General'}</h3>
                                                <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        {new Date(app.scheduled_date).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4" />
                                                        {new Date(app.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4" />
                                                        {app.employee?.name || 'Sin asignar'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 pt-4 md:pt-0 border-t md:border-none border-gray-100">
                                                {(app.status !== 'completed' && app.status !== 'cancelled') && (
                                                    <>
                                                        <button
                                                            onClick={() => updateAppointmentStatus(app.id, 'completed')}
                                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-medium transition-colors"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                            Completar
                                                        </button>
                                                        <button
                                                            onClick={() => updateAppointmentStatus(app.id, 'cancelled')}
                                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-medium transition-colors"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                            Cancelar
                                                        </button>
                                                    </>
                                                )}
                                                {app.status === 'completed' && (
                                                    <span className="text-green-600 flex items-center gap-1 font-medium text-sm">
                                                        <CheckCircle className="h-4 w-4" /> Completada
                                                    </span>
                                                )}
                                                {app.status === 'cancelled' && (
                                                    <span className="text-red-600 flex items-center gap-1 font-medium text-sm">
                                                        <XCircle className="h-4 w-4" /> Cancelada
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Services Tab */}
                    {activeTab === 'services' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h2 className="text-lg font-bold text-gray-800 mb-4">Servicios Activos</h2>
                                {loadingServices ? (
                                    <div className="animate-pulse h-20 bg-gray-100 rounded-lg"></div>
                                ) : services.length === 0 ? (
                                    <p className="text-gray-500">No hay servicios registrados.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {services.map(service => (
                                            <div key={service.id} className="p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-bold text-gray-900">{service.name}</h3>
                                                    <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full font-bold">
                                                        ${service.price}
                                                    </span>
                                                </div>
                                                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{service.description}</p>
                                                <div className="flex items-center justify-between text-xs text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" /> {service.estimated_time} min
                                                    </span>
                                                    <span className={service.is_active ? "text-green-500" : "text-gray-400"}>
                                                        {service.is_active ? "Activo" : "Inactivo"}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Profile Card */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center lg:col-span-1 h-fit">
                                <div className="w-32 h-32 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
                                    <span className="text-4xl font-bold text-teal-600">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                                <p className="text-teal-600 font-medium mb-1">{clinicName}</p>
                                <p className="text-gray-500 text-sm mb-6">{user.email}</p>
                                <div className="inline-block px-4 py-1.5 bg-gray-100 rounded-full text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                    Empleado
                                </div>
                            </div>

                            {/* Forms */}
                            <div className="lg:col-span-2 space-y-8">
                                <form onSubmit={handleProfileUpdate} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <Settings className="w-5 h-5 text-teal-500" />
                                        Información Personal
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                                            <input
                                                type="text"
                                                value={profileData.name}
                                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                            <input
                                                type="email"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                    <button className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm">
                                        Actualizar Información
                                    </button>
                                </form>

                                <form onSubmit={handleProfileUpdate} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <Settings className="w-5 h-5 text-teal-500" />
                                        Seguridad
                                    </h3>
                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña Actual</label>
                                            <input
                                                type="password"
                                                value={profileData.current_password}
                                                onChange={(e) => setProfileData({ ...profileData, current_password: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
                                                <input
                                                    type="password"
                                                    value={profileData.new_password}
                                                    onChange={(e) => setProfileData({ ...profileData, new_password: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
                                                <input
                                                    type="password"
                                                    value={profileData.new_password_confirmation}
                                                    onChange={(e) => setProfileData({ ...profileData, new_password_confirmation: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        disabled={!profileData.new_password}
                                        className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cambiar Contraseña
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
