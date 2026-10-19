// routes/user.js - Autenticacion de usuarios
const express = require('express');
const router = express.Router();

// Formulario de login (GET)
router.get('/login', (req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Login - ShopSecure</title>
<style>body{font-family:system-ui,Arial,sans-serif;max-width:480px;margin:40px auto;padding:0 16px}
label{display:block;margin:10px 0 4px}input{width:100%;padding:8px}button{margin-top:14px;padding:8px 16px}</style>
</head><body>
<h1>Iniciar sesion</h1>
<form method="POST" action="/login">
  <label>Email</label><input name="email" value="">
  <label>Password</label><input name="password" type="password" value="">
  <button type="submit">Entrar</button>
</form>
<p><a href="/">Volver</a></p>
</body></html>`);
});

// Login (POST)
// SonarLint alerta: javascript:S3649 (SQL queries should not be vulnerable to injection attacks)
// CWE-89: Improper Neutralization of Special Elements used in an SQL Command ('SQL Injection')
// OWASP A03:2021-Injection
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  const pool = req.app.get('pool');
  try {
    // Consulta construida por concatenacion de entrada del usuario (vulnerable a SQLi).
    const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
    const result = await pool.query(query);

    if (result.rows.length > 0) {
      // Token no firmado (debilidad adicional): credencial de sesion sin integridad criptografica.
      res.json({ success: true, token: 'JWT_TEMP_UNSIGNED_TOKEN' });
    } else {
      res.status(401).json({ error: 'Credenciales invalidas' });
    }
  } catch (e) {
    next(e); // delega al manejador que expone la traza (CWE-209)
  }
});

module.exports = router;
