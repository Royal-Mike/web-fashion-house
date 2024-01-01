CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    totalMoney INT NOT NULL,
	FOREIGN KEY (username) REFERENCES accounts(username)
);
