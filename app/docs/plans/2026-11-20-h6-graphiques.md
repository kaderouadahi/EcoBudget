# H6 Graphiques — Plan d'implémentation

> **Pour l'exécutant :** superpowers:executing-plans (inline). TDD (superpowers:test-driven-development) pour `lib/charts.ts` (totaux par mois et par catégorie, fenêtre de 6 mois au plus, passage d'année, pourcentages et « moins de 1 % », ordre de la légende, chiffres du jeu de démo). superpowers:verification-before-completion avant « fait », avec le parcours navigateur de la spec en local et en ligne. Cases à cocher.

**Objectif :** écran Graphiques (F3, S3) : une page, deux cartes — « Répartition du mois » (anneau d'un mois au choix, légende en texte) et « D'un mois à l'autre » (barres sur les mêmes mois, menu Toutes les dépenses / une catégorie). Statistiques seulement : ni phrase de synthèse, ni ampoule, ni vert/orange/rouge.

**Architecture :** calculs purs dans `src/lib/charts.ts` (réutilise `spentByCategory` de `lib/budget.ts`, `addMonths`/`monthOf`/`currentMonth` de `lib/month.ts`, `monthLabel` de `lib/goals.ts`). Écran `src/features/charts/ChartsPage.tsx` : Recharts (`PieChart`/`Pie` en anneau segmenté, `BarChart`/`Bar` arrondies avec `LabelList`), animations et `accessibilityLayer` coupés, pas de `Tooltip` (toucher ne fait rien). Les SVG sont `aria-hidden` ; l'information est portée par du texte : légende visible et tableau des barres pour lecteur d'écran (testable dans jsdom, où Recharts ne dessine pas). Mois choisi et menu sont un état local : remis à zéro à chaque ouverture de l'écran.

**Spec :** `docs/HANDOFF.md` § H6 ; `docs/DECISIONS.md` (20/11 : H6, Recharts ; 18/11 : mois du 1er au dernier jour) ; maquettes `telephone-05`, `ordinateur-05` (écarts listés dans la spec) ; jeu de démo `lib/demo.ts` (H8).

## Contexte
H0–H5 et H8 fusionnés dans `main`. Rendu le 21/11 à 23 h 59. En démo, la hausse des sorties se voit dans Graphiques avant la carte Conseil. Branche `h6-graphiques` depuis `main` ; plan copié dans `app/docs/plans/2026-11-20-h6-graphiques.md`.

## Contraintes globales (valeurs de la spec)
- Mois couverts : M et jusqu'à 5 avant (6 au plus), pas avant le mois de la plus ancienne dépense ; aucune dépense → [M]. Mois sans dépense = 0 DA.
- Sélecteur « ‹ Novembre 2026 › » : M à chaque ouverture ; flèches grisées et inactives aux bouts ; `aria-label` « Mois précédent » / « Mois suivant » ; ≥ 44 px ; « en cours » à côté du nom quand le mois choisi est M.
- Anneau : une part par catégorie avec dépense ; au centre « 29 000 » et « DA dépensés ». Légende sur une colonne : montant décroissant, puis ordre des catégories ; pastille, nom, « 22 500 DA », pourcentage arrondi ; « moins de 1 % » ; catégorie seule = 100 %.
- Couleurs : nuances de la charte (`#1E2B4F`, `#3460E0`, `#8FA8F5`, `#5B6B8C`, `#C9D5FA`, `#A9B4C8`), répétées au besoin ; jamais vert/orange/rouge.
- Mois sans dépense : « Aucune dépense ce mois-ci » + bouton « Ajouter une dépense » (M) ; « Aucune dépense en août 2026 » sans bouton (mois passé).
- Barres : menu « Toutes les dépenses », puis catégories dans leur ordre ; revient à « Toutes les dépenses » à chaque ouverture ; ne change que les barres. Montant écrit au-dessus (« 44 000 »), « 0 » sans barre, « Montants en DA » sous le titre de la carte. Barre du mois choisi en bleu nuit, autres en bleu clair. « en cours » sous la barre de M. Étiquettes « Janv. », « Févr. », « Mars », « Avr. », « Mai », « Juin », « Juil. », « Août », « Sept. », « Oct. », « Nov. », « Déc. ».
- Téléphone : cartes l'une sous l'autre ; ordinateur : côte à côte. Mêmes cartes et libellés.

## Ajustements validés par Kader
1. Sélecteur : « Novembre 2026 » avec majuscule (`formatMonthTitle`) ; « Aucune dépense en août 2026 » en minuscule (`monthLabel`).
2. Menu des barres : libellé « Barres pour » caché (lecteurs d'écran seulement, classe `sr-only`), pas de libellé visible.
3. Rien n'est affiché tant que les données ne sont pas prêtes (`if (!ready) return null`).
4. Dépense d'une catégorie inconnue comptée dans « Autres » aussi dans `monthlyTotals` quand le menu est sur Autres (signature `monthlyTotals(expenses, categories, months, categoryId)`), avec test.
5. Écarts constatés : « Montants en DA » toujours affiché (téléphone et ordinateur), montants sans « DA » au-dessus des barres.

## Review Focus
1. Recharts dans jsdom (pas de taille, pas de `ResizeObserver`) : les tests de page lisent la légende et le tableau des barres, pas le SVG ; `ResizeObserver` simulé dans `test-setup.ts` si nécessaire. Tâche 3.
2. Données qui changent pendant que l'écran est ouvert (ajout, chargement `/demo`) : si le mois choisi n'est plus couvert, revenir à M. Test Tâche 3.
3. Dépense d'une catégorie supprimée (H7) : comptée dans « Autres » au lieu d'une ligne sans nom. Test Tâche 1.
4. Passage d'année : novembre → avril, décembre → janvier. Test Tâche 1.
5. Arrondis qui ne totalisent pas 100 % : chaque part arrondie séparément (spec). Test Tâche 1 (jeu de démo : 65 + 15 + 13 + 7).

---

### Tâche 1 : calculs (TDD) — `src/lib/charts.ts`, `src/lib/charts.test.ts`
**Produit :**
- `coveredMonths(expenses: Expense[], today: Date): string[]` (croissant)
- `monthlyTotals(expenses: Expense[], months: string[], categoryId: string | null): { month: string; total: number }[]`
- `breakdown(expenses: Expense[], categories: Category[], month: string): { total: number; rows: { categoryId: string; name: string; amount: number; percent: string }[] }`
- `percentLabel(amount: number, total: number): string` → « 65 % », « moins de 1 % », « 100 % »
- `shortMonth(month: string): string` → « Nov. » ; `formatNumber(n: number): string` (dans `lib/format.ts`, milliers sans « DA »)
- `CHART_COLORS: string[]`
**Tests :** totaux toutes dépenses et par catégorie ; mois sans dépense = 0 ; 6 mois au plus ; pas avant le mois de la plus ancienne dépense ; aucune dépense → [M] ; passage d'année (M = avril 2027 depuis novembre 2026 ; janvier) ; dépenses du 1er et du dernier jour dans le bon mois ; pourcentages arrondis, « moins de 1 % », catégorie seule = 100 % ; ordre de la légende (montant décroissant puis ordre des catégories) ; catégorie inconnue → « Autres » ; aucune couleur verte/orange/rouge dans `CHART_COLORS` ; **jeu de démo** (`buildDemoData`) pour chaque jour du 1er au 31 janvier 2027 et du 1er au 28 février 2027 : 5 mois M-4…M ; toutes dépenses M-4…M-1 = 44 000, 43 800, 44 200, 46 000 ; Sorties = 5 000, 4 800, 5 200, 7 000 et 0 en M (4 500 après ajout) ; répartition de M-1 : 46 000, Courses 30 000 « 65 % », Sorties 7 000 « 15 % », Repas 6 000 « 13 % », Transport 3 000 « 7 % », dans cet ordre.

### Tâche 2 : écran — `src/features/charts/ChartsPage.tsx`, `charts.css`, `App.tsx`
- Route `/graphiques` → `ChartsPage` (remplace le `Placeholder`).
- Carte « Répartition du mois » : sélecteur, anneau Recharts (`innerRadius`, `paddingAngle`, `cornerRadius`, `isAnimationActive={false}`) avec total au centre en HTML superposé, légende `<ul>` ; état vide.
- Carte « D'un mois à l'autre » : « Montants en DA », `<select>` « Barres pour », barres Recharts (`radius`, `Cell` bleu nuit / bleu clair, `LabelList` en `formatNumber`, axe X personnalisé : mois abrégé + « en cours » sous M) ; tableau caché `sr-only` (mois, montant).
- Grille : une colonne, deux à partir de 1100 px (comme l'Accueil).

### Tâche 3 : tests de l'écran — `src/features/charts/ChartsPage.test.tsx`
Avec le jeu de démo (repo simulé) : mois en cours affiché avec « en cours », « Mois suivant » désactivé ; « Mois précédent » × 4 → M-4, puis désactivé ; à M-1 la légende donne Courses 30 000 DA 65 %, Sorties 7 000 DA 15 %, Repas 6 000 DA 13 %, Transport 3 000 DA 7 % et « 46 000 » au centre ; menu sur Sorties → tableau des barres 5 000, 4 800, 5 200, 7 000, 0 ; le menu ne change pas la légende ; nouveau rendu → mois en cours et « Toutes les dépenses » ; mois passé vide → « Aucune dépense en … » sans bouton ; aucune dépense → « Aucune dépense ce mois-ci » + lien vers `/depense/nouvelle` ; pas de classe `status-*` ni d'icône ampoule ; données qui changent et mois choisi plus couvert → retour à M.

### Tâche 4 : vérification et livraison
- `typecheck`, `test`, `test:rules`, `build` verts (bundle précaché sous la limite de 5 Mo).
- E2E puppeteer, local puis en ligne (parcours de la spec) : `/demo` → Graphiques → anneau sur M, « › » grisée → « ‹ » jusqu'à M-4 puis grisée, barre du mois choisi en bleu nuit à chaque pas (couleur lue dans le SVG) → menu Sorties → M-1 = 7 000 → ajout de 4 500 DA en Sorties → retour Graphiques : menu « Toutes les dépenses », anneau sur M → menu Sorties → barre de M = 4 500. Captures téléphone et ordinateur. H1–H5 et H8 repassent.
- Déploiement Hosting ; HANDOFF § H6 statut + écarts ; revue indépendante ; correctifs importants RED→GREEN.
- Notion tâche 11 en fin de session (avec ton accord).
