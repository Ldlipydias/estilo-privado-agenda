
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, User, Calendar, Clock, DollarSign, Scissors } from "lucide-react";
import { Client, Visit, Payment, Service } from "@/hooks/useBarberData";

interface VisitsSectionProps {
  visits: Visit[];
  clients: Client[];
  services: Service[];
  payments: Payment[];
  onAddVisit: (visit: Omit<Visit, "id">) => void;
  onAddPayment: (payment: Omit<Payment, "id">) => void;
  privacyMode: boolean;
}

const VisitsSection = ({ 
  visits, 
  clients, 
  services, 
  payments, 
  onAddVisit, 
  onAddPayment,
  privacyMode 
}: VisitsSectionProps) => {
  const [isAddingVisit, setIsAddingVisit] = useState(false);
  const [newVisit, setNewVisit] = useState({
    clientId: "",
    serviceId: "",
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    notes: "",
    paymentMethod: "cash" as Payment["method"],
    amount: 0
  });

  const handleAddVisit = () => {
    if (newVisit.clientId && newVisit.serviceId && newVisit.date && newVisit.time) {
      const visitData = {
        clientId: newVisit.clientId,
        serviceId: newVisit.serviceId,
        date: newVisit.date,
        time: newVisit.time,
        notes: newVisit.notes
      };
      
      // Gerar ID único para sincronizar visit e payment
      const visitId = Date.now().toString();
      
      // Adicionar visit com ID específico
      onAddVisit({ ...visitData, id: visitId } as any);
      
      // Adicionar pagamento com o mesmo ID
      const service = services.find(s => s.id === newVisit.serviceId);
      const paymentAmount = newVisit.amount || service?.price || 0;
      
      onAddPayment({
        visitId: visitId,
        amount: paymentAmount,
        method: newVisit.paymentMethod,
        date: new Date().toISOString()
      });

      setNewVisit({
        clientId: "",
        serviceId: "",
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        notes: "",
        paymentMethod: "cash",
        amount: 0
      });
      setIsAddingVisit(false);
    }
  };

  const getVisitDetails = (visit: Visit) => {
    const client = clients.find(c => c.id === visit.clientId);
    const service = services.find(s => s.id === visit.serviceId);
    const payment = payments.find(p => p.visitId === visit.id);
    return { client, service, payment };
  };

  const formatCurrency = (value: number) => {
    return privacyMode ? "***" : `R$ ${value.toFixed(2)}`;
  };

  const getMethodLabel = (method: Payment["method"]) => {
    switch (method) {
      case "cash": return "Dinheiro";
      case "pix": return "PIX";
      case "credit": return "Cartão Crédito";
      case "debit": return "Cartão Débito";
      default: return method;
    }
  };

  const sortedVisits = visits.sort((a, b) => 
    new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Atendimentos Realizados</h1>
        <Dialog open={isAddingVisit} onOpenChange={setIsAddingVisit}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Registrar Atendimento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Novo Atendimento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="client">Cliente *</Label>
                <Select value={newVisit.clientId} onValueChange={(value) => setNewVisit(prev => ({ ...prev, clientId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
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
                <Select 
                  value={newVisit.serviceId} 
                  onValueChange={(value) => {
                    const service = services.find(s => s.id === value);
                    setNewVisit(prev => ({ 
                      ...prev, 
                      serviceId: value,
                      amount: service?.price || 0
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço" />
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
                    value={newVisit.date}
                    onChange={(e) => setNewVisit(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Horário *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newVisit.time}
                    onChange={(e) => setNewVisit(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="amount">Valor Cobrado</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={newVisit.amount}
                  onChange={(e) => setNewVisit(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="payment">Forma de Pagamento</Label>
                <Select value={newVisit.paymentMethod} onValueChange={(value: Payment["method"]) => setNewVisit(prev => ({ ...prev, paymentMethod: value }))}>
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

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={newVisit.notes}
                  onChange={(e) => setNewVisit(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observações sobre o atendimento..."
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddVisit} className="flex-1">
                  Registrar
                </Button>
                <Button variant="outline" onClick={() => setIsAddingVisit(false)} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {sortedVisits.map(visit => {
          const { client, service, payment } = getVisitDetails(visit);

          return (
            <Card key={visit.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{client?.name || "Cliente não encontrado"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Scissors className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-600">{service?.name || "Serviço não encontrado"}</span>
                      <span className="text-xs text-gray-400">({service?.duration || 0} min)</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(visit.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{visit.time}</span>
                      </div>
                    </div>
                    {payment && (
                      <Badge variant="outline" className="text-xs">
                        {getMethodLabel(payment.method)}
                      </Badge>
                    )}
                    {visit.notes && (
                      <p className="text-sm text-gray-500 italic">{visit.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-lg font-bold text-green-600">
                      <DollarSign className="h-4 w-4" />
                      {formatCurrency(payment?.amount || service?.price || 0)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {visits.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Scissors className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhum atendimento registrado ainda.</p>
            <p className="text-sm text-gray-400">Clique em "Registrar Atendimento" para começar.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VisitsSection;
