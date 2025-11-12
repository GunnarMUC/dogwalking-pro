import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { api } from '../../lib/api';
import { DollarSign, Download, Plus, Edit2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import type { Dog, Rate } from '@dogwalking/shared';

export function AdminBilling() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [rates, setRates] = useState<Rate[]>([]);
  const [billingData, setBillingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRateModal, setShowRateModal] = useState(false);
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });

  const [rateForm, setRateForm] = useState({
    dogId: '',
    hourlyRate: 0,
    effectiveFrom: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (dogs.length > 0) {
      generateReport();
    }
  }, [dateRange]);

  const loadData = async () => {
    try {
      const [dogsData, ratesData] = await Promise.all([
        api.getDogs(),
        api.getRates(),
      ]);
      setDogs(dogsData);
      setRates(ratesData);
    } catch (error) {
      toast.error('Fehler beim Laden der Daten');
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      const data = await api.getBillingReport(dateRange);
      setBillingData(data);
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Erstellen des Berichts');
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await api.exportBillingCSV(dateRange);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `abrechnung-${dateRange.startDate}-${dateRange.endDate}.csv`;
      a.click();
      toast.success('CSV exportiert');
    } catch (error: any) {
      toast.error(error.message || 'Export fehlgeschlagen');
    }
  };

  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createRate({
        dogId: rateForm.dogId,
        hourlyRate: rateForm.hourlyRate,
        effectiveFrom: new Date(rateForm.effectiveFrom),
      });
      toast.success('Honorarsatz gespeichert');
      setShowRateModal(false);
      setSelectedDog(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Speichern');
    }
  };

  const openRateModal = (dog: Dog) => {
    setSelectedDog(dog);
    const currentRate = rates.find(r => r.dogId === dog.id);
    setRateForm({
      dogId: dog.id,
      hourlyRate: currentRate?.hourlyRate || 25,
      effectiveFrom: format(new Date(), 'yyyy-MM-dd'),
    });
    setShowRateModal(true);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-dark">Abrechnung</h2>
          <p className="text-gray-600 mt-2">Honorarsätze und Abrechnungsübersicht</p>
        </div>

        {/* Rates Section */}
        <div className="card">
          <h3 className="text-xl font-bold text-dark mb-4">Honorarsätze</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dogs.map(dog => {
              const currentRate = rates.find(r => r.dogId === dog.id);
              return (
                <div key={dog.id} className="border border-gray-200 rounded-xl p-4 hover:border-primary transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-dark">{dog.name}</h4>
                      <p className="text-sm text-gray-600">
                        {dog.owner?.firstName} {dog.owner?.lastName}
                      </p>
                    </div>
                    <button
                      onClick={() => openRateModal(dog)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      {currentRate ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>
                  {currentRate ? (
                    <div className="bg-success/10 rounded-lg p-3">
                      <p className="text-2xl font-bold text-dark">{currentRate.hourlyRate.toFixed(2)} €</p>
                      <p className="text-xs text-gray-600 mt-1">pro Stunde</p>
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Kein Honorarsatz festgelegt</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Billing Report Section */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-dark">Abrechnungsbericht</h3>
            <button
              onClick={handleExportCSV}
              className="btn-secondary flex items-center space-x-2"
              disabled={!billingData}
            >
              <Download className="w-4 h-4" />
              <span>CSV Export</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Von
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Bis
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="input"
              />
            </div>
          </div>

          {billingData && (
            <>
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-primary/10 rounded-xl p-4">
                  <p className="text-sm text-gray-600">Gesamtanzahl</p>
                  <p className="text-3xl font-bold text-dark mt-2">
                    {billingData.summary.totalRecords}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Walks</p>
                </div>
                <div className="bg-accent/10 rounded-xl p-4">
                  <p className="text-sm text-gray-600">Gesamtdauer</p>
                  <p className="text-3xl font-bold text-dark mt-2">
                    {Math.floor(billingData.summary.totalDuration / 60)}h {billingData.summary.totalDuration % 60}m
                  </p>
                </div>
                <div className="bg-success/10 rounded-xl p-4">
                  <p className="text-sm text-gray-600">Gesamtbetrag</p>
                  <p className="text-3xl font-bold text-dark mt-2">
                    {billingData.summary.totalAmount.toFixed(2)} €
                  </p>
                </div>
              </div>

              {/* Records Table */}
              {billingData.records.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Datum
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Hund
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Besitzer
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Dauer
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Stundensatz
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Betrag
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {billingData.records.map((record: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                            {format(new Date(record.date), 'dd.MM.yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark">
                            {record.dogName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {record.ownerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                            {Math.floor(record.duration / 60)}h {record.duration % 60}m
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                            {record.hourlyRate.toFixed(2)} €
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark text-right">
                            {record.amount.toFixed(2)} €
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Keine Abrechnungsdaten für den ausgewählten Zeitraum
                </div>
              )}
            </>
          )}
        </div>

        {/* Rate Modal */}
        {showRateModal && selectedDog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-dark">
                  Honorarsatz für {selectedDog.name}
                </h3>
                <button
                  onClick={() => { setShowRateModal(false); setSelectedDog(null); }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSaveRate} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Stundensatz (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={rateForm.hourlyRate}
                    onChange={(e) => setRateForm({ ...rateForm, hourlyRate: Number(e.target.value) })}
                    required
                    min="0"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Gültig ab *
                  </label>
                  <input
                    type="date"
                    value={rateForm.effectiveFrom}
                    onChange={(e) => setRateForm({ ...rateForm, effectiveFrom: e.target.value })}
                    required
                    className="input"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Der neue Satz gilt für alle Walks ab diesem Datum.
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowRateModal(false); setSelectedDog(null); }}
                    className="btn-outline flex-1"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="btn-success flex-1"
                  >
                    Speichern
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

