# Maquettes et prototype interactif (E3)

Mis à jour le 17/11/2026. Décisions : voir `docs/DECISIONS.md` (17/11/2026).

## Ce qui se trouve ici

- **`prototype/index.html`** : le prototype interactif (E3). Une seule page autonome qui contient tous les écrans, reliés entre eux. Elle s'ouvre dans n'importe quel navigateur, sans compte ni connexion internet (la police est incluse). Sur ordinateur, l'écran s'affiche dans un cadre de téléphone, avec un bouton pour passer à la version ordinateur ; sur un téléphone, en plein écran. Elle sera mise en ligne sur Firebase Hosting pour les tests.
- **`ecrans/`** : les images des 22 écrans (11 sur téléphone, 11 sur ordinateur), pour le diaporama et la matrice des critères.
- **Source des maquettes** : le canevas Claude Design « EcoBudget — Maquettes ». Toute modification se fait là, puis le prototype et les images sont régénérés.

Les montants sont des **données de démonstration** (voir `docs/01_analyse/scenarios.md`).

**À compléter (décisions du 18/11/2026)** : écran Objectifs (bouton « Ajouter de l'épargne », formulaire avec l'aide « Il reste X DA », état Atteint) ; écrans Alerte et Objectifs (« Compris » au lieu des anciens boutons) ; Réglages (section « Alertes et conseils », deux interrupteurs ; retirer « Mois budgétaire » et l'interrupteur « Alerte de budget »).

**Écart (décision du 20/11/2026)** : écran Graphiques sans onglets ni phrase de synthèse (fond orange clair, ampoule) ; sélecteur de mois, menu de catégorie et montants au-dessus des barres à ajouter (spec H6 de `docs/HANDOFF.md`).

**Écart (décisions du 20/11/2026)** : écran Réglages sans « Alerte de budget », « Mois budgétaire » ni « Données de démonstration » ; section « Alertes et conseils » avec deux interrupteurs et leur texte ; corbeilles grises, rouge seulement sur le bouton « Supprimer » de la confirmation (spec H7 de `docs/HANDOFF.md`).

**Écart (décisions du 21/11/2026)** : Réglages › Compte avec deux états (« Sans compte pour l'instant » avec « Créer un compte » / « Se connecter », ou « Connecté » avec l'adresse et « Se déconnecter », bouton absent des maquettes) ; `telephone-10` / `ordinateur-09` : règles du mot de passe en liste de conditions qui passent au vert avec une coche pendant la saisie ; `telephone-11` / `ordinateur-10` : l'encadré « seront ajoutées à votre compte » (beige) est remplacé par l'avertissement « ne seront pas ajoutées » (bleu) ; aucun lien souligné dans l'application (spec H9 de `docs/HANDOFF.md`).

## Parcourir les 4 scénarios dans le prototype

| Scénario | Parcours au clic |
|---|---|
| S1 · Amine note sa première dépense | Première ouverture → « Noter ma première dépense » → Nouvelle dépense → « Enregistrer la dépense » → Accueil avec « Dépense ajoutée · Annuler » |
| S2 · Nadia tient le budget des courses | Accueil → budget Courses (orange) → Budgets et détail ; Réglages → icône poubelle d'une catégorie → confirmation de suppression |
| S3 · Yasmine fait le point le soir | Bouton « Ordinateur » → Première ouverture → « Se connecter » → Accueil → Graphiques → Objectifs (conseil : « Pourquoi ? » puis « Compris » ; décision du 18/11, le prototype affiche encore « Accepter / Ignorer », à mettre à jour) ; création de compte depuis Réglages > « Créer un compte » |
| S4 · Amine reçoit une alerte inhabituelle | Accueil → carte « Dépense inhabituelle » → « Pourquoi ? » → Alerte → « Compris » ou « Gérer les alertes » (décision du 18/11 ; le prototype affiche encore « Ce n'est pas inhabituel » et « Ignorer », à mettre à jour) |

## Écrans, scénarios, besoins et critères

| Écran | Images | Scénarios | Besoins | Critères illustrés |
|---|---|---|---|---|
| Première ouverture | telephone-01, ordinateur-01 | S1, S3 | B1, B11, B13 | C1 une action principale mise en avant ; C2 rien à configurer ; C8 catégories prêtes, montants en DA |
| Accueil | telephone-02, ordinateur-02 | S1, S2, S4 | B5, B6, B9, B12 | C1 reste à dépenser en tête ; C7 état du budget en couleur + icône + texte ; C2 l'essentiel sur un écran |
| Nouvelle dépense | telephone-03, ordinateur-03 | S1, S2, S4 | B1, B2, B3 | C2 montant, catégorie proposée, date du jour par défaut ; C5 aide sous le champ ; C1 et C3 confirmation avec « Annuler » |
| Budgets et détail | telephone-04, ordinateur-04 | S2 | B4, B5, B6 | C1 et C7 état du budget ; C4 budget modifiable, reconduit chaque mois |
| Graphiques | telephone-05, ordinateur-05 | S3 | B7 | C7 légende en texte avec montants et pourcentages ; C2 une seule page, montants écrits sur les barres |
| Objectifs d'épargne | telephone-06, ordinateur-06 | S3 | B8, B10 | C1 étape franchie valorisée ; C3 conseil qui ne modifie rien, « Compris » ; C2 objectif créé en trois champs |
| Alerte et « Pourquoi ? » | telephone-07, ordinateur-07 | S4 | B9, B10 | C1 et C7 explication en une phrase ; C3 l'alerte informe sans rien déclencher, « Compris » la ferme ; C4 alertes désactivables |
| Réglages et compte | telephone-08, ordinateur-08 | S2, S3, S4 | B2, B10, B11, B13 | C4 catégories, alertes, mois budgétaire, prénom ; C7 message clair sur l'enregistrement anonyme |
| Supprimer une catégorie | telephone-09, ordinateur-11 | S2 | B2, B3 | C5 confirmation qui dit ce qui va se passer ; C3 annulation possible ; aucune dépense perdue |
| Créer un compte | telephone-10, ordinateur-09 | S3 | B11 | C5 erreur signalée au bon champ avec la correction ; C1 règles du mot de passe affichées à l'avance |
| Se connecter | telephone-11, ordinateur-10 | S3 | B13 | C3 et C5 message avant validation : les dépenses notées sans compte sont ajoutées, rien n'est perdu |

C6 (homogénéité) vaut pour tous les écrans : mêmes composants, mêmes libellés, même charte ; seule la disposition change entre téléphone et ordinateur.
