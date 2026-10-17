package com.example.Hotel_Management.Repo;

import com.example.Hotel_Management.Model.Room;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepo extends JpaRepository<Room,Integer> {
}
