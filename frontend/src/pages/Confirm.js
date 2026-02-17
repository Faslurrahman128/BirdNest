import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function ConfirmBooking() {
  const [unconfirmedRooms, setUnconfirmedRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:8070/rooms");
        const roomsData = response.data;

        const unconfirmed = roomsData.filter((room) => !room.isBookedConfirm);
        setUnconfirmedRooms(unconfirmed);
        setLoading(false);
      } catch (error) {
        setError("Error fetching rooms. Please try again later.");
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleConfirmBooking = async (id) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      alert("Authorization token is missing. Please log in again.");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:8070/Room/confirmbooking/${id}`,
        { isBookedConfirm: true },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setUnconfirmedRooms((prevRooms) => prevRooms.filter((room) => room._id !== id));
        alert("Booking successfully confirmed!");
      } else {
        alert("Failed to update booking status.");
      }
    } catch (err) {
      alert("Error updating booking status: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="container mt-4">
      <h3>Confirm Bookings</h3>
      {loading && <p>Loading rooms...</p>}
      {error && <p className="text-danger">{error}</p>}
      {unconfirmedRooms.length === 0 ? (
        <p>No pending bookings.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Room Type</th>
              <th>Location</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {unconfirmedRooms.map((room) => (
              <tr key={room._id}>
                <td>{room.roomType} - {room.ownerName || "N/A"}</td>
                <td>{room.roomCity}</td>
                <td>Rs {room.price.toLocaleString()}</td>
                <td>
                  <button className="btn btn-success" onClick={() => handleConfirmBooking(room._id)}>
                    Confirm Booking ✅
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ConfirmBooking;
