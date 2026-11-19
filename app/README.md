# EcoBudget — application

React + Vite + TypeScript, PWA, Firebase (Authentication anonyme, Firestore, Hosting). Voir `../docs/DECISIONS.md`.

## Démarrer
```bash
cp .env.example .env.local   # puis remplir : firebase apps:sdkconfig WEB <appId>
npm install
npm run dev
```

## Tester
```bash
npm test             # logique (formats, mois, calculs) et composants
npm run test:rules   # règles Firestore « chacun ses données » à l'émulateur (Java requis)
npm run typecheck
```

## Déployer (Firebase Hosting, projet ecobudget-3b3a4)
```bash
npm run build
firebase deploy --only hosting,firestore:rules
```

Plans d'implémentation : `docs/plans/`.
