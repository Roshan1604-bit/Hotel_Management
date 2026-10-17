
package com.example.Hotel_Management.Service;

import com.example.Hotel_Management.Model.Room;
import com.example.Hotel_Management.Repo.RoomRepo;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class RoomService {

    private final RoomRepo roomRepo;

    public RoomService(RoomRepo roomRepo) {
        this.roomRepo = roomRepo;
    }

    public List<Room> getAllRooms() {
        return roomRepo.findAll();
    }

    public Room getRoomById(Integer id) {
        return roomRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Room Not Found"
                ));
    }
    public Room addRoom(Room room) {
        if (room.getId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Room ID is Required"
            );
        }

        if (roomRepo.existsById(room.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Room ID Already Exists"
            );
        }

        room.setStatus("Available");
        return roomRepo.save(room);
    }

    public Room updateRoomStatus(Integer id, String status) {
        if (!"Available".equalsIgnoreCase(status)
                && !"Occupied".equalsIgnoreCase(status)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Status must be Available or Occupied"
            );
        }

        Room room = getRoomById(id);
        room.setStatus(status);
        return roomRepo.save(room);
    }

    public void deleteRoom(Integer id) {
        if (!roomRepo.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Room Not Found"
            );
        }

        roomRepo.deleteById(id);
    }
}
