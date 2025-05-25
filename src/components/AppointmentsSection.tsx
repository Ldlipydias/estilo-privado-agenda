
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Calendar, Clock, User, Scissors, DollarSign, CreditCard } from "lucide-react";
import { Appointment, Client, Service, Payment } from "@/hooks/useBarberData";

interface AppointmentsSectionProps {
  appointments: Appointment[];
  clients: Client[];
  services: Service[];
  payments: Payment[];
  onAddAppointment: (appointment: Omit<Appointment, "id">) => void;
  onUpdateAppointment: (id: string, updates: Partial<Appointment>) => void;
  onAddPayment: (payment: Omit<Payment, "id">) => void;
}

const AppointmentsSection = ({ 
  appointments, 
  clients, 
  services, 
  payments,
  onAddAppointment, 
  onUpdateAppointment,
  onAddPayment 
}: AppointmentsSectionProps) => {
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [newAppointment, setNewAppointment] = useState({
    clientId: "",
    serviceId: "",
    date: "",
    time: "",
    notes: ""
  });
  const [paymentData, setPaymentData] = useState({
    method: "cash" as Payment["method"],
    amount: ""
  });

  const handleAddAppointment = () => {
    if (newAppointment.clientId && newAppointment.serviceId && newAppointment.date && newAppointment.time) {
      onAddAppointment({
        clientId: newAppointment.clientId,
        serviceId: newAppointment.serviceId,
        date: newAppointment.date,
        time: newAppointment.time,
        status: "scheduled",
        notes: newAppointment.notes || undefined
      });
      setNewAppointment({ clientId: "", serviceId: "", date: "", time: "", notes: "" });
      setIsAddingAppointment(false);
    }
  };

  const completeAppointment = (appointmentId: string) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    const service = services.find(s => s.id === appointment?.serviceId);
    
    if (appointment && service) {
      onUpdateAppointment(appointmentId, { status: "completed" });
      
      // Adicionar pagamento
      onAddPayment({
        appointmentId,
        amount: parseFloat(paymentData.amount) || service.price,
        method: paymentData.method,
        date: new Date().toISOString()
      });
      
      setSelectedAppointment(null);
      setPaymentData({ method: "cash", amount: "" });
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || "Cliente não encontrado";
  };

  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || "Serviço não encontrado";
  };

  const getServicePrice = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service?.price || 0;
  };

  const getPayment = (appointmentId: string) => {
    return payments.find(p => p.appointmentId === appointmentId);
  };

  const sortedAppointments = appointments.sort((a, b) => {
    const dateA = new Date(a.date + 'T' + a.time);
    const dateB = new Date(b.date + 'T' + b.time);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Atendimentos</h1>
        <Dialog open={isAddingAppointment} onOpenChange={setIsAddingAppointment}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Atendimento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agendar Novo Atendimento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="client">Cliente *</Label>
                <Select value={newAppointment.clientId} onValueChange={(value) => 
                  setNewAppointment(prev => ({ ...prev, clientId: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="service">Serviço *</Label>
                <Select value={newAppointment.serviceId} onValueChange={(value) => 
                  setNewAppointment(prev => ({ ...prev, serviceId: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(service => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - R$ {service.price.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Horário *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observações sobre o atendimento"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddAppointment} className="flex-1">
                  Agendar
                </Button>
                <Button variant="outline" onClick={() => setIsAddingAppointment(false)} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {sortedAppointments.map(appointment => {
          const payment = getPayment(appointment.id);
          const servicePrice = getServicePrice(appointment.serviceId);

          return (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{getClientName(appointment.clientId)}</span>
                      <Badge variant={
                        appointment.status === "completed" ? "default" :
                        appointment.status === "scheduled" ? "secondary" : "destructive"
                      }>
                        {appointment.status === "completed" ? "Concluído" :
                         appointment.status === "scheduled" ? "Agendado" : "Cancelado"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Scissors className="h-4 w-4" />
                      <span>{getServiceName(appointment.serviceId)}</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(appointment.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{appointment.time}</span>
                      </div>
                    </div>
                    {appointment.notes && (
                      <p className="text-sm text-gray-500 italic">{appointment.notes}</p>
                    )}
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-lg font-bold text-green-600">
                      R$ {(payment?.amount || servicePrice).toFixed(2)}
                    </p>
                    {payment && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        {payment.method === "cash" ? "Dinheiro" :
                         payment.method === "pix" ? "PIX" :
                         payment.method === "credit" ? "Cartão Crédito" : "Cartão Débito"}
                      </Badge>
                    )}
                    {appointment.status === "scheduled" && (
                      <Button
                        size="sm"
                        onClick={() => setSelectedAppointment(appointment)}
                        className="w-full"
                      >
                        Finalizar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {appointments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhum atendimento agendado ainda.</p>
            <p className="text-sm text-gray-400">Clique em "Novo Atendimento" para começar.</p>
          </CardContent>
        </Card>
      )}

      {/* Modal para finalizar atendimento */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Atendimento</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p><strong>Cliente:</strong> {getClientName(selectedAppointment.clientId)}</p>
                <p><strong>Serviço:</strong> {getServiceName(selectedAppointment.serviceId)}</p>
                <p><strong>Data:</strong> {new Date(selectedAppointment.date).toLocaleDateString('pt-BR')} às {selectedAppointment.time}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment-amount">Valor (R$)</Label>
                  <Input
                    id="payment-amount"
                    type="number"
                    step="0.01"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder={getServicePrice(selectedAppointment.serviceId).toFixed(2)}
                  />
                </div>
                <div>
                  <Label htmlFor="payment-method">Forma de Pagamento</Label>
                  <Select
                    value={paymentData.method}
                    onValueChange={(value: Payment["method"]) => 
                      setPaymentData(prev => ({ ...prev, method: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="credit">Cartão de Crédito</SelectItem>
                      <SelectItem value="debit">Cartão de Débito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => completeAppointment(selectedAppointment.id)} 
                  className="flex-1"
                >
                  Finalizar Atendimento
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedAppointment(null)} 
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsSection;
