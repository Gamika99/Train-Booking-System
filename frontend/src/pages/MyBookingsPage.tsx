import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { apiService, Booking } from '../services/api';

const MyBookingsPage: React.FC = () => {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const state = location.state as { email?: string };
    if (state?.email) {
      setEmail(state.email);
      handleSearchBookings(state.email);
    }
  }, [location]);

  const handleSearchBookings = async (searchEmail?: string) => {
    const emailToSearch = searchEmail || email;
    if (!emailToSearch) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const { data } = await apiService.getBookingsByEmail(emailToSearch);
      setBookings(data.data);
      if (data.data.length === 0) toast('No bookings found');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await apiService.cancelBooking(bookingId);
      toast.success('Booking cancelled');
      await handleSearchBookings(email);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">My Bookings</h2>
        <div className="flex gap-4">
          <input type="email" className="input-field flex-1" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
          <button className="btn-primary" onClick={() => handleSearchBookings()} disabled={loading}>
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>
      </div>

      {searched && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500">No bookings found</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking._id} className="card">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">{format(new Date(booking.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                    <h3 className="text-lg font-semibold mt-2">{booking.seatId?.seatNumber || 'Unknown Seat'}</h3>
                    <p className="text-gray-600">{booking.fromStationId?.name} → {booking.toStationId?.name}</p>
                    <p className="text-sm text-gray-500 mt-1">Passenger: {booking.passengerName}</p>
                    <p className="text-sm text-gray-500">Travel: {format(new Date(booking.travelDate), 'MMM dd, yyyy')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-600">LKR {booking.price.toFixed(2)}</p>
                    {booking.status === 'confirmed' && (
                      <button className="text-sm text-red-600 hover:text-red-800 mt-2" onClick={() => handleCancelBooking(booking._id)}>
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;