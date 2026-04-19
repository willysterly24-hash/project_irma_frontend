import { useState } from 'react';
import { Plus, X, Users, Calendar, Bed, CreditCard, Phone, Mail, Edit2, Trash2 } from 'lucide-react';

interface Reservations {
  id: string;
  guest: string;
  email: string;
  phone: string;
  room: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  status: string;
  amount: number;
  pricePerNight: number;
  avatar: string;
  specialRequests?: string;
}

interface ReservationsEnCoursProps {
  reservations: Reservations[];
  onAddReservation: (reservation: Reservations) => void;
  onUpdateReservation: (reservation: Reservations) => void;
  onCancelReservation: (id: string) => void;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  "En cours": { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500" },
  "Confirmée": { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500" },
};


const avatarColors = [
  "bg-purple-100 text-purple-700",
  "bg-teal-100 text-teal-700", "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700", "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700"
];

const rooms = [
  { name: "Suite Royale 401", type: "Suite", capacity: 4, price:1000 },
  { name: "Chambre Deluxe 210", type: "Deluxe", capacity: 2, price: 650 },
  { name: "Junior Suite 305", type: "Suite", capacity: 3, price: 950 },
  { name: "Chambre Standard 108", type: "Standard", capacity: 2, price: 300 },
  { name: "Suite Présidentielle 501", type: "Suite", capacity: 6, price: 1500 },
  { name: "Chambre Standard 102", type: "Standard", capacity: 2, price: 350 },
  { name: "Chambre Deluxe 220", type: "Deluxe", capacity: 2, price: 700 },
  { name: "Junior Suite 310", type: "Suite", capacity: 3, price: 1100 }
];

export default function ReservationEnCours({ 
  reservations, 
  onAddReservation, 
  onUpdateReservation, 
  onCancelReservation 
}: ReservationsEnCoursProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRes, setSelectedRes] = useState<Reservations | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<Reservations | null>(null);
  
  const [formData, setFormData] = useState({
    guest: '',
    email: '',
    phone: '',
    room: '',
    roomType: '',
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0,
    status: 'Confirmée',
    specialRequests: ''
  });

  const calculateNights = (checkIn: string, checkOut: string) => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }
    return 0;
  };

  const getRoomPrice = (roomName: string) => {
    const room = rooms.find(r => r.name === roomName);
    return room ? room.price : 0;
  };

  const nights = calculateNights(formData.checkIn, formData.checkOut);
  const pricePerNight = getRoomPrice(formData.room);
  const totalPrice = pricePerNight * nights;

  const handleRoomChange = (roomName: string) => {
    const selectedRoom = rooms.find(r => r.name === roomName);
    if (selectedRoom) {
      setFormData({
        ...formData,
        room: roomName,
        roomType: selectedRoom.type,
      });
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const nightsCount = calculateNights(formData.checkIn, formData.checkOut);
    const roomPrice = getRoomPrice(formData.room);
    const totalAmount = roomPrice * nightsCount;
    
    if (nightsCount <= 0) {
      alert('Veuillez sélectionner des dates valides');
      return;
    }
    
    if (!formData.room) {
      alert('Veuillez sélectionner une chambre');
      return;
    }
    
    const newReservation: Reservations = {
      id: `RES-${Date.now()}`,
      guest: formData.guest,
      email: formData.email,
      phone: formData.phone,
      room: formData.room,
      roomType: formData.roomType,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      nights: nightsCount,
      adults: formData.adults,
      children: formData.children,
      status: formData.status,
      amount: totalAmount,
      pricePerNight: roomPrice,
      avatar: formData.guest.split(' ').map(n => n[0]).join('').toUpperCase(),
      specialRequests: formData.specialRequests
    };
    
    onAddReservation(newReservation);
    setShowAddModal(false);
    setFormData({
      guest: '',
      email: '',
      phone: '',
      room: '',
      roomType: '',
      checkIn: '',
      checkOut: '',
      adults: 1,
      children: 0,
      status: 'Confirmée',
      specialRequests: ''
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRes) {
      const nightsCount = calculateNights(formData.checkIn, formData.checkOut);
      const roomPrice = getRoomPrice(formData.room);
      const totalAmount = roomPrice * nightsCount;
      
      const updatedReservation = {
        ...selectedRes,
        guest: formData.guest,
        email: formData.email,
        phone: formData.phone,
        room: formData.room,
        roomType: formData.roomType,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        nights: nightsCount,
        adults: formData.adults,
        children: formData.children,
        status: formData.status,
        pricePerNight: roomPrice,
        amount: totalAmount,
        avatar: formData.guest.split(' ').map(n => n[0]).join('').toUpperCase(),
        specialRequests: formData.specialRequests
      };
      onUpdateReservation(updatedReservation);
      setShowEditModal(false);
      setSelectedRes(null);
    }
  };

  const openEditModal = (res: Reservations) => {
    setSelectedRes(res);
    setFormData({
      guest: res.guest,
      email: res.email,
      phone: res.phone,
      room: res.room,
      roomType: res.roomType,
      checkIn: res.checkIn,
      checkOut: res.checkOut,
      adults: res.adults,
      children: res.children,
      status: res.status,
      specialRequests: res.specialRequests || ''
    });
    setShowEditModal(true);
  };

  const openDetailsModal = (res: Reservations) => {
    setSelectedDetails(res);
    setShowDetailsModal(true);
  };

  const handleCancel = (id: string, guest: string) => {
    if (confirm(`Êtes-vous sûr de vouloir annuler la réservation de ${guest} ?`)) {
      onCancelReservation(id);
    }
  };

  const formatPrice = (price: number) => price.toLocaleString() + '€';

  const totalReservations = reservations.length;
  const totalRevenue = reservations.reduce((sum, r) => sum + r.amount, 0);
  const totalNights = reservations.reduce((sum, r) => sum + r.nights, 0);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Réservations en cours</h1>
          <p className="text-gray-500 text-sm mt-1">
            {totalReservations} réservation(s) active(s)
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-xl hover:bg-amber-600 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nouvelle réservation
        </button>
      </div>

      {/* Cartes statistiques */}
      {totalReservations > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-gray-900 to-yellow-500  rounded-xl p-4 text-white">
            <p className="text-sm opacity-90">Total réservations</p>
            <p className="text-2xl font-bold">{totalReservations}</p>
          </div>
          <div className="bg-gradient-to-r from-gray-900 to-yellow-500 rounded-xl p-4 text-white">
            <p className="text-sm opacity-90">Revenu total</p>
            <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
          </div>
          <div className="bg-gradient-to-r from-gray-900 to-yellow-500 rounded-xl p-4 text-white">
  <p className="text-sm opacity-90">Nuits totales</p>
  <p className="text-2xl font-bold">{totalNights} nuits</p>
        </div>
        </div>
      )}

      {/* Liste des réservations */}
      <div className="space-y-3">
        {reservations.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucune réservation en cours</p>
            <p className="text-sm text-gray-400 mt-1">Vous n'avez pas encore de réservation active</p>
            <button onClick={() => setShowAddModal(true)} className="mt-4 text-amber-600 font-medium hover:underline">
              Faire une réservation
            </button>
          </div>
        ) : (
          reservations.map((res, i) => (
            <div 
              key={res.id} 
              className="bg-white rounded-2xl border p-5 hover:shadow-md transition cursor-pointer"
              onClick={() => openDetailsModal(res)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold ${avatarColors[i % avatarColors.length]}`}>
                      {res.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-lg">{res.guest}</p>
                      <p className="text-xs text-gray-400">{res.id}</p>
                    </div>
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${statusConfig[res.status]?.bg} ${statusConfig[res.status]?.text}`}>
                      {res.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Chambre</p>
                      <p className="font-medium text-gray-800">{res.room}</p>
                      <p className="text-xs text-gray-400">{res.roomType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Dates</p>
                      <p className="text-sm font-medium">{res.checkIn}</p>
                      <p className="text-xs text-gray-400">→ {res.checkOut}</p>
                      <p className="text-xs text-gray-400">{res.nights} nuits</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Personnes</p>
                      <p className="text-sm">{res.adults} adulte{res.adults !== 1 ? 's' : ''}</p>
                      {res.children > 0 && <p className="text-xs text-gray-400">+ {res.children} enfant(s)</p>}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Montant</p>
                      <p className="text-lg font-bold text-amber-600">{formatPrice(res.amount)}</p>
                      <p className="text-xs text-gray-400">{formatPrice(res.pricePerNight)}/nuit</p>
                    </div>
                  </div>

                  {(res.email || res.phone) && (
                    <div className="mt-4 pt-3 border-t flex gap-4 text-xs text-gray-500">
                      {res.email && <p className="flex items-center gap-1"><Mail className="w-3 h-3" /> {res.email}</p>}
                      {res.phone && <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> {res.phone}</p>}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openEditModal(res)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                    title="Modifier"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCancel(res.id, res.guest)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Annuler"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Ajout - garder le même code que précédemment */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Nouvelle réservation</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-5">
              {/* Informations client */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-500" /> Informations client
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nom complet *</label>
                    <input type="text" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" 
                      value={formData.guest} onChange={e => setFormData({...formData, guest: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input type="email" className="w-full px-4 py-2 border rounded-lg" 
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Téléphone *</label>
                    <input type="tel" required className="w-full px-4 py-2 border rounded-lg" 
                      value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" /> Dates du séjour
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Arrivée *</label>
                    <input type="date" required className="w-full px-4 py-2 border rounded-lg" 
                      value={formData.checkIn} onChange={e => setFormData({...formData, checkIn: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Départ *</label>
                    <input type="date" required className="w-full px-4 py-2 border rounded-lg" 
                      value={formData.checkOut} onChange={e => setFormData({...formData, checkOut: e.target.value})} />
                  </div>
                </div>
                {formData.checkIn && formData.checkOut && nights > 0 && (
                  <div className="mt-2 text-sm text-gray-600">📅 {nights} nuit{nights > 1 ? 's' : ''}</div>
                )}
              </div>

              {/* Hébergement */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Bed className="w-5 h-5 text-amber-500" /> Hébergement
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Chambre *</label>
                    <select required className="w-full px-4 py-2 border rounded-lg" 
                      value={formData.room} onChange={e => handleRoomChange(e.target.value)}>
                      <option value="">Sélectionner une chambre</option>
                      {rooms.map(room => (
                        <option key={room.name} value={room.name}>
                          {room.name} - {room.type} ({room.capacity} pers) - {room.price.toLocaleString()} €/nuit
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Type de chambre</label>
                    <input type="text" disabled className="w-full px-4 py-2 border bg-gray-50 rounded-lg" value={formData.roomType} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Adultes *</label>
                    <select className="w-full px-4 py-2 border rounded-lg" 
                      value={formData.adults} onChange={e => setFormData({...formData, adults: parseInt(e.target.value)})}>
                      {[1,2,3,4,5,6].map(num => <option key={num}>{num}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Enfants</label>
                    <select className="w-full px-4 py-2 border rounded-lg" 
                      value={formData.children} onChange={e => setFormData({...formData, children: parseInt(e.target.value)})}>
                      {[0,1,2,3,4].map(num => <option key={num}>{num}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Paiement */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-500" /> Paiement
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Prix par nuit</label>
                    <div className="w-full px-4 py-2 bg-gray-50 border rounded-lg text-gray-700">
                      {pricePerNight > 0 ? formatPrice(pricePerNight) : '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Statut</label>
                    <select className="w-full px-4 py-2 border rounded-lg" 
                      value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="Confirmée">Confirmée</option>
                      <option value="En cours">En cours</option>
                      <option value="Terminée">Terminée</option>

                    </select>
                  </div>
                </div>
                {formData.checkIn && formData.checkOut && formData.room && nights > 0 && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">{nights} nuit{nights > 1 ? 's' : ''} × {formatPrice(pricePerNight)}</p>
                        <p className="text-xs text-gray-500">Total à payer</p>
                      </div>
                      <span className="text-2xl font-bold text-amber-600">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Demandes spéciales */}
              <div>
                <label className="block text-sm font-medium mb-1">Demandes spéciales</label>
                <textarea rows={2} className="w-full px-4 py-2 border rounded-lg" 
                  value={formData.specialRequests} onChange={e => setFormData({...formData, specialRequests: e.target.value})}
                  placeholder="Lit bébé, repas spécifique, vue sur mer, etc..." />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 border py-2 rounded-lg">Annuler</button>
                <button type="submit" className="flex-1 bg-amber-500 text-white py-2 rounded-lg font-semibold">Confirmer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Édition */}
      {showEditModal && selectedRes && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between">
              <h2 className="text-xl font-bold">Modifier la réservation</h2>
              <button onClick={() => setShowEditModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom complet</label>
                <input type="text" required className="w-full p-2 border rounded-lg" value={formData.guest} onChange={e => setFormData({...formData, guest: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" className="w-full p-2 border rounded-lg" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Téléphone</label>
                <input type="tel" className="w-full p-2 border rounded-lg" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Chambre</label>
                <select className="w-full p-2 border rounded-lg" value={formData.room} onChange={e => handleRoomChange(e.target.value)}>
                  {rooms.map(room => <option key={room.name} value={room.name}>{room.name} - {room.price.toLocaleString()} FCFA/nuit</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Arrivée</label>
                  <input type="date" className="w-full p-2 border rounded-lg" value={formData.checkIn} onChange={e => setFormData({...formData, checkIn: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Départ</label>
                  <input type="date" className="w-full p-2 border rounded-lg" value={formData.checkOut} onChange={e => setFormData({...formData, checkOut: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Adultes</label>
                  <select className="w-full p-2 border rounded-lg" value={formData.adults} onChange={e => setFormData({...formData, adults: +e.target.value})}>
                    {[1,2,3,4].map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Enfants</label>
                  <select className="w-full p-2 border rounded-lg" value={formData.children} onChange={e => setFormData({...formData, children: +e.target.value})}>
                    {[0,1,2,3].map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              {formData.checkIn && formData.checkOut && formData.room && (
                <div className="p-3 bg-amber-50 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-sm">Total pour {calculateNights(formData.checkIn, formData.checkOut)} nuit(s) :</span>
                    <span className="font-bold text-amber-600">
                      {(getRoomPrice(formData.room) * calculateNights(formData.checkIn, formData.checkOut)).toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Statut</label>
                <select className="w-full p-2 border rounded-lg" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option>Confirmée</option>
                  <option>En cours</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-amber-500 text-white py-2 rounded-lg font-semibold">Enregistrer</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Détails */}
      {showDetailsModal && selectedDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Détails de la réservation</h2>
              <button onClick={() => setShowDetailsModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">ID</span>
                <span className="font-medium">{selectedDetails.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Client</span>
                <span className="font-medium">{selectedDetails.guest}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Contact</span>
                <span>{selectedDetails.email} / {selectedDetails.phone}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Chambre</span>
                <span>{selectedDetails.room} ({selectedDetails.roomType})</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Dates</span>
                <span>{selectedDetails.checkIn} → {selectedDetails.checkOut}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Personnes</span>
                <span>{selectedDetails.adults} adulte(s) + {selectedDetails.children} enfant(s)</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Prix par nuit</span>
                <span>{formatPrice(selectedDetails.pricePerNight)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Montant total</span>
                <span className="font-bold text-amber-600">{formatPrice(selectedDetails.amount)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Statut</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${statusConfig[selectedDetails.status]?.bg} ${statusConfig[selectedDetails.status]?.text}`}>
                  {selectedDetails.status}
                </span>
              </div>
              {selectedDetails.specialRequests && (
                <div className="py-2">
                  <span className="text-gray-500">Demandes spéciales</span>
                  <p className="mt-1 text-sm bg-gray-50 p-2 rounded">{selectedDetails.specialRequests}</p>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button onClick={() => { setShowDetailsModal(false); openEditModal(selectedDetails); }} className="flex-1 bg-blue-500 text-white py-2 rounded-lg">Modifier</button>
                <button onClick={() => { handleCancel(selectedDetails.id, selectedDetails.guest); setShowDetailsModal(false); }} className="flex-1 bg-red-500 text-white py-2 rounded-lg">Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
