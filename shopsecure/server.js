// ShopSecure - aplicacion de pruebas locales (laboratorio DAST/SAST).
// USO ACADEMICO: ejecutar unicamente en localhost / loopback autorizado.
const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Pool de conexion a PostgreSQL (configurable por variables de entorno / docker-compose).
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'shopsecure',
  password: process.env.DB_PASSWORD || 'shopsecure',
  database: process.env.DB_NAME || 'shopsecure',
});
app.set('pool', pool);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use('/', require('./routes/user'));
app.use('/', require('./routes/products'));

// Pagina principal (superficie navegable para "Manual Explore" de ZAP)
app.get('/', (req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>ShopSecure</title>
<style>body{font-family:system-ui,Arial,sans-serif;max-width:720px;margin:40px auto;padding:0 16px}
a{display:inline-block;margin:6px 10px 6px 0}</style></head>
<body>
<h1>ShopSecure <small>(entorno de pruebas)</small></h1>
<p>Plataforma de comercio electronico de laboratorio.</p>
<nav>
  <a href="/login">Iniciar sesion</a>
  <a href="/products">Catalogo de productos</a>
  <a href="/products?search=shoes">Buscar: shoes</a>
  <a href="/api/products?search=shoes">API /api/products</a>
</nav>
</body></html>`);
});

// Manejador de errores: expone la traza de pila (CWE-209 Information Exposure Through an Error Message)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(500).type('text/plain').send(err.stack);
});

app.listen(PORT, () => {
  console.log(`ShopSecure escuchando en http://localhost:${PORT}`);
});
