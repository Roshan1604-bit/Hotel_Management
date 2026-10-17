
package com.example.Hotel_Management.Controller;

import com.example.Hotel_Management.Model.Payment;
import com.example.Hotel_Management.Service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    public List<Payment> getAllPayments() {
        return paymentService.getAllPayments();
    }

    @PostMapping
    public ResponseEntity<Payment> addPayment(
            @RequestBody Payment payment) {

        Payment savedPayment = paymentService.addPayment(payment);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savedPayment);
    }

    @PutMapping("/{id}/status")
    public Payment updatePaymentStatus(
            @PathVariable Integer id,
            @RequestParam String status) {

        return paymentService.updatePaymentStatus(id, status);
    }
}

