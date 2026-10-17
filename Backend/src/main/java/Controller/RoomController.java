
package com.example.Hotel_Management.Controller;

import com.example.Hotel_Management.Model.Room;
import com.example.Hotel_Management.Service.RoomService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "http://localhost:5173")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping
    public List<Room> getAllRooms() {
        return roomService.getAllRooms();
    }

    @GetMapping("/{id}")
    public Room getRoomById(@PathVariable Integer id) {
        return roomService.getRoomById(id);
    }

    @PostMapping
    public ResponseEntity<Room> addRoom(@RequestBody Room room) {
        Room savedRoom = roomService.addRoom(room);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savedRoom);
    }

    @PutMapping("/{id}/status")
    public Room updateRoomStatus(
            @PathVariable Integer id,
            @RequestParam String status) {

        return roomService.updateRoomStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(
            @PathVariable Integer id) {

        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }
}
