import React from 'react';
import { Seat } from '../services/api';

interface SeatMapProps {
  seats: Seat[];
  selectedSeat: Seat | null;
  onSeatSelect: (seat: Seat) => void;
}

const SeatMap: React.FC<SeatMapProps> = ({ seats, selectedSeat, onSeatSelect }) => {
  const seatsByCoach = seats.reduce((acc, seat) => {
    if (!acc[seat.coachId]) acc[seat.coachId] = [];
    acc[seat.coachId].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  const sortedSeats = (seats: Seat[]) => [...seats].sort((a, b) => a.position.row - b.position.row || a.position.column - b.position.column);

  if (Object.keys(seatsByCoach).length === 0) {
    return <div className="text-center py-8 text-gray-500">No seats available</div>;
  }

  return (
    <div className="space-y-6">
      {Object.entries(seatsByCoach).map(([coachId, coachSeats]) => {
        const sorted = sortedSeats(coachSeats);
        const maxCol = Math.max(...sorted.map(s => s.position.column));

        return (
          <div key={coachId} className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Coach {coachId.slice(-4)}</h3>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${maxCol}, 1fr)` }}>
              {sorted.map((seat) => (
                <button
                  key={seat._id}
                  className={`aspect-square rounded-lg text-xs font-medium transition-colors duration-200 ${
                    selectedSeat?._id === seat._id
                      ? 'bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                  onClick={() => onSeatSelect(seat)}
                >
                  {seat.seatNumber}
                </button>
              ))}
            </div>
          </div>
        );
      })}
      <div className="flex items-center gap-4 justify-center text-sm">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-100 rounded" /><span>Available</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-600 rounded" /><span>Selected</span></div>
      </div>
    </div>
  );
};

export default SeatMap;