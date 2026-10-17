
package com.example.Hotel_Management.Service;

import com.example.Hotel_Management.Model.Payment;
import com.example.Hotel_Management.Repo.PaymentRepo;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepo paymentRepo;

    public PaymentService(PaymentRepo paymentRepo) {
        this.paymentRepo = paymentRepo;
    }

    public List<Payment> getAllPayments() {
        return paymentRepo.findAll();
    }

    public Payment addPayment(Payment payment) {
        if (payment.getGuestName() == null
                || payment.getGuestName().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Guest name is required");
        }

        if (payment.getRoomId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Room ID is required");
        }

        if (payment.getAmount() == null
                || payment.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Amount must be greater than zero");
        }

        String method = payment.getMethod();

        if (method == null ||
                !(method.equalsIgnoreCase("Cash")
                        || method.equalsIgnoreCase("UPI")
                        || method.equalsIgnoreCase("Card"))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Method must be Cash, UPI, or Card");
        }

        payment.setMethod(method.toUpperCase());
        payment.setStatus("Pending");
        payment.setId(null);
        payment.setPaymentDate(null);

        return paymentRepo.save(payment);
    }

    public Payment updatePaymentStatus(Integer id, String status) {
        if (!"Paid".equalsIgnoreCase(status)
                && !"Pending".equalsIgnoreCase(status)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Status must be Paid or Pending");
        }

        Payment payment = paymentRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Payment not found"));

        payment.setStatus(status.equalsIgnoreCase("Paid") ? "Paid" : "Pending");

        return paymentRepo.save(payment);
    }
}
