
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Scissors, Clock, DollarSign, Edit } from "lucide-react";
import { Service } from "@/hooks/useBarberData";

interface ServicesSectionProps {
  services: Service[];
  onAddService: (service: Omit<Service, "id">) => void;
  onUpdateService: (id: string, updates: Partial<Service>) => void;
}

const ServicesSection = ({ services, onAddService, onUpdateService }: ServicesSectionProps) => {
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newService, setNewService] = useState({
    name: "",
    price: "",
    duration: "",
    description: ""
  });

  const handleAddService = () => {
    if (newService.name && newService.price && newService.duration) {
      onAddService({
        name: newService.name,
        price: parseFloat(newService.price),
        duration: parseInt(newService.duration),
        description: newService.description || undefined
      });
      setNewService({ name: "", price: "", duration: "", description: "" });
      setIsAddingService(false);
    }
  };

  const handleUpdateService = () => {
    if (editingService && newService.name && newService.price && newService.duration) {
      onUpdateService(editingService.id, {
        name: newService.name,
        price: parseFloat(newService.price),
        duration: parseInt(newService.duration),
        description: newService.description || undefined
      });
      setEditingService(null);
      setNewService({ name: "", price: "", duration: "", description: "" });
    }
  };

  const startEditing = (service: Service) => {
    setEditingService(service);
    setNewService({
      name: service.name,
      price: service.price.toString(),
      duration: service.duration.toString(),
      description: service.description || ""
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Serviços</h1>
        <Dialog open={isAddingService} onOpenChange={setIsAddingService}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Serviço</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="service-name">Nome do Serviço *</Label>
                <Input
                  id="service-name"
                  value={newService.name}
                  onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Corte Masculino"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service-price">Preço (R$) *</Label>
                  <Input
                    id="service-price"
                    type="number"
                    step="0.01"
                    value={newService.price}
                    onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="25.00"
                  />
                </div>
                <div>
                  <Label htmlFor="service-duration">Duração (min) *</Label>
                  <Input
                    id="service-duration"
                    type="number"
                    value={newService.duration}
                    onChange={(e) => setNewService(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="30"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="service-description">Descrição</Label>
                <Textarea
                  id="service-description"
                  value={newService.description}
                  onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição opcional do serviço"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddService} className="flex-1">
                  Adicionar
                </Button>
                <Button variant="outline" onClick={() => setIsAddingService(false)} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(service => (
          <Card key={service.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scissors className="h-5 w-5 text-blue-600" />
                  <span className="text-lg">{service.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditing(service)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-600">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-bold text-lg">R$ {service.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{service.duration} min</span>
                </div>
              </div>
              {service.description && (
                <p className="text-sm text-gray-600">{service.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Scissors className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhum serviço cadastrado ainda.</p>
            <p className="text-sm text-gray-400">Clique em "Novo Serviço" para começar.</p>
          </CardContent>
        </Card>
      )}

      {/* Modal de edição de serviço */}
      <Dialog open={!!editingService} onOpenChange={() => setEditingService(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Serviço</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-service-name">Nome do Serviço *</Label>
              <Input
                id="edit-service-name"
                value={newService.name}
                onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Corte Masculino"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-service-price">Preço (R$) *</Label>
                <Input
                  id="edit-service-price"
                  type="number"
                  step="0.01"
                  value={newService.price}
                  onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="25.00"
                />
              </div>
              <div>
                <Label htmlFor="edit-service-duration">Duração (min) *</Label>
                <Input
                  id="edit-service-duration"
                  type="number"
                  value={newService.duration}
                  onChange={(e) => setNewService(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="30"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-service-description">Descrição</Label>
              <Textarea
                id="edit-service-description"
                value={newService.description}
                onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição opcional do serviço"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateService} className="flex-1">
                Salvar Alterações
              </Button>
              <Button variant="outline" onClick={() => setEditingService(null)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesSection;
