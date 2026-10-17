package com.example.Hotel_Management.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class Room {

    @Id
    private Integer id;

    private String type;
    private String status;
    private  double price;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    @Override
    public String toString() {
        return "Room{" +
                "id=" + id +
                ", type='" + type + '\'' +
                ", status='" + status + '\'' +
                ", price=" + price +
                '}';
    }

}
