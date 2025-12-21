# Guide Livreur - DoneFood

Guide complet pour les livreurs utilisant la plateforme DoneFood. Ce guide vous accompagne dans toutes les étapes de votre activité de livraison sur la blockchain.

---

##  Table des matières

1. [Introduction](#introduction)
2. [Premiers pas](#premiers-pas)
3. [Inscription et configuration](#inscription-et-configuration)
4. [Effectuer un staking](#effectuer-un-staking)
5. [Accepter des commandes](#accepter-des-commandes)
6. [Effectuer une livraison](#effectuer-une-livraison)
7. [Consulter vos gains](#consulter-vos-gains)
8. [Gérer votre profil](#gérer-votre-profil)
9. [FAQ](#faq)

---

## 🎯 Introduction

**DoneFood** est une plateforme de livraison de repas décentralisée qui permet aux livreurs de :

- 🚴 **Accepter des livraisons** en temps réel
-  **Suivre les trajets** avec navigation GPS
- 💰 **Gagner des revenus** automatiquement (20% du montant de chaque commande)
- 🔒 **Garantir leur fiabilité** avec un système de staking
- ⭐ **Recevoir des notes** et améliorer leur réputation

### Avantages pour les livreurs

-  **Paiements automatiques** : 20% du montant de chaque commande livrée
-  **Staking sécurisé** : Garantie de fiabilité avec 0.1 ETH minimum
-  **Navigation GPS** : Intégration Google Maps pour les trajets optimaux
-  **Temps réel** : Notifications instantanées des nouvelles commandes
-  **Transparence** : Toutes les transactions sont sur la blockchain

---

## 🚀 Premiers pas

### Étape 1 : Installer MetaMask

Si vous n'avez pas encore MetaMask installé :

1. Allez sur [metamask.io](https://metamask.io)
2. Téléchargez l'extension pour votre navigateur
3. Créez un nouveau portefeuille ou importez un existant
4. **IMPORTANT** : Sauvegardez votre phrase de récupération (12 mots)

### Étape 2 : Configurer le réseau Polygon

1. Ouvrez MetaMask
2. Cliquez sur le menu réseau (en haut)
3. Cliquez sur "Ajouter un réseau"
4. Entrez les informations suivantes :
   - **Nom du réseau** : Polygon Mainnet
   - **URL RPC** : `https://polygon-rpc.com`
   - **ID de chaîne** : 137
   - **Symbole** : MATIC
   - **URL du bloc explorateur** : `https://polygonscan.com`

### Étape 3 : Obtenir des POL (MATIC)

Pour effectuer des transactions et du staking, vous avez besoin de POL :

- **Minimum requis** : 0.1 POL pour le staking
- **Frais de transaction** : Environ 0.01 POL par transaction
- **Où obtenir** : Exchanges (Binance, Coinbase) ou bridges depuis Ethereum

### Étape 4 : Accéder à l'application livreur

1. Allez sur le site DoneFood Livreur
2. Cliquez sur **"Connecter le portefeuille"**
3. Sélectionnez **MetaMask**
4. Approuvez la connexion

 **Vous êtes maintenant connecté !**

---

##  Inscription et configuration

### Si c'est votre première fois

Lors de votre première connexion, vous devrez vous inscrire comme livreur.

### Formulaire d'inscription

Remplissez les informations suivantes :

- **Nom** * (obligatoire)
  - Votre nom ou pseudonyme
  
- **Téléphone** * (obligatoire)
  - Numéro de téléphone pour les communications
  
- **Type de véhicule** * (obligatoire)
  - Choisissez parmi : Vélo, Moto, Voiture, etc.

### Soumettre l'inscription

1. Vérifiez que tous les champs sont remplis
2. Cliquez sur **"S'inscrire comme livreur"**
3. Attendez la confirmation

 **Vous êtes maintenant inscrit comme livreur !**

---

## 🔒 Effectuer un staking

### Qu'est-ce que le staking ?

Le **staking** est un dépôt de garantie qui prouve votre fiabilité en tant que livreur. Il est requis pour pouvoir accepter des commandes.

### Pourquoi staker ?

-  **Obligatoire** : Vous devez staker pour accepter des commandes
-  **Garantie de fiabilité** : Montre votre engagement
-  **Protection** : En cas de faute grave, une partie peut être confisquée (slashing)
-  **Récupérable** : Vous pouvez retirer votre stake quand vous voulez (si aucune livraison active)

### Montant minimum

- **Minimum requis** : 0.1 POL (Polygon)
- **Recommandé** : 0.1 - 0.5 POL pour commencer

### Comment staker

1. Allez dans **"Profil"** → **"Staking"**
2. Vérifiez votre solde MetaMask (doit être ≥ 0.1 POL)
3. Entrez le montant à staker (minimum 0.1 POL)
4. Cliquez sur **"Staker"**
5. Confirmez la transaction dans MetaMask

 **Votre stake est maintenant actif !**

Vous pouvez maintenant accepter des commandes.

### Retirer votre stake (Unstake)

Vous pouvez retirer votre stake si :
-  Vous n'avez **aucune livraison active**
-  Vous souhaitez arrêter temporairement

**Comment retirer :**

1. Allez dans **"Profil"** → **"Staking"**
2. Vérifiez qu'aucune livraison n'est en cours
3. Cliquez sur **"Retirer le stake"**
4. Confirmez la transaction dans MetaMask

 **Attention** : Après le retrait, vous ne pourrez plus accepter de commandes jusqu'à ce que vous stakiez à nouveau.

### Slashing (confiscation)

En cas de faute grave (non-livraison, comportement abusif), la plateforme peut confisquer une partie de votre stake.

- **Quand** : En cas de faute grave vérifiée
- **Montant** : Déterminé par la plateforme selon la gravité
- **Notification** : Vous serez notifié en cas de slashing

---

## 📦 Accepter des commandes

### Passer en ligne

Pour recevoir des commandes, vous devez être **en ligne** :

1. Sur la page d'accueil, activez le **switch "En ligne"**
2. Votre statut passe à **"Disponible"**
3. Les commandes disponibles apparaissent automatiquement

### Voir les commandes disponibles

Sur la page d'accueil, vous verrez :

- **Liste des commandes** prêtes à être livrées
- **Distance au restaurant** : Calculée depuis votre position GPS
- **Gains estimés** : 20% du montant total de la commande
- **Adresse de livraison** : Où vous devez livrer
- **Temps estimé** : Temps de préparation estimé

### Filtrer par distance

Les commandes sont automatiquement triées par distance (plus proche en premier).

### Accepter une commande

1. Cliquez sur une commande dans la liste
2. Vérifiez les détails :
   - Articles commandés
   - Adresse du restaurant
   - Adresse de livraison
   - Gains estimés
3. Cliquez sur **"Accepter la commande"**
4. Confirmez la transaction dans MetaMask

 **La commande est maintenant assignée à vous !**

> 💡 **Astuce** : Acceptez les commandes proches pour optimiser vos gains et votre temps.

---

## 🚴 Effectuer une livraison

### Vue d'ensemble de la livraison active

Une fois une commande acceptée, elle apparaît comme **"Livraison active"** sur la page d'accueil.

### Étapes de la livraison

#### Étape 1 : Aller au restaurant

1. **Navigation automatique** :
   - La carte Google Maps s'affiche avec l'itinéraire
   - Cliquez sur **"Naviguer vers le restaurant"** pour ouvrir Google Maps
   
2. **Suivi GPS** :
   - Votre position est suivie en temps réel
   - La distance au restaurant est mise à jour automatiquement

3. **Confirmer la récupération** :
   - Quand vous êtes à moins de **100 mètres** du restaurant
   - Le bouton **"Confirmer la récupération"** devient actif
   - Cliquez dessus et confirmez dans MetaMask

 **Vous avez récupéré la commande !**

Le statut passe à **"En livraison"**.

#### Étape 2 : Livrer au client

1. **Navigation vers le client** :
   - La carte se met à jour avec l'itinéraire vers le client
   - Cliquez sur **"Naviguer vers le client"** pour ouvrir Google Maps
   
2. **Suivi GPS continu** :
   - Votre position est toujours suivie
   - Le client peut voir votre position en temps réel

3. **Confirmer la livraison** :
   - Quand vous êtes à moins de **100 mètres** du client
   - Le bouton **"Confirmer la livraison"** devient actif
   - Cliquez dessus et confirmez dans MetaMask

 **Livraison confirmée !**

**Actions automatiques :**
- Le paiement est réparti automatiquement (70% restaurant, 20% vous, 10% plateforme)
- Votre solde est mis à jour
- La commande disparaît de votre liste active

### Navigation GPS

L'application utilise **Google Maps** pour la navigation :

- **Carte interactive** : Affiche votre position, le restaurant et le client
- **Itinéraire optimisé** : Calcul automatique du meilleur trajet
- **Temps estimé (ETA)** : Temps d'arrivée estimé
- **Mise à jour en temps réel** : Votre position est mise à jour toutes les 5 secondes

### Autorisations GPS

Pour que le GPS fonctionne :

1. **Autorisez l'accès à la localisation** dans votre navigateur
2. Sur mobile, autorisez l'accès GPS dans les paramètres
3. Vérifiez que la géolocalisation est activée

---

## 💰 Consulter vos gains

### Vue d'ensemble sur le dashboard

Sur la page d'accueil, vous verrez des **cartes statistiques** :

- **Livraisons aujourd'hui** : Nombre de livraisons complétées
- **Gains aujourd'hui** : Montant gagné en POL
- **Rating** : Note moyenne reçue (sur 5)
- **Staké** : Montant actuellement staké

### Page Revenus détaillée

Allez dans **"Revenus"** pour voir :

#### Statistiques par période

- **Aujourd'hui** : Gains et nombre de livraisons du jour
- **Cette semaine** : Total de la semaine
- **Ce mois** : Total du mois

#### Graphique des gains

- **Graphique linéaire** montrant l'évolution de vos gains
- Filtres : Jour / Semaine / Mois
- Comparaison avec les périodes précédentes

#### Historique des transactions

- **Liste complète** de toutes vos livraisons
- Pour chaque livraison :
  - Numéro de commande
  - Date et heure
  - Montant gagné (20% du total)
  - Statut (livrée, en attente)
  - Lien vers Polygonscan (pour voir sur la blockchain)

### Retirer vos gains

Vos gains sont automatiquement ajoutés à votre solde après chaque livraison confirmée.

**Les fonds sont directement dans votre wallet MetaMask** - pas besoin de retirer manuellement !

> 💡 **Note** : Les paiements sont effectués automatiquement via le contrat `PaymentSplitter` sur la blockchain.

---

## 👤 Gérer votre profil

### Accéder à votre profil

Cliquez sur **"Profil"** dans le menu de navigation.

### Sections disponibles

#### 1. Informations personnelles

- **Nom** : Votre nom ou pseudonyme
- **Téléphone** : Numéro de contact
- **Type de véhicule** : Votre moyen de transport
- **Adresse wallet** : Votre adresse MetaMask (en lecture seule)

#### 2. Staking

- **Montant staké** : Montant actuellement en stake
- **Statut** : Staké / Non staké
- **Historique de slashing** : Si vous avez été slasher (confisqué)

#### 3. Notes et avis

- **Note moyenne** : Note moyenne reçue (sur 5 étoiles)
- **Nombre total de livraisons** : Total de livraisons complétées
- **Avis récents** : Derniers commentaires des clients
- **Graphique d'évolution** : Évolution de votre note dans le temps

#### 4. Historique des livraisons

- **Liste complète** de toutes vos livraisons
- Filtres par statut et date
- Export CSV disponible

### Statut en ligne/hors ligne

Sur la page d'accueil :

- **Switch "En ligne"** : Activez pour recevoir des commandes
- **Switch "Hors ligne"** : Désactivez quand vous ne souhaitez pas recevoir de commandes

> 💡 **Astuce** : Passez hors ligne pendant vos pauses pour ne pas recevoir de notifications.

---

## ❓ FAQ

### Questions générales

**Q : Dois-je payer pour m'inscrire ?**  
R : Non, l'inscription est gratuite. Vous devez seulement staker 0.1 POL minimum pour pouvoir accepter des commandes.

**Q : Puis-je avoir plusieurs comptes livreur ?**  
R : Actuellement, un wallet = un compte livreur. Pour plusieurs comptes, utilisez des wallets différents.

**Q : Que se passe-t-il si je perds l'accès à mon wallet ?**  
R : Utilisez votre phrase de récupération MetaMask pour restaurer votre wallet. Sans cette phrase, vous ne pourrez pas récupérer l'accès.

### Questions sur le staking

**Q : Pourquoi dois-je staker ?**  
R : Le staking garantit votre fiabilité. C'est une garantie que vous livrerez correctement les commandes.

**Q : Puis-je staker plus que le minimum ?**  
R : Oui, vous pouvez staker autant que vous voulez. Plus de stake = plus de confiance.

**Q : Quand puis-je retirer mon stake ?**  
R : Vous pouvez retirer votre stake à tout moment, sauf si vous avez une livraison active.

**Q : Que se passe-t-il si je suis slasher ?**  
R : Une partie de votre stake sera confisquée. Vous serez notifié et pourrez continuer à livrer si votre stake reste ≥ 0.1 POL.

**Q : Mon stake peut-il être confisqué entièrement ?**  
R : Oui, en cas de faute très grave. Vous devrez staker à nouveau pour continuer.

### Questions sur les commandes

**Q : Combien gagnez-vous par livraison ?**  
R : Vous recevez 20% du montant total de la commande (hors frais de livraison).

**Q : Puis-je refuser une commande après l'avoir acceptée ?**  
R : Non, une fois acceptée, vous devez la livrer. En cas de problème majeur, contactez le support.

**Q : Que faire si je ne peux pas trouver l'adresse du client ?**  
R : Contactez le client via le support ou utilisez la navigation GPS pour vous guider.

**Q : Puis-je accepter plusieurs commandes en même temps ?**  
R : Actuellement, vous ne pouvez avoir qu'une seule livraison active à la fois.

**Q : Combien de temps ai-je pour livrer ?**  
R : Il n'y a pas de limite stricte, mais les livraisons rapides améliorent votre rating.

### Questions sur la navigation

**Q : Le GPS fonctionne-t-il sur mobile ?**  
R : Oui, l'application est optimisée pour mobile avec accès GPS natif.

**Q : Puis-je utiliser une autre application de navigation ?**  
R : Oui, vous pouvez cliquer sur "Naviguer" pour ouvrir Google Maps ou votre application préférée.

**Q : Que faire si le GPS ne fonctionne pas ?**  
R : Vérifiez les autorisations de localisation dans votre navigateur/appareil. Rechargez la page si nécessaire.

**Q : Dois-je garder l'application ouverte pendant la livraison ?**  
R : Il est recommandé de garder l'application ouverte pour le suivi GPS, mais vous pouvez utiliser une autre app de navigation.

### Questions sur les paiements

**Q : Quand est-ce que je reçois mon paiement ?**  
R : Vous recevez 20% du montant total dès que le client confirme la livraison.

**Q : Comment sont calculés mes gains ?**  
R : `Gains = (Montant total de la commande) × 20%`

**Q : Y a-t-il des frais ?**  
R : Seulement les frais de transaction blockchain (gaz), qui sont très faibles sur Polygon (< 0.01 POL).

**Q : Puis-je voir l'historique de mes paiements ?**  
R : Oui, dans la page "Revenus", section "Historique des transactions".

**Q : Les paiements sont-ils automatiques ?**  
R : Oui, les paiements sont effectués automatiquement via le smart contract. Pas besoin de retirer manuellement.

### Questions sur les notes

**Q : Comment sont calculées mes notes ?**  
R : Les clients vous notent après chaque livraison (1 à 5 étoiles). Votre note moyenne est calculée automatiquement.

**Q : Puis-je voir qui m'a noté ?**  
R : Vous pouvez voir les avis récents, mais pas nécessairement l'identité complète du client (respect de la vie privée).

**Q : Que faire si je reçois une mauvaise note injuste ?**  
R : Contactez le support avec le numéro de commande. Les litiges peuvent être ouverts si nécessaire.

**Q : Les notes affectent-elles mes gains ?**  
R : Non, les notes n'affectent pas directement vos gains, mais une bonne note peut vous aider à recevoir plus de commandes.

### Questions techniques

**Q : Que faire si MetaMask ne se connecte pas ?**  
R : Vérifiez que MetaMask est installé et déverrouillé. Rafraîchissez la page et réessayez.

**Q : Pourquoi ma transaction est-elle en attente ?**  
R : Cela peut prendre quelques secondes à quelques minutes selon la congestion du réseau Polygon.

**Q : L'application fonctionne-t-elle hors ligne ?**  
R : Partiellement. Vous pouvez voir vos statistiques, mais vous ne recevrez pas de nouvelles commandes sans connexion.

**Q : Puis-je utiliser l'application sur plusieurs appareils ?**  
R : Oui, connectez simplement le même wallet MetaMask sur chaque appareil.

---

## 🆘 Support

Si vous rencontrez un problème ou avez une question :

1. **Consultez cette FAQ** : La réponse à votre question s'y trouve peut-être
2. **Vérifiez la section Troubleshooting** : Pour les problèmes techniques courants
3. **Contactez le support** : Via l'email support@donefood.io

---

##  Notes importantes

-  **Sauvegardez votre phrase de récupération MetaMask** : C'est la seule façon de récupérer votre wallet
- 🔒 **Stakez au minimum 0.1 POL** : Obligatoire pour accepter des commandes
-  **Autorisez le GPS** : Essentiel pour la navigation et la confirmation de livraison
- ⚡ **Confirmez rapidement** : Les confirmations rapides améliorent votre rating
- 💰 **Vérifiez vos gains régulièrement** : Dans la page "Revenus"

---

## 🎯 Bonnes pratiques

### Pour optimiser vos gains

1. **Restez en ligne** : Plus vous êtes disponible, plus vous recevez de commandes
2. **Acceptez les commandes proches** : Optimisez votre temps et vos déplacements
3. **Livrez rapidement** : Les clients apprécient les livraisons rapides
4. **Vérifiez les adresses** : Évitez les erreurs de livraison
5. **Communiquez** : En cas de problème, contactez le support rapidement

### Pour une meilleure expérience

1. **GPS activé** : Gardez le GPS activé pour une navigation optimale
2. **Batterie chargée** : Assurez-vous d'avoir assez de batterie pour les livraisons
3. **Connexion stable** : Une bonne connexion internet améliore le suivi GPS
4. **Application à jour** : Vérifiez régulièrement les mises à jour

---

**Bonne chance avec vos livraisons sur DoneFood ! 🚴✨**

