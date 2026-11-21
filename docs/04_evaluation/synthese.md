# Synthèse de l'évaluation (L3)

Tests sur l'application finale, 21/11/2026. Les retours viennent des trois testeurs du protocole (P1, P2, P3 : voir `protocole.md`). Ils sont reformulés par l'équipe à partir de la liste transmise par Kader ; aucune citation n'est inventée.

Gravité non notée pendant les tests, estimée par l'équipe, avec la même échelle que pour les tests sur le MVP (`resultats/tests-conception.md`) : 1 = gêne de lecture ou de cohérence, 2 = hésitation ou erreur rattrapable, 3 = tâche bloquée.

## Problèmes identifiés et améliorations

| N° | Testeur | Problème | Critère(s) | Gravité estimée | Amélioration proposée | Statut |
|---|---|---|---|---|---|---|
| 1 | P1 | Difficile de trouver où ajouter ou modifier une catégorie : la gestion est dans Réglages, ce qui n'est pas assez clair | C1, C2 | 2 | Lien « Gérer les catégories » sous la grille des catégories du formulaire Dépense et dans Budgets, vers Réglages › Catégories | Correction avant le rendu (spec H11) |
| 2 | P1 | Pas de logo dans l'application | C6, C7 | 1 | Logo à gauche du titre « EcoBudget » et icône de l'application (décision du 21/11) | Correction avant le rendu (spec H12) |
| 3 | P1 | Pas de mode sombre | C4 | 1 | Mode sombre | Proposée, après le rendu |
| 4 | P2 | Une icône est imposée à toute nouvelle catégorie, même quand aucune ne correspond | C4, C7 | 1 | Icône neutre « Étiquette », présélectionnée pour une nouvelle catégorie | Correction avant le rendu (spec H13) |
| 5 | P3 | Pas d'historique des alertes et des conseils : une fois fermés, on ne peut plus les relire | C1, C3 | 2 | Historique prévu le 18/11 « si le besoin est confirmé » (une bulle sur l'Accueil qui ouvre une page unique) | Proposée, après le rendu (besoin confirmé) |
| 6 | P3 | Créer un compte ou se connecter n'est pas assez clair ni mis en valeur, surtout quand l'appareil contient déjà des dépenses | C1, C5 | 2 | Réglages › Compte : « Vos N dépenses seront conservées si vous créez un compte » ; Se connecter : lien « Les garder : créer un compte » sous l'avertissement | Correction avant le rendu (spec H14) |
| 7 | P3 | Aucun moyen de voir les dépenses au-delà des 4 dernières, ni celles des mois passés, donc de corriger une dépense plus ancienne | C2, C5, C6 | 3 | Lien « Tout voir » sous « Dernières dépenses » : liste du mois avec les mêmes flèches de mois que Graphiques ; toucher une dépense ouvre le formulaire de modification | Correction avant le rendu (spec H10) |

## Ce que disent ces retours

- **Le guidage reste le point à renforcer (C1)** : deux retours sur sept (n° 1 et 6) portent sur des fonctions qui existent déjà mais se trouvent mal.
- **Une seule tâche bloquée** (n° 7) : retrouver une dépense ancienne. C'est la première correction.
- **L'innovation** : aucun retour ne porte sur la compréhension de l'alerte ou du conseil. Le seul retour qui la concerne demande de pouvoir les relire (n° 5), ce qui confirme le besoin d'historique prévu le 18/11.
- **Après les tests sur le MVP** : aucun retour ne revient sur les 14 points corrigés à l'issue des deux premiers tours (`resultats/tests-conception.md`).
- **Ce qui attend** : le mode sombre (n° 3) change toutes les couleurs, dont le code vert, orange et rouge des budgets ; l'historique (n° 5) demande de nouvelles données. Les faire le soir du rendu mettrait la démonstration en danger.

## Pour le diaporama (partie 10)

- Une diapositive « Ce que les tests finaux ont révélé » : les 7 problèmes, avec testeur, critère et gravité estimée (tableau ci-dessus, en version courte).
- Une diapositive « Corrigé avant le rendu, proposé pour la suite » : n° 7, 1, 2, 4 et 6 corrigés ; n° 3 et 5 proposés, avec la raison.
- Dans les notes de l'orateur : gravité estimée après coup par l'équipe ; aucun retour ne revient sur les corrections faites après les tests sur le MVP.
- À corriger au passage : diapositive 20 (« accepter, ignorer ou désactiver » → « fermer avec « Compris », désactiver »).
