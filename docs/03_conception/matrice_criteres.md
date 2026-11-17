# Matrice de traçabilité — critères de Bastien et Scapin

Une ligne = un élément concret de l'application. Les 8 critères du sujet (§3), sans sous-critères (voir `docs/QUESTIONS.md`).
La colonne Besoins renvoie à `docs/01_analyse/besoins.md`, la colonne Scénarios à `docs/01_analyse/scenarios.md`.
Les pistes sont des propositions à valider.

| Critère | Besoins | Scénarios | Pistes pour EcoBudget | Écran(s) | Preuve | Statut |
|---|---|---|---|---|---|---|
| C1 Guidage | B5, B6, B8, B9, B11 | S1, S2, S3, S4 | Exemples dans les champs ; regroupement par mois et catégorie ; confirmation visible après ajout | Accueil ; Ajouter une dépense ; Budgets ; Objectifs ; Alerte | docs/02_maquettes/ecrans/ : telephone-01, 02, 03, 07, 10 (action principale, reste à dépenser, confirmation, explication, règles affichées) |  |
| C2 Charge de travail | B1, B7, B11 | S1, S3 | Ajout d'une dépense en très peu d'actions ; catégorie suggérée ; accueil limité à l'essentiel | Ajouter une dépense ; Accueil ; Graphiques | docs/02_maquettes/ecrans/ : telephone-01, 03, 05, 06 (rien à configurer, valeurs par défaut, phrase de synthèse, 3 champs) |  |
| C3 Contrôle explicite | B3, B10 | S1, S3, S4 | Rien n'est appliqué sans accord ; Annuler ; innovation désactivable | Ajouter / modifier une dépense ; Alerte ; Réglages | docs/02_maquettes/ecrans/ : telephone-02 (Annuler), 06, 07, 09, 11 |  |
| C4 Adaptabilité | B2, B4, B10 | S2, S3, S4 | Mode simple / avancé ; catégories et seuils personnalisables | Réglages ; Budgets ; Alerte | docs/02_maquettes/ecrans/ : telephone-04, 07, 08 |  |
| C5 Gestion des erreurs | B3, B6 | S1, S2 | Saisies invalides bloquées au bon champ ; messages qui disent quoi faire ; modification possible | Ajouter / modifier une dépense ; Budgets | docs/02_maquettes/ecrans/ : telephone-03, 09, 10, 11 |  |
| C6 Homogénéité | — (transversal, CLAUDE.md §8) | Tous | Mêmes composants, positions et libellés partout, sur mobile et ordinateur | Tous les écrans | docs/02_maquettes/ecrans/ : comparer telephone-* et ordinateur-* (même charte, mêmes libellés) |  |
| C7 Signifiance | B2, B5, B7, B9, B12 | S2, S3, S4 | Icônes de catégories compréhensibles ; couleur + texte ; vocabulaire non bancaire | Accueil ; Budgets ; Graphiques ; Alerte | docs/02_maquettes/ecrans/ : telephone-02, 04, 05, 07, 08 |  |
| C8 Compatibilité | B1, B4, B12, B13 | S1, S2, S3 | Formats de date et de montant locaux ; mois budgétaire réglable ; usage en déplacement | Ajouter une dépense ; Budgets ; Graphiques | docs/02_maquettes/ecrans/ : telephone-01, 03 (DA, formats locaux) ; ordinateur-* (même usage sur PC) |  |
