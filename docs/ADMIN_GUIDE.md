# Guide Administrateur - DoneFood

Guide complet pour les administrateurs de la plateforme DoneFood. Ce guide vous accompagne dans toutes les tâches d'administration et de monitoring de la plateforme.

---

##  Table des matières

1. [Introduction](#introduction)
2. [Premiers pas](#premiers-pas)
3. [Tableau de bord](#tableau-de-bord)
4. [Gérer les commandes](#gérer-les-commandes)
5. [Gérer les utilisateurs](#gérer-les-utilisateurs)
6. [Gérer les restaurants](#gérer-les-restaurants)
7. [Gérer les livreurs](#gérer-les-livreurs)
8. [Résoudre les litiges](#résoudre-les-litiges)
9. [Analytics et statistiques](#analytics-et-statistiques)
10. [FAQ](#faq)

---

## 🎯 Introduction

**DoneFood Admin Dashboard** est l'interface d'administration complète pour gérer la plateforme de livraison de repas décentralisée.

En tant qu'administrateur, vous pouvez :

-  **Monitorer l'activité** de la plateforme en temps réel
- 👥 **Gérer les utilisateurs** (clients, restaurants, livreurs)
- 📦 **Superviser les commandes** et leur statut
- ⚖️ **Résoudre les litiges** entre parties
-  **Analyser les performances** avec des graphiques détaillés
- 💰 **Suivre les revenus** de la plateforme

### Rôles et permissions

- **PLATFORM_ROLE** : Accès complet au dashboard admin
- **ARBITRATOR_ROLE** : Peut résoudre les litiges
- **DEFAULT_ADMIN_ROLE** : Administration complète du système

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

### Étape 3 : Vérifier votre rôle admin

Votre wallet doit avoir le rôle **PLATFORM_ROLE** ou **DEFAULT_ADMIN_ROLE** sur les smart contracts.

**Si vous n'avez pas le rôle :**
- Contactez le développeur ou le propriétaire des contrats
- Le rôle doit être assigné via `grantRole()` sur les contrats

### Étape 4 : Accéder au dashboard admin

1. Allez sur le site DoneFood Admin
2. Cliquez sur **"Connecter le portefeuille"**
3. Sélectionnez **MetaMask**
4. Approuvez la connexion
5. Vérifiez que votre rôle est reconnu

 **Vous êtes maintenant connecté en tant qu'administrateur !**

---

##  Tableau de bord

### Vue d'ensemble

Le tableau de bord affiche les **statistiques globales** de la plateforme :

#### Cartes KPIs (Indicateurs clés)

- **Total Commandes** : Nombre total de commandes créées
- **GMV Total** : Gross Merchandise Value (valeur totale des commandes)
- **Revenus Plateforme** : Total des commissions (10% de toutes les commandes)
- **Temps Moyen Livraison** : Temps moyen entre création et livraison
- **Utilisateurs Actifs** : Nombre d'utilisateurs actifs (clients + restaurants + livreurs)

### Graphiques principaux

#### 1. Graphique des commandes

- **Graphique linéaire** montrant l'évolution du nombre de commandes
- Filtres : Jour / Semaine / Mois / Année
- Comparaison avec les périodes précédentes
- **KPIs associés** :
  - Nombre total de commandes
  - Panier moyen
  - Taux de croissance

#### 2. Graphique des revenus

- **Graphique linéaire** des revenus de la plateforme
- **Répartition** :
  - Revenus plateforme (10%)
  - Revenus restaurants (70%)
  - Revenus livreurs (20%)
- Filtres : Jour / Semaine / Mois / Année

### Dernières commandes

- **Tableau** des 5 commandes les plus récentes
- Colonnes : ID, Client, Restaurant, Statut, Montant, Date
- Lien vers la page complète des commandes

### Derniers litiges

- **Tableau** des 5 litiges nécessitant une attention
- Colonnes : ID, Commande, Participants, Statut, Date
- Lien vers la page complète des litiges

---

## 📦 Gérer les commandes

### Accéder à la page Commandes

1. Dans le menu, cliquez sur **"Commandes"**
2. Vous verrez la liste complète de toutes les commandes

### Filtrer les commandes

Vous pouvez filtrer par :

- **Statut** :
  - Toutes
  - Créées
  - En préparation
  - En livraison
  - Livrées
  - En litige
  - Annulées

- **Date** :
  - Date de début
  - Date de fin
  - Utilisez les champs de date pour une période personnalisée

- **Restaurant** :
  - Recherche par nom ou adresse du restaurant

- **Livreur** :
  - Recherche par nom ou adresse du livreur

### Rechercher une commande

Utilisez la barre de recherche pour trouver une commande par :
- Numéro de commande
- Adresse du client
- Adresse du restaurant

### Voir les détails d'une commande

1. Cliquez sur une commande dans le tableau
2. Un modal s'ouvre avec :
   - **Informations complètes** : Tous les détails de la commande
   - **Articles** : Liste complète avec quantités et prix
   - **Participants** : Client, restaurant, livreur
   - **Timeline** : Historique des changements de statut
   - **Transactions blockchain** : Hash des transactions
   - **Avis client** : Si disponible

### Actions sur les commandes

En tant qu'admin, vous pouvez :

- 👁️ **Voir les détails** : Consulter toutes les informations
- 📄 **Télécharger le reçu** : Pour les commandes livrées
- ⚖️ **Intervenir en cas de litige** : Voir la section "Résoudre les litiges"

---

## 👥 Gérer les utilisateurs

### Accéder à la page Utilisateurs

1. Dans le menu, cliquez sur **"Utilisateurs"**
2. Vous verrez la liste de tous les clients

### Filtrer les utilisateurs

- **Recherche** : Par nom, email ou adresse wallet
- **Activité** :
  - Tous les utilisateurs
  - Actifs (ont passé au moins une commande)
  - Inactifs (aucune commande)

### Informations affichées

Pour chaque utilisateur :

- **Adresse wallet** : Adresse MetaMask
- **Nom** : Nom du client
- **Email** : Email de contact
- **Total commandes** : Nombre de commandes passées
- **Total dépensé** : Montant total dépensé (en POL)
- **Tokens DONE** : Solde de tokens de fidélité
- **Statut** : Actif / Inactif

### Voir les détails d'un utilisateur

1. Cliquez sur un utilisateur dans le tableau
2. Un modal s'ouvre avec :
   - **Profil complet** : Toutes les informations
   - **Historique des commandes** : Liste de toutes ses commandes
   - **Tokens DONE** : Historique des transactions de tokens
   - **Statistiques** : Commandes, dépenses, rating moyen reçu

### Actions sur les utilisateurs

- 👁️ **Voir les détails** : Consulter le profil complet
-  **Voir les statistiques** : Commandes, dépenses, etc.
-  **Suspendre** : (Fonctionnalité future) Suspendre un compte en cas de problème

---

## 🍽️ Gérer les restaurants

### Accéder à la page Restaurants

1. Dans le menu, cliquez sur **"Restaurants"**
2. Vous verrez la liste de tous les restaurants

### Filtrer les restaurants

- **Recherche** : Par nom, type de cuisine ou adresse
- **Statut** :
  - Tous
  - Actifs
  - Inactifs

### Informations affichées

Pour chaque restaurant :

- **Adresse wallet** : Adresse MetaMask du restaurant
- **Nom** : Nom du restaurant
- **Type de cuisine** : Italienne, Française, etc.
- **Total commandes** : Nombre de commandes reçues
- **Revenus** : Total des revenus (en POL)
- **Rating** : Note moyenne reçue
- **Statut** : Actif / Inactif

### Voir les détails d'un restaurant

1. Cliquez sur un restaurant dans le tableau
2. Un modal s'ouvre avec :
   - **Profil complet** : Informations du restaurant
   - **Menu** : Liste complète des articles
   - **Historique des commandes** : Toutes les commandes reçues
   - **Statistiques** : Revenus, commandes, rating

### Actions sur les restaurants

- 👁️ **Voir les détails** : Consulter le profil complet
-  **Voir les statistiques** : Revenus, commandes, etc.
-  **Suspendre** : (Fonctionnalité future) Suspendre un restaurant en cas de problème

---

## 🚴 Gérer les livreurs

### Accéder à la page Livreurs

1. Dans le menu, cliquez sur **"Livreurs"**
2. Vous verrez la liste de tous les livreurs

### Filtrer les livreurs

- **Recherche** : Par nom ou adresse wallet
- **Statut** :
  - Tous
  - Stakés (ont effectué un stake)
  - Non stakés
  - Disponibles
  - Indisponibles

### Informations affichées

Pour chaque livreur :

- **Adresse wallet** : Adresse MetaMask
- **Nom** : Nom du livreur
- **Type de véhicule** : Vélo, Moto, Voiture, etc.
- **Montant staké** : Montant en stake (en POL)
- **Total livraisons** : Nombre de livraisons complétées
- **Rating** : Note moyenne reçue
- **Gains** : Total des gains (en POL)
- **Statut** : Disponible / Indisponible

### Voir les détails d'un livreur

1. Cliquez sur un livreur dans le tableau
2. Un modal s'ouvre avec :
   - **Profil complet** : Informations du livreur
   - **Staking** : Détails du stake actuel
   - **Historique des livraisons** : Toutes les livraisons
   - **Statistiques** : Gains, livraisons, rating

### Actions sur les livreurs

- 👁️ **Voir les détails** : Consulter le profil complet
-  **Voir les statistiques** : Gains, livraisons, etc.
-  **Slashing** : Confisquer une partie du stake en cas de faute grave
-  **Suspendre** : (Fonctionnalité future) Suspendre un livreur en cas de problème

---

## ⚖️ Résoudre les litiges

### Accéder à la page Litiges

1. Dans le menu, cliquez sur **"Litiges"**
2. Vous verrez la liste de tous les litiges

### Filtrer les litiges

- **Statut** :
  - Tous
  - Actifs (en attente de résolution)
  - Résolus

- **Recherche** : Par numéro de commande ou ID de litige

### Informations affichées

Pour chaque litige :

- **ID du litige** : Identifiant unique
- **Commande #** : Numéro de la commande concernée
- **Client** : Adresse et nom du client
- **Restaurant** : Adresse et nom du restaurant
- **Livreur** : Adresse et nom du livreur (si assigné)
- **Statut** : En attente / Résolu
- **Date** : Date d'ouverture du litige

### Voir les détails d'un litige

1. Cliquez sur un litige dans le tableau
2. Un modal s'ouvre avec :

#### Informations de la commande

- **Détails complets** : Articles, montants, dates
- **Participants** : Client, restaurant, livreur avec adresses

#### Informations du litige

- **Raison** : Raison du litige fournie par l'ouvreur
- **Preuves** : Images IPFS si disponibles
- **Date d'ouverture** : Quand le litige a été ouvert
- **Ouvreur** : Qui a ouvert le litige (client, restaurant ou livreur)

#### Votes (si système d'arbitrage décentralisé)

- **Votes des arbitres** : Si applicable
- **Tendances** : Pour qui penchent les votes

### Résoudre un litige

1. **Examiner les détails** :
   - Lisez la raison du litige
   - Consultez les preuves (images IPFS)
   - Vérifiez l'historique de la commande

2. **Sélectionner le gagnant** :
   - Choisissez parmi : **Client**, **Restaurant**, ou **Livreur**
   - Basez votre décision sur les preuves et les faits

3. **Résoudre le litige** :
   - Cliquez sur **"Résoudre le litige"**
   - Sélectionnez le gagnant dans le menu déroulant
   - (Optionnel) Cochez "Exécuter la résolution on-chain" pour enregistrer sur la blockchain
   - Cliquez sur **"Résoudre"**
   - Confirmez la transaction dans MetaMask

 **Le litige est résolu !**

**Actions automatiques :**
- Le remboursement est calculé selon le pourcentage défini
- Les fonds sont transférés au gagnant
- Le statut de la commande est mis à jour
- Le modal se ferme automatiquement après 1.5 secondes

### Historique des résolutions

Sur la page Litiges, vous pouvez voir :
- **Litiges résolus** : Tous les litiges déjà traités
- **Gagnant** : Qui a gagné chaque litige
- **Montant remboursé** : Montant transféré au gagnant
- **Date de résolution** : Quand le litige a été résolu

---

##  Analytics et statistiques

### Accéder aux analytics

Le tableau de bord affiche déjà les principales statistiques. Pour plus de détails :

1. Consultez les graphiques sur le dashboard
2. Utilisez les filtres pour différentes périodes
3. Exportez les données si nécessaire

### Statistiques disponibles

#### Commandes

- **Évolution temporelle** : Nombre de commandes dans le temps
- **Panier moyen** : Montant moyen par commande
- **Taux de croissance** : Comparaison avec les périodes précédentes
- **Répartition par statut** : Combien de commandes dans chaque statut

#### Revenus

- **Revenus plateforme** : Total des commissions (10%)
- **Répartition** :
  - 70% restaurants
  - 20% livreurs
  - 10% plateforme
- **Évolution temporelle** : Revenus dans le temps

#### Utilisateurs

- **Utilisateurs actifs** : Nombre d'utilisateurs actifs
- **Répartition** :
  - Clients
  - Restaurants
  - Livreurs
- **Croissance** : Évolution du nombre d'utilisateurs

#### Livraisons

- **Temps moyen** : Temps moyen de livraison
- **Taux de succès** : Pourcentage de livraisons réussies
- **Rating moyen** : Note moyenne des livreurs

### Exporter les données

Sur certaines pages, vous pouvez exporter les données :

1. Cliquez sur **"Exporter CSV"** (si disponible)
2. Un fichier CSV sera téléchargé avec toutes les données
3. Ouvrez-le dans Excel ou Google Sheets pour analyse

---

## ❓ FAQ

### Questions générales

**Q : Qui peut accéder au dashboard admin ?**  
R : Seuls les wallets avec le rôle PLATFORM_ROLE ou DEFAULT_ADMIN_ROLE peuvent accéder.

**Q : Puis-je avoir plusieurs admins ?**  
R : Oui, plusieurs wallets peuvent avoir le rôle admin. Contactez le développeur pour ajouter des admins.

**Q : Que faire si je perds l'accès à mon wallet admin ?**  
R : Utilisez votre phrase de récupération MetaMask. Si vous l'avez perdue, contactez le développeur pour réassigner le rôle à un nouveau wallet.

### Questions sur les commandes

**Q : Puis-je modifier une commande ?**  
R : Non, les commandes sont immuables une fois créées sur la blockchain. Vous pouvez seulement consulter les détails.

**Q : Puis-je annuler une commande ?**  
R : En tant qu'admin, vous pouvez intervenir en cas de litige, mais l'annulation directe n'est pas disponible. Les commandes peuvent être annulées par le restaurant ou via litige.

**Q : Comment voir toutes les commandes d'un utilisateur ?**  
R : Allez dans "Utilisateurs", cliquez sur l'utilisateur, et consultez son historique de commandes.

### Questions sur les litiges

**Q : Combien de temps ai-je pour résoudre un litige ?**  
R : Il n'y a pas de limite stricte, mais il est recommandé de résoudre rapidement pour une meilleure expérience utilisateur.

**Q : Puis-je voir l'historique de tous les litiges ?**  
R : Oui, sur la page "Litiges", filtrez par "Résolus" pour voir tous les litiges déjà traités.

**Q : Que se passe-t-il si je résous un litige en faveur du client ?**  
R : Le client reçoit un remboursement selon le pourcentage défini. Les fonds sont transférés automatiquement.

**Q : Puis-je modifier une résolution de litige ?**  
R : Non, une fois résolu, un litige ne peut pas être modifié. Assurez-vous de bien examiner avant de résoudre.

### Questions sur les utilisateurs

**Q : Puis-je suspendre un utilisateur ?**  
R : Cette fonctionnalité sera disponible dans une future version. Pour l'instant, contactez le support.

**Q : Comment voir les tokens DONE d'un utilisateur ?**  
R : Allez dans "Utilisateurs", cliquez sur l'utilisateur, et consultez la section "Tokens DONE".

**Q : Puis-je modifier les informations d'un utilisateur ?**  
R : Les informations de base peuvent être modifiées via le support. Les données blockchain sont immuables.

### Questions sur les restaurants

**Q : Puis-je voir le menu d'un restaurant ?**  
R : Oui, allez dans "Restaurants", cliquez sur un restaurant, et consultez la section "Menu".

**Q : Comment voir les revenus d'un restaurant ?**  
R : Allez dans "Restaurants", cliquez sur un restaurant, et consultez la section "Statistiques" → "Revenus".

**Q : Puis-je suspendre un restaurant ?**  
R : Cette fonctionnalité sera disponible dans une future version. Pour l'instant, contactez le support.

### Questions sur les livreurs

**Q : Puis-je voir le stake d'un livreur ?**  
R : Oui, allez dans "Livreurs", cliquez sur un livreur, et consultez la section "Staking".

**Q : Comment slasher un livreur ?**  
R : Cette fonctionnalité sera disponible dans une future version. Pour l'instant, contactez le développeur.

**Q : Puis-je voir l'historique des livraisons d'un livreur ?**  
R : Oui, allez dans "Livreurs", cliquez sur un livreur, et consultez la section "Historique des livraisons".

### Questions techniques

**Q : Les données sont-elles en temps réel ?**  
R : Oui, les données sont mises à jour en temps réel. Rafraîchissez la page pour voir les dernières données.

**Q : Puis-je exporter toutes les données ?**  
R : Certaines pages permettent l'export CSV. Pour un export complet, contactez le support.

**Q : Que faire si le dashboard ne charge pas ?**  
R : Vérifiez votre connexion internet, rafraîchissez la page, ou contactez le support.

**Q : Les transactions blockchain sont-elles visibles ?**  
R : Oui, vous pouvez voir les hash de transactions. Cliquez dessus pour voir sur Polygonscan.

---

## 🆘 Support

Si vous rencontrez un problème ou avez une question :

1. **Consultez cette FAQ** : La réponse à votre question s'y trouve peut-être
2. **Vérifiez la section Troubleshooting** : Pour les problèmes techniques courants
3. **Contactez le support technique** : Via l'email admin@donefood.io

---

##  Notes importantes

-  **Sauvegardez votre phrase de récupération MetaMask** : C'est la seule façon de récupérer votre wallet admin
- 🔒 **Sécurité** : Ne partagez jamais votre clé privée ou votre phrase de récupération
- ⚖️ **Litiges** : Examinez toujours les preuves avant de résoudre un litige
-  **Données** : Les données sont mises à jour en temps réel, mais rafraîchissez si nécessaire
- 💰 **Revenus** : Les revenus de la plateforme sont automatiquement calculés (10% de chaque commande)

---

## 🎯 Bonnes pratiques

### Pour une gestion efficace

1. **Vérifiez régulièrement** : Consultez le dashboard quotidiennement
2. **Résolvez rapidement** : Traitez les litiges dans les 24-48 heures
3. **Analysez les tendances** : Utilisez les graphiques pour identifier les problèmes
4. **Documentez** : Notez les décisions importantes pour référence future
5. **Communiquez** : En cas de problème majeur, contactez les parties concernées

### Pour la résolution de litiges

1. **Examinez toutes les preuves** : Images, descriptions, historique
2. **Consultez l'historique** : Vérifiez le timeline de la commande
3. **Soyez équitable** : Basez vos décisions sur les faits
4. **Documentez** : Notez la raison de votre décision
5. **Communiquez** : Informez les parties de la résolution

---

**Bonne gestion de la plateforme DoneFood ! 🎛️✨**

