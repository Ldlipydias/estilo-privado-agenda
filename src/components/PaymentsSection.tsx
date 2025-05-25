
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CreditCard, DollarSign, Calendar, TrendingUp, Edit, Eye, EyeOff } from "lucide-react";
import { Payment, Appointment, Client, Service } from "@/hooks/useBarberData";

interface PaymentsSectionProps {
  payments: Payment[];
  appointments: Appointment[];
  clients: Client[];
  services: Service[];
  onUpdatePayment: (id: string, updates: Partial<Payment>) => void;
  privacyMode: boolean;
}

const PaymentsSection = ({ 
  payments, 
  appointments, 
  clients, 
  services, 
  onUpdatePayment,
  privacyMode 
}: PaymentsSectionProps) => {
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [filterPeriod, setFilterPeriod] = useState<string>("all");
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [localPrivacyMode, setLocalPrivacyMode] = useState(privacyMode);

  const getAppointmentDetails = (appointmentId: string) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return { client: null, service: null, appointment: null };
    
    const client = clients.find(c => c.id === appointment.clientId);
    const service = services.find(s => s.id === appointment.serviceId);
    
    return { client, service, appointment };
  };

  const formatCurrency = (value: number) => {
    return localPrivacyMode ? "***" : `R$ ${value.toFixed(2)}`;
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

  const getMethodColor = (method: Payment["method"]) => {
    switch (method) {
      case "cash": return "bg-green-100 text-green-800";
      case "pix": return "bg-blue-100 text-blue-800";
      case "credit": return "bg-purple-100 text-purple-800";
      case "debit": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filterPayments = () => {
    let filtered = payments;

    if (filterMethod !== "all") {
      filtered = filtered.filter(payment => payment.method === filterMethod);
    }

    if (filterPeriod !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.date);
        switch (filterPeriod) {
          case "today":
            return paymentDate >= today;
          case "week":
            return paymentDate >= weekStart;
          case "month":
            return paymentDate >= monthStart;
          default:
            return true;
        }
      });
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const calculateStats = () => {
    const filtered = filterPayments();
    const total = filtered.reduce((sum, payment) => sum + payment.amount, 0);
    const count = filtered.length;
    
    const methodStats = payments.reduce((acc, payment) => {
      acc[payment.method] = (acc[payment.method] || 0) + payment.amount;
      return acc;
    }, {} as Record<Payment["method"], number>);

    return { total, count, methodStats };
  };

  const { total, count, methodStats } = calculateStats();
  const filteredPayments = filterPayments();

  const handleUpdatePaymentMethod = (paymentId: string, newMethod: string) => {
    onUpdatePayment(paymentId, { method: newMethod as Payment["method"] });
    setEditingPayment(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Pagamentos</h1>
        <Button
          variant="outline"
          onClick={() => setLocalPrivacyMode(!localPrivacyMode)}
          className="flex items-center gap-2"
        >
          {localPrivacyMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {localPrivacyMode ? "Mostrar Valores" : "Ocultar Valores"}
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Recebido</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{formatCurrency(total)}</div>
            <p className="text-xs text-green-600">{count} pagamentos</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">PIX</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{formatCurrency(methodStats.pix || 0)}</div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Dinheiro</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{formatCurrency(methodStats.cash || 0)}</div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Cartões</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {formatCurrency((methodStats.credit || 0) + (methodStats.debit || 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <div>
          <Label>Forma de Pagamento</Label>
          <Select value={filterMethod} onValueChange={setFilterMethod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="cash">Dinheiro</SelectItem>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="credit">Cartão Crédito</SelectItem>
              <SelectItem value="debit">Cartão Débito</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Período</Label>
          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de pagamentos */}
      <div className="space-y-3">
        {filteredPayments.map(payment => {
          const { client, service, appointment } = getAppointmentDetails(payment.appointmentId);

          return (
            <Card key={payment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{client?.name || "Cliente não encontrado"}</span>
                      <Badge className={getMethodColor(payment.method)}>
                        {getMethodLabel(payment.method)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{service?.name || "Serviço não encontrado"}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(payment.date).toLocaleDateString('pt-BR')}</span>
                      {appointment && (
                        <>
                          <span>•</span>
                          <span>{appointment.time}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-lg font-bold text-green-600">{formatCurrency(payment.amount)}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingPayment(payment)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Editar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredPayments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhum pagamento encontrado.</p>
            <p className="text-sm text-gray-400">Ajuste os filtros ou finalize alguns atendimentos.</p>
          </CardContent>
        </Card>
      )}

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

export default PaymentsSection;
