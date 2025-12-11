'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { slotApi, SlotObservation, CreateSlotObservation } from '@/lib/api';
import { Plus, Save, Trash2, Edit } from 'lucide-react';

export default function SlotEntryCard() {
  const [observations, setObservations] = useState<SlotObservation[]>([]);
  const [formData, setFormData] = useState<CreateSlotObservation>({
    slotName: '',
    location: '',
    amount: 0,
    status: 'active',
    notes: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchObservations = async () => {
    try {
      const res = await slotApi.getAll();
      setObservations(res.data);
    } catch (error) {
      console.error('Failed to fetch observations:', error);
    }
  };

  useEffect(() => {
    fetchObservations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await slotApi.update(editingId, formData);
      } else {
        await slotApi.create(formData);
      }
      
      resetForm();
      await fetchObservations();
    } catch (error) {
      console.error('Failed to save observation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (observation: SlotObservation) => {
    setFormData({
      slotName: observation.slotName,
      location: observation.location,
      amount: observation.amount,
      status: observation.status,
      notes: observation.notes || '',
    });
    setEditingId(observation.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this observation?')) return;

    try {
      await slotApi.delete(id);
      await fetchObservations();
    } catch (error) {
      console.error('Failed to delete observation:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      slotName: '',
      location: '',
      amount: 0,
      status: 'active',
      notes: '',
    });
    setEditingId(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Plus className="h-6 w-6 text-primary" />
          <CardTitle>Slot Entry</CardTitle>
        </div>
        <CardDescription>Create and manage slot observations</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slotName">Slot Name</Label>
              <Input
                id="slotName"
                placeholder="e.g., Slot A1"
                value={formData.slotName}
                onChange={(e) => setFormData({ ...formData, slotName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Floor 1, Zone B"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {editingId ? 'Update' : 'Create'} Observation
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </form>

        {/* Recent Observations */}
        <div className="mt-6">
          <h4 className="font-medium mb-3">Recent Observations</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {observations.slice(0, 5).map((obs) => (
              <div
                key={obs.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary"
              >
                <div className="flex-1">
                  <p className="font-medium">{obs.slotName}</p>
                  <p className="text-sm text-muted-foreground">
                    {obs.location} • ${obs.amount.toFixed(2)} • {obs.status}
                  </p>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(obs)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(obs.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {observations.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No observations yet. Create your first one above!
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
