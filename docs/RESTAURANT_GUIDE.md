# Guide Restaurant - DoneFood

Guide complet pour les restaurants utilisant la plateforme DoneFood. Ce guide vous accompagne dans toutes les étapes de gestion de votre restaurant sur la blockchain.

---

## 📋 Table des matières

1. [Introduction](#introduction)
2. [Premiers pas](#premiers-pas)
3. [Inscription et configuration](#inscription-et-configuration)
4. [Gérer votre menu](#gérer-votre-menu)
5. [Traiter les commandes](#traiter-les-commandes)
6. [Consulter vos statistiques](#consulter-vos-statistiques)
7. [Gérer vos revenus](#gérer-vos-revenus)
8. [FAQ](#faq)

---

## 🎯 Introduction

**DoneFood** est une plateforme de livraison de repas décentralisée qui permet aux restaurants de :

- 🍽️ **Gérer leur menu** en ligne avec images IPFS
- 📦 **Recevoir des commandes** en temps réel via Socket.io
- 💰 **Recevoir des paiements** automatiquement (70% du montant)
- 📊 **Suivre leurs statistiques** et performances
- ⚡ **Traiter les commandes** rapidement avec confirmation blockchain

### Avantages pour les restaurants

- ✅ **Paiements sécurisés** : Les fonds sont en escrow jusqu'à livraison
- ✅ **Répartition automatique** : 70% pour vous, 20% livreur, 10% plateforme
- ✅ **Temps réel** : Notifications instantanées des nouvelles commandes
- ✅ **Transparence** : Toutes les transactions sont sur la blockchain
- ✅ **Pas de frais cachés** : Commission fixe de 10%

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
   - **Nom** : Polygon Mainnet
   - **URL RPC** : `https://polygon-rpc.com`
   - **ID de chaîne** : 137
   - **Symbole** : MATIC
   - **URL du bloc explorateur** : `https://polygonscan.com`

### Étape 3 : Accéder au dashboard restaurant

1. Allez sur le site DoneFood Restaurant
2. Cliquez sur **"Connecter le portefeuille"**
3. Sélectionnez **MetaMask**
4. Approuvez la connexion

✅ **Vous êtes maintenant connecté !**

---

## 📝 Inscription et configuration

### Si c'est votre première fois

Lors de votre première connexion, vous serez redirigé vers la page d'inscription.

### Formulaire d'inscription

Remplissez les informations suivantes :

#### Informations du restaurant

- **Nom du restaurant** * (obligatoire)
  - Exemple : "Chez Mario", "La Pizzeria", etc.
  
- **Type de cuisine** * (obligatoire)
  - Exemple : "Italienne", "Française", "Marocaine", "Asiatique", etc.
  
- **Description** (optionnel)
  - Décrivez votre restaurant, vos spécialités, votre histoire
  
- **Email** * (obligatoire)
  - Email de contact pour les notifications
  
- **Téléphone** * (obligatoire)
  - Numéro de téléphone de contact

#### Localisation

- **Adresse** (optionnel)
  - Adresse complète de votre restaurant
  
- **Latitude / Longitude** (optionnel)
  - Coordonnées GPS pour le calcul des distances de livraison
  - Vous pouvez les trouver sur Google Maps

#### Photos du restaurant

- **Ajoutez des photos** (optionnel, max 10)
  - Photos de votre restaurant, de vos plats
  - Format : JPG, PNG
  - Les images seront uploadées sur IPFS (stockage décentralisé)

#### Adresse Wallet

- **Votre adresse wallet** est automatiquement détectée
- C'est cette adresse qui recevra vos paiements

### Soumettre l'inscription

1. Vérifiez que tous les champs obligatoires sont remplis
2. Cliquez sur **"Créer mon restaurant"**
3. Confirmez la transaction dans MetaMask (si nécessaire)
4. Attendez la confirmation

✅ **Votre restaurant est maintenant enregistré !**

Vous serez automatiquement redirigé vers le dashboard.

---

## 🍽️ Gérer votre menu

### Accéder à la gestion du menu

1. Dans le menu de navigation, cliquez sur **"Menu"**
2. Vous verrez votre menu actuel (vide au début)

### Ajouter un nouvel article

1. Cliquez sur **"Ajouter un article"**
2. Remplissez le formulaire :

   - **Nom** * (obligatoire)
     - Exemple : "Pizza Margherita", "Burger Classic"
   
   - **Description** (optionnel)
     - Décrivez l'article, les ingrédients, etc.
   
   - **Prix** * (obligatoire)
     - Prix en POL (Polygon)
     - Exemple : 0.1 POL = environ 0.1 USD
     - Le prix sera converti en EUR pour l'affichage client
   
   - **Catégorie** * (obligatoire)
     - Choisissez parmi : Entrées, Plats, Desserts, Boissons
   
   - **Image** (optionnel mais recommandé)
     - Cliquez sur "Choisir une image"
     - L'image sera uploadée sur IPFS
     - Format recommandé : JPG, PNG
     - Taille recommandée : 800x600px
   
   - **Disponible** (case à cocher)
     - Cochez si l'article est disponible
     - Décochez pour masquer temporairement

3. Cliquez sur **"Ajouter"**
4. L'article apparaît dans votre menu

### Modifier un article

1. Cliquez sur l'article que vous voulez modifier
2. Le formulaire s'ouvre avec les données actuelles
3. Modifiez les champs souhaités
4. Cliquez sur **"Enregistrer les modifications"**

### Désactiver/Activer un article

**Méthode 1 : Via le formulaire**
- Ouvrez l'article en modification
- Décochez/cochez la case "Disponible"
- Enregistrez

**Méthode 2 : Via le bouton rapide**
- Cliquez sur le bouton "Désactiver" / "Activer" sur la carte de l'article

> 💡 **Astuce** : Désactivez temporairement les articles en rupture de stock plutôt que de les supprimer.

### Supprimer un article

1. Ouvrez l'article en modification
2. Cliquez sur **"Supprimer"**
3. Confirmez la suppression

⚠️ **Attention** : La suppression est définitive. L'article ne pourra plus être récupéré.

### Filtrer par catégorie

Utilisez le filtre en haut de la page pour afficher :
- **Tous** : Tous les articles
- **Entrées** : Seulement les entrées
- **Plats** : Seulement les plats
- **Desserts** : Seulement les desserts
- **Boissons** : Seulement les boissons

### Conseils pour un bon menu

- 📸 **Ajoutez des photos** : Les clients commandent plus avec des images
- 📝 **Descriptions détaillées** : Mentionnez les ingrédients, allergènes
- 💰 **Prix compétitifs** : Comparez avec les restaurants similaires
- 🏷️ **Catégories claires** : Organisez bien vos articles
- ✅ **Mettez à jour** : Gardez votre menu à jour avec les disponibilités

---

## 📦 Traiter les commandes

### Recevoir une nouvelle commande

Lorsqu'un client passe une commande :

1. **Notification en temps réel** : Vous recevez une notification sonore et visuelle
2. **La commande apparaît** dans la file d'attente sur le dashboard
3. **Détails affichés** :
   - Numéro de commande
   - Articles commandés avec quantités
   - Montant total
   - Adresse de livraison
   - Informations client
   - Temps écoulé depuis la création

### Voir les détails d'une commande

Cliquez sur une commande dans la file d'attente pour voir :
- **Articles détaillés** : Liste complète avec quantités et prix
- **Adresse de livraison** : Adresse complète du client
- **Informations client** : Adresse wallet du client
- **Statut actuel** : CREATED, PREPARING, IN_DELIVERY, DELIVERED
- **Timer** : Temps écoulé depuis la création

### Confirmer la préparation

Une fois que vous avez commencé à préparer la commande :

1. Cliquez sur **"Confirmer la préparation"** sur la carte de commande
2. Confirmez la transaction dans MetaMask
3. Le statut passe à **"En préparation"**

✅ **La commande est maintenant en préparation !**

> 💡 **Note** : Cette action est enregistrée sur la blockchain et déclenche l'assignation d'un livreur.

### Filtrer les commandes

Sur la page **"Commandes"**, vous pouvez filtrer par :

- **Statut** :
  - Toutes
  - Créées (en attente)
  - En préparation
  - En livraison
  - Livrées
  - Litiges

- **Date** :
  - Aujourd'hui
  - Cette semaine
  - Ce mois
  - Personnalisé (date de début et fin)

### Rechercher une commande

Utilisez la barre de recherche pour trouver une commande par :
- Numéro de commande
- Adresse du client

---

## 📊 Consulter vos statistiques

### Accéder aux statistiques

1. Dans le menu, cliquez sur **"Statistiques"**
2. Vous verrez plusieurs sections :

### Vue d'ensemble (Dashboard)

Sur la page d'accueil, vous verrez des **cartes KPIs** :

- **Commandes en attente** : Nombre de commandes créées non traitées
- **En préparation** : Nombre de commandes en cours de préparation
- **Livrées aujourd'hui** : Nombre de commandes livrées aujourd'hui
- **Revenus du jour** : Montant total gagné aujourd'hui (en POL)

### Statistiques détaillées

#### 1. Graphique des commandes

- **Graphique linéaire** montrant le nombre de commandes dans le temps
- Filtres : Jour / Semaine / Mois
- Comparaison avec les périodes précédentes

#### 2. Plats les plus populaires

- **Graphique en barres** horizontal
- Affiche les articles les plus commandés
- Avec quantités et pourcentages

#### 3. Revenus

- **Graphique linéaire** des revenus dans le temps
- Filtres : Jour / Semaine / Mois
- Revenus on-chain depuis la blockchain

#### 4. Temps moyen de préparation

- Temps moyen entre création et confirmation de préparation
- Aide à optimiser votre efficacité

#### 5. Notes et avis

- **Note moyenne** reçue de vos clients
- **Nombre d'avis** total
- **Derniers commentaires** clients

### Exporter les données

1. Sur la page Statistiques
2. Cliquez sur **"Exporter CSV"**
3. Un fichier CSV sera téléchargé avec toutes vos données

---

## 💰 Gérer vos revenus

### Comprendre la répartition

Lorsqu'une commande est livrée, le paiement est automatiquement réparti :

- **70%** → Restaurant (vous)
- **20%** → Livreur
- **10%** → Plateforme

### Consulter vos revenus

#### Sur le Dashboard

La carte **"Revenus du jour"** affiche :
- Montant gagné aujourd'hui
- En POL (Polygon)

#### Sur la page Statistiques

Le graphique **"Revenus"** montre :
- Revenus quotidiens/hebdomadaires/mensuels
- Tendance dans le temps
- Comparaison avec les périodes précédentes

### Retirer vos fonds

Vos revenus sont automatiquement accumulés dans le contrat `PaymentSplitter`.

#### Consulter votre solde en attente

1. Allez sur la page **"Statistiques"**
2. Dans la section **"Revenus"**, vous verrez :
   - **Solde en attente** : Montant disponible pour retrait
   - **Total retiré** : Montant déjà retiré

#### Effectuer un retrait

1. Vérifiez votre solde en attente
2. Cliquez sur **"Retirer"**
3. Confirmez la transaction dans MetaMask
4. Les fonds seront transférés à votre wallet

✅ **Les fonds sont maintenant dans votre wallet MetaMask !**

> 💡 **Note** : Vous pouvez retirer à tout moment. Il n'y a pas de minimum requis.

### Historique des transactions

Sur la page Statistiques, section **"Revenus"**, vous pouvez voir :

- **Historique des retraits** : Toutes vos transactions de retrait
- **Lien vers Polygonscan** : Pour voir les détails sur la blockchain
- **Date et montant** de chaque transaction

---

## ❓ FAQ

### Questions générales

**Q : Dois-je payer pour m'inscrire ?**  
R : Non, l'inscription est gratuite. Vous ne payez que la commission de 10% sur chaque commande livrée.

**Q : Puis-je avoir plusieurs restaurants avec le même wallet ?**  
R : Actuellement, un wallet = un restaurant. Pour plusieurs restaurants, utilisez des wallets différents.

**Q : Que se passe-t-il si je perds l'accès à mon wallet ?**  
R : Utilisez votre phrase de récupération MetaMask pour restaurer votre wallet. Sans cette phrase, vous ne pourrez pas récupérer l'accès.

**Q : Puis-je modifier mes informations après inscription ?**  
R : Oui, contactez le support pour modifier vos informations de base. Le menu peut être modifié à tout moment depuis le dashboard.

### Questions sur les commandes

**Q : Combien de temps ai-je pour confirmer la préparation ?**  
R : Il n'y a pas de limite de temps, mais il est recommandé de confirmer rapidement pour une meilleure expérience client.

**Q : Puis-je refuser une commande ?**  
R : Actuellement, toutes les commandes doivent être traitées. En cas de problème, contactez le support.

**Q : Que se passe-t-il si je ne confirme pas la préparation ?**  
R : La commande restera en état "Créée" et un livreur ne sera pas assigné. Le client attendra indéfiniment.

**Q : Puis-je voir l'historique de toutes mes commandes ?**  
R : Oui, allez dans "Commandes" pour voir toutes vos commandes avec filtres et recherche.

### Questions sur le menu

**Q : Combien d'articles puis-je avoir dans mon menu ?**  
R : Il n'y a pas de limite. Vous pouvez ajouter autant d'articles que vous voulez.

**Q : Puis-je changer le prix d'un article ?**  
R : Oui, modifiez l'article et changez le prix. Les nouvelles commandes utiliseront le nouveau prix.

**Q : Les images sont-elles stockées sur la blockchain ?**  
R : Non, les images sont stockées sur IPFS (InterPlanetary File System), un système de stockage décentralisé. Seul le hash IPFS est enregistré.

**Q : Puis-je importer mon menu depuis un fichier ?**  
R : Actuellement, vous devez ajouter les articles manuellement. L'import en masse sera disponible dans une future version.

### Questions sur les paiements

**Q : Quand est-ce que je reçois mon paiement ?**  
R : Vous recevez 70% du montant total dès que le client confirme la livraison. Les fonds sont automatiquement ajoutés à votre solde.

**Q : Comment retirer mes fonds ?**  
R : Allez dans "Statistiques" → Section "Revenus" → Cliquez sur "Retirer". Les fonds seront transférés à votre wallet MetaMask.

**Q : Y a-t-il des frais pour retirer ?**  
R : Seulement les frais de transaction blockchain (gaz), qui sont très faibles sur Polygon (généralement < 0.01 POL).

**Q : Puis-je retirer à tout moment ?**  
R : Oui, vous pouvez retirer vos fonds à tout moment. Il n'y a pas de minimum requis.

**Q : Dans quelle crypto-monnaie suis-je payé ?**  
R : Vous êtes payé en POL (Polygon), qui peut être converti en d'autres crypto-monnaies ou en fiat via un exchange.

### Questions sur les statistiques

**Q : Les statistiques sont-elles en temps réel ?**  
R : Oui, les statistiques sont mises à jour en temps réel. Rafraîchissez la page pour voir les dernières données.

**Q : Puis-je exporter mes données ?**  
R : Oui, sur la page Statistiques, cliquez sur "Exporter CSV" pour télécharger toutes vos données.

**Q : Les revenus affichés incluent-ils les retraits ?**  
R : Les revenus affichés sont les revenus bruts (avant retrait). Le solde en attente est le montant disponible pour retrait.

### Questions techniques

**Q : Que faire si MetaMask ne se connecte pas ?**  
R : Vérifiez que MetaMask est installé et déverrouillé. Rafraîchissez la page et réessayez.

**Q : Pourquoi ma transaction est-elle en attente ?**  
R : Cela peut prendre quelques secondes à quelques minutes selon la congestion du réseau Polygon.

**Q : Que faire si je ne reçois pas de notifications de nouvelles commandes ?**  
R : Vérifiez que votre navigateur autorise les notifications. Vérifiez aussi que vous êtes bien connecté au dashboard.

**Q : Puis-je utiliser l'application sur mobile ?**  
R : L'application web est responsive et fonctionne sur mobile, mais MetaMask doit être installé dans un navigateur mobile compatible.

---

## 🆘 Support

Si vous rencontrez un problème ou avez une question :

1. **Consultez cette FAQ** : La réponse à votre question s'y trouve peut-être
2. **Vérifiez la section Troubleshooting** : Pour les problèmes techniques courants
3. **Contactez le support** : Via l'email support@donefood.io

---

## 📝 Notes importantes

- ⚠️ **Sauvegardez votre phrase de récupération MetaMask** : C'est la seule façon de récupérer votre wallet
- 💰 **Vérifiez vos revenus régulièrement** : Retirez vos fonds régulièrement pour sécuriser vos gains
- 📦 **Confirmez rapidement les préparations** : Cela améliore l'expérience client et accélère le processus
- 🍽️ **Mettez à jour votre menu** : Gardez votre menu à jour avec les disponibilités réelles
- ⭐ **Répondez aux avis** : Les avis clients aident à améliorer votre réputation

---

## 🎯 Bonnes pratiques

### Pour optimiser vos revenus

1. **Menu attractif** : Ajoutez des photos de qualité et des descriptions détaillées
2. **Prix compétitifs** : Comparez avec les restaurants similaires
3. **Temps de préparation rapide** : Confirmez rapidement la préparation
4. **Disponibilités à jour** : Désactivez les articles en rupture de stock
5. **Répondez aux avis** : Les bons avis attirent plus de clients

### Pour une meilleure expérience

1. **Notifications activées** : Ne manquez aucune commande
2. **Dashboard ouvert** : Gardez le dashboard ouvert pendant vos heures d'ouverture
3. **Communication** : En cas de problème, contactez rapidement le support
4. **Retraits réguliers** : Retirez vos fonds régulièrement pour sécuriser vos gains

---

**Bonne chance avec votre restaurant sur DoneFood ! 🍕✨**

