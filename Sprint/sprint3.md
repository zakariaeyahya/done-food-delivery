# SPRINT 3: FRONTEND CLIENT APP

## OBJECTIF
Créer l'interface React pour les clients permettant de commander des repas, suivre les livraisons en temps réel et gérer leur compte avec tokens de fidélité.

---

## ⚠️ ÉTAT ACTUEL DU PROJET

**IMPORTANT:** Les dossiers et fichiers suivants existent déjà mais sont **VIDES** ou **PARTIELLEMENT REMPLIS**. Il faut les compléter/implémenter.

**Dossiers existants:**
- ✓ `frontend/client/` (existe)
- ✓ `frontend/client/src/` (existe)
- ✓ `frontend/client/src/components/` (existe)
- ✓ `frontend/client/src/pages/` (existe)
- ✓ `frontend/client/src/services/` (existe)
- ✓ `frontend/client/src/utils/` (existe)

**Fichiers existants mais vides/à compléter:**
- ✓ `frontend/client/src/App.jsx` (vide - à compléter)
- ✓ `frontend/client/src/index.jsx` (vide - à compléter)
- ✓ `frontend/client/public/index.html` (vide - à compléter)
- ✓ `frontend/client/src/components/ConnectWallet.jsx` (vide - à compléter)
- ✓ `frontend/client/src/components/RestaurantList.jsx` (vide - à compléter)
- ✓ `frontend/client/src/components/RestaurantCard.jsx` (vide - à compléter)
- ✓ `frontend/client/src/components/MenuItems.jsx` (vide - à compléter)
- ✓ `frontend/client/src/components/Cart.jsx` (vide - à compléter)
- ✓ `frontend/client/src/components/Checkout.jsx` (vide - à compléter)
- ✓ `frontend/client/src/components/OrderTracking.jsx` (vide - à compléter)
- ✓ `frontend/client/src/components/OrderHistory.jsx` (vide - à compléter)
- ✓ `frontend/client/src/components/TokenBalance.jsx` (vide - à compléter)
- ✓ `frontend/client/src/components/DisputeModal.jsx` (vide - à compléter)
- ✓ `frontend/client/src/pages/HomePage.jsx` (vide - à compléter)
- ✓ `frontend/client/src/pages/RestaurantPage.jsx` (vide - à compléter)
- ✓ `frontend/client/src/pages/CheckoutPage.jsx` (vide - à compléter)
- ✓ `frontend/client/src/pages/TrackingPage.jsx` (vide - à compléter)
- ✓ `frontend/client/src/pages/ProfilePage.jsx` (vide - à compléter)
- ✓ `frontend/client/src/services/api.js` (vide - à compléter)
- ✓ `frontend/client/src/services/blockchain.js` (vide - à compléter)
- ✓ `frontend/client/src/services/ipfs.js` (vide - à compléter)
- ✓ `frontend/client/src/utils/web3.js` (vide - à compléter)
- ✓ `frontend/client/src/utils/formatters.js` (vide - à compléter)
- ✓ `frontend/client/src/index.css` (vide - à compléter)
- ✓ `frontend/client/vite.config.js` (vide - à compléter)
- ✓ `frontend/client/tailwind.config.js` (vide - à compléter)

---

## ÉTAPES À SUIVRE PAR ORDRE

### ÉTAPE 1: PRÉPARATION DE L'ENVIRONNEMENT
- ✓ Vérifier que Node.js (v18+) est installé
- ✓ Avoir l'URL de l'API backend (Sprint 2)
- ✓ Obtenir une clé API Google Maps
- ✓ Préparer les adresses des contrats déployés

### ÉTAPE 2: INITIALISATION DU FRONTEND CLIENT
1. Aller dans le dossier `frontend/client/`:
   ```bash
   cd frontend/client
   ```
2. Initialiser npm (si pas déjà fait):
   ```bash
   npm init -y
   ```
