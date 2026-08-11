"""
QueryLens AI — Sample Database Seed Script

Creates a SQLite database with realistic e-commerce sample data for development and testing.

Usage:
    python database/seed.py
"""

import sqlite3
import os
from pathlib import Path

DB_PATH = Path(__file__).parent / "querylens.db"


def create_and_seed():
    print(f"Creating database at: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # -------------------------------------------------------------------------
    # Schema
    # -------------------------------------------------------------------------
    cursor.executescript("""
        PRAGMA journal_mode=WAL;

        DROP TABLE IF EXISTS payments;
        DROP TABLE IF EXISTS order_items;
        DROP TABLE IF EXISTS orders;
        DROP TABLE IF EXISTS products;
        DROP TABLE IF EXISTS categories;
        DROP TABLE IF EXISTS customers;

        CREATE TABLE categories (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT NOT NULL UNIQUE,
            description TEXT
        );

        CREATE TABLE customers (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name      TEXT NOT NULL,
            last_name       TEXT NOT NULL,
            email           TEXT NOT NULL UNIQUE,
            signup_date     TEXT NOT NULL DEFAULT (date('now')),
            is_active       INTEGER NOT NULL DEFAULT 1
        );

        CREATE TABLE products (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT NOT NULL,
            category_id INTEGER NOT NULL REFERENCES categories(id),
            price       REAL NOT NULL,
            stock       INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE orders (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id     INTEGER NOT NULL REFERENCES customers(id),
            order_date      TEXT NOT NULL DEFAULT (datetime('now')),
            total_amount    REAL NOT NULL,
            status          TEXT NOT NULL DEFAULT 'PENDING'
        );

        CREATE TABLE order_items (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id        INTEGER NOT NULL REFERENCES orders(id),
            product_id      INTEGER NOT NULL REFERENCES products(id),
            quantity        INTEGER NOT NULL,
            unit_price      REAL NOT NULL
        );

        CREATE TABLE payments (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id        INTEGER NOT NULL REFERENCES orders(id),
            payment_date    TEXT NOT NULL DEFAULT (datetime('now')),
            amount          REAL NOT NULL,
            payment_method  TEXT NOT NULL,
            status          TEXT NOT NULL DEFAULT 'SUCCESS'
        );
    """)

    # -------------------------------------------------------------------------
    # Seed data
    # -------------------------------------------------------------------------
    categories = [
        ("Electronics", "Gadgets and devices"),
        ("Clothing", "Apparel and accessories"),
        ("Home & Kitchen", "Appliances and furniture"),
        ("Books", "Physical and digital books"),
        ("Sports", "Sporting goods and equipment"),
    ]
    cursor.executemany(
        "INSERT INTO categories (name, description) VALUES (?, ?)",
        categories,
    )

    customers = [
        ("Alice",   "Johnson", "alice@example.com",   "2023-01-15"),
        ("Bob",     "Smith",   "bob@example.com",     "2023-03-22"),
        ("Carol",   "White",   "carol@example.com",   "2023-05-10"),
        ("David",   "Brown",   "david@example.com",   "2023-08-05"),
        ("Eve",     "Davis",   "eve@example.com",     "2023-11-20"),
        ("Frank",   "Wilson",  "frank@example.com",   "2024-01-02"),
        ("Grace",   "Moore",   "grace@example.com",   "2024-02-14"),
    ]
    cursor.executemany(
        "INSERT INTO customers (first_name, last_name, email, signup_date) VALUES (?, ?, ?, ?)",
        customers,
    )

    products = [
        ("Smartphone X",    1, 799.99, 150),
        ("Laptop Pro",      1, 1299.99, 50),
        ("Wireless Earbuds",1, 149.99, 300),
        ("Cotton T-Shirt",  2, 19.99, 500),
        ("Jeans",           2, 49.99, 200),
        ("Coffee Maker",    3, 89.99, 100),
        ("Blender",         3, 59.99, 120),
        ("Fiction Bestseller",4, 14.99, 1000),
        ("Yoga Mat",        5, 29.99, 400),
        ("Dumbbells Set",   5, 99.99, 80),
    ]
    cursor.executemany(
        "INSERT INTO products (name, category_id, price, stock) VALUES (?, ?, ?, ?)",
        products,
    )

    orders = [
        (1, "2024-01-10 10:30:00", 819.98, "COMPLETED"),
        (2, "2024-02-05 14:15:00", 1299.99, "COMPLETED"),
        (3, "2024-02-20 09:45:00", 169.98, "COMPLETED"),
        (1, "2024-03-01 11:00:00", 49.99, "SHIPPED"),
        (4, "2024-03-15 16:20:00", 114.98, "COMPLETED"),
        (5, "2024-04-02 08:30:00", 29.99, "PROCESSING"),
        (6, "2024-04-10 13:10:00", 219.97, "COMPLETED"),
    ]
    cursor.executemany(
        "INSERT INTO orders (customer_id, order_date, total_amount, status) VALUES (?, ?, ?, ?)",
        orders,
    )

    order_items = [
        (1, 1, 1, 799.99), # order 1: Smartphone X (1)
        (1, 4, 1, 19.99),  # order 1: T-Shirt (1)
        (2, 2, 1, 1299.99),# order 2: Laptop Pro (1)
        (3, 3, 1, 149.99), # order 3: Wireless Earbuds (1)
        (3, 8, 1, 19.99),  # order 3: Fiction Bestseller (Wait, price was 14.99, lets say 19.99 here)
        (4, 5, 1, 49.99),  # order 4: Jeans (1)
        (5, 6, 1, 89.99),  # order 5: Coffee Maker (1)
        (5, 8, 1, 25.00),  # order 5: Book
        (6, 9, 1, 29.99),  # order 6: Yoga Mat (1)
        (7, 3, 1, 149.99), # order 7: Wireless Earbuds (1)
        (7, 4, 2, 19.99),  # order 7: T-Shirt (2)
        (7, 9, 1, 29.99),  # order 7: Yoga Mat (1)
    ]
    cursor.executemany(
        "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
        order_items,
    )

    payments = [
        (1, "2024-01-10 10:35:00", 819.98, "CREDIT_CARD", "SUCCESS"),
        (2, "2024-02-05 14:20:00", 1299.99, "PAYPAL", "SUCCESS"),
        (3, "2024-02-20 09:50:00", 169.98, "CREDIT_CARD", "SUCCESS"),
        (4, "2024-03-01 11:05:00", 49.99, "DEBIT_CARD", "SUCCESS"),
        (5, "2024-03-15 16:25:00", 114.98, "CREDIT_CARD", "SUCCESS"),
        (6, "2024-04-02 08:35:00", 29.99, "PAYPAL", "PENDING"),
        (7, "2024-04-10 13:15:00", 219.97, "CREDIT_CARD", "SUCCESS"),
    ]
    cursor.executemany(
        "INSERT INTO payments (order_id, payment_date, amount, payment_method, status) VALUES (?, ?, ?, ?, ?)",
        payments,
    )

    conn.commit()
    conn.close()

    print("E-commerce database seeded successfully!")
    print(f"   Tables : categories, customers, products, orders, order_items, payments")
    print(f"   Records: {len(categories)} categories | {len(customers)} customers | {len(products)} products")


if __name__ == "__main__":
    create_and_seed()
