
const API_URL = "http://localhost:8080/api/rooms";

// Get all rooms
export async function getRooms() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch rooms");
  }

  return response.json();
}

// Add a room
export async function addRoom(room) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(room),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

// Update room status
export async function updateRoomStatus(id, status) {
  const url =
    `${API_URL}/${id}/status?status=${encodeURIComponent(status)}`;

  const response = await fetch(url, {
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error("Failed to update room status");
  }

  return response.json();
}

// Delete a room
export async function deleteRoom(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete room");
  }
}
