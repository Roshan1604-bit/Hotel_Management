              import { useEffect, useState } from "react";
              import Login from "./Login";

              const ROOMS_API = "http://localhost:8080/api/rooms";
              const PAYMENTS_API = "http://localhost:8080/api/payments";

              export default function App() {
                const [page, setPage] = useState("Dashboard");

                // Restore the login session while this browser tab remains open.
                const [auth, setAuth] = useState(() => {
                  const token = sessionStorage.getItem("token");
                  if (!token) return null;

                  return {
                    token,
                    name: sessionStorage.getItem("userName") || "",
                    email: sessionStorage.getItem("userEmail") || "",
                  };
                });

                function handleLoginSuccess(data) {
                  sessionStorage.setItem("token", data.token);
                  sessionStorage.setItem("userName", data.name || "");
                  sessionStorage.setItem("userEmail", data.email || "");
                  setAuth(data);
                }

                function handleLogout() {
                  sessionStorage.removeItem("token");
                  sessionStorage.removeItem("userName");
                  sessionStorage.removeItem("userEmail");
                  setAuth(null);
                  setRooms([]);
                  setPayments([]);
                  setError("");
                  setSuccess("");
                  setPage("Dashboard");
                }

                const [rooms, setRooms] = useState([]);
                const [payments, setPayments] = useState([]);

                const [loadingRooms, setLoadingRooms] = useState(true);
                const [loadingPayments, setLoadingPayments] = useState(true);

                const [error, setError] = useState("");
                const [success, setSuccess] = useState("");

                const [newRoomId, setNewRoomId] = useState("");
                const [newRoomType, setNewRoomType] = useState("Single");
                const [newRoomPrice, setNewRoomPrice] = useState("");

                const [guestName, setGuestName] = useState("");
                const [paymentRoomId, setPaymentRoomId] = useState("");
                const [paymentAmount, setPaymentAmount] = useState("");
                const [paymentMethod, setPaymentMethod] = useState("UPI");

                const money = (amount) =>
                  new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 2,
                  }).format(Number(amount) || 0);

                const available = rooms.filter(
                  (room) => room.status?.toLowerCase() === "available"
                ).length;

                const occupied = rooms.filter(
                  (room) => room.status?.toLowerCase() === "occupied"
                ).length;

                const paidPayments = payments.filter(
                  (payment) => payment.status?.toLowerCase() === "paid"
                );

                const pendingPayments = payments.filter(
                  (payment) => payment.status?.toLowerCase() === "pending"
                );

                const totalRevenue = paidPayments.reduce(
                  (total, payment) => total + Number(payment.amount || 0),
                  0
                );

                const pendingAmount = pendingPayments.reduce(
                  (total, payment) => total + Number(payment.amount || 0),
                  0
                );

                // Load protected data only after the user has logged in.
                useEffect(() => {
                  if (!auth?.token) return;
                  loadRooms();
                  loadPayments();
                }, [auth?.token]);

                // Attach the JWT to every request sent to protected backend endpoints.
                async function apiFetch(url, options = {}) {
                  const headers = new Headers(options.headers || {});
                  if (auth?.token) {
                    headers.set("Authorization", `Bearer ${auth.token}`);
                  }

                  return fetch(url, { ...options, headers });
                }

                // Show the login page until a valid login response is received.
                if (!auth) {
                  return <Login onLoginSuccess={handleLoginSuccess} />;
                }

                async function loadRooms() {
                  setLoadingRooms(true);

                  try {
                    const response = await apiFetch(ROOMS_API);

                    if (!response.ok) {
                      throw new Error("Failed to load rooms.");
                    }

                    const data = await response.json();
                    setRooms(data);
                  } catch (err) {
                    setError("Could not load rooms. Check your backend.");
                  } finally {
                    setLoadingRooms(false);
                  }
                }

                async function loadPayments() {
                  setLoadingPayments(true);

                  try {
                    const response = await apiFetch(PAYMENTS_API);

                    if (!response.ok) {
                      throw new Error("Failed to load payments.");
                    }

                    const data = await response.json();
                    setPayments(data);
                  } catch (err) {
                    setError(
                      "Could not load payments. Check that the Payment backend is running."
                    );
                  } finally {
                    setLoadingPayments(false);
                  }
                }

                // Add a room.
                async function addRoom(event) {
                  event.preventDefault();
                  setError("");
                  setSuccess("");

                  const id = Number(newRoomId);
                  const price = Number(newRoomPrice);

                  if (
                    !Number.isInteger(id) ||
                    id <= 0 ||
                    !Number.isFinite(price) ||
                    price <= 0
                  ) {
                    setError("Enter a valid room number and price.");
                    return;
                  }

                  if (rooms.some((room) => Number(room.id) === id)) {
                    setError("This room number already exists.");
                    return;
                  }

                  try {
                    const response = await apiFetch(ROOMS_API, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        id,
                        type: newRoomType,
                        price,
                        status: "Available",
                      }),
                    });

                    if (!response.ok) {
                      throw new Error("Could not add room.");
                    }

                    const savedRoom = await response.json();

                    setRooms((current) => [...current, savedRoom]);
                    setNewRoomId("");
                    setNewRoomPrice("");
                    setSuccess("Room added successfully.");
                  } catch (err) {
                    setError("Could not add room. Check the backend and room number.");
                  }
                }

                // Change room availability.
                async function changeRoomStatus(roomId) {
                  setError("");
                  setSuccess("");

                  const room = rooms.find((item) => Number(item.id) === Number(roomId));

                  if (!room) return;

                  const newStatus =
                    room.status?.toLowerCase() === "available"
                      ? "Occupied"
                      : "Available";

                  try {
                    const response = await apiFetch(
                      `${ROOMS_API}/${roomId}/status?status=${newStatus}`,
                      { method: "PUT" }
                    );

                    if (!response.ok) {
                      throw new Error("Could not update room.");
                    }

                    const updatedRoom = await response.json();

                    setRooms((current) =>
                      current.map((item) =>
                        Number(item.id) === Number(roomId) ? updatedRoom : item
                      )
                    );

                    setSuccess(`Room ${roomId} is now ${newStatus}.`);
                  } catch (err) {
                    setError("Could not update room status.");
                  }
                }

                // Delete a room.
                async function deleteRoom(roomId) {
                  if (!window.confirm(`Delete room ${roomId}?`)) return;

                  setError("");
                  setSuccess("");

                  try {
                    const response = await apiFetch(`${ROOMS_API}/${roomId}`, {
                      method: "DELETE",
                    });

                    if (!response.ok) {
                      throw new Error("Could not delete room.");
                    }

                    setRooms((current) =>
                      current.filter((room) => Number(room.id) !== Number(roomId))
                    );

                    setSuccess(`Room ${roomId} deleted successfully.`);
                  } catch (err) {
                    setError("Could not delete room.");
                  }
                }

                // Add a payment to the backend.
                async function addPayment(event) {
                  event.preventDefault();
                  setError("");
                  setSuccess("");

                  const amount = Number(paymentAmount);
                  const roomId = Number(paymentRoomId);

                  if (!guestName.trim()) {
                    setError("Please enter the guest name.");
                    return;
                  }

                  if (!Number.isInteger(roomId) || roomId <= 0) {
                    setError("Please select a valid room.");
                    return;
                  }

                  if (!Number.isFinite(amount) || amount <= 0) {
                    setError("Payment amount must be greater than zero.");
                    return;
                  }

                  if (!rooms.some((room) => Number(room.id) === roomId)) {
                    setError("The selected room does not exist.");
                    return;
                  }

                  try {
                    const response = await apiFetch(PAYMENTS_API, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        guestName: guestName.trim(),
                        roomId,
                        amount,
                        method: paymentMethod,
                      }),
                    });

                    if (!response.ok) {
                      const details = await response.text();
                      throw new Error(details || "Could not save payment.");
                    }

                    const savedPayment = await response.json();

                    setPayments((current) => [...current, savedPayment]);

                    setGuestName("");
                    setPaymentRoomId("");
                    setPaymentAmount("");
                    setPaymentMethod("UPI");

                    setSuccess(
                      `Payment #${savedPayment.id} recorded successfully. Status: ${savedPayment.status}.`
                    );
                  } catch (err) {
                    setError(
                      err.message || "Could not record payment. Check the backend."
                    );
                  }
                }

                // Update a payment's status in the backend.
                async function updatePaymentStatus(paymentId, newStatus) {
                  setError("");
                  setSuccess("");

                  try {
                    const response = await apiFetch(
                      `${PAYMENTS_API}/${paymentId}/status?status=${newStatus}`,
                      { method: "PUT" }
                    );

                    if (!response.ok) {
                      throw new Error("Could not update payment status.");
                    }

                    const updatedPayment = await response.json();

                    setPayments((current) =>
                      current.map((payment) =>
                        Number(payment.id) === Number(paymentId)
                          ? updatedPayment
                          : payment
                      )
                    );

                    setSuccess(`Payment #${paymentId} status updated to ${newStatus}.`);
                  } catch (err) {
                    setError("Could not update payment status.");
                  }
                }

                function navigateTo(item) {
                  setPage(item);
                  setError("");
                  setSuccess("");
                }

                return (
                  <div className="app">
                    <style>{`
                      * { box-sizing: border-box; }
                      body { margin: 0; font-family: Arial, sans-serif; background: #f4f6fa; color: #202b3c; }
                      button, input, select { font: inherit; }
                      button { cursor: pointer; }
                      .topbar { height: 70px; padding: 0 30px; background: white; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e7eaf0; }
                      .brand { font-size: 22px; font-weight: 800; color: #2457d6; }
                      .brand span { color: #263247; }
                      .top-info { color: #68758a; font-size: 13px; }
                      .layout { display: flex; min-height: calc(100vh - 120px); }
                      .sidebar { width: 220px; flex-shrink: 0; padding: 25px 14px; background: white; border-right: 1px solid #e7eaf0; }
                      .nav-title { margin: 0 12px 15px; color: #8993a4; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
                      .nav-button { width: 100%; padding: 13px 14px; margin: 4px 0; border: 0; border-radius: 8px; background: transparent; color: #536078; text-align: left; font-weight: 600; }
                      .nav-button:hover { background: #f2f5fc; }
                      .nav-button.active { color: #2457d6; background: #eaf0ff; }
                      .main { flex: 1; min-width: 0; padding: 30px; }
                      .page-heading { display: flex; align-items: center; justify-content: space-between; gap: 15px; flex-wrap: wrap; margin-bottom: 24px; }
                      h1 { margin: 0 0 8px; font-size: 27px; }
                      h2 { margin: 0 0 18px; font-size: 18px; }
                      .muted { color: #7b8798; font-size: 14px; }
                      .stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 17px; margin-bottom: 25px; }
                      .stat-card, .panel { padding: 22px; background: white; border: 1px solid #e8ebf1; border-radius: 13px; box-shadow: 0 3px 12px #1d2d4510; }
                      .stat-label { color: #748096; font-size: 13px; }
                      .stat-number { margin: 12px 0 5px; font-size: 25px; font-weight: 800; overflow-wrap: anywhere; }
                      .stat-note { color: #8792a4; font-size: 12px; }
                      .panel { margin-bottom: 22px; overflow: hidden; }
                      .panel-heading { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 18px; }
                      .primary-button { padding: 11px 16px; border: 0; border-radius: 7px; color: white; background: #285bd7; font-weight: 600; }
                      .primary-button:hover { background: #1e49b3; }
                      .secondary-button { padding: 8px 12px; border: 1px solid #dce2eb; border-radius: 7px; color: #344158; background: white; }
                      .delete-button { padding: 8px 11px; border: 1px solid #f2caca; border-radius: 7px; background: #fff4f4; color: #bd3434; }
                      .form-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)) auto; gap: 13px; align-items: end; }
                      .field label { display: block; margin-bottom: 7px; color: #59667b; font-size: 13px; font-weight: 600; }
                      .field input, .field select { width: 100%; min-width: 0; padding: 11px; border: 1px solid #dce2eb; border-radius: 7px; background: white; color: #263247; }
                      .table-wrap { width: 100%; overflow-x: auto; }
                      table { width: 100%; border-collapse: collapse; text-align: left; white-space: nowrap; }
                      th { padding: 13px 12px; background: #f7f8fb; color: #748096; font-size: 12px; font-weight: 700; }
                      td { padding: 15px 12px; border-bottom: 1px solid #edf0f5; font-size: 14px; }
                      tbody tr:last-child td { border-bottom: 0; }
                      .status { display: inline-block; padding: 6px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; }
                      .available { color: #18794e; background: #e6f7ee; }
                      .occupied { color: #b76a13; background: #fff1d8; }
                      .actions { display: flex; align-items: center; gap: 8px; }
                      .room-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 15px; }
                      .room-tile { padding: 20px; border: 1px solid #e3e8f0; border-radius: 12px; background: white; text-align: left; }
                      .room-tile:hover { border-color: #8aa7f8; }
                      .room-tile h3 { margin: 0 0 9px; font-size: 18px; }
                      .room-tile p { margin: 8px 0; color: #68758a; font-size: 13px; }
                      .notice { padding: 12px 15px; margin-bottom: 18px; border-radius: 8px; font-size: 14px; }
                      .error-message { color: #a52b2b; background: #fff0f0; border: 1px solid #f5d0d0; }
                      .success-message { color: #176b45; background: #eaf8f0; border: 1px solid #c8ead6; }
                      .empty { padding: 30px 10px; text-align: center; color: #7b8798; }
                      .footer { padding: 18px 30px; text-align: center; color: #8993a4; font-size: 12px; }
                      @media (max-width: 1000px) { .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } .room-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
                      @media (max-width: 650px) { .topbar { padding: 0 16px; } .layout { display: block; } .sidebar { width: 100%; display: flex; overflow-x: auto; gap: 5px; padding: 10px; border-right: 0; border-bottom: 1px solid #e7eaf0; } .nav-title { display: none; } .nav-button { min-width: max-content; width: auto; margin: 0; } .main { padding: 18px 12px; } .stats { gap: 10px; } .stat-card { padding: 15px; } .stat-number { font-size: 21px; } .room-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; } .form-grid { grid-template-columns: 1fr; } h1 { font-size: 23px; } }
                    `}</style>

                    <header className="topbar">
                      <div className="brand">Stay<span>Simple</span></div>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div className="top-info">
                          {auth.name ? `Welcome, ${auth.name}` : auth.email || "Logged in"} · Hotel Management System
                        </div>
                        <button className="secondary-button" onClick={handleLogout}>
                          Logout
                        </button>
                      </div>
                    </header>

                    <div className="layout">
                      <aside className="sidebar">
                        <div className="nav-title">Main Menu</div>

                        {["Dashboard", "Rooms", "Map", "Payments"].map((item) => (
                          <button
                            key={item}
                            className={`nav-button ${page === item ? "active" : ""}`}
                            onClick={() => navigateTo(item)}
                          >
                            {item === "Dashboard" && "▦ "}
                            {item === "Rooms" && "▤ "}
                            {item === "Map" && "⌖ "}
                            {item === "Payments" && "₹ "}
                            {item}
                          </button>
                        ))}
                      </aside>

                      <main className="main">
                        {error && (
                          <div className="notice error-message">{error}</div>
                        )}

                        {success && (
                          <div className="notice success-message">{success}</div>
                        )}

                        {page === "Dashboard" && (
                          <>
                            <div className="page-heading">
                              <div>
                                <h1>Dashboard</h1>
                                <div className="muted">
                                  Welcome back! Here is your hotel overview.
                                </div>
                              </div>
                              <button
                                className="primary-button"
                                onClick={() => {
                                  loadRooms();
                                  loadPayments();
                                }}
                              >
                                Refresh Data
                              </button>
                            </div>

                            <div className="stats">
                              <StatCard label="Total Rooms" value={loadingRooms ? "..." : rooms.length} note="Rooms in the database" />
                              <StatCard label="Available Rooms" value={loadingRooms ? "..." : available} note="Ready for guests" />
                              <StatCard label="Occupied Rooms" value={loadingRooms ? "..." : occupied} note="Currently occupied" />
                              <StatCard label="Paid Payments" value={loadingPayments ? "..." : money(totalRevenue)} note="Saved payment records" />
                            </div>

                            <section className="panel">
                              <div className="panel-heading">
                                <h2>Recent Rooms</h2>
                                <button className="secondary-button" onClick={() => navigateTo("Rooms")}>
                                  View All
                                </button>
                              </div>

                              {loadingRooms ? (
                                <p>Loading rooms...</p>
                              ) : (
                                <RoomTable
                                  rooms={rooms.slice(0, 5)}
                                  onToggle={changeRoomStatus}
                                  onDelete={deleteRoom}
                                  money={money}
                                />
                              )}
                            </section>

                            <section className="panel">
                              <div className="panel-heading">
                                <h2>Recent Payments</h2>
                                <button className="secondary-button" onClick={() => navigateTo("Payments")}>
                                  View All
                                </button>
                              </div>

                              {loadingPayments ? (
                                <p>Loading payments...</p>
                              ) : (
                                <PaymentTable
                                  payments={payments.slice(-5).reverse()}
                                  money={money}
                                  onUpdateStatus={updatePaymentStatus}
                                />
                              )}
                            </section>
                          </>
                        )}

                        {page === "Rooms" && (
                          <>
                            <div className="page-heading">
                              <div>
                                <h1>Rooms Management</h1>
                                <div className="muted">
                                  Add rooms and manage their availability.
                                </div>
                              </div>
                              <button className="secondary-button" onClick={loadRooms}>
                                Refresh
                              </button>
                            </div>

                            <section className="panel">
                              <h2>Add New Room</h2>

                              <form className="form-grid" onSubmit={addRoom}>
                                <div className="field">
                                  <label htmlFor="roomId">Room Number</label>
                                  <input
                                    id="roomId"
                                    type="number"
                                    min="1"
                                    required
                                    value={newRoomId}
                                    onChange={(e) => setNewRoomId(e.target.value)}
                                    placeholder="e.g. 109"
                                  />
                                </div>

                                <div className="field">
                                  <label htmlFor="roomType">Room Type</label>
                                  <select
                                    id="roomType"
                                    value={newRoomType}
                                    onChange={(e) => setNewRoomType(e.target.value)}
                                  >
                                    <option>Single</option>
                                    <option>Double</option>
                                    <option>Deluxe</option>
                                    <option>Suite</option>
                                  </select>
                                </div>

                                <div className="field">
                                  <label htmlFor="roomPrice">Price Per Night (₹)</label>
                                  <input
                                    id="roomPrice"
                                    type="number"
                                    min="1"
                                    required
                                    value={newRoomPrice}
                                    onChange={(e) => setNewRoomPrice(e.target.value)}
                                    placeholder="e.g. 1500"
                                  />
                                </div>

                                <button className="primary-button" type="submit">
                                  + Add Room
                                </button>
                              </form>
                            </section>

                            <section className="panel">
                              <div className="panel-heading">
                                <h2>All Rooms ({rooms.length})</h2>
                              </div>

                              {loadingRooms ? (
                                <p>Loading rooms...</p>
                              ) : (
                                <RoomTable
                                  rooms={rooms}
                                  onToggle={changeRoomStatus}
                                  onDelete={deleteRoom}
                                  money={money}
                                />
                              )}
                            </section>
                          </>
                        )}

                        {page === "Map" && (
                          <>
                            <div className="page-heading">
                              <div>
                                <h1>Room Map</h1>
                                <div className="muted">
                                  Click a room card to change its status.
                                </div>
                              </div>
                            </div>

                            <div className="stats">
                              <StatCard label="Total Rooms" value={rooms.length} />
                              <StatCard label="Available" value={available} />
                              <StatCard label="Occupied" value={occupied} />
                              <StatCard
                                label="Occupancy"
                                value={`${rooms.length ? Math.round((occupied / rooms.length) * 100) : 0}%`}
                              />
                            </div>

                            <section className="panel">
                              <h2>Room Layout</h2>

                              {loadingRooms ? (
                                <p>Loading rooms...</p>
                              ) : rooms.length === 0 ? (
                                <div className="empty">No rooms found. Add a room first.</div>
                              ) : (
                                <div className="room-grid">
                                  {rooms.map((room) => {
                                    const isAvailable =
                                      room.status?.toLowerCase() === "available";

                                    return (
                                      <button
                                        key={room.id}
                                        className="room-tile"
                                        onClick={() => changeRoomStatus(room.id)}
                                      >
                                        <h3>Room {room.id}</h3>
                                        <p>{room.type}</p>
                                        <p>{money(room.price)} / night</p>
                                        <span className={`status ${isAvailable ? "available" : "occupied"}`}>
                                          {room.status}
                                        </span>
                                        <p>Click to change status</p>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </section>
                          </>
                        )}

                        {page === "Payments" && (
                          <>
                            <div className="page-heading">
                              <div>
                                <h1>Payments</h1>
                                <div className="muted">
                                  Record and manage payments stored in your backend.
                                </div>
                              </div>

                              <button className="secondary-button" onClick={loadPayments}>
                                Refresh Payments
                              </button>
                            </div>

                            <div className="stats">
                              <StatCard
                                label="Total Payments"
                                value={loadingPayments ? "..." : payments.length}
                                note="Saved payment records"
                              />
                              <StatCard
                                label="Paid Amount"
                                value={loadingPayments ? "..." : money(totalRevenue)}
                                note="Payments marked Paid"
                              />
                              <StatCard
                                label="Pending Payments"
                                value={loadingPayments ? "..." : pendingPayments.length}
                                note="Awaiting confirmation"
                              />
                              <StatCard
                                label="Pending Amount"
                                value={loadingPayments ? "..." : money(pendingAmount)}
                                note="Payments marked Pending"
                              />
                            </div>

                            <section className="panel">
                              <h2>Record New Payment</h2>

                              <form className="form-grid" onSubmit={addPayment}>
                                <div className="field">
                                  <label htmlFor="guestName">Guest Name</label>
                                  <input
                                    id="guestName"
                                    type="text"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    placeholder="Enter guest name"
                                    required
                                  />
                                </div>

                                <div className="field">
                                  <label htmlFor="paymentRoom">Room Number</label>
                                  <select
                                    id="paymentRoom"
                                    value={paymentRoomId}
                                    onChange={(e) => {
                                      const selectedId = e.target.value;
                                      setPaymentRoomId(selectedId);

                                      const selectedRoom = rooms.find(
                                        (room) => Number(room.id) === Number(selectedId)
                                      );

                                      if (selectedRoom) {
                                        setPaymentAmount(String(selectedRoom.price));
                                      }
                                    }}
                                    required
                                  >
                                    <option value="">Select a room</option>
                                    {rooms.map((room) => (
                                      <option key={room.id} value={room.id}>
                                        Room {room.id} - {room.type}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="field">
                                  <label htmlFor="paymentAmount">Amount (₹)</label>
                                  <input
                                    id="paymentAmount"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    required
                                  />
                                </div>

                                <div className="field">
                                  <label htmlFor="paymentMethod">Payment Method</label>
                                  <select
                                    id="paymentMethod"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                  >
                                    <option value="UPI">UPI</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Card">Card</option>
                                  </select>
                                </div>

                                <button
                                  className="primary-button"
                                  type="submit"
                                  disabled={loadingRooms || rooms.length === 0}
                                >
                                  + Record Payment
                                </button>
                              </form>

                              <p className="muted">
                                A new payment is initially saved as Pending. This records a
                                payment entry; it does not charge a card or transfer money.
                              </p>
                            </section>

                            <section className="panel">
                              <div className="panel-heading">
                                <h2>Payment History</h2>
                                <span className="muted">{payments.length} records</span>
                              </div>

                              {loadingPayments ? (
                                <p>Loading payments...</p>
                              ) : (
                                <PaymentTable
                                  payments={[...payments].reverse()}
                                  money={money}
                                  onUpdateStatus={updatePaymentStatus}
                                />
                              )}
                            </section>
                          </>
                        )}
                      </main>
                    </div>

                    <footer className="footer">
                      StaySimple · Hotel Management System
                    </footer>
                  </div>
                );
              }

              function StatCard({ label, value, note }) {
                return (
                  <div className="stat-card">
                    <div className="stat-label">{label}</div>
                    <div className="stat-number">{value}</div>
                    {note && <div className="stat-note">{note}</div>}
                  </div>
                );
              }

              function RoomTable({ rooms, onToggle, onDelete, money }) {
                if (rooms.length === 0) {
                  return <div className="empty">No rooms found in the database.</div>;
                }

                return (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Room No.</th>
                          <th>Type</th>
                          <th>Price / Night</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {rooms.map((room) => {
                          const isAvailable =
                            room.status?.toLowerCase() === "available";

                          return (
                            <tr key={room.id}>
                              <td><strong>{room.id}</strong></td>
                              <td>{room.type}</td>
                              <td>{money(room.price)}</td>
                              <td>
                                <span className={`status ${isAvailable ? "available" : "occupied"}`}>
                                  {room.status || "Unknown"}
                                </span>
                              </td>
                              <td>
                                <div className="actions">
                                  <button
                                    className="secondary-button"
                                    onClick={() => onToggle(room.id)}
                                  >
                                    {isAvailable ? "Occupy" : "Make Available"}
                                  </button>
                                  <button
                                    className="delete-button"
                                    onClick={() => onDelete(room.id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              }

              function PaymentTable({ payments, money, onUpdateStatus }) {
                if (payments.length === 0) {
                  return (
                    <div className="empty">
                      No payments found. Use the form above to record your first payment.
                    </div>
                  );
                }

                return (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Payment ID</th>
                          <th>Guest Name</th>
                          <th>Room</th>
                          <th>Amount</th>
                          <th>Method</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {payments.map((payment) => {
                          const isPaid = payment.status?.toLowerCase() === "paid";

                          return (
                            <tr key={payment.id}>
                              <td>PAY-{payment.id}</td>
                              <td>{payment.guestName}</td>
                              <td>{payment.roomId}</td>
                              <td>{money(payment.amount)}</td>
                              <td>{payment.method}</td>
                              <td>
                                {payment.paymentDate
                                  ? new Date(payment.paymentDate).toLocaleDateString("en-IN")
                                  : "-"}
                              </td>
                              <td>
                                <span className={`status ${isPaid ? "available" : "occupied"}`}>
                                  {payment.status}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="secondary-button"
                                  onClick={() =>
                                    onUpdateStatus(
                                      payment.id,
                                      isPaid ? "Pending" : "Paid"
                                    )
                                  }
                                >
                                  {isPaid ? "Mark Pending" : "Mark Paid"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              }