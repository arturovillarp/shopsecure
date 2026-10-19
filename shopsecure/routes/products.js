// routes/products.js - Catalogo, busqueda y comentarios
const express = require('express');
const router = express.Router();

// API JSON de busqueda de productos
// CWE-89 (SQL Injection) - parametro 'search' concatenado directamente.
// Columnas (id, name, description) alineadas para permitir UNION SELECT en el laboratorio.
router.get('/api/products', async (req, res, next) => {
  const search = req.query.search || '';
  const pool = req.app.get('pool');
  try {
    const query = `SELECT id, name, description FROM products WHERE name ILIKE '%${search}%'`;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (e) {
    next(e);
  }
});

// Catalogo navegable (HTML)
// CWE-79 (Reflected XSS) - el termino de busqueda se refleja sin codificar en el HTML.
router.get('/products', async (req, res, next) => {
  const search = req.query.search || '';
  const pool = req.app.get('pool');
  try {
    const query = `SELECT id, name, description, price FROM products WHERE name ILIKE '%${search}%'`;
    const result = await pool.query(query);
    const rows = result.rows.map(p =>
      `<li><a href="/products/${p.id}">${p.name}</a> - ${p.description} ($${p.price})</li>`
    ).join('');
    res.type('html').send(`<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Catalogo - ShopSecure</title>
<style>body{font-family:system-ui,Arial,sans-serif;max-width:720px;margin:40px auto;padding:0 16px}</style>
</head><body>
<h1>Catalogo</h1>
<form method="GET" action="/products"><input name="search" value="${search}"><button>Buscar</button></form>
<p>Resultados para: ${search}</p>
<ul>${rows}</ul>
<p><a href="/">Volver</a></p>
</body></html>`);
  } catch (e) {
    next(e);
  }
});

// Detalle de producto + comentarios
// CWE-79 (Stored XSS) - el contenido del comentario se renderiza sin codificar.
router.get('/products/:id', async (req, res, next) => {
  const id = req.params.id;
  const pool = req.app.get('pool');
  try {
    const prod = await pool.query(`SELECT id, name, description, price FROM products WHERE id = ${id}`);
    if (prod.rows.length === 0) return res.status(404).send('Producto no encontrado');
    const p = prod.rows[0];
    const comments = await pool.query('SELECT author, content FROM comments WHERE product_id = $1 ORDER BY id', [id]);
    const list = comments.rows.map(c => `<li><b>${c.author}:</b> ${c.content}</li>`).join('');
    res.type('html').send(`<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>${p.name} - ShopSecure</title>
<style>body{font-family:system-ui,Arial,sans-serif;max-width:720px;margin:40px auto;padding:0 16px}
label{display:block;margin:8px 0 4px}input,textarea{width:100%;padding:8px}button{margin-top:10px;padding:8px 16px}</style>
</head><body>
<h1>${p.name}</h1>
<p>${p.description}</p>
<p><b>Precio:</b> $${p.price}</p>
<h2>Comentarios</h2>
<ul>${list}</ul>
<form method="POST" action="/products/${p.id}/comments">
  <label>Autor</label><input name="author" value="">
  <label>Comentario</label><textarea name="content"></textarea>
  <button type="submit">Enviar comentario</button>
</form>
<p><a href="/products">Volver al catalogo</a></p>
</body></html>`);
  } catch (e) {
    next(e);
  }
});

// Registrar comentario
router.post('/products/:id/comments', async (req, res, next) => {
  const id = req.params.id;
  const { author, content } = req.body;
  const pool = req.app.get('pool');
  try {
    await pool.query('INSERT INTO comments (product_id, author, content) VALUES ($1, $2, $3)', [id, author, content]);
    res.redirect(`/products/${id}`);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
