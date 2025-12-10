# Plan de Migration vers Next.js 14

## État actuel
- **Stack**: React 18 + Vite + React Router DOM
- **Services**: api.js, blockchain.js, geolocation.js (⚠️ INTOUCHABLES)

## Objectif
Migrer vers Next.js 14 (App Router) avec:
- ✅ Design system moderne (Glassmorphism, Dark Mode)
- ✅ Animations Framer Motion
- ✅ Structure organisée
- ⛔ Services inchangés (copier tel quel)

## Commandes d'installation

```bash
# Créer le projet Next.js (dans un nouveau dossier ou remplacer)
cd frontend/deliverer
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --yes

# Installer les dépendances UI
pnpm add framer-motion lucide-react clsx tailwind-merge
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu
pnpm add sonner

# Dépendances existantes à garder
pnpm add ethers socket.io-client
pnpm add @react-google-maps/api
pnpm add chart.js react-chartjs-2
pnpm add axios date-fns

# Dev dependencies
pnpm add -D @types/node
```

## Structure cible

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   ├── deliveries/
│   ├── earnings/
│   └── profile/
├── components/
│   ├── ui/                 # Design System
│   ├── wallet/
│   ├── maps/
│   ├── charts/
│   ├── delivery/
│   ├── staking/
│   ├── rating/
│   └── layout/
├── services/               # ⛔ COPIER SANS MODIFICATION
├── hooks/                  # Wrappers UI
├── lib/                    # Utils
├── types/                  # TypeScript types
└── providers/             # Context providers
```

## Phases de migration

### ✅ Phase 1: Foundation
- [x] Créer structure Next.js
- [ ] Copier services (sans modification)
- [ ] Créer design system (Button, Card, Badge)
- [ ] Setup providers

### ✅ Phase 2: Layout & Navigation - TERMINÉE
- [x] Header avec navigation animée
- [x] Mobile bottom nav
- [x] Page transitions
- [x] Loading skeletons

### ✅ Phase 3: Pages principales - TERMINÉE
- [x] Dashboard (/)
- [x] Refonte AvailableOrders (OrdersList + OrderCard)
- [x] Refonte ActiveDelivery (ActiveDeliveryCard)
- [x] Page /deliveries

### ✅ Phase 4: Features secondaires - TERMINÉE
- [x] Page /earnings (avec EarningsChart)
- [x] Page /profile (avec StakingPanel et RatingDisplay)
- [x] RatingDisplay refactorisé (avec RatingChart)
- [x] ConnectWallet modal moderne

### Phase 5: Polish
- [ ] Toasts (Sonner)
- [ ] Micro-interactions
- [ ] PWA manifest
- [ ] Performance audit

