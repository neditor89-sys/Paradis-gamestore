const express = require("express");
const Database = require("better-sqlite3");
const crypto = require("crypto");

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

const sessions = new Set();

// Accueil
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Test API public
app.get("/api", (req, res) => {
  res.json({
    service: "👑🎮 PARADIS GAMESTORE 💎🔥",
    status: "online",
    message: "API fonctionnelle ✅"
  });
});

// Connexion administrateur
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  
  if (
    typeof password !== "string" ||
    password !== ADMIN_PASSWORD
  ) {
    return res.status(401).json({
      success: false,
      message: "Mot de passe incorrect."
    });
  }
  
  const token = crypto.randomBytes(32).toString("hex");
  
  sessions.add(token);
  
  res.json({
    success: true,
    token: token
  });
});

// Vérification admin
function verifierAdmin(req, res, next) {
  const authorization = req.headers.authorization || "";
  
  if (!authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Accès administrateur requis."
    });
  }
  
  const token = authorization.slice(7);
  
  if (!sessions.has(token)) {
    return res.status(401).json({
      success: false,
      message: "Session administrateur invalide."
    });
  }
  
  next();
}

// Créer une commande
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

// Voir les commandes : ADMIN UNIQUEMENT
app.get("/api/orders", verifierAdmin, (req, res) => {
  
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

// Modifier le statut d'une commande
app.put("/api/orders/:id/status", verifierAdmin, (req, res) => {
  const { status } = req.body;
  const id = Number(req.params.id);
  
  const statutsAutorises = [
    "En attente",
    "Acceptée",
    "Refusée",
    "Expédiée",
    "Terminée"
  ];
  
  if (!Number.isInteger(id) || !statutsAutorises.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Statut invalide."
    });
  }
  
  const resultat = db.prepare(`
    UPDATE commandes
    SET statut = ?
    WHERE id = ?
  `).run(status, id);
  
  if (resultat.changes === 0) {
    return res.status(404).json({
      success: false,
      message: "Commande introuvable."
    });
  }
  
  res.json({
    success: true,
    message: "Statut modifié.",
    statut: status
  });
});

app.listen(PORT, () => {
  console.log(
    `🚀 PARADIS GAMESTORE lancé sur le port ${PORT}`
  );
});