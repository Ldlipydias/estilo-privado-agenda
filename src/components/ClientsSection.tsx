
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, User, Phone, Mail, Calendar, DollarSign, Edit } from "lucide-react";
import { Client, Appointment, Payment, Service } from "@/hooks/useBarberData";

interface ClientsSectionProps {
  clients: Client[];
  appointments: Appointment[];
  payments: Payment[];
  services: Service[];
  onAddClient: (client: Omit<Client, "id" | "createdAt">) => void;
  onUpdateClient: (id: string, updates: Partial<Client>) => void;
  onUpdatePayment: (id: string, updates: Partial<Payment>) => void;
  privacyMode: boolean;
}

const ClientsSection = ({ 
  clients, 
  appointments, 
  payments, 
  services,
  onAddClient, 
  onUpdateClient,
  onUpdatePayment,
  privacyMode 
}: ClientsSectionProps) => {
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [newClient, setNewClient] = useState({ name: "", phone: "", email: "" });

  const handleAddClient = () => {
    if (newClient.name && newClient.phone) {
      onAddClient(newClient);
      setNewClient({ name: "", phone: "", email: "" });
      setIsAddingClient(false);
    }
  };

  const getClientHistory = (clientId: string) => {
    return appointments
      .filter(apt => apt.clientId === clientId)
      .map(apt => {
        const service = services.find(s => s.id === apt.serviceId);
        const payment = payments.find(p => p.appointmentId === apt.id);
        return { appointment: apt, service, payment };
      })
      .sort((a, b) => new Date(b.appointment.date).getTime() - new Date(a.appointment.date).getTime());
  };

  const getTotalSpent = (clientId: string) => {
    const clientPayments = appointments
      .filter(apt => apt.clientId === clientId)
      .map(apt => payments.find(p => p.appointmentId === apt.id))
      .filter(Boolean) as Payment[];
    
    return clientPayments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const formatCurrency = (value: number) => {
    return privacyMode ? "***" : `R$ ${value.toFixed(2)}`;
  };

  const handleUpdatePaymentMethod = (paymentId: string, newMethod: string) => {
    onUpdatePayment(paymentId, { method: newMethod as Payment["method"] });
    setEditingPayment(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <Dialog open={isAddingClient} onOpenChange={setIsAddingClient}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={newClient.name}
                  onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={newClient.phone}
                  onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddClient} className="flex-1">
                  Adicionar
                </Button>
                <Button variant="outline" onClick={() => setIsAddingClient(false)} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map(client => {
          const totalSpent = getTotalSpent(client.id);
          const totalAppointments = appointments.filter(apt => apt.clientId === client.id).length;

          return (
            <Card key={client.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-blue-600" />
                  {client.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  {client.phone}
                </div>
                {client.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    {client.email}
                  </div>
                )}
                <div className="flex justify-between items-center pt-2">
                  <div className="text-sm">
                    <p className="font-medium text-green-600">{formatCurrency(totalSpent)}</p>
                    <p className="text-gray-500">{totalAppointments} atendimentos</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedClient(client)}
                  >
                    Ver Histórico
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {clients.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhum cliente cadastrado ainda.</p>
            <p className="text-sm text-gray-400">Clique em "Novo Cliente" para começar.</p>
          </CardContent>
        </Card>
      )}

      {/* Modal de histórico do cliente */}
      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Histórico de {selectedClient?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <DollarSign className="h-8 w-8 mx-auto text-green-600 mb-2" />
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(getTotalSpent(selectedClient.id))}
                    </p>
                    <p className="text-sm text-gray-500">Total Gasto</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Calendar className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                    <p className="text-2xl font-bold text-blue-600">
                      {appointments.filter(apt => apt.clientId === selectedClient.id).length}
                    </p>
                    <p className="text-sm text-gray-500">Atendimentos</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Phone className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                    <p className="text-sm font-medium text-purple-600">{selectedClient.phone}</p>
                    <p className="text-sm text-gray-500">Contato</p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Histórico de Atendimentos</h3>
                <div className="space-y-2">
                  {getClientHistory(selectedClient.id).map(({ appointment, service, payment }) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="font-medium">{service?.name}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant={appointment.status === "completed" ? "default" : "secondary"}>
                                {appointment.status === "completed" ? "Concluído" : 
                                 appointment.status === "scheduled" ? "Agendado" : "Cancelado"}
                              </Badge>
                              {payment && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    {payment.method === "cash" ? "Dinheiro" :
                                     payment.method === "pix" ? "PIX" :
                                     payment.method === "credit" ? "Cartão Crédito" : "Cartão Débito"}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingPayment(payment)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              {formatCurrency(payment?.amount || service?.price || 0)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {getClientHistory(selectedClient.id).length === 0 && (
                    <p className="text-gray-500 text-center py-4">Nenhum atendimento registrado</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para editar forma de pagamento */}
      <Dialog open={!!editingPayment} onOpenChange={() => setEditingPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Forma de Pagamento</DialogTitle>
          </DialogHeader>
          {editingPayment && (
            <div className="space-y-4">
              <div>
                <Label>Valor: {formatCurrency(editingPayment.amount)}</Label>
              </div>
              <div>
                <Label htmlFor="payment-method">Nova Forma de Pagamento</Label>
                <Select
                  defaultValue={editingPayment.method}
                  onValueChange={(value) => handleUpdatePaymentMethod(editingPayment.id, value)}
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientsSection;
