# Dossier contracts/oracles/

Ce dossier contient les smart contracts d'oracles qui permettent d'injecter des données du monde réel (prix, GPS, météo) dans la blockchain. Les oracles sont essentiels car les smart contracts ne peuvent pas accéder directement aux données externes.

## Fichiers

### DonePriceOracle.sol
**Rôle** : Oracle de prix MATIC/USD utilisant Chainlink Price Feed.

**Fonctionnalités** :
- **getLatestPrice()** : Récupère le prix MATIC/USD en temps réel depuis Chainlink
- **convertUSDtoMATIC(usdAmount)** : Convertit automatiquement un montant en USD vers MATIC
- **convertMATICtoUSD(maticAmount)** : Convertit un montant en MATIC vers USD

**Pourquoi c'est essentiel** :
- Les restaurants définissent leurs prix en EUR/USD, mais le paiement se fait en MATIC
- Évite les erreurs de conversion manuelle
- Assure que la plateforme reçoit toujours la bonne commission même si le cours crypto varie
- Conversion automatique et précise en temps réel

**Intégration Chainlink** :
- Utilise Chainlink Price Feed pour obtenir les prix MATIC/USD
- Mise à jour automatique des prix
- Données décentralisées et fiables

**Utilisation** :
- Appelé automatiquement lors de la création d'une commande
- Utilisé par le backend pour convertir les prix avant de créer une commande on-chain
- Permet d'afficher les prix en EUR et MATIC simultanément dans les frontends

### DoneGPSOracle.sol
**Rôle** : Oracle GPS pour vérification de livraison on-chain.

**Fonctionnalités** :
- **updateLocation(orderId, lat, lng)** : Met à jour la position du livreur dans le contrat
- **verifyDelivery(orderId, clientLat, clientLng)** : Vérifie que la livraison a été effectuée dans une zone acceptable
- **calculateDistance(lat1, lng1, lat2, lng2)** : Calcule la distance entre deux points GPS (formule Haversine)

**Pourquoi c'est puissant** :
- Preuve cryptographique de livraison : la blockchain enregistre la position exacte
- Anti-fraude : le livreur ne peut pas confirmer une livraison à distance
- Automatisation des litiges basés sur la localisation
- Traçabilité complète du trajet de livraison

**Fonctionnement** :
1. Le livreur envoie sa position GPS en temps réel via le backend
2. Le backend appelle `updateLocation()` pour enregistrer la position on-chain
3. Lors de la livraison, `verifyDelivery()` vérifie que le livreur est proche du client
4. Si la distance est acceptable (< 100m par exemple), la livraison est validée

**Sécurité** :
- Seul le livreur assigné peut mettre à jour sa position pour une commande
- Vérification de la distance minimale pour confirmer la livraison
- Enregistrement immuable de toutes les positions GPS

### DoneWeatherOracle.sol
**Rôle** : Oracle météo (fonctionnalité bonus) pour adapter les conditions de livraison.

**Fonctionnalités** :
- **getWeather(lat, lng)** : Récupère les conditions météo pour une localisation
- **getWeatherImpact(orderId)** : Calcule l'impact météo sur une commande
- **adjustDeliveryFee(weatherCondition)** : Ajuste les frais de livraison selon la météo

**Exemples d'usages** :
- Adapter les frais de livraison selon les conditions météo (pluie, neige, tempête)
- Ajuster automatiquement l'ETA (temps estimé d'arrivée) selon la météo
- Protéger les livreurs : annulations gratuites lors de conditions météo extrêmes
- Bonus pour les livreurs qui livrent par mauvais temps

**Conditions météo** :
- SUNNY : Conditions normales
- RAINY : Pluie (frais légèrement augmentés)
- SNOWY : Neige (frais augmentés)
- STORM : Tempête (annulation gratuite possible)

**Intégration** :
- Peut utiliser Chainlink Weather Data Feed
- Ou API météo externe via oracle personnalisé
- Données mises à jour périodiquement

## Architecture

Les oracles fonctionnent en deux couches :

1. **On-chain (Smart Contracts)** :
   - Stockent les données vérifiées
   - Exposent des fonctions pour accéder aux données
   - Garantissent l'immuabilité des données

2. **Off-chain (Backend Services)** :
   - Récupèrent les données depuis les sources externes (Chainlink, APIs)
   - Appellent les fonctions des contrats pour mettre à jour les données
   - Synchronisent les données périodiquement

## Dépendances

- **Chainlink** : Pour les prix et potentiellement la météo
- **DoneOrderManager** : Les oracles sont appelés depuis le contrat principal
- **Backend Services** : chainlinkService.js, gpsOracleService.js pour la synchronisation

## Déploiement

Les oracles doivent être déployés après les contrats principaux :
1. DoneToken
2. DonePaymentSplitter
3. DoneStaking
4. DoneOrderManager
5. **DonePriceOracle** (Sprint 6)
6. **DoneGPSOracle** (Sprint 6)
7. **DoneWeatherOracle** (Sprint 6 - optionnel)

## Sécurité

- Validation des données avant enregistrement on-chain
- Contrôle d'accès : seuls les services autorisés peuvent mettre à jour
- Rate limiting pour éviter les abus
- Vérification de la source des données (Chainlink vérifié)

