CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    totalMoney INT NOT NULL
);
