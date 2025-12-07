# script Documentation


Ce dossier contient les scripts permettant :

- de déployer l’ensemble du protocole Done Delivery
- de configurer les rôles nécessaires
- de créer des données de test sur un réseau réel

Scripts concernés :

deploy-amoy.js
setup-roles.js
seed-data-amoy.js

yaml

---

## 1. deploy-amoy.js

Objectif : déployer l’ensemble des contrats sur Polygon Amoy.

Ce script :

1. Déploie DoneToken  
2. Déploie DoneStaking  
3. Déploie DonePaymentSplitter  
4. Déploie DoneOrderManager  
5. Sauvegarde toutes les adresses dans `contracts-amoy.json`

Idéal pour un déploiement complet ou pour re-déployer en cas de mise à jour.

---

##  2. setup-roles.js

 Objectif : configurer les rôles nécessaires au fonctionnement du protocole.

Ce script :

- attribue RESTAURANT_ROLE, DELIVERER_ROLE, PLATFORM_ROLE, ARBITRATOR_ROLE  
- donne MINTER_ROLE à DoneOrderManager  
- configure PLATFORM_ROLE dans DoneStaking  

Utile après un nouveau déploiement.

---

##  3. seed-data-amoy.js

 Objectif : injecter des données de test réelles sur un réseau (Amoy).

Ce script :

- effectue le staking d’un livreur  
- crée trois commandes (#1, #2, #3)  
- exécute un workflow complet pour la commande #3  
  → mint DONE  
  → split paiement  
- affiche les résultats dans la console  

Très utile pour :

- tester l'intégration front-end  
- vérifier la cohérence des contrats sur un vrai réseau  
- démonstrations ou environnements staging

---

