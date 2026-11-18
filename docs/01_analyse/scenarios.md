# Scénarios d'utilisation (E2)

Mis à jour le 17/11/2026. Décision : voir `docs/DECISIONS.md` (16/11/2026).

Un scénario par persona (`docs/01_analyse/personas.md`), plus un scénario consacré à l'innovation. Chaque écran de l'application se rattache à au moins un scénario (règle 7.2 de `CLAUDE.md`).

**Données de démonstration.** Les montants en dinars sont des ordres de grandeur plausibles, choisis par le binôme. Ils ne viennent d'aucune source et sont présentés comme des données de démonstration.

## S1 · Amine note sa première dépense

*À la cafétéria, sur son téléphone, entre deux cours.*

1. Il ouvre EcoBudget pour la première fois. Les catégories par défaut sont déjà là, il n'y a rien à configurer.
2. Il ajoute « 250 DA, Repas ». La catégorie proposée correspond, il valide.
3. Un message confirme l'ajout, et le reste à dépenser du mois se met à jour.
4. Il s'aperçoit qu'il a tapé 2 500 DA au lieu de 250. Il corrige la dépense en deux gestes. S'il l'avait supprimée, il aurait pu annuler.

- **Besoins** : B1, B2, B3, B5, B11, B13
- **Critères** : C2 (saisie en peu d'actions), C1 (confirmation visible), C5 (correction de l'erreur), C3 (annuler)
- **Écrans** : Première ouverture ; Accueil ; Ajouter / modifier une dépense

## S2 · Nadia tient le budget des courses

*En début de mois, puis le 20, à la maison.*

1. Elle crée une catégorie « Enfants » et fixe ses budgets du mois, dont 40 000 DA pour les courses.
2. Le 20, elle note des courses à 6 500 DA. Le budget Courses atteint 85 %.
3. L'état du budget passe à l'orange, avec une icône et le texte « Il reste 6 000 DA pour finir le mois ». Elle est prévenue avant de dépasser, sans reproche.
4. Elle ouvre le détail pour voir ses dernières dépenses de courses.

- **Besoins** : B2, B4, B5, B6, B12
- **Critères** : C4 (catégorie personnalisée), C1 (prévenue avant), C7 (couleur + icône + texte, ton neutre), C5 (prévention du dépassement)
- **Écrans** : Réglages (catégories) ; Budgets et détail d'un budget ; Ajouter une dépense ; Accueil

## S3 · Yasmine fait le point le soir

*Sur son ordinateur, au calme.*

1. Quelques mois plus tôt, sur son téléphone, elle a créé un compte et son objectif « Ordinateur portable, 150 000 DA » : un nom, un montant, une date visée.
2. Ce soir, sur son PC, elle se connecte à son compte et retrouve les dépenses notées sur son téléphone.
3. Elle ouvre les graphiques : la répartition du mois par catégorie, puis la comparaison avec le mois dernier. Ses sorties ont augmenté.
4. Elle consulte son objectif. Elle en est à 60 %, et l'application souligne l'étape franchie.
5. Un conseil s'affiche : « En réduisant vos sorties de 2 000 DA par mois, vous atteindriez votre objectif un mois plus tôt. » Elle touche « Pourquoi ? » pour voir le calcul, puis « Compris ».

