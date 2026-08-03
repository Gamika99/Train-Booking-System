import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Select from 'react-select';
import { apiService, Station, Seat } from '../services/api';
// Inline lightweight SeatMap component to avoid missing external module
type SeatMapProps = {
  seats: Seat[];
  selectedSeat: Seat | null;
  onSeatSelect: (s: Seat) => void;
};

const SeatMap: React.FC<SeatMapProps> = ({ seats, selectedSeat, onSeatSelect }) => {
  return (
    <div className="grid grid-cols-4 gap-3">
      {seats.map((s) => (
        <button
          key={s._id}
          onClick={() => onSeatSelect(s)}
          className={`p-3 border rounded text-sm ${selectedSeat?._id === s._id ? 'bg-blue-600 text-white' : 'bg-white'}`}
          aria-pressed={selectedSeat?._id === s._id}
        >
          {s.seatNumber}
        </button>
      ))}
    </div>
  );
};

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [stations, setStations] = useState<Station[]>([]);
  const [fromStation, setFromStation] = useState<any>(null);
  const [toStation, setToStation] = useState<any>(null);
  const [availableSeats, setAvailableSeats] = useState<Seat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [passengerName, setPassengerName] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    apiService.getStations()
      .then(({ data }) => {
        const stationList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        setStations(stationList);
      })
      .catch(() => toast.error('Failed to load stations'));
  }, []);

  const stationOptions = stations.map((s) => ({ value: s._id, label: `${s.name} (${s.code})` }));

  const getStationValue = (station: any) => {
    if (!station) return null;
    if (typeof station === 'string') return station;
    if (station.value) return station.value;
    return station._id || null;
  };

  const handleSearchSeats = async () => {
    const fromValue = getStationValue(fromStation);
    const toValue = getStationValue(toStation);

    if (!fromValue || !toValue || fromValue === toValue) {
      toast.error('Please select valid origin and destination');
      return;
    }

    setSearching(true);
    try {
      const { data } = await apiService.getAvailableSeats(fromValue, toValue);
      const seats = Array.isArray(data?.data) ? data.data : [];
      setAvailableSeats(seats);
      setSelectedSeat(null);
      seats.length === 0 ? toast('No seats available') : toast.success(`Found ${seats.length} seats`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch available seats');
    } finally {
      setSearching(false);
    }
  };

  const handleBookSeat = async () => {
    if (!selectedSeat || !fromStation || !toStation || !passengerName || !passengerEmail || !passengerPhone || !travelDate) {
      toast.error('Please complete all fields');
      return;
    }

    setLoading(true);
    try {
      await apiService.createBooking({
        seatId: selectedSeat._id,
        fromStationId: getStationValue(fromStation),
        toStationId: getStationValue(toStation),
        passengerName,
        passengerEmail,
        passengerPhone,
        travelDate,
      });
      toast.success('Booking confirmed!');
      navigate('/my-bookings', { state: { email: passengerEmail } });
    } catch (error: any) {
      if (error.message.includes('not available')) {
        toast.error('Seat was just taken. Please try another.');
        await handleSearchSeats();
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Search Available Seats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
            <Select options={stationOptions} value={fromStation} onChange={setFromStation} placeholder="Select origin" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
            <Select options={stationOptions} value={toStation} onChange={setToStation} placeholder="Select destination" />
          </div>
        </div>
        <button className="btn-primary w-full mt-4" onClick={handleSearchSeats} disabled={searching}>
          {searching ? 'Searching...' : 'Search Seats'}
        </button>
      </div>

      {availableSeats.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Available Seats ({availableSeats.length})</h2>
          <SeatMap seats={availableSeats} selectedSeat={selectedSeat} onSeatSelect={setSelectedSeat} />
        </div>
      )}

      {selectedSeat && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Passenger Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" className="input-field" placeholder="Full Name" value={passengerName} onChange={(e) => setPassengerName(e.target.value)} />
              <input type="email" className="input-field" placeholder="Email" value={passengerEmail} onChange={(e) => setPassengerEmail(e.target.value)} />
              <input type="tel" className="input-field" placeholder="Phone Number" value={passengerPhone} onChange={(e) => setPassengerPhone(e.target.value)} />
              <input type="date" className="input-field" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800"><strong>Selected Seat:</strong> {selectedSeat.seatNumber}</p>
            </div>
            <button className="btn-primary w-full" onClick={handleBookSeat} disabled={loading}>
              {loading ? 'Processing...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;