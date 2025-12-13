# 🚀 Guide de démarrage rapide - Tous les services

Ce guide explique comment lancer tous les services (backend + 4 frontends) en une seule commande.

## 📋 Prérequis

Assurez-vous d'avoir installé toutes les dépendances :
```bash
npm install
npm run install:all
```

## 🎯 Solution 1 : Utiliser `concurrently` (Recommandé)

Cette solution lance tous les services dans **un seul terminal** avec des couleurs différentes pour chaque service.

### Installation de `concurrently` (une seule fois)
```bash
npm install
```

### Utilisation
```bash
npm run dev:all
```

**Avantages :**
- ✅ Un seul terminal
- ✅ Sorties colorées pour chaque service
- ✅ Facile à arrêter (Ctrl+C arrête tout)
- ✅ Multiplateforme (Windows, Mac, Linux)

---

## 🪟 Solution 2 : Scripts Windows (Fenêtres séparées)

Ces scripts ouvrent **5 fenêtres séparées**, une pour chaque service.

### Option A : Script PowerShell (`.ps1`)
```powershell
.\start-all.ps1
```

### Option B : Script Batch (`.bat`)
```cmd
start-all.bat
```

**Avantages :**
- ✅ Chaque service dans sa propre fenêtre
- ✅ Facile de voir les logs de chaque service séparément
- ✅ Peut fermer un service individuellement

**Inconvénients :**
- ⚠️ 5 fenêtres à gérer
- ⚠️ Windows uniquement

---

## 📝 Services lancés

1. **BACKEND** - API Backend (port par défaut)
2. **ADMIN** - Interface Admin
3. **CLIENT** - Interface Client
4. **RESTAURANT** - Interface Restaurant
5. **DELIVERER** - Interface Livreur

---

## 🛑 Arrêter les services

### Avec `concurrently` (Solution 1)
Appuyez sur `Ctrl+C` dans le terminal

### Avec les scripts Windows (Solution 2)
Fermez les fenêtres correspondantes ou appuyez sur `Ctrl+C` dans chaque fenêtre

---

## 💡 Recommandation

Pour le développement quotidien, utilisez **`npm run dev:all`** (Solution 1) car c'est plus pratique et vous voyez toutes les sorties dans un seul endroit.

