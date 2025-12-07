# Done Delivery Protocol – Documentation des Contrats

Ce dossier contient l’ensemble des smart contracts du protocole Done Delivery.  
Ils sont organisés en trois catégories :

- **Contrats Core (gestion des commandes, paiements, staking, token)**
- **Oracles (GPS, Weather, Price)**
- **Interfaces (IOrderManager, IPaymentSplitter)**

---

## 1. Vue d’ensemble de l’architecture



Client → DoneOrderManager → PaymentSplitter → Restaurant / Livreur / Plateforme
↘
→ DoneToken (reward)
↘
→ DoneStaking (validation livreurs)
↘
→ Oracles (GPS / Weather / Price)


---

## 2. Contrats Core

### DoneOrderManager.sol
Contrat central du protocole.  
Il gère :

- création de commande  
- préparation par restaurant  
- assignation livreur  
- récupération / livraison  
- litiges  
- mint des tokens DONE  
- paiement (splitter)

Rôles utilisés :

- CLIENT_ROLE  
- RESTAURANT_ROLE  
- DELIVERER_ROLE  
- PLATFORM_ROLE  
- ARBITRATOR_ROLE  

---

### DonePaymentSplitter.sol
Répartit automatiquement le paiement :

- 70 % restaurant  
- 20 % livreur  
- 10 % plateforme  

Fonctions clés :
- splitPayment()
- withdraw()

---

### DoneStaking.sol
Permet au livreur d’être "vérifié" :  
il doit staker **0.1 ETH minimum**.

- stakeAsDeliverer()  
- slash()  
- unstake()  
- isStaked()  

---

### DoneToken.sol (ERC20)
Token utilitaire distribué aux clients après livraison :

- mint() par OrderManager  
- burn()  
- calculateReward() (10% du montant food)

---

## 3. Oracles

### DoneGPSOracle.sol
Vérifie la position du livreur :

- updateLocation()  
- verifyDelivery()  
- calculateDistance()  

Utilisé pour valider la livraison.

---

### DoneWeatherOracle.sol
Permet :

- récupération météo  
- ajustement des frais selon les conditions  
- détection météo extrême

Fonctions :
- updateWeather()  
- getWeather()  
- adjustDeliveryFee()  
- canDeliver()  

---

### DonePriceOracle.sol
Basé sur Chainlink Price Feed.

- getLatestPrice()  
- convertUSDtoMATIC()  
- convertMATICtoUSD()  

---

## 4. Interfaces

### IOrderManager.sol  
Expose les fonctions publiques de DoneOrderManager.

### IPaymentSplitter.sol  
Expose splitPayment().

---

## 5. Relation entre les contrats

- **DoneOrderManager** = chef d’orchestre  
- **DonePaymentSplitter** = gestion paiement  
- **DoneToken** = récompenses  
- **DoneStaking** = validation livreur  
- **GPS / Weather / Price** = données externes pour automatiser le flux  

---

