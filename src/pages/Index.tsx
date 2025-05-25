
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Users, DollarSign, Calendar, TrendingUp, Scissors, CreditCard } from "lucide-react";
import ClientsSection from "@/components/ClientsSection";
import ServicesSection from "@/components/ServicesSection";
import VisitsSection from "@/components/VisitsSection";
import PaymentsSection from "@/components/PaymentsSection";
import { useBarberData } from "@/hooks/useBarberData";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [privacyMode, setPrivacyMode] = useState(false);
  const { 
    clients, 
    services, 
    visits, 
    payments, 
    addClient, 
    updateClient, 
    addService, 
    updateService, 
    addVisit, 
    updateVisit,
    addPayment,
    updatePayment 
  } = useBarberData();

  // Cálculos das estatísticas
  const today = new Date().toDateString();
  const todayVisits = visits.filter(visit => new Date(visit.date).toDateString() === today);
  const todayRevenue = todayVisits.reduce((sum, visit) => {
    const payment = payments.find(p => p.visitId === visit.id);
    return sum + (payment?.amount || 0);
  }, 0);

  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  const weeklyVisits = visits.filter(visit => new Date(visit.date) >= thisWeekStart);
  const weeklyRevenue = weeklyVisits.reduce((sum, visit) => {
    const payment = payments.find(p => p.visitId === visit.id);
    return sum + (payment?.amount || 0);
  }, 0);

  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);
  const monthlyVisits = visits.filter(visit => new Date(visit.date) >= thisMonthStart);
  const monthlyRevenue = monthlyVisits.reduce((sum, visit) => {
    const payment = payments.find(p => p.visitId === visit.id);
    return sum + (payment?.amount || 0);
  }, 0);

  const formatCurrency = (value: number) => {
    return privacyMode ? "***" : `R$ ${value.toFixed(2)}`;
  };

  const formatNumber = (value: number) => {
    return privacyMode ? "***" : value.toString();
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Caderneta do Barbeiro</h1>
        <Button
          variant="outline"
          onClick={() => setPrivacyMode(!privacyMode)}
          className="flex items-center gap-2"
        >
          {privacyMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {privacyMode ? "Mostrar Valores" : "Ocultar Valores"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Faturamento Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{formatCurrency(todayRevenue)}</div>
            <p className="text-xs text-blue-600">Atendimentos: {formatNumber(todayVisits.length)}</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Faturamento Semanal</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{formatCurrency(weeklyRevenue)}</div>
            <p className="text-xs text-green-600">Atendimentos: {formatNumber(weeklyVisits.length)}</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Faturamento Mensal</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{formatCurrency(monthlyRevenue)}</div>
            <p className="text-xs text-purple-600">Total de atendimentos: {formatNumber(monthlyVisits.length)}</p>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{clients.length}</div>
            <p className="text-xs text-orange-600">Cadastrados no sistema</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Últimos Atendimentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {visits
                .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime())
                .slice(0, 5)
                .map(visit => {
                  const client = clients.find(c => c.id === visit.clientId);
                  const service = services.find(s => s.id === visit.serviceId);
                  const payment = payments.find(p => p.visitId === visit.id);
                  
                  return (
                    <div key={visit.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{client?.name}</p>
                        <p className="text-sm text-gray-600">{service?.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(visit.date).toLocaleDateString('pt-BR')} às {visit.time}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(payment?.amount || service?.price || 0)}</p>
                        {payment && (
                          <Badge variant="outline" className="text-xs">
                            {payment.method === "cash" ? "Dinheiro" :
                             payment.method === "pix" ? "PIX" :
                             payment.method === "credit" ? "Cartão Crédito" : "Cartão Débito"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              {visits.length === 0 && (
                <p className="text-gray-500 text-center py-4">Nenhum atendimento registrado</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="h-5 w-5" />
              Serviços Mais Realizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {services.slice(0, 5).map(service => {
                const serviceVisits = visits.filter(visit => visit.serviceId === service.id);
                return (
                  <div key={service.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-gray-600">{service.duration} min</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{formatCurrency(service.price)}</p>
                      <p className="text-xs text-gray-500">{serviceVisits.length} realizados</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={activeTab === "dashboard" ? "default" : "outline"}
              onClick={() => setActiveTab("dashboard")}
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === "clients" ? "default" : "outline"}
              onClick={() => setActiveTab("clients")}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Clientes
            </Button>
            <Button
              variant={activeTab === "services" ? "default" : "outline"}
              onClick={() => setActiveTab("services")}
              className="flex items-center gap-2"
            >
              <Scissors className="h-4 w-4" />
              Serviços
            </Button>
            <Button
              variant={activeTab === "visits" ? "default" : "outline"}
              onClick={() => setActiveTab("visits")}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Atendimentos
            </Button>
            <Button
              variant={activeTab === "payments" ? "default" : "outline"}
              onClick={() => setActiveTab("payments")}
              className="flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Pagamentos
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "clients" && (
            <ClientsSection 
              clients={clients} 
              visits={visits}
              payments={payments}
              services={services}
              onAddClient={addClient} 
              onUpdateClient={updateClient}
              onUpdatePayment={updatePayment}
              privacyMode={privacyMode}
            />
          )}
          {activeTab === "services" && (
            <ServicesSection 
              services={services} 
              onAddService={addService} 
              onUpdateService={updateService} 
            />
          )}
          {activeTab === "visits" && (
            <VisitsSection 
              visits={visits}
              clients={clients}
              services={services}
              payments={payments}
              onAddVisit={addVisit}
              onAddPayment={addPayment}
              privacyMode={privacyMode}
            />
          )}
          {activeTab === "payments" && (
            <PaymentsSection 
              payments={payments}
              visits={visits}
              clients={clients}
              services={services}
              onUpdatePayment={updatePayment}
              privacyMode={privacyMode}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
