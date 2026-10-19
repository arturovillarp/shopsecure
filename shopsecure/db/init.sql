-- Esquema y datos de siembra para ShopSecure (laboratorio).
-- PostgreSQL ejecuta este archivo automaticamente al inicializar el contenedor.

CREATE TABLE IF NOT EXISTS users (
  id       SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email    VARCHAR(200) NOT NULL,
  -- CWE-522 (Insufficiently Secured Credentials): contrasenas en texto plano / hash debil.
  password VARCHAR(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  description TEXT,
  price       NUMERIC(10,2)
);

CREATE TABLE IF NOT EXISTS comments (
  id         SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  author     VARCHAR(100),
  content    TEXT
);

INSERT INTO users (username, email, password) VALUES
  ('admin', 'admin@shopsecure.local', 'secret_admin_hash_12345'),
  ('jdoe',  'john@shopsecure.local',  'Password123'),
  ('mlopez','maria@shopsecure.local', 'qwerty2024');

INSERT INTO products (name, description, price) VALUES
  ('Running Shoes',   'Lightweight running shoes for daily training', 59.90),
  ('Leather Wallet',  'Genuine leather bifold wallet',                29.50),
  ('Laptop Backpack', 'Water-resistant 25L backpack',                 45.00),
  ('Wireless Mouse',  'Ergonomic 2.4GHz wireless mouse',              19.99);

INSERT INTO comments (product_id, author, content) VALUES
  (1, 'carlos', 'Muy comodas, llegaron rapido.'),
  (1, 'ana',    'Buena relacion calidad-precio.');
