
package com.example.Hotel_Management.Repo;

import com.example.Hotel_Management.Model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepo extends JpaRepository<Payment, Integer> {
}