- **Besoins** : B7, B8, B10
- **Critères** : C7 (graphiques lisibles), C1 (progression et étape valorisée), C3 (le conseil ne modifie rien ; elle le ferme ou le désactive), C8 (consultation sur ordinateur, données retrouvées d'un appareil à l'autre), C2 (création d'objectif en trois champs)
- **Écrans** : Créer un compte ; Première ouverture et Se connecter (sur son PC) ; Graphiques ; Objectifs d'épargne ; Alerte / conseil

## S4 · Amine reçoit une alerte de dépense inhabituelle (innovation)

*Un samedi soir, après l'anniversaire d'un ami.*

1. Il note 4 500 DA en Sorties. D'habitude, une sortie lui coûte environ 1 000 DA.
2. Une alerte apparaît : « Dépense inhabituelle en Sorties ».
3. Il touche « Pourquoi ? » et lit la comparaison en une phrase, qui confronte cette dépense à ses habitudes.
4. C'était un anniversaire : il touche « Compris » et l'alerte se ferme. Le lien « Gérer les alertes » lui montre qu'il peut les désactiver dans les réglages.

- **Besoins** : B9, B10
- **Critères** : C1 (alerte et explication), C7 (phrase compréhensible), C3 (l'alerte ne déclenche aucune action, il la ferme), C4 (alertes désactivables)
- **Écrans** : Ajouter une dépense ; Alerte (Pourquoi ?, Compris, Gérer les alertes) ; Réglages (alertes)
- **Démo** : ce scénario sert de script de démonstration de l'innovation (L2, L4). La règle de calcul est fixée dans `docs/03_conception/innovation.md` §2.1 (décidée le 18/11/2026).

## Écrans qui en découlent (pour les maquettes, tâche 07)

| Écran | Contenu principal | Scénarios |
|---|---|---|
| Première ouverture | Bienvenue, « Noter ma première dépense », catégories prêtes, budget facultatif, « Déjà un compte ? Se connecter » | S1, S3 |
| Accueil | Reste à dépenser, état des budgets, alertes | S1, S2, S4 |
| Ajouter / modifier une dépense | Montant, catégorie proposée, confirmation, annuler | S1, S2, S4 |
| Budgets (et détail d'un budget) | Budget par catégorie, état couleur + icône + texte, dernières dépenses | S2 |
| Graphiques | Répartition par catégorie, évolution d'un mois à l'autre | S3 |
| Objectifs d'épargne | Création (nom, montant, date visée), progression, étapes valorisées | S3 |
| Alerte / conseil | Message, « Pourquoi ? », « Compris », lien vers Réglages (« Gérer les alertes » ou « Gérer les conseils ») | S3, S4 |
| Réglages | Catégories, activation des alertes, compte facultatif (créer un compte, se connecter, message sur l'enregistrement anonyme) | S2, S3, S4 |
| Créer un compte | Prénom (facultatif), e-mail, mot de passe avec règles affichées, erreurs au bon champ ; « ce que vous avez déjà noté est conservé » | S3 |
| Se connecter | E-mail, mot de passe, mot de passe oublié ; message si des dépenses notées sans compte vont être ajoutées au compte | S3 |

## Cas d'utilisation (diagramme UML, en complément des scénarios)

Le sujet demande des scénarios d'utilisation, pas d'UML : le diagramme est un complément, pour donner la vue d'ensemble du périmètre. Un seul acteur : l'utilisateur. Repris dans L1 (diapositive « Vue d'ensemble des cas d'utilisation »).

| Cas d'utilisation | Relation | Scénarios |
|---|---|---|
| Ajouter une dépense | Association avec l'utilisateur | S1, S2, S4 |
| Modifier ou supprimer une dépense | Association | S1 |
| Définir les budgets du mois | Association | S2 |
| Consulter l'état des budgets | Association | S2 |
| Consulter les graphiques | Association | S3 |
| Définir un objectif d'épargne | Association | S3 |
| Suivre ses objectifs d'épargne | Association | S3 |
| Gérer les réglages (catégories, alertes) | Association | S2, S4 |
| Créer un compte ou se connecter (facultatif) | Association | S3 |
| Annuler la dernière action | « extend » de Modifier ou supprimer une dépense | S1 |
| Recevoir une alerte de dépense inhabituelle (innovation) | « extend » de Ajouter une dépense | S4 |
| Voir le « Pourquoi ? » (innovation) | « extend » de Recevoir une alerte | S4 |
| Recevoir un conseil d'épargne (innovation) | « extend » de Suivre ses objectifs d'épargne | S3 |

Chaque cas d'utilisation est illustré par au moins un scénario. « Définir un objectif d'épargne » n'en avait pas : ajouté au début de S3 le 17/11.