3. Installer les dépendances principales:
   ```bash
   npm install react-router-dom ethers socket.io-client @react-google-maps/api axios
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

### ÉTAPE 3: CONFIGURATION DE TAILWINDCSS
**Fichiers à compléter:**
- `tailwind.config.js` (vide - à compléter)
- `index.css` avec directives Tailwind (vide - à compléter)
- `vite.config.js` (vide - à compléter)

### ÉTAPE 4: IMPLÉMENTATION DES SERVICES
**Fichiers à compléter (existent mais vides):**

1. **`frontend/client/src/services/api.js`** (vide - à compléter)
   - Service appels API backend
   - Fonctions: `getRestaurants()`, `getRestaurant()`, `createOrder()`, `getOrder()`, `getOrdersByClient()`, `confirmDelivery()`, `openDispute()`, `submitReview()`

2. **`frontend/client/src/services/blockchain.js`** (vide - à compléter)
   - Service interactions Web3 directes
   - Fonctions: `connectWallet()`, `getBalance()`, `getTokenBalance()`, `createOrderOnChain()`, `confirmDeliveryOnChain()`, `openDisputeOnChain()`, `getOrderOnChain()`

3. **`frontend/client/src/services/ipfs.js`** (vide - à compléter)
   - Service interactions IPFS
   - Fonctions: `uploadImage()`, `getImage()`, `uploadJSON()`, `getJSON()`

### ÉTAPE 5: IMPLÉMENTATION DES UTILS
**Fichiers à compléter (existent mais vides):**

1. **`frontend/client/src/utils/web3.js`** (vide - à compléter)
   - Utilitaires Web3
   - Fonctions: `formatAddress()`, `formatBalance()`, `parseUnits()`, `formatUnits()`, `isValidAddress()`

2. **`frontend/client/src/utils/formatters.js`** (vide - à compléter)
   - Formatage des données
   - Fonctions: `formatPrice()`, `formatDate()`, `formatTime()`, `truncateText()`

### ÉTAPE 6: IMPLÉMENTATION DES COMPOSANTS
**Fichiers à compléter (existent mais vides):**

1. **`frontend/client/src/components/ConnectWallet.jsx`** (vide - à compléter)
   - Connexion MetaMask
   - Détection MetaMask installé
   - Vérification réseau Polygon Mumbai
   - Affichage adresse connectée et solde MATIC

2. **`frontend/client/src/components/RestaurantList.jsx`** (vide - à compléter)
   - Affichage liste restaurants
   - Filtres (cuisine type, prix, rating)
   - Fetch depuis API backend
   - Grid layout responsive

3. **`frontend/client/src/components/RestaurantCard.jsx`** (vide - à compléter)
   - Carte individuelle restaurant
   - Informations: nom, cuisine, description, image IPFS
   - Note moyenne et nombre d'avis
   - Temps de livraison estimé

4. **`frontend/client/src/components/MenuItems.jsx`** (vide - à compléter)
   - Affichage menu avec images IPFS
   - Add to cart
   - Prix en ETH/MATIC + EUR (conversion)
   - Filtres par catégorie

5. **`frontend/client/src/components/Cart.jsx`** (vide - à compléter)
   - Liste items dans panier
   - Calcul total (food + delivery + platform fee 10%)
   - Remove items et modification quantités

6. **`frontend/client/src/components/Checkout.jsx`** (vide - à compléter)
   - Confirmation adresse de livraison
   - Autocomplete Google Places
   - Approbation paiement MetaMask
   - Appel `createOrder()` via backend
   - Affichage progression transaction

7. **`frontend/client/src/components/OrderTracking.jsx`** (vide - à compléter)
   - Suivi temps réel d'une commande
   - Socket.io listener 'orderStatusUpdate'
   - Timeline visuelle des étapes
   - GPS map (Google Maps API)
   - Markers: restaurant, client, livreur
   - ETA countdown

8. **`frontend/client/src/components/OrderHistory.jsx`** (vide - à compléter)
   - Historique des commandes passées
   - Table avec colonnes: Order ID, Restaurant, Date, Total, Status, Actions
   - Pagination
   - Bouton "Commander à nouveau"
   - Modal avis

9. **`frontend/client/src/components/TokenBalance.jsx`** (vide - à compléter)
   - Affichage solde tokens DONE
   - Conversion en EUR
   - Utilisation tokens pour discount
   - Historique transactions tokens

10. **`frontend/client/src/components/DisputeModal.jsx`** (vide - à compléter)
    - Modal pour ouvrir un litige
    - Formulaire: raison, type de problème
    - Upload preuves images (IPFS)
    - Submit dispute

### ÉTAPE 7: IMPLÉMENTATION DES PAGES
**Fichiers à compléter (existent mais vides):**

1. **`frontend/client/src/pages/HomePage.jsx`** (vide - à compléter)
   - Page d'accueil
   - Hero section avec recherche
   - Liste restaurants populaires
   - Catégories de cuisine

2. **`frontend/client/src/pages/RestaurantPage.jsx`** (vide - à compléter)
   - Page détail restaurant
   - Informations complètes
   - Menu complet avec MenuItems
   - Avis et notes clients

3. **`frontend/client/src/pages/CheckoutPage.jsx`** (vide - à compléter)
   - Page checkout complète
   - Intègre Checkout component
   - Gestion flux paiement

4. **`frontend/client/src/pages/TrackingPage.jsx`** (vide - à compléter)
   - Page dédiée suivi commande
   - Intègre OrderTracking component
   - Vue full-screen avec map

5. **`frontend/client/src/pages/ProfilePage.jsx`** (vide - à compléter)
   - Profil utilisateur
   - Informations personnelles
   - Historique commandes
   - Solde tokens DONE
   - Paramètres compte

### ÉTAPE 8: CONFIGURATION DU ROUTING
**Fichier à compléter:** `frontend/client/src/App.jsx` (vide - à compléter)

**Implémenter:**
- Composant racine de l'application
- Configuration React Router
- Gestion état global (Context API)
- Authentification wallet
- Layout responsive avec header/footer
- Gestion panier global
- Connexion Socket.io

**Routes à configurer:**
- `/` → HomePage
- `/restaurant/:id` → RestaurantPage
- `/checkout` → CheckoutPage
- `/tracking/:orderId` → TrackingPage
- `/profile` → ProfilePage

### ÉTAPE 9: CONFIGURATION DES VARIABLES D'ENVIRONNEMENT
**Créer:** `frontend/client/.env.example`
- `VITE_API_URL`
- `VITE_ORDER_MANAGER_ADDRESS`
- `VITE_TOKEN_ADDRESS`
- `VITE_SOCKET_URL`
- `VITE_IPFS_GATEWAY`
- `VITE_GOOGLE_MAPS_API_KEY`

**Créer:** `.env` avec les valeurs réelles

### ÉTAPE 10: TEST DE L'APPLICATION
1. Démarrer le serveur de développement:
   ```bash
   npm run dev
   ```
2. Tester les fonctionnalités:
   - Connexion wallet
   - Affichage restaurants
   - Ajout au panier
   - Checkout et paiement
   - Suivi commande
   - Historique
3. Vérifier le responsive mobile

### ÉTAPE 11: DOCUMENTATION
**Fichier à compléter:** `frontend/client/README.md` (peut être complété après implémentation)

**Contenu à ajouter:**
- Documentation complète application client
- Description de chaque composant et page
- Services et utils
- Workflow utilisateur
- Technologies utilisées

### ÉTAPE 12: VALIDATION DU SPRINT 3
✓ Tous les fichiers vides complétés avec le code
✓ Application client fonctionnelle
✓ Connexion wallet + flux commande complet
✓ Responsive mobile
✓ Intégration Google Maps
✓ Socket.io pour notifications temps réel
✓ Documentation complète

---

## RÉCAPITULATIF DES FICHIERS À COMPLÉTER PAR ORDRE

**⚠️ NOTE:** Tous ces fichiers existent déjà mais sont **VIDES**. Il faut les compléter dans l'ordre suivant:

### 1. Configuration (Fichiers vides - à compléter)
- `frontend/client/tailwind.config.js` ⚠️ VIDE
- `frontend/client/vite.config.js` ⚠️ VIDE
- `frontend/client/src/index.css` ⚠️ VIDE

### 2. Services (Fichiers vides - à compléter)
- `frontend/client/src/services/api.js` ⚠️ VIDE
- `frontend/client/src/services/blockchain.js` ⚠️ VIDE
- `frontend/client/src/services/ipfs.js` ⚠️ VIDE

### 3. Utils (Fichiers vides - à compléter)
- `frontend/client/src/utils/web3.js` ⚠️ VIDE
- `frontend/client/src/utils/formatters.js` ⚠️ VIDE

### 4. Composants (Fichiers vides - à compléter)
- `frontend/client/src/components/ConnectWallet.jsx` ⚠️ VIDE
- `frontend/client/src/components/RestaurantList.jsx` ⚠️ VIDE
- `frontend/client/src/components/RestaurantCard.jsx` ⚠️ VIDE
- `frontend/client/src/components/MenuItems.jsx` ⚠️ VIDE
- `frontend/client/src/components/Cart.jsx` ⚠️ VIDE
- `frontend/client/src/components/Checkout.jsx` ⚠️ VIDE
- `frontend/client/src/components/OrderTracking.jsx` ⚠️ VIDE
- `frontend/client/src/components/OrderHistory.jsx` ⚠️ VIDE
- `frontend/client/src/components/TokenBalance.jsx` ⚠️ VIDE
- `frontend/client/src/components/DisputeModal.jsx` ⚠️ VIDE

### 5. Pages (Fichiers vides - à compléter)
- `frontend/client/src/pages/HomePage.jsx` ⚠️ VIDE
- `frontend/client/src/pages/RestaurantPage.jsx` ⚠️ VIDE
- `frontend/client/src/pages/CheckoutPage.jsx` ⚠️ VIDE
- `frontend/client/src/pages/TrackingPage.jsx` ⚠️ VIDE
- `frontend/client/src/pages/ProfilePage.jsx` ⚠️ VIDE

### 6. Application Principale (Fichier vide - à compléter)
- `frontend/client/src/App.jsx` ⚠️ VIDE
- `frontend/client/src/index.jsx` ⚠️ VIDE
- `frontend/client/public/index.html` ⚠️ VIDE

### 7. Configuration
- `frontend/client/.env.example` (à créer)
- `frontend/client/.env` (à créer)

### 8. Documentation
- `frontend/client/README.md` (peut être complété après implémentation)

---

## FONCTIONNALITÉS DÉTAILLÉES PAR COMPOSANT

### RestaurantList.jsx
- Affiche liste restaurants
- Filtres (cuisine type, prix, rating)
- Fetch depuis API backend
- Grid layout responsive

### MenuItems.jsx
- Affiche menu avec images IPFS
- Add to cart
- Prix en ETH/MATIC + EUR

### Cart.jsx
- Liste items
- Calcul total (food + delivery + platform fee)
- Remove items

### Checkout.jsx
- Confirm address
- Approve payment (MetaMask)
- Call createOrder() via backend
- Show transaction progress

### OrderTracking.jsx
- Real-time status updates
- GPS map (Google Maps API)
- Deliverer info
- ETA countdown
- Confirm delivery button

### OrderHistory.jsx
- List past orders
- Reorder button
- Leave review
- Download receipt (IPFS proof)

### TokenBalance.jsx
- Display DONE tokens
- Use tokens for discount
- Token transaction history

### DisputeModal.jsx
- Open dispute form
- Upload proof images (IPFS)
- Submit dispute

---

## LIVRABLES ATTENDUS

✓ Application client fonctionnelle
✓ Connexion wallet + flux commande complet
✓ Responsive mobile
✓ Intégration Google Maps
✓ Socket.io pour notifications temps réel
✓ Documentation complète

---

## NOTES IMPORTANTES

- Application React avec Vite pour build rapide
- TailwindCSS pour styling responsive
- Socket.io pour notifications temps réel
- Google Maps pour tracking GPS
- Intégration MetaMask pour paiements Web3

---

## PROCHAINES ÉTAPES

→ Passer au Sprint 4: Frontend Restaurant Dashboard
→ Lire `SPRINT_4.txt` pour connaître les fichiers à créer
→ Suivre `ETAPES_4.txt` pour les étapes détaillées

