# Guide Utilisateur - DoneFood

Bienvenue sur **DoneFood**, la plateforme de livraison de repas décentralisée sur blockchain ! Ce guide vous accompagne dans toutes les étapes de votre expérience utilisateur.

---

##  Table des matières

1. [Introduction](#introduction)
2. [Premiers pas](#premiers-pas)
3. [Passer une commande](#passer-une-commande)
4. [Suivre votre commande](#suivre-votre-commande)
5. [Gérer vos tokens DONE](#gérer-vos-tokens-done)
6. [Gérer les litiges](#gérer-les-litiges)
7. [Votre profil](#votre-profil)
8. [FAQ](#faq)

---

## 🎯 Introduction

**DoneFood** est une plateforme de livraison de repas innovante qui utilise la technologie blockchain pour garantir transparence, sécurité et récompenses. En tant que client, vous pouvez :

- 🍕 Commander auprès de restaurants locaux
- 💰 Payer en crypto-monnaies (POL, ETH, tokens DONE)
- 🎁 Gagner des tokens DONE à chaque commande
-  Suivre votre livraison en temps réel
- ⚖️ Ouvrir un litige si nécessaire
- ⭐ Laisser des avis sur vos commandes

---

## 🚀 Premiers pas

### Étape 1 : Installer MetaMask

MetaMask est un portefeuille crypto qui vous permet d'interagir avec la blockchain Polygon.

1. **Installer l'extension** :
   - Allez sur [metamask.io](https://metamask.io)
   - Cliquez sur "Télécharger"
   - Ajoutez l'extension à votre navigateur (Chrome, Firefox, Brave, etc.)

2. **Créer un portefeuille** :
   - Ouvrez MetaMask
   - Cliquez sur "Créer un portefeuille"
   - Suivez les instructions pour créer un mot de passe
   - **IMPORTANT** : Sauvegardez votre phrase de récupération (12 mots) dans un endroit sûr

3. **Ajouter le réseau Polygon** :
   - Ouvrez MetaMask
   - Cliquez sur le menu réseau (en haut)
   - Cliquez sur "Ajouter un réseau"
   - Entrez les informations suivantes :
     - **Nom du réseau** : Polygon Mainnet
     - **URL RPC** : `https://polygon-rpc.com`
     - **ID de chaîne** : 137
     - **Symbole** : MATIC
     - **URL du bloc explorateur** : `https://polygonscan.com`

### Étape 2 : Obtenir des POL (MATIC)

Pour passer des commandes, vous avez besoin de POL (Polygon) pour payer les frais de transaction et les commandes.

**Options pour obtenir des POL** :
- Acheter sur un exchange (Binance, Coinbase, etc.)
- Utiliser un bridge pour transférer des tokens depuis Ethereum
- Utiliser un faucet (pour les tests uniquement)

### Étape 3 : Se connecter à DoneFood

1. Allez sur le site DoneFood
2. Cliquez sur le bouton **"Connecter le portefeuille"** en haut à droite
3. Sélectionnez **MetaMask** dans la liste
4. Approuvez la connexion dans MetaMask
5. Confirmez la connexion

 **Vous êtes maintenant connecté !**

---

## 🛒 Passer une commande

### Étape 1 : Parcourir les restaurants

1. Sur la page d'accueil, vous verrez une liste de restaurants disponibles
2. Chaque carte restaurant affiche :
   - Le nom du restaurant
   - Le type de cuisine
   - La note moyenne
   - Le temps de livraison estimé
3. Cliquez sur un restaurant pour voir son menu

### Étape 2 : Consulter le menu

1. Sur la page du restaurant, vous verrez :
   - Les informations du restaurant
   - Le menu complet avec photos
   - Les prix en POL
2. Pour chaque plat, vous pouvez voir :
   - Le nom et la description
   - Le prix
   - Une photo (si disponible)

### Étape 3 : Ajouter des articles au panier

1. Cliquez sur **"Ajouter au panier"** pour chaque plat souhaité
2. Vous pouvez ajuster la quantité directement dans le panier
3. Le panier affiche :
   - Les articles sélectionnés
   - Le sous-total
   - Les frais de livraison (0.001 POL)
   - La commission plateforme (10%)
   - **Le total final**

### Étape 4 : Passer à la caisse

1. Cliquez sur **"Voir le panier"** ou l'icône panier dans le header
2. Vérifiez votre commande
3. Cliquez sur **"Passer la commande"**

### Étape 5 : Confirmer la commande

1. Sur la page de checkout, vous devez :
   - **Entrer votre adresse de livraison** (obligatoire)
   - Vérifier le récapitulatif de la commande
   - Vérifier que vous avez suffisamment de POL dans votre wallet

2. **Si vous avez des tokens DONE** :
   - Vous pouvez les utiliser pour obtenir une réduction
   - Le taux de conversion est affiché
   - La réduction sera appliquée automatiquement

3. Cliquez sur **"Confirmer et payer"**

4. **Confirmer la transaction dans MetaMask** :
   - Une fenêtre MetaMask s'ouvrira
   - Vérifiez le montant total
   - Cliquez sur **"Confirmer"**
   - Attendez la confirmation de la transaction

 **Votre commande est passée !**

Vous recevrez un numéro de commande unique et serez redirigé vers la page de suivi.

---

##  Suivre votre commande

### Accéder au suivi

1. Après avoir passé votre commande, vous êtes automatiquement redirigé vers la page de suivi
2. Vous pouvez aussi accéder au suivi depuis :
   - Votre profil → Historique des commandes → Cliquez sur une commande
   - L'icône de suivi dans le header (si une commande est en cours)

### Informations affichées

La page de suivi affiche :

- **Numéro de commande** : Identifiant unique de votre commande
- **Statut actuel** :
  -  **Créée** : Votre commande a été reçue
  - 👨‍🍳 **En préparation** : Le restaurant prépare votre commande
  - 🚗 **En livraison** : Un livreur a pris votre commande en charge
  -  **Livrée** : Votre commande est arrivée
  -  **Litige** : Un problème a été signalé

- **Carte interactive** : Suivi en temps réel de la position du livreur (si disponible)
- **Temps estimé d'arrivée (ETA)** : Calculé en fonction de la distance
- **Détails de la commande** : Articles, montant, adresse de livraison

### Confirmer la livraison

Une fois que vous avez reçu votre commande :

1. Vérifiez que tous les articles sont présents et corrects
2. Cliquez sur **"Confirmer la livraison"**
3. Confirmez la transaction dans MetaMask
4.  **Vous recevrez automatiquement des tokens DONE !**

> 💡 **Astuce** : Plus vous confirmez rapidement, plus vous recevrez de tokens en récompense.

---

## 🎁 Gérer vos tokens DONE

### Qu'est-ce que les tokens DONE ?

Les **tokens DONE** sont la monnaie de fidélité de la plateforme. Vous les gagnez à chaque commande livrée et confirmée.

### Comment gagner des tokens DONE ?

-  **Confirmer une livraison** : Vous recevez automatiquement des tokens
- 💰 **Montant gagné** : Environ 10% de la valeur de votre commande (en tokens DONE)
- 🎁 **Bonus** : Plus vous commandez, plus vous gagnez !

### Consulter votre solde

1. Allez dans **Profil** → **Tokens DONE**
2. Vous verrez :
   - **Votre solde actuel** en tokens DONE
   - **L'historique des transactions** (gains, utilisations)
   - **Le taux de conversion** actuel (tokens DONE → POL)

### Utiliser vos tokens DONE

Lors du checkout :

1. Si vous avez des tokens DONE, une option s'affichera automatiquement
2. Vous pouvez choisir d'utiliser vos tokens pour réduire le montant à payer
3. Le taux de conversion est affiché en temps réel
4. La réduction est appliquée automatiquement au total

### Historique des transactions

Dans la section **Tokens DONE** de votre profil, vous pouvez voir :

-  **Gains** : Quand et combien vous avez gagné
- 💸 **Utilisations** : Quand vous avez utilisé vos tokens
-  **Statistiques** : Total gagné, total utilisé, solde actuel

---

## ⚖️ Gérer les litiges

### Quand ouvrir un litige ?

Vous pouvez ouvrir un litige si :

-  Votre commande n'a jamais été livrée
- ⏰ Il y a un retard important (plus de 2 heures)
- 🍕 La qualité de la nourriture est problématique
- 📦 Votre commande est incorrecte (mauvais articles)
- 🚫 Autre problème majeur

### Comment ouvrir un litige ?

1. Allez dans **Profil** → **Historique des commandes**
2. Trouvez la commande concernée
3. Cliquez sur **"Ouvrir un litige"** (disponible pour les commandes en livraison ou livrées)
4. Remplissez le formulaire :
   - **Type de problème** : Sélectionnez dans la liste
   - **Description** : Décrivez le problème en détail
   - **Preuve (optionnel)** : Ajoutez une photo si vous en avez une
5. Cliquez sur **"Soumettre le litige"**
6. Confirmez la transaction dans MetaMask

 **Votre litige est ouvert !**

Un administrateur examinera votre litige et vous contactera pour résoudre le problème.

### Suivre votre litige

- Le statut de votre commande changera en **"En litige"**
- Vous pouvez voir les détails du litige dans l'historique des commandes
- Vous serez notifié lorsque le litige sera résolu

---

## 👤 Votre profil

### Accéder à votre profil

Cliquez sur **"Profil"** dans le menu de navigation en haut.

### Sections disponibles

#### 1. Historique des commandes

-  Liste de toutes vos commandes passées
-  Filtres par statut (Créée, En préparation, Livrée, etc.)
- 📄 Pagination pour naviguer entre les commandes
- 📥 **Télécharger le reçu** : Disponible pour les commandes livrées

Pour chaque commande, vous pouvez :

- 👁️ **Voir les détails** : Articles, montant, dates
- ⭐ **Laisser un avis** : Pour les commandes livrées (note de 1 à 5 étoiles + commentaire)
- ⚖️ **Ouvrir un litige** : Si nécessaire
- 📄 **Télécharger le reçu** : Reçu PDF complet avec toutes les informations

#### 2. Tokens DONE

- 💰 Votre solde actuel
-  Historique des transactions
-  Statistiques (total gagné, utilisé)

#### 3. Statistiques rapides

En haut de votre profil, vous verrez :

- 🛒 **Nombre total de commandes**
- 💵 **Montant total dépensé**
- 🎁 **Tokens DONE gagnés**
- ⭐ **Note moyenne reçue** (si applicable)

---

## ❓ FAQ

### Questions générales

**Q : Dois-je créer un compte ?**  
R : Non ! DoneFood utilise votre adresse wallet comme identifiant. Connectez simplement votre wallet MetaMask.

**Q : Quels navigateurs sont supportés ?**  
R : Chrome, Firefox, Brave, Edge (avec extension MetaMask).

**Q : Puis-je utiliser un autre wallet que MetaMask ?**  
R : Actuellement, MetaMask est le wallet principalement supporté. D'autres wallets peuvent être ajoutés à l'avenir.

### Questions sur les paiements

**Q : Quelles crypto-monnaies puis-je utiliser ?**  
R : Vous pouvez payer avec POL (Polygon), ETH, ou utiliser vos tokens DONE pour une réduction.

**Q : Combien coûtent les frais de transaction ?**  
R : Les frais de transaction sur Polygon sont très faibles (généralement moins de 0.01 POL).

**Q : Que se passe-t-il si ma transaction échoue ?**  
R : Votre commande ne sera pas créée et vous ne serez pas débité. Vous pouvez réessayer.

**Q : Puis-je annuler une commande ?**  
R : Une fois la commande passée, elle ne peut être annulée que par le restaurant ou en cas de litige.

### Questions sur les tokens DONE

**Q : Combien de tokens DONE gagnez-vous par commande ?**  
R : Environ 10% de la valeur de votre commande (en tokens DONE). Le montant exact dépend du taux de conversion.

**Q : Les tokens DONE expirent-ils ?**  
R : Non, vos tokens DONE n'expirent jamais. Vous pouvez les utiliser quand vous voulez.

**Q : Puis-je transférer mes tokens DONE à un autre wallet ?**  
R : Oui, les tokens DONE sont des tokens ERC-20 standards sur Polygon, vous pouvez les transférer librement.

**Q : Où puis-je voir le taux de conversion ?**  
R : Dans votre profil → Tokens DONE, le taux actuel est affiché.

### Questions sur les livraisons

**Q : Comment fonctionne le suivi en temps réel ?**  
R : Si le livreur a activé le partage de position, vous verrez sa position sur une carte en temps réel.

**Q : Que faire si ma commande n'arrive pas ?**  
R : Attendez le temps estimé, puis ouvrez un litige si nécessaire.

**Q : Puis-je modifier mon adresse de livraison après avoir passé la commande ?**  
R : Non, l'adresse ne peut pas être modifiée après confirmation. Contactez le support si nécessaire.

**Q : Dois-je être présent pour recevoir la commande ?**  
R : Oui, vous devez confirmer la livraison dans l'application pour recevoir vos tokens DONE.

### Questions sur les litiges

**Q : Combien de temps prend la résolution d'un litige ?**  
R : Généralement 24-48 heures. Un administrateur examinera votre cas.

**Q : Puis-je ouvrir plusieurs litiges pour la même commande ?**  
R : Non, un seul litige peut être ouvert par commande.

**Q : Que se passe-t-il si mon litige est accepté ?**  
R : Vous serez remboursé ou recevrez une compensation selon la décision de l'administrateur.

**Q : Puis-je annuler un litige ?**  
R : Contactez le support si vous souhaitez annuler un litige en cours.

### Questions techniques

**Q : Que faire si MetaMask ne se connecte pas ?**  
R : Vérifiez que MetaMask est installé et déverrouillé. Rafraîchissez la page et réessayez.

**Q : Pourquoi ma transaction est-elle en attente ?**  
R : Cela peut prendre quelques secondes à quelques minutes selon la congestion du réseau Polygon.

**Q : Que faire si je perds l'accès à mon wallet ?**  
R : Utilisez votre phrase de récupération pour restaurer votre wallet. Si vous l'avez perdue, vous ne pourrez pas récupérer votre wallet.

**Q : Mes données sont-elles sécurisées ?**  
R : Oui, toutes les transactions sont enregistrées sur la blockchain Polygon, garantissant transparence et sécurité.

---

## 🆘 Support

Si vous rencontrez un problème ou avez une question :

1. **Consultez cette FAQ** : La réponse à votre question s'y trouve peut-être
2. **Vérifiez la section Troubleshooting** : Pour les problèmes techniques courants
3. **Contactez le support** : Via l'email support@donefood.io

---

##  Notes importantes

-  **Sauvegardez votre phrase de récupération MetaMask** : C'est la seule façon de récupérer votre wallet
- 💰 **Vérifiez toujours les montants** avant de confirmer une transaction
-  **Vérifiez votre adresse de livraison** avant de passer la commande
- ⏰ **Confirmez rapidement la livraison** pour recevoir vos tokens DONE
- ⭐ **Laissez des avis** : Cela aide les autres clients et améliore la plateforme

---

**Bon appétit et bon shopping sur DoneFood ! 🍕✨**

