const express = require("express");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("."));

const db = new Database("paradis-gamestore.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS commandes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    telephone TEXT NOT NULL,
    adresse TEXT NOT NULL,
    produits TEXT NOT NULL,
    total INTEGER NOT NULL,
    statut TEXT NOT NULL,
    date TEXT NOT NULL
  )
`);

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || "ChangeMoi123!";

// Accueil
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Test de l'API
app.get("/api", (req, res) => {
  res.json({
    service: "👑🎮 PARADIS GAMESTORE 💎🔥",
    status: "online",
    message: "API fonctionnelle ✅"
  });
});

// Connexion admin
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      message: "Mot de passe incorrect."
    });
  }

  res.json({
    success: true,
    message: "Connexion réussie."
  });
});

// Nouvelle commande
app.post("/api/orders", (req, res) => {
  const {
    nom,
    telephone,
    adresse,
    produits,
    total
  } = req.body;

  if (
    !nom ||
    !telephone ||
    !adresse ||
    !Array.isArray(produits) ||
    produits.length === 0 ||
    !Number.isFinite(total)
  ) {
    return res.status(400).json({
      success: false,
      message: "Informations de commande invalides."
    });
  }

  const date = new Date().toISOString();

  const resultat = db.prepare(`
    INSERT INTO commandes
    (nom, telephone, adresse, produits, total, statut, date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    nom,
    telephone,
    adresse,
    JSON.stringify(produits),
    total,
    "En attente",
    date
  );

  const commande = {
    id: resultat.lastInsertRowid,
    nom,
    telephone,
    adresse,
    produits,
    total,
    statut: "En attente",
    date
  };

  console.log("📦 NOUVELLE COMMANDE :", commande);

  res.status(201).json({
    success: true,
    message: "Commande reçue.",
    commande
  });
});

// Voir les commandes
app.get("/api/orders", (req, res) => {
  const lignes = db.prepare(`
    SELECT *
    FROM commandes
    ORDER BY id DESC
  `).all();

  const commandes = lignes.map(ligne => ({
    id: ligne.id,
    nom: ligne.nom,
    telephone: ligne.telephone,
    adresse: ligne.adresse,
    produits: JSON.parse(ligne.produits),
    total: ligne.total,
    statut: ligne.statut,
    date: ligne.date
  }));

  res.json({
    success: true,
    commandes
  });
});

app.listen(PORT, () => {
  console.log(
    `🚀 PARADIS GAMESTORE lancé sur le port ${PORT}`
  );
});