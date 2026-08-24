// ===============================
// 👑🎮 PARADIS GAME 💎🔥
// ===============================

const produits = [
  {
    id: 1,
    nom: "🎮 Manette Gaming",
    prix: 15000,
    image: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 2,
    nom: "🎧 Casque Gaming",
    prix: 12000,
    image: "https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 3,
    nom: "🖱️ Souris Gaming",
    prix: 8000,
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 4,
    nom: "⌨️ Clavier Gaming",
    prix: 18000,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80"
  }
];

let panier = [];

// Afficher les produits
function afficherProduits() {
  const conteneur = document.getElementById("produits");

  conteneur.innerHTML = "";

  produits.forEach(produit => {
    conteneur.innerHTML += `
      <div class="produit">

        <img src="${produit.image}" alt="${produit.nom}">

        <h3>${produit.nom}</h3>

        <p class="prix">
          ${produit.prix.toLocaleString("fr-FR")} FCFA
        </p>

        <button onclick="ajouterAuPanier(${produit.id})">
          🛒 Ajouter au panier
        </button>

      </div>
    `;
  });
}

// Ajouter au panier
function ajouterAuPanier(id) {
  const produit = produits.find(p => p.id === id);

  if (!produit) return;

  panier.push(produit);

  mettreAJourPanier();

  alert("✅ Produit ajouté au panier !");
}

// Mettre à jour le panier
function mettreAJourPanier() {
  const nombre = document.getElementById("nombrePanier");
  const contenu = document.getElementById("contenuPanier");
  const totalElement = document.getElementById("total");

  nombre.textContent = panier.length;

  contenu.innerHTML = "";

  let total = 0;

  panier.forEach((produit, index) => {

    total += produit.prix;

    contenu.innerHTML += `
      <div class="article-panier">

        <span>
          ${produit.nom}
          <br>
          ${produit.prix.toLocaleString("fr-FR")} FCFA
        </span>

        <button onclick="supprimerDuPanier(${index})">
          ❌
        </button>

      </div>
    `;
  });

  totalElement.textContent =
    total.toLocaleString("fr-FR") + " FCFA";
}

// Supprimer un produit
function supprimerDuPanier(index) {
  panier.splice(index, 1);

  mettreAJourPanier();
}

// Afficher / cacher le panier
function afficherPanier() {
  const panierSection = document.getElementById("panier");

  if (panierSection.style.display === "none") {
    panierSection.style.display = "block";
  } else {
    panierSection.style.display = "none";
  }
}

// Passer à la commande
function passerCommande() {

  if (panier.length === 0) {
    alert("🛒 Votre panier est vide !");
    return;
  }

  document.getElementById("commande").style.display = "block";

  document.getElementById("commande").scrollIntoView({
    behavior: "smooth"
  });
}

// Confirmer la commande
async function confirmerCommande() {
  const nom = document.getElementById("nom").value.trim();
  const telephone = document.getElementById("telephone").value.trim();
  const adresse = document.getElementById("adresse").value.trim();
  
  if (!nom || !telephone || !adresse) {
    alert("⚠️ Veuillez remplir toutes les informations.");
    return;
  }
  
  if (panier.length === 0) {
    alert("🛒 Votre panier est vide.");
    return;
  }
  
  const total = panier.reduce(
    (somme, produit) => somme + produit.prix,
    0
  );
  
  const commande = {
    nom: nom,
    telephone: telephone,
    adresse: adresse,
    produits: panier,
    total: total
  };
  
  try {
    const reponse = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(commande)
    });
    
    const resultat = await reponse.json();
    
    if (!reponse.ok) {
      throw new Error(resultat.message || "Erreur");
    }
    
    alert(
      "✅ Commande envoyée !\n\n" +
      "Numéro de commande : #" +
      resultat.commande.id
    );
    
    panier = [];
    
    mettreAJourPanier();
    
    document.getElementById("nom").value = "";
    document.getElementById("telephone").value = "";
    document.getElementById("adresse").value = "";
    
    document.getElementById("commande").style.display = "none";
    
  } catch (erreur) {
    console.error(erreur);
    
    alert(
      "❌ Impossible d'envoyer la commande.\n" +
      "Vérifie que ton serveur est démarré."
    );
  }
}
// Lancer la boutique
afficherProduits();
mettreAJourPanier();