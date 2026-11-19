# H4 Objectifs d'épargne — Plan d'implémentation

> **Pour l'exécutant :** superpowers:executing-plans (inline). TDD (superpowers:test-driven-development) pour `lib/goals.ts` (épargné, pourcentage, étapes, correction, tri, date visée). superpowers:verification-before-completion avant « fait ». Cases à cocher.

**Objectif :** écran Objectifs (F4, S3) : créer, modifier, supprimer un Objectif d'épargne, ajouter de l'épargne, progression avec étapes 25/50/75 %, état Atteint et « Date visée passée », tri par urgence ; « Annuler » après chaque action.

**Architecture :** modèle H0 existant (`goals` : `{ name, target, targetMonth, createdAt }` ; `contributions` : `{ goalId, amount, date, createdAt }`). Montant épargné = somme des versements, jamais stocké. `DataProvider` s'abonne aussi à `goals` et `contributions` (inclus dans `ready`). Logique pure dans `src/lib/goals.ts` ; formulaires sans accès aux données (props), branchés par des pages, comme Dépense et Budget.

**Spec :** `docs/HANDOFF.md` § H4 ; `docs/DECISIONS.md` (18/11 F4 ×2, 19/11 H4) ; maquettes `telephone-06`, `ordinateur-06` (HANDOFF/DECISIONS priment : formulaire à part, étapes 25/50/75, pas de Conseil).

## Contexte
H0–H3 fusionnés dans `main`. H4 sert S3 et prépare H5 (conseil). Branche `h4-objectifs` depuis `main` ; plan copié dans `app/docs/plans/2026-11-19-h4-objectifs.md`.

## Contraintes globales
- Barre et couleurs en bleu vif ; jamais vert/orange/rouge (budgets). Tout état : icône + texte.
- Pourcentage : arrondi vers le bas, au plus 99 % tant que non atteint ; 100 % quand atteint (épargné ≥ visé).
- Date visée au mois près, sans valeur par défaut ; au plus tôt le mois prochain ; en modification, contrôle seulement si la date change.
- Montant à atteindre / ajout d'épargne : `parseAmount` (mêmes messages que Dépense). Date de versement : `validateDate`.
- Montant épargné (modification) : entier ≥ 0 ; le changer crée un versement de correction = différence, daté du jour.
- Messages exacts : « Objectif créé », « Objectif modifié » (+ « · Objectif atteint ! »), « Objectif supprimé », « [X] DA ajoutés à « [nom] » » (+ « · Étape franchie : 50 % ! » ou « · Objectif atteint ! ») — tous avec « Annuler », ton neutre.
- Formulaires plein écran sur téléphone (AppShell `onForm` étendu à `/objectifs/…`).

## Review Focus
1. Mois visé : sélecteurs Mois + Année (pas `<input type="month">`, absent de Firefox) ; un seul des deux choisi → erreur au champ. Test Tâche 3.
2. Montant visé baissé sous l'épargné → l'objectif devient atteint et le message le dit ; remonté → repasse en cours. Test Tâche 1 + E2E.
3. Annuler une suppression rétablit l'objectif **et** ses versements (mêmes ids). E2E Tâche 5.
4. Versement supérieur au reste accepté ; pourcentage plafonné à 100 % à l'affichage. Test Tâche 1.
5. Objectif dont la date est passée mais atteint : « Objectif atteint ! », pas « Date visée passée ». Test Tâche 1.

---

### Tâche 1 : calculs (TDD) — `src/lib/goals.ts`, `src/lib/goals.test.ts`
**Produit :**
- `savedAmount(goalId: string, contributions: Contribution[]): number`
- `goalPercent(saved: number, target: number): number` — `saved ≥ target` → 100 ; sinon `min(99, floor(saved×100/target))`.
- `milestone(percent: number): 25 | 50 | 75 | null` — plus haute étape atteinte sous 100.
- `goalStatus(saved, target, targetMonth, currentMonth): 'reached' | 'late' | 'ongoing'` — atteint prime sur date passée.
- `sortGoals<T extends { goal: Goal; status }>(items): T[]` — en cours (y compris `late`) par `targetMonth` puis `createdAt` ; atteints en bas, même ordre.
- `parseSaved(text): AmountResult` — entier ≥ 0 (« 0 » accepté) ; négatif → « Le montant épargné ne peut pas être négatif, par exemple 0 » ; vide/décimal : messages de `parseAmount`.
- `correction(oldSaved, newSaved): number` (différence ; 0 = pas de versement).
- `nextMonth(today): string` ; `validateTargetMonth(month: string, today: Date, original?: string): string | null` — vide → « Choisissez une date visée » ; < mois prochain → « Choisissez un mois à partir de décembre 2026 » ; égal à `original` → null.
- `monthLabel(month): string` → « juin 2027 ».
- `progressNotice(beforeSaved, afterSaved, target): string | null` — « Objectif atteint ! » au passage à 100 % ; sinon « Étape franchie : 50 % ! » si l'étape monte.
**Tests :** somme des versements (et d'un autre objectif ignoré) ; pourcentage 0, 59,9 → 59, 99,9 → 99, 100, 120 → 100 ; étape à 24, 25, 49, 50, 75, 99, 100 ; correction hausse, baisse, jusqu'à 0, « -1 » refusé ; statut atteint ↔ en cours après correction ou changement du visé ; date passée + atteint → reached ; tri (proches d'abord, égalité par création, atteints en bas) ; mois en cours refusé, mois prochain accepté, date passée inchangée acceptée en modification, vide refusé ; notices 40→60 % « Étape franchie : 50 % ! », 60→70 % null, 90→100 % « Objectif atteint ! ».

### Tâche 2 : données — `DataProvider.tsx`
`useData()` expose aussi `goals: Goal[]`, `contributions: Contribution[]` ; `ready` les attend. Test : étendre `DataProvider.test.tsx` (prêt seulement quand goals et contributions sont arrivés).

### Tâche 3 : formulaires — `src/features/goals/GoalForm.tsx`, `SavingsForm.tsx` (+ tests)
- `GoalForm({ initial?, initialSaved?, today, onSubmit({ name, target, targetMonth, saved? }), onDelete?, onClose })` : Nom, Montant à atteindre, Date visée (sélecteurs Mois/Année ; années de l'année en cours à l'année en cours + 10 au moins, plus l'année de la date existante en modification ; aide « Au plus tôt décembre 2026 »), Montant épargné (modification seulement). Boutons « Créer l'objectif » / « Enregistrer », « Supprimer l'objectif ». Erreurs au champ, double envoi bloqué. Styles de `ExpenseForm.css`.
- `SavingsForm({ goalName, remaining, today, onSubmit({ amount, date }), onClose })` : titre « Ajouter de l'épargne », montant, aide « Il reste X DA pour atteindre l'objectif », date (défaut aujourd'hui, futur refusé), bouton « Ajouter l'épargne ».
**Tests :** nom vide → « Donnez un nom à votre objectif, par exemple Ordinateur portable » ; montant 0 → message Dépense ; mois seul sans année → erreur ; mois en cours refusé ; valeurs valides envoyées une fois ; modification : prérempli, épargné « -5 » refusé, date passée inchangée acceptée ; SavingsForm : aide « Il reste », futur refusé, envoi.

### Tâche 4 : écran et pages — `GoalsPage.tsx`, `GoalCard.tsx`, `goals.css`, routes
- `/objectifs` : « Objectifs », « Votre épargne », « Nouvel objectif » ; vide → « Pas encore d'objectif d'épargne » + « Créer un objectif ». Cartes triées.
- `GoalCard` : icône cible, nom (lien vers modification), « Objectif visé : juin 2027 », « 60 % », barre bleue (`role=progressbar`), « 90 000 DA épargnés sur 150 000 DA », bandeau trophée « Étape franchie : vous avez passé les 50 % ! », bouton « Ajouter de l'épargne » ; atteint : icône + « Objectif atteint ! », pas de bouton ; en retard : icône horloge + « Date visée passée » + lien « Modifier la date ».
- Pages `NewGoal`, `EditGoal` (correction = versement daté du jour ; suppression : `ConfirmDialog` « Supprimer l'objectif « [nom] » ? Son suivi ([X] DA épargnés) sera effacé. » ; Annuler rétablit objectif + versements), `AddSavings`. Routes `/objectifs/nouveau`, `/objectifs/:id`, `/objectifs/:id/epargne` ; `navigate(..., { replace: true })` ; `dismiss()` à l'ouverture des formulaires ; AppShell `onForm` inclut `pathname.startsWith('/objectifs/')`.
**Tests (`GoalsPage.test.tsx`, `GoalCard.test.tsx`) :** écran vide ; ordre des cartes ; carte 60 % avec bandeau 50 % ; atteinte sans bouton d'ajout, avec icône + texte ; en retard avec « Date visée passée » et lien ; aucune classe `status-*` de budget.

### Tâche 5 : vérification et livraison
- `typecheck`, `test`, `test:rules`, `build` verts.
- E2E puppeteer (local puis en ligne) : écran vide → créer « Ordinateur portable » 150 000 DA, mois +7 → « Objectif créé » ; « Annuler » → l'objectif disparaît ; le recréer ; ajouter 10 000 puis « Annuler » → le pourcentage revient à 0 % ; ajouter 90 000 → « Étape franchie : 50 % ! », carte 60 % + bandeau ; 2ᵉ objectif plus proche → en haut ; modifier épargné 150 000 → « Objectif modifié · Objectif atteint ! », carte en bas sans bouton ; « Annuler » → 60 % ; supprimer → confirmation → « Annuler » → 60 % (versements rétablis) ; mois en cours refusé au champ. Captures téléphone et ordinateur. H1–H3 repassent.
- Déploiement Hosting ; HANDOFF § H4 statut + écarts ; revue indépendante ; correctifs importants RED→GREEN.
- Notion tâche 11 en fin de session (avec ton accord).
