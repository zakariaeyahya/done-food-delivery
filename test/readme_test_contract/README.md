# Tests Documentation

Ce dossier contient tous les tests :

- unitaires (unit tests)
- d’intégration (end-to-end)
- oracles (GPS, météo, prix)

Tests inclus :

DoneOrderManager.test.js
DonePaymentSplitter.test.js
DoneStaking.test.js
DoneToken.test.js
Integration.test.js
oracles.test.js

yaml
Copier le code

---

##  1. Tests unitaires

### DoneOrderManager.test.js
- création de commande  
- transition d’état (prepare → pickup → delivery)  
- événements émis  

### DonePaymentSplitter.test.js
- répartition 70/20/10  
- retrait des fonds  
- validation des erreurs  

### DoneStaking.test.js
- staking minimal  
- slashing  
- unstake  

### DoneToken.test.js
- mint sécurisé  
- burn  
- calculateReward  

---

## 2. Test d’intégration (Integration.test.js)

Simule un cycle complet :

1. création commande  
2. préparation  
3. assignation livreur  
4. livraison  
5. split paiement  
6. mint DONE  

Valide l’interaction **entre tous les contrats**.

---

## 3. Tests Oracles (oracles.test.js)

### Price Oracle  
- conversion USD ↔ MATIC (MockV3Aggregator)

### Weather Oracle  
- ajustement frais selon conditions
- météo extrême

### GPS Oracle  
- vérification localisation client/livreur

---

## Résumé des validations couvertes

| Module | Objectif |
|--------|----------|
| OrderManager | flux commande complet |
| PaymentSplitter | sécurité & logique paiement |
| Staking | sûreté du livreur |
| Token | récompenses clients |
| Oracles | données externes (GPS, météo, prix) |
| Integration | cohésion totale du protocole |

---

