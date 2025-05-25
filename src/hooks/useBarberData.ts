
import { useState, useEffect } from "react";

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  serviceId: string;
  date: string;
  time: string;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
}

export interface Payment {
  id: string;
  appointmentId: string;
  amount: number;
  method: "cash" | "pix" | "credit" | "debit";
  date: string;
}

const STORAGE_KEYS = {
  clients: "barber_clients",
  services: "barber_services", 
  appointments: "barber_appointments",
  payments: "barber_payments"
};

export const useBarberData = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Carregar dados do localStorage
  useEffect(() => {
    const loadedClients = localStorage.getItem(STORAGE_KEYS.clients);
    const loadedServices = localStorage.getItem(STORAGE_KEYS.services);
    const loadedAppointments = localStorage.getItem(STORAGE_KEYS.appointments);
    const loadedPayments = localStorage.getItem(STORAGE_KEYS.payments);

    if (loadedClients) setClients(JSON.parse(loadedClients));
    if (loadedServices) setServices(JSON.parse(loadedServices));
    if (loadedAppointments) setAppointments(JSON.parse(loadedAppointments));
    if (loadedPayments) setPayments(JSON.parse(loadedPayments));

    // Dados iniciais se não houver nada salvo
    if (!loadedServices) {
      const initialServices: Service[] = [
        { id: "1", name: "Corte Masculino", price: 25.00, duration: 30 },
        { id: "2", name: "Barba", price: 15.00, duration: 20 },
        { id: "3", name: "Corte + Barba", price: 35.00, duration: 45 },
        { id: "4", name: "Sobrancelha", price: 10.00, duration: 15 }
      ];
      setServices(initialServices);
      localStorage.setItem(STORAGE_KEYS.services, JSON.stringify(initialServices));
    }
  }, []);

  // Salvar no localStorage quando os dados mudarem
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.services, JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.payments, JSON.stringify(payments));
  }, [payments]);

  // Funções para clientes
  const addClient = (client: Omit<Client, "id" | "createdAt">) => {
    const newClient: Client = {
      ...client,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setClients(prev => [...prev, newClient]);
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(client => 
      client.id === id ? { ...client, ...updates } : client
    ));
  };

  // Funções para serviços
  const addService = (service: Omit<Service, "id">) => {
    const newService: Service = {
      ...service,
      id: Date.now().toString()
    };
    setServices(prev => [...prev, newService]);
  };

  const updateService = (id: string, updates: Partial<Service>) => {
    setServices(prev => prev.map(service => 
      service.id === id ? { ...service, ...updates } : service
    ));
  };

  // Funções para agendamentos
  const addAppointment = (appointment: Omit<Appointment, "id">) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now().toString()
    };
    setAppointments(prev => [...prev, newAppointment]);
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    setAppointments(prev => prev.map(appointment => 
      appointment.id === id ? { ...appointment, ...updates } : appointment
    ));
  };

  // Funções para pagamentos
  const addPayment = (payment: Omit<Payment, "id">) => {
    const newPayment: Payment = {
      ...payment,
      id: Date.now().toString()
    };
    setPayments(prev => [...prev, newPayment]);
  };

  const updatePayment = (id: string, updates: Partial<Payment>) => {
    setPayments(prev => prev.map(payment => 
      payment.id === id ? { ...payment, ...updates } : payment
    ));
  };

  return {
    clients,
    services,
    appointments,
    payments,
    addClient,
    updateClient,
    addService,
    updateService,
    addAppointment,
    updateAppointment,
    addPayment,
    updatePayment
  };
};
