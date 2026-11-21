# Handoff Cowork → Claude Code

## Modèle de spec
### [ID] Écran ou fonctionnalité — statut : à faire | en cours | fait
- Scénario source :
- Fonctionnalité du sujet : F1 | F2 | F3 | F4 | INNOV
- Contenu et interactions :
- Critères visés et comment :
- Critères d'acceptation :
- Maquette :
- Écarts constatés (rempli par Claude Code) :

## Ordre de priorité (décidé le 18/11/2026, H8 avancée le 20/11/2026, H10 à H14 ajoutées le 21/11/2026 après les tests finaux)
Si le temps manque, les specs du bas sont les premières à tomber. Sources : `docs/DECISIONS.md` (prime en cas d'écart avec une maquette), `docs/01_analyse/scenarios.md`, `docs/03_conception/innovation.md`, `docs/02_maquettes/`.

| Ordre | Spec | Fonctionnalité |
|---|---|---|
| 1 | H0 Socle | Transversal |
| 2 | H1 Dépenses | F1 |
| 3 | H2 Budgets | F2 |
| 4 | H3 Alerte de dépense inhabituelle | INNOV |
| 5 | H4 Objectifs d'épargne | F4 |
| 6 | H5 Conseil d'épargne | INNOV |
| 7 | H8 Données de démo | Démo (L2, L4) |
| 8 | H6 Graphiques | F3 |
| 9 | H7 Réglages | Transversal |
| 10 | H9 Compte e-mail facultatif | Transversal (version réduite, décidée le 21/11) |
| 11 | H10 Liste des dépenses du mois | F1 (retour n° 7 des tests finaux) |
| 12 | H11 Lien « Gérer les catégories » | Transversal (retour n° 1) |
| 13 | H12 Logo et icône de l'application | Transversal (retour n° 2) |
| 14 | H13 Icône neutre de catégorie | Transversal (retour n° 4) |
| 15 | H14 Compte plus visible | Transversal (retour n° 6) |

Les choix marqués ✱ ont été proposés par Cowork et validés par le binôme le 19/11/2026.

---

### H0 Socle — statut : fait (fusionné dans main le 19/11, PR n°1)
- **Scénario source** : tous (S1 à S4).
- **Fonctionnalité du sujet** : transversal (sert F1 à F4 et INNOV).
- **Contenu et interactions** :
  - **Stack** (DECISIONS.md, 17/11) : React + Vite + TypeScript, application web installable (PWA), tests Vitest ; Firebase Authentication, Firestore, Hosting. Bibliothèque de graphiques au choix de Claude Code : noter le choix dans `docs/HANDOFF.md` (Écarts constatés), le binôme l'ajoutera à DECISIONS.md.
  - **Compte et données** : à la première ouverture, un compte anonyme est créé sans aucun écran. Données dans Firestore, avec copie hors connexion (une dépense notée sans réseau est enregistrée et synchronisée ensuite). Règles de sécurité « chacun ses données », testées à l'émulateur.
  - **Données à stocker** (par utilisateur) : catégories (nom, icône, ordre, « Autres » non supprimable) ; dépenses (montant entier en DA, catégorie, date, note facultative) ; budgets (catégorie, montant mensuel, reconduit chaque mois) ; objectifs d'épargne (nom, montant visé, mois visé) ; versements (objectif, montant, date) ; réglages (prénom facultatif, alertes activées, conseils activés) ; état de l'innovation (conseil masqué jusqu'à quel mois). Le modèle exact est au choix de Claude Code.
  - **Mois** : toujours du 1er au dernier jour du mois (DECISIONS.md, 18/11).
  - **Navigation** (DECISIONS.md, 17/11) : sur téléphone, barre en bas Accueil · Budgets · [+] · Graphiques · Objectifs, Réglages par une icône en haut à droite. Sur ordinateur, barre latérale bleu nuit sur toute la hauteur (EcoBudget, bouton « Ajouter une dépense », Accueil, Budgets, Graphiques, Objectifs ; Réglages tout en bas), contenu dans un panneau clair. Créer un compte et Se connecter s'affichent sans barre latérale. Seule la disposition change entre les deux.
  - **Charte** : bleu nuit #1E2B4F, bleu vif #3460E0, police Plus Jakarta Sans ; vert, orange et rouge réservés aux états de budget ; cibles tactiles d'au moins 44 px.
  - **Formats** : montants entiers en DA avec séparateur de milliers (« 34 000 DA »), dates en français (« Aujourd'hui », « samedi 14 novembre »).
  - **Message de confirmation commun** : affiché après chaque action, en bas de l'écran, avec un bouton « Annuler » quand l'action est réversible. Réutilisé par toutes les specs.
- **Critères visés et comment** : C6 (mêmes composants, libellés et charte sur téléphone et ordinateur) ; C8 (installable, hors connexion, DA, formats locaux) ; C1 (retour visible après chaque action) ; C2 (aucune inscription avant d'utiliser).
- **Critères d'acceptation** :
  - L'application s'installe depuis le navigateur (HTTPS, Firebase Hosting) et s'ouvre sans écran d'inscription.
  - Une dépense ajoutée hors connexion est visible tout de suite et retrouvée après retour du réseau.
  - Les tests des règles de sécurité passent à l'émulateur : un utilisateur ne lit ni n'écrit les données d'un autre.
  - Les mêmes entrées de navigation et les mêmes libellés existent sur téléphone et sur ordinateur.
  - Montants et dates s'affichent aux formats ci-dessus partout.
- **Maquette** : `docs/02_maquettes/` (tous les écrans) et `prototype/index.html`. Écarts connus : voir la note « À compléter » du README des maquettes ; DECISIONS.md prime.
- **Écarts constatés (rempli par Claude Code)** :
  - L'ID réel du projet Firebase est `ecobudget-3b3a4` (nom affiché « EcoBudget »), pas « ecobudget » comme dans DECISIONS.md (19/11). Application en ligne : https://ecobudget-3b3a4.web.app
  - Bibliothèque de graphiques choisie : **Recharts** (à ajouter à DECISIONS.md).
  - Format des dates : « Hier » ajouté entre « Aujourd'hui » et le jour de la semaine ; de 2 à 6 jours, jour seul avec majuscule (« Samedi », comme les maquettes) ; au-delà, « samedi 14 novembre » (« 1er » pour le premier jour du mois).
  - Le hors connexion suppose une première ouverture en ligne (création du compte anonyme). Sans réseau à la toute première ouverture, un message l'explique et l'application reprend seule au retour du réseau.
  - Critère « dépense ajoutée hors connexion » : l'infrastructure est en place (cache Firestore persistant, écritures non bloquantes) ; il sera vérifié avec le vrai formulaire à la fin de H1.
  - Plan d'implémentation : `app/docs/plans/2026-11-19-h0-socle.md`.

---

### H1 Dépenses — statut : fait (fusionné dans main le 19/11, PR n°1)
- **Scénario source** : S1 (Amine note sa première dépense) ; aussi S2 et S4.
- **Fonctionnalité du sujet** : F1.
- **Contenu et interactions** :
  - **Première ouverture** (une seule fois) : « Bienvenue sur EcoBudget », « Noter ma première dépense » (ouvre le formulaire), la liste des catégories prêtes, « Fixer un budget » (facultatif, ouvre Budgets), « Déjà un compte ? Se connecter ».
  - **Catégories par défaut**, chacune avec une icône : Repas, Courses, Transport, Sorties, Santé, Logement, Études, Autres. « Autres » ne peut pas être supprimée.
  - **Formulaire « Nouvelle dépense »**, ouvert par [+] ou « Ajouter une dépense » depuis n'importe quel écran :
    - Montant : entier supérieur à 0, en DA ; aide « En dinars, sans centimes. Exemple : 250 ».
    - Catégorie : ✱ proposée = celle de la dernière dépense (Repas pour la toute première), affichée « Proposée : Repas », modifiable.
    - Date : aujourd'hui par défaut, modifiable ; ✱ une date dans le futur est refusée.
    - Note : facultative.
    - Bouton « Enregistrer la dépense ».
  - **Erreurs** signalées au champ concerné, avec la façon de corriger (ex. « Saisissez un montant en dinars, par exemple 250 » ; « La date ne peut pas être dans le futur »).
  - **Après l'enregistrement** : retour à l'Accueil, message « Dépense ajoutée : 250 DA, Repas » ; si la dépense fait passer le budget de sa catégorie à 80 % ou plus, le message ajoute l'état (« Courses : il reste 6 000 DA » ou « Courses : dépassé de 900 DA », avec couleur et icône). Le reste à dépenser se met à jour. Le contrôle de l'alerte de dépense inhabituelle (H3) se fait à ce moment.
  - **Modifier** : toucher une dépense dans une liste ouvre le même formulaire prérempli (« Enregistrer », « Supprimer la dépense »).
  - **Supprimer** : confirmation (« Supprimer cette dépense de 2 500 DA ? ») **et** message « Dépense supprimée · Annuler » (CLAUDE.md §8).
  - **Dernières dépenses** sur l'Accueil : ✱ les 4 plus récentes ; titre = la note, sinon le nom de la catégorie ; sous-titre « Catégorie · jour » ; montant « −250 DA ».
- **Critères visés et comment** : C2 (montant, catégorie proposée, date du jour : une dépense en quelques gestes) ; C1 (confirmation visible, état du budget annoncé) ; C5 (erreurs au bon champ, correction en deux gestes) ; C3 (annuler une suppression) ; C8 (DA, sans centimes, espèces).
- **Critères d'acceptation** :
  - À la première ouverture, une dépense peut être enregistrée sans rien configurer.
  - Montant vide, nul, négatif ou décimal : enregistrement bloqué, message au champ Montant.
  - La catégorie proposée est celle de la dernière dépense.
  - Une dépense modifiée met à jour l'Accueil, le budget et les graphiques.
  - Une suppression demande confirmation et peut être annulée depuis le message.
  - Une dépense qui fait passer un budget à 80 % ou plus affiche l'état dans le message de confirmation.
- **Maquette** : `telephone-01`, `telephone-02`, `telephone-03` (et `ordinateur-01` à `03`). Écart : le message de confirmation doit inclure l'état du budget quand il atteint 80 % (décision du 18/11).
- **Écarts constatés (rempli par Claude Code)** :
  - Vérifié dans un navigateur piloté, en local et en ligne : première ouverture, erreur au champ Montant, ajout, **ajout hors connexion visible tout de suite puis retrouvé après retour du réseau** (critère H0), confirmation de suppression puis « Annuler », catégorie proposée = dernière dépense.
  - « Annuler » est aussi proposé après un ajout et une modification, pas seulement après une suppression (comme le prototype : « Dépense ajoutée · Annuler »).
  - Le message de confirmation reste neutre (bleu nuit) ; il ne prend l'orange ou le rouge, avec icône, que pour l'état d'un budget (vert, orange, rouge réservés aux budgets).
  - L'état du budget s'affiche à chaque dépense qui laisse la catégorie à 80 % ou plus, pas seulement au franchissement du seuil. Calcul testé ; vérification à l'écran avec H2 (pas d'écran Budgets avant).
  - Sur téléphone, le formulaire s'affiche en plein écran, sans barre du bas (comme `telephone-03`) ; le message de l'action précédente se ferme à son ouverture pour ne pas masquer « Enregistrer la dépense ».
  - Les milliers sont séparés par une espace insécable normale : l'espace fine était presque invisible dans la police (« 1200 DA »).
  - Le contrôle de l'alerte de dépense inhabituelle (H3) n'est pas encore branché.
  - Plan : `app/docs/plans/2026-11-19-h1-depenses.md`.

---

### H2 Budgets — statut : fait (fusionné dans main le 19/11, PR n°1)
- **Scénario source** : S2 (Nadia tient le budget des courses) ; aussi S1 et S3.
- **Fonctionnalité du sujet** : F2.
- **Contenu et interactions** :
  - **Budget par catégorie**, facultatif : montant mensuel entier supérieur à 0, reconduit chaque mois, modifiable à tout moment (« Budget reconduit chaque mois. Vous pouvez le changer à tout moment. »). « Fixer un budget pour une catégorie » depuis la liste.
  - **État d'un budget** (dépenses du mois ÷ budget), toujours couleur + icône + texte, sans reproche :
    - moins de 80 % : vert, « Dans le budget » ;
    - de 80 % à 100 % inclus : orange, « Il reste X DA » ;
    - plus de 100 % : rouge, « Dépassé de X DA ».
  - **Reste à dépenser** = somme des budgets fixés − dépenses du mois de ces catégories ; sous-titre « sur X DA de budgets · N jours restants ».
    - ✱ Reste négatif : « Budgets dépassés de X DA », en rouge avec icône.
    - ✱ Aucun budget fixé : « Dépensé ce mois : X DA » et une invitation « Fixer un budget ».
  - **Hors budget** : les catégories sans budget ont leurs dépenses du mois listées en « Hors budget : Santé 1 800 DA ».
  - **Accueil** : « Bonjour [prénom] » (ou « Bonjour » sans prénom), mois en cours, reste à dépenser, carte d'alerte (H3) s'il y en a une, « Vos budgets » avec « Tout voir », Hors budget, Dernières dépenses (H1).
  - **Écran Budgets** : liste des budgets avec montant, pourcentage et état ; **détail** d'un budget : montant, état, « Modifier », dernières dépenses de la catégorie.
  - ✱ **Retirer un budget** : bouton « Retirer le budget » dans Modifier ; la catégorie repasse en Hors budget ; confirmation et message « Budget retiré · Annuler ».
- **Critères visés et comment** : C1 (reste à dépenser en tête, prévenu dès 80 %) ; C7 (couleur + icône + texte, jamais la couleur seule) ; C4 (budget facultatif, modifiable, reconduit) ; C5 (prévention du dépassement) ; C2 (l'essentiel sur l'Accueil).
- **Critères d'acceptation** :
  - Tests Vitest (CLAUDE.md §9) : état à 79 %, 80 %, 100 % et 101 % ; reste à dépenser avec et sans catégories hors budget ; reste négatif ; aucun budget.
  - Un budget fixé en novembre existe encore en décembre, avec le même montant.
  - Les dépenses d'une catégorie sans budget n'entrent pas dans le reste à dépenser et apparaissent en Hors budget.
  - Aucun état n'est signalé par la couleur seule.
- **Maquette** : `telephone-02`, `telephone-04` (et `ordinateur-02`, `ordinateur-04`). Écarts : les choix ✱ ci-dessus ne sont pas dessinés.
- **Écarts constatés (rempli par Claude Code)** :
  - Tests Vitest demandés : états à 79, 80, 100 et 101 % ; reste à dépenser avec et sans hors budget ; reste négatif ; aucun budget ; reconduction novembre → décembre ; dépenses d'un autre mois exclues.
  - Vérifié dans un navigateur piloté, en local et en ligne : fixer un budget, message « Dépense ajoutée : 8 500 DA, Courses · Courses : il reste 1 500 DA » en orange avec icône (critère H1), reste à dépenser sur l'Accueil, détail, modification jusqu'au dépassement (« Dépassé de 500 DA », « Budgets dépassés de 500 DA »), retrait avec confirmation puis « Annuler ».
  - Écrans : `/budgets` (liste), `/budgets/:catégorie` (détail), `/budgets/fixer` et `/budgets/:catégorie/modifier` (formulaire, plein écran sur téléphone comme le formulaire Dépense). Montant du budget : mêmes règles et messages que le montant d'une dépense.
  - « Fixer un budget » sur l'Accueil sans budget mène directement au formulaire ; sur l'écran de première ouverture, il mène à l'écran Budgets (comme la maquette).
  - Quand les budgets sont dépassés, le chiffre principal de l'Accueil s'affiche sur fond rouge clair avec icône et texte (« Budgets dépassés de X DA »), pas sur le fond bleu nuit.
  - Pas de carte d'alerte (H3) ni de prénom (H7) pour l'instant : l'Accueil affiche « Bonjour » et une icône de profil.
  - Pourcentage affiché arrondi par défaut, et au moins 101 % dès qu'un budget est dépassé : le chiffre est toujours d'accord avec la couleur (jamais « 80 % » en vert ni « 100 % » en rouge).
  - Pourcentage affiché dans la liste de l'écran Budgets (demandé par la spec) ; les cartes de l'Accueil restent sans pourcentage, comme la maquette.
  - Chaque ligne « Hors budget » porte l'icône de sa catégorie.
  - Un budget fixé depuis l'écran de première ouverture fait passer l'Accueil en mode normal (sinon le budget n'y serait pas visible).
  - Plan : `app/docs/plans/2026-11-19-h2-budgets.md`.

---

### H3 Alerte de dépense inhabituelle — statut : fait (fusionné dans main le 19/11, PR n°2)
- **Scénario source** : S4 (Amine reçoit une alerte de dépense inhabituelle) ; script de démo dans `docs/03_conception/innovation.md` §5.3.
- **Fonctionnalité du sujet** : INNOV (détection de dépenses inhabituelles).
- **Contenu et interactions** :
  - **Règle** : `innovation.md` §2.1 (DECISIONS.md, 18/11), à appliquer telle quelle.
    - ✱ Contrôle **seulement à l'ajout d'une dépense** (formulaire H1), jamais à la modification, et seulement si les alertes sont activées (activées par défaut tant que H7 n'existe pas).
    - ✱ **Historique** : les autres dépenses de la même catégorie datées du même jour ou d'avant ; les fenêtres de 8 semaines et de 6 mois se comptent à partir de la date de la dépense, pas du jour de saisie.
    - Au moins 5 dépenses dans les 8 semaines : on les prend toutes ; sinon les 5 dernières, si la plus ancienne a moins de 6 mois ; sinon pas d'alerte.
    - **Inhabituelle** si le montant est strictement supérieur à 3 × la médiane **et** au moins égal à la médiane + 1 000 DA.
    - Le calcul se fait sur l'appareil : il fonctionne aussi hors connexion.
  - ✱ **Carte d'alerte sur l'Accueil**, entre le reste à dépenser et « Vos budgets » : cloche, titre « Dépense inhabituelle en [Catégorie] », sous-titre « [montant] · [jour], nettement plus que d'habitude », boutons « Pourquoi ? » et « Compris ». ✱ En bleu vif (contour et cloche), jamais en vert, orange ou rouge (réservés aux budgets).
  - **Panneau Alerte**, ouvert par « Pourquoi ? » (monte du bas sur téléphone, comme `ordinateur-07` sur ordinateur) : titre, « 4 500 DA · Samedi » (format de date de H0), phrase « Pourquoi ? », bouton « Compris », lien « Gérer les alertes » vers Réglages, section « Alertes et conseils » (H7 ; d'ici là, l'écran Réglages actuel). La croix ferme le panneau, la carte reste.
  - **Phrase « Pourquoi ? »** (`innovation.md` §2.2, mot pour mot) : « D'habitude, une dépense en [catégorie] est d'environ [médiane] DA. Celle-ci est [rapport] fois plus élevée. Calcul fait sur vos [N] dépenses en [catégorie] depuis le [date de la plus ancienne]. »
    - Médiane arrondie à la centaine ; rapport = montant ÷ médiane non arrondie, une décimale avec virgule (« 4,5 ») ; date « 21 septembre » (« 1er » pour le premier jour du mois).
    - ✱ Phrase calculée au moment de l'ajout et gardée telle quelle.
  - **« Compris »** (sur la carte ou dans le panneau) ferme l'alerte pour de bon ; la disparition de la carte est le retour visible. Pas d'« Annuler » (rien n'est détruit).
  - ✱ **Une seule carte** : elle reste jusqu'à « Compris », même après fermeture de l'application et sur un autre appareil du même compte (état gardé dans Firestore). ✱ Une nouvelle alerte remplace l'ancienne.
  - ✱ **Lien avec la dépense** : la carte ne s'affiche que si la dépense signalée existe encore avec le même montant, la même catégorie et la même date. Modifiée ou supprimée → la carte disparaît ; rétablie par « Annuler » → la carte revient ; « Annuler » après l'ajout → la carte disparaît.
  - La dépense signalée compte ensuite dans l'historique comme les autres. Le message de confirmation de H1 est inchangé.
  - Hors périmètre : historique des alertes, marque « Inhabituelle » sur la dépense (prévus après les tests L3).
- **Critères visés et comment** : C1 (alerte visible sur l'Accueil, phrase avec les chiffres et la période du calcul) ; C2 (rien à décider, un seul bouton, explication à un geste) ; C3 (l'alerte ne modifie rien, l'utilisateur la ferme ou la désactive) ; C4 (désactivable, habitude propre à chaque utilisateur) ; C5 (peu de fausses alertes, carte jamais en décalage avec la dépense) ; C6 (même modèle de phrase pour toutes les catégories) ; C7 (langage courant, cloche et texte, pas l'orange des budgets).
- **Critères d'acceptation** :
  - Tests Vitest de la règle (CLAUDE.md §9) : moins de 5 dépenses → pas d'alerte ; 5 ou plus en 8 semaines → toutes prises, sinon les 5 dernières ; plus ancienne des 5 à plus de 6 mois → pas d'alerte ; exactement 3 × la médiane → pas d'alerte ; café 50 → 200 DA → pas d'alerte ; S4 4 500 contre 1 000 → alerte ; médiane sur un nombre pair de dépenses ; dépense saisie avec une date passée ; arrondis, N et date dans la phrase.
  - Avec le jeu de données de `innovation.md` §5.2 (en test ; son chargement dans l'application relève de H8), 4 500 DA en Sorties donnent « environ 1 000 DA » et « 4,5 fois ».
  - Modifier une dépense ne crée jamais d'alerte.
  - La carte reste après un rechargement ; disparaît avec « Compris », et quand la dépense est modifiée ou supprimée ; revient avec « Annuler ».
  - Une deuxième alerte remplace la première.
  - Alertes désactivées → aucun contrôle (testé sur le réglage ; l'interrupteur arrive en H7).
- **Maquette** : `telephone-02` (carte), `telephone-07` et `ordinateur-07` (panneau). Écarts (DECISIONS.md prime) : « C'est normal », « Ce n'est pas inhabituel » et « Ignorer pour cette fois » remplacés par « Compris » ; lien « Gérer les alertes » à ajouter ; phrase « par semaine » remplacée par celle de §2.2 ; orange remplacé par le bleu vif.
- **Écarts constatés (rempli par Claude Code)** :
  - Tests Vitest de la règle et de la phrase : tous les cas demandés, plus le jeu de `innovation.md` §5.2 vérifié pour une dépense de 4 500 DA en Sorties le 1er, le 10, le 19 et le 28 du mois (« environ 1 000 DA », « 4,5 fois » à chaque fois) ; « Modifier ne crée jamais d'alerte » et « alertes désactivées → aucun contrôle » testés.
  - Vérifié dans un navigateur piloté, en local et en ligne (13 étapes) : 5 dépenses Sorties à 1 000 DA puis 4 500 DA → carte ; « Pourquoi ? » → phrase exacte ; croix → la carte reste ; rechargement → la carte reste ; « Compris » → disparue, et pas de retour après rechargement ; dépense modifiée → disparue, « Annuler » → revenue ; nouvelle alerte → remplace l'ancienne ; « Annuler » de l'ajout → disparue ; ordinateur (panneau centré).
  - Précisions de la règle : fenêtre de 8 semaines = 56 jours avant la date de la dépense, bornes incluses ; « moins de 6 mois » = plus ancienne dépense strictement après la même date 6 mois plus tôt, bornée au dernier jour du mois (31 août → 28 février).
  - Phrase : si la médiane arrondie à la centaine donnerait « 0 DA » (médiane sous 50 DA), elle est affichée à l'unité ; l'année est ajoutée à la date de départ si elle diffère de celle de la dépense (« depuis le 24 décembre 2025 »).
  - « Gérer les alertes » mène à l'écran Réglages actuel (provisoire) en attendant la section « Alertes et conseils » de H7.
  - Pour la démo : le jeu de §5.2 n'est pas chargé tant que H8 n'existe pas ; il faut au moins 5 dépenses en Sorties avant d'ajouter les 4 500 DA.
  - Constaté en test automatique : la liste des dépenses se met à jour 20 à 60 ms après un enregistrement. Deux dépenses enregistrées à moins de 60 ms d'intervalle (impossible à la main) pourraient manquer une alerte ; pas de correctif.
  - Plan : `app/docs/plans/2026-11-19-h3-alerte.md`.

---

### H4 Objectifs d'épargne — statut : fait (fusionné dans main le 19/11, PR n°3)
- **Scénario source** : S3 (Yasmine fait le point le soir, étapes 1 et 4).
- **Fonctionnalité du sujet** : F4.
- **Contenu et interactions** :
  - **Données** (H0) : objectif = nom, montant visé, mois visé ; versements = objectif, montant, date. **Montant épargné = somme des versements.** Le modèle exact est au choix de Claude Code.
  - **Écran Objectifs** : titre « Objectifs », sous-titre « Votre épargne », bouton « Nouvel objectif ». ✱ Écran vide : « Pas encore d'objectif d'épargne » et bouton « Créer un objectif ».
  - **Carte d'un objectif** : icône cible, nom, « Objectif visé : juin 2027 », pourcentage, barre en bleu vif (jamais vert, orange ou rouge, réservés aux budgets), « 90 000 DA épargnés sur 150 000 DA », bouton « Ajouter de l'épargne ». ✱ Toucher la carte ouvre « Modifier l'objectif ». Pourcentage arrondi vers le bas : jamais « 100 % » tant que l'objectif n'est pas atteint (comme la règle des pourcentages de H2).
  - ✱ **Étapes** à 25, 50 et 75 % : la carte affiche « Étape franchie : vous avez passé les [50] % ! » (trophée) pour la plus haute étape atteinte sous 100 %. Le bandeau suit le pourcentage, il n'est pas stocké à part.
  - **Objectif atteint** (100 % ou plus, DECISIONS.md 18/11) : icône et texte « Objectif atteint ! », bouton d'ajout masqué, carte en bas de la liste, plus de conseil (H5).
  - ✱ **Date visée passée** sans que l'objectif soit atteint : texte neutre avec icône, « Date visée passée », et lien « Modifier la date ».
  - ✱ **Tri** : objectifs en cours par mois visé, le plus proche en haut, puis par date de création ; objectifs atteints en bas, dans le même ordre.
  - ✱ **Formulaire « Nouvel objectif » / « Modifier l'objectif »**, plein écran sur téléphone comme le formulaire Dépense :
    - **Nom** : obligatoire ; erreur « Donnez un nom à votre objectif, par exemple Ordinateur portable ».
    - **Montant à atteindre** : mêmes règles et messages que le montant d'une dépense.
    - **Date visée** : mois et année ; ✱ pas de date par défaut ; aide « Au plus tôt [mois prochain] » ; ✱ un mois antérieur au mois prochain est refusé (« Choisissez un mois à partir de [décembre 2026] ») ; ✱ en modification, la règle ne s'applique que si la date est changée.
    - **Montant épargné** (en modification seulement) : prérempli, entier supérieur ou égal à 0 ; ✱ le changer enregistre un versement de correction égal à la différence, daté du jour ; ✱ jamais sous 0.
    - Boutons « Créer l'objectif » / « Enregistrer », et « Supprimer l'objectif » en modification.
    - ✱ Messages « Objectif créé · Annuler » et « Objectif modifié · Annuler » ; « Annuler » remet l'état d'avant, versement de correction compris.
    - ✱ L'état suit les changements : repasse « en cours » sous 100 %, devient « atteint » à 100 % ou plus ; le message le dit (« Objectif modifié · Objectif atteint ! »).
  - ✱ **Supprimer un objectif** : confirmation « Supprimer l'objectif « [nom] » ? Son suivi ([X] DA épargnés) sera effacé. », puis message « Objectif supprimé · Annuler », qui rétablit l'objectif et ses versements.
  - **Ajouter de l'épargne** (DECISIONS.md 18/11), même forme de formulaire : montant obligatoire, entier supérieur à 0 ; ✱ date du jour par défaut, date dans le futur refusée (mêmes règles et messages qu'une dépense) ; aide « Il reste [X] DA pour atteindre l'objectif » ; montant supérieur au reste accepté ; message « [X] DA ajoutés à « [objectif] » · Annuler » ; ✱ si une étape est franchie, le message ajoute « Étape franchie : 50 % ! », et « Objectif atteint ! » à 100 %.
  - ✱ Versements enregistrés mais pas affichés en liste.
  - Hors périmètre : carte Conseil (H5), liste des versements, rappel d'épargne.
- **Critères visés et comment** : C1 (progression, étape franchie, aide « Il reste X DA ») ; C2 (objectif en trois champs, tri par urgence) ; C3 (suppression avec confirmation et « Annuler », « Annuler » après chaque action) ; C5 (date visée contrôlée, montant épargné jamais négatif, correction possible) ; C6 (mêmes formulaires, règles et messages que Dépense et Budget) ; C7 (Atteint et date passée avec icône et texte, barre bleue sans couleur de budget) ; C8 (saisie manuelle adaptée aux espèces).
- **Critères d'acceptation** :
  - Tests Vitest (CLAUDE.md §9) : montant épargné = somme des versements ; pourcentage arrondi vers le bas, 100 % seulement si atteint ; étape à 24, 25, 49, 50, 75, 99 et 100 % ; correction à la hausse, à la baisse, jusqu'à 0, refus sous 0 ; passage atteint ↔ en cours après correction ou changement du montant visé ; tri ; date visée (mois en cours refusé, mois prochain accepté, date passée inchangée acceptée en modification).
  - Un objectif se crée avec ses trois champs seulement ; l'épargne existante s'ajoute par un premier versement.
  - Chaque action affiche son message, et « Annuler » rétablit l'état d'avant.
  - Aucun état signalé par la couleur seule.
- **Maquette** : `telephone-06`, `ordinateur-06`. Écarts (DECISIONS.md prime) : formulaire en bas de l'écran remplacé par « Nouvel objectif » et un formulaire à part ; étape « 60 % » remplacée par 25, 50 et 75 % ; bouton « Ajouter de l'épargne », état Atteint et « Date visée passée » non dessinés ; carte Conseil relevant de H5.
- **Écarts constatés (rempli par Claude Code)** :
  - Tests Vitest demandés : épargné = somme des versements ; pourcentage arrondi vers le bas (59,9 → 59, 99,9 → 99, 100 seulement atteint, plafonné à 100 au-delà) ; étapes à 24, 25, 49, 50, 75, 99, 100 % ; correction à la hausse, à la baisse, jusqu'à 0, « -1 » refusé ; atteint ↔ en cours ; tri ; date visée (mois en cours refusé, mois prochain accepté, date passée inchangée acceptée en modification).
  - Vérifié dans un navigateur piloté, en local et en ligne (14 étapes) : écran vide ; mois en cours refusé au champ ; création puis « Annuler » (objectif disparu) ; ajout de 10 000 DA puis « Annuler » (retour à 0 %) ; ajout de 90 000 DA → « Étape franchie : 50 % ! », carte à 60 % avec bandeau ; objectif plus proche en haut ; montant épargné corrigé à 150 000 → « Objectif modifié · Objectif atteint ! », carte en bas sans bouton d'ajout, « Annuler » → 60 % ; suppression avec confirmation puis « Annuler » → objectif et versements rétablis ; ordinateur en deux colonnes.
  - Date visée : deux menus, Mois et Année (de l'année en cours à +10, plus l'année déjà choisie en modification), plutôt qu'un champ « mois » que Firefox n'affiche pas.
  - Les messages nomment l'objectif : « Objectif créé : Ordinateur portable », « Objectif supprimé : … ». Retour sous 100 % après modification : « Objectif modifié · Objectif de nouveau en cours » (la spec ne donne que l'exemple « Objectif atteint ! »).
  - Le formulaire « Modifier l'objectif » explique sous le montant épargné : « Pour corriger une erreur. Pour une nouvelle épargne, utilisez « Ajouter de l'épargne ». »
  - L'aide « Il reste X DA pour atteindre l'objectif » est suivie de « En dinars, sans centimes. Exemple : 250 » ; elle disparaît quand l'objectif est déjà atteint.
  - Sur la carte, « Objectif atteint ! » et le bandeau d'étape sont en bleu clair avec icône ; pas de couleur d'état de budget.
  - Mois ou année choisi seul : l'erreur dit ce qui manque (« Choisissez aussi l'année » / « Choisissez aussi le mois »).
  - Écran vide : le bouton « Nouvel objectif » de l'en-tête est masqué, « Créer un objectif » est juste en dessous.
  - Pour H5 : les objectifs dont la date visée est passée sont triés avec les objectifs en cours ; le conseil devra les exclure explicitement (statut « en cours » seulement), et un objectif visé pour le mois en cours laisse 0 mois restant.
  - Plan : `app/docs/plans/2026-11-19-h4-objectifs.md`.

---

### H5 Conseil d'épargne — statut : fait (fusionné dans main le 20/11, PR n°4)
- **Scénario source** : S3 (Yasmine fait le point le soir, étape 5) ; script de démo dans `docs/03_conception/innovation.md` §5.3, étape 5.
- **Fonctionnalité du sujet** : INNOV (recommandations).
- **Contenu et interactions** :
  - **Règle** : `innovation.md` §2.4 (DECISIONS.md, 18/11), avec ces précisions :
    - ✱ **Calcul à chaque ouverture de l'écran Objectifs**, sur le dernier mois complet (M-1), si les conseils sont activés (`adviceEnabled`, activés par défaut ; interrupteur en H7).
    - ✱ **Objectif visé** : parmi les objectifs en cours, celui dont le mois visé est le plus proche (à égalité, le plus ancien créé). « En cours » ici = non atteint, date visée non passée, et mois visé postérieur au mois en cours.
    - ✱ **Historique suffisant** : au moins une dépense, toutes catégories confondues, datée du mois M-4 ou avant ; sinon pas de conseil.
    - **Catégorie visée** : plus forte hausse entre le total de M-1 et l'habitude (médiane des totaux de M-2, M-3 et M-4). ✱ Un mois sans dépense compte pour 0 DA. ✱ Santé, Logement **et Autres** sont exclues (reconnues à leur identifiant, pas à leur nom). À égalité, la première dans l'ordre des catégories.
    - **Réduction** = la hausse arrondie à 500 DA en dessous ; si elle vaut 0, pas de conseil.
    - **Mois restants** n = mois visé − mois en cours ; **reste** = montant visé − épargné ; **rythme prévu** = reste ÷ n.
    - **Mois nécessaires** = arrondi au mois supérieur de reste × n ÷ (reste + réduction × n), calculé en nombres entiers (pas d'erreur d'arrondi) ; **gain** = n − mois nécessaires ; conseil seulement si le gain vaut au moins 1.
  - ✱ **Carte Conseil**, juste sous la carte de l'objectif concerné, construite comme la carte d'alerte de H3 : bleu vif, ampoule, titre « Conseil », phrase « En réduisant vos [catégorie] de [réduction] DA par mois, vous atteindriez « [objectif] » [un mois / N mois] plus tôt. » (✱ nom de catégorie commençant par une minuscule : « vos sorties »), boutons « Pourquoi ? » et « Compris ».
  - **Panneau Conseil**, ouvert par « Pourquoi ? », même composant que le panneau Alerte : titre, phrase « Pourquoi ? », bouton « Compris », lien « Gérer les conseils » vers `/reglages`. La croix ferme le panneau, la carte reste.
  - **Phrase « Pourquoi ? »** (`innovation.md` §2.4, mot pour mot) : « Pour atteindre « [objectif] » en [mois visé], il faut mettre de côté environ [rythme prévu] DA par mois. Avec [réduction] DA de plus, [mois nécessaires] mois suffiraient au lieu de [mois restants]. Le mois dernier, vos dépenses en [Catégorie] ont atteint [montant] DA, contre environ [habitude] DA d'habitude. » Montants arrondis à la centaine ; ✱ le nom de catégorie garde sa majuscule (comme dans la phrase de l'alerte).
  - ✱ **« Compris »** masque le conseil jusqu'à la fin du mois en cours (`adviceHiddenUntil` = mois en cours), sur tous les appareils ; le mois suivant, le calcul est refait.
  - Le conseil informe seulement : il ne modifie aucun budget ni objectif.
  - Hors périmètre : historique des conseils (après les tests L3).
- **Critères visés et comment** : C1 (la carte et son « Pourquoi ? » montrent comment avancer vers l'objectif) ; C2 (rien à décider, un seul bouton) ; C3 (rien n'est modifié ; l'utilisateur ferme ou désactive) ; C4 (conseils désactivables à part) ; C5 (pas de conseil sur des données insuffisantes ou un objectif clos) ; C6 (même composant et même fonctionnement que l'alerte) ; C7 (revenir à son habitude plutôt que se priver, carte bleue et non orange) ; C8 (comparaison mensuelle cohérente avec Graphiques).
- **Critères d'acceptation** :
  - Tests Vitest (CLAUDE.md §9) : vérification du prototype (reste 60 000 DA, 7 mois → environ 8 600 DA par mois ; avec 2 000 DA de plus, 6 mois → un mois plus tôt) ; jeu §5.2 aux jours 1, 10, 19 et 28 du mois → conseil Sorties, 2 000 DA, « Ordinateur portable », un mois plus tôt, et rien pour « Réserve de sécurité » ; pas de conseil sans 4 mois d'historique, pour un objectif atteint, une date passée, le mois en cours, une hausse inférieure à 500 DA ou un gain de 0 ; Santé, Logement et Autres exclues même avec la plus forte hausse ; mois sans dépense compté pour 0 ; « Compris » masque jusqu'au mois suivant ; conseils désactivés → rien.
  - Aucune couleur d'état de budget sur la carte et le panneau.
- **Maquette** : `telephone-06` et `ordinateur-06` (carte), `telephone-07` (modèle du panneau). Écarts (DECISIONS.md prime) : orange remplacé par le bleu ; « Accepter » et « Ignorer » remplacés par « Compris » ; « Pourquoi ? » devient un bouton qui ouvre le panneau.
- **Écarts constatés (rempli par Claude Code)** :
  - Tests Vitest : tous les cas demandés ; jeu de §5.2 vérifié aux jours 1, 10, 19 et 28 (Sorties, 2 000 DA, « Ordinateur portable », un mois plus tôt, rien pour « Réserve de sécurité ») ; phrase « Pourquoi ? » S3 mot pour mot (« environ 8 600 DA », « 6 mois suffiraient au lieu de 7 », « 7 000 DA, contre environ 5 000 DA ») ; un objectif en retard plus proche est écarté au profit du plus proche en cours ; catégorie renommée → nom actuel (« vos loisirs »).
  - Vérifié dans un navigateur piloté, en local et en ligne (8 étapes) : 4 mois de Sorties (5 000, 4 800, 5 200, puis 7 000) et un objectif à 90 000 / 150 000 DA visé dans 7 mois → carte Conseil juste sous l'objectif, phrase exacte ; « Pourquoi ? » → phrase exacte et « Gérer les conseils » ; croix → la carte reste ; « Compris » → masqué, et toujours masqué après rechargement.
  - La carte et le panneau de l'alerte (H3) sont devenus un composant commun (`InsightCard`) : alerte et conseil ont exactement le même fonctionnement (C6) ; l'alerte est inchangée (ses tests passent sans modification).
  - Dans le panneau, la ligne sous le titre « Conseil » reprend la phrase de la carte.
  - Sur ordinateur, les objectifs sont affichés sur une seule colonne (comme `ordinateur-06`), pour que le conseil reste juste sous l'objectif concerné.
  - « Gérer les conseils » mène à l'écran Réglages provisoire en attendant H7.
  - Pour la démo : le jeu de §5.2 n'est pas chargé tant que H8 n'existe pas ; il faut des dépenses datées des 4 mois précédents (le formulaire accepte les dates passées) et ne pas avoir touché « Compris » ce mois-ci sur le compte de démo.
  - Plan : `app/docs/plans/2026-11-20-h5-conseil.md`.

---

### H8 Données de démo — statut : fait (fusionné dans main le 20/11, PR n°5)
- **Scénario source** : script de démo `docs/03_conception/innovation.md` §5.3 (S4 puis S3, enchaînés) ; second tour des tests L3 sur l'application finale.
- **Fonctionnalité du sujet** : démonstration (L2 « démonstration de la fonctionnalité innovante », L4). Avancée en 7e position le 20/11 : l'application est montrée en direct, sans capture (QUESTIONS.md, 20/11).
- **Contenu et interactions** :
  - ✱ **Page cachée `/demo`**, absente de la navigation : titre « Données de démo », une phrase d'explication, bouton « Charger les données de démo ».
  - ✱ **Confirmation** : « Toutes les données de ce compte seront remplacées par les données de démo. » ; après le chargement, message « Données de démo chargées » et retour à l'Accueil.
  - ✱ **Le chargement remplace tout le compte en cours** : catégories remises par défaut (H1), dépenses, budgets, objectifs et versements remplacés ; prénom effacé ; alerte en attente et `adviceHiddenUntil` effacés ; alertes et conseils activés. Charger deux fois donne le même état. ✱ Pas d'« Annuler » : exception à CLAUDE.md §8, la page étant un outil de démo hors de l'interface utilisateur (DECISIONS.md, 20/11).
  - **Dates relatives au jour du chargement** : M = mois en cours, M-1 = mois dernier, etc.
  - **Sorties** : exactement le tableau de `innovation.md` §5.2 (M-4 à M-1) ; aucune dépense en Sorties dans le mois en cours.
  - ✱ **Autres catégories, stables de M-4 à M-1** (rien ne doit augmenter, pour que Sorties soit la seule hausse) :
    - Courses : 7 500 DA les 3, 10, 17 et 24 (30 000 DA par mois) ;
    - Transport : 500 DA les 2, 7, 12, 17, 22 et 27 (3 000 DA par mois) ;
    - Repas : 750 DA les 1, 5, 8, 12, 15, 19, 22 et 26 (6 000 DA par mois).
  - ✱ **Mois en cours** : les mêmes dépenses de Courses, Transport et Repas, seulement celles datées d'aujourd'hui ou avant ; aucune en Sorties.
  - ✱ **Budgets** : Courses 40 000, Repas 8 000, Transport 4 000, Sorties 5 000 DA. Avec ces montants, la dépense de 4 500 DA en Sorties de l'étape 2 du script affiche « Sorties : il reste 500 DA » (H1).
  - **Objectifs** (`innovation.md` §5.2) : « Ordinateur portable », 150 000 DA visés en M+7 ; « Réserve de sécurité », 50 000 DA visés en M+13 ; créés en M-5. ✱ Épargne enregistrée en vrais versements, un par mois le 28, de M-4 à M-1 : 22 500 DA pour « Ordinateur portable » (90 000 DA), 3 000 DA pour « Réserve de sécurité » (12 000 DA).
  - ✱ **Deux corrections de H5** : « 1 mois suffirait » (singulier) quand un seul mois suffit ; nom de catégorie gardé tel quel dans la phrase de la carte quand sa deuxième lettre est une majuscule (sigle : « EDF » reste « EDF »).
- **Critères visés et comment** : C8 (démo reproductible en direct, quel que soit le jour) ; C5 (confirmation avant de remplacer les données).
- **Critères d'acceptation** :
  - ✱ Tests Vitest pour **chaque jour du 1er au 31**, dans un mois de 31 jours et en février : après chargement, une dépense de 4 500 DA en Sorties datée du jour déclenche l'alerte (« environ 1 000 DA », « 4,5 fois ») ; le conseil porte sur Sorties, 2 000 DA, « Ordinateur portable », un mois plus tôt ; aucun conseil pour « Réserve de sécurité ». Si un jour échoue, ajuster les dates des données et le signaler dans « Écarts constatés » (Cowork mettra `innovation.md` §5 à jour).
  - Tests : chargement répété → même état ; catégories renommées remises par défaut ; alerte et masquage du conseil effacés ; « 1 mois suffirait » ; sigle conservé.
  - Parcours dans un navigateur, en local et en ligne : `/demo` → chargement → Accueil avec budgets et reste à dépenser → ajout de 4 500 DA en Sorties → message « il reste 500 DA » et carte d'alerte → Objectifs → carte Conseil → « Compris » → nouveau chargement → le conseil revient.
- **Maquette** : aucune (page technique, hors interface utilisateur).
- **Écarts constatés (rempli par Claude Code)** :
  - Jeu vérifié **pour chaque jour** du 1er au 31 janvier 2027, du 1er au 28 février 2027, le 29 février 2028 et trois jours de novembre 2026 : une dépense de 4 500 DA en Sorties déclenche l'alerte (« environ 1 000 DA », « 4,5 fois »), le message « Sorties : il reste 500 DA », et le conseil porte sur Sorties, 2 000 DA, « Ordinateur portable », un mois plus tôt ; jamais sur « Réserve de sécurité ». **Aucune date du jeu n'a eu besoin d'être ajustée** : `innovation.md` §5 reste valable, et vaut aussi pour les jours 29 à 31.
  - Tests aussi : totaux mensuels (Sorties 5 000 / 4 800 / 5 200 / 7 000, Courses 30 000, Transport 3 000, Repas 6 000), mois en cours sans Sorties et sans date future, épargnés 90 000 et 12 000, chargement répété → même état, dépense et catégorie en trop supprimées, catégorie renommée remise par défaut, prénom, alerte et masquage du conseil effacés ; « 1 mois suffirait » ; « EDF » gardé tel quel.
  - Vérifié dans un navigateur piloté, en local et en ligne (10 étapes) : `/demo` → confirmation → Accueil (reste à dépenser sur 57 000 DA de budgets) → 4 500 DA en Sorties → « Sorties : il reste 500 DA » et carte d'alerte → « Pourquoi ? » → Objectifs → carte Conseil → « Compris » → nouveau chargement → plus d'alerte ni de dépense de 4 500 DA → le conseil revient.
  - Le chargement part en un seul envoi groupé (atomique) : jamais d'état à moitié chargé, et il fonctionne aussi hors connexion (environ 140 écritures, plus la suppression des données existantes).
  - Les dépenses de démo du jour sont datées de minuit : une dépense saisie ensuite est toujours la plus récente (catégorie proposée, « Dernières dépenses »).
  - Les dates sont relatives au jour du chargement : recharger `/demo` le jour même de la démo (sur chaque appareil, chacun ayant son propre compte anonyme). Sur iPhone, l'application installée ne partage pas les données de Safari et n'a pas de barre d'adresse : faire la démo de secours dans l'onglet du navigateur.
  - Les dépenses de démo ont des notes vides : la liste « Dernières dépenses » affiche le nom de la catégorie.
  - La page `/demo` s'affiche dans la coquille de l'application (barre de navigation visible) mais n'apparaît dans aucun menu.
  - Plan : `app/docs/plans/2026-11-20-h8-demo.md`.

---

### H6 Graphiques — statut : fait (fusionné dans main le 20/11, PR n°6)
- **Scénario source** : S3 (Yasmine fait le point le soir, étape 3) ; démo `docs/03_conception/innovation.md` §5.3 (hausse des sorties visible avant la carte Conseil).
- **Fonctionnalité du sujet** : F3.
- **Contenu et interactions** :
  - ✱ **Principe** (DECISIONS.md, 20/11) : l'écran montre **seulement des statistiques des dépenses**. Pas de phrase de synthèse, pas d'ampoule, rien qui ressemble à une alerte ou à un conseil : Graphiques montre, l'innovation interprète.
  - **Bibliothèque** : Recharts (DECISIONS.md, 20/11). Anneau segmenté et barres arrondies (charte, DECISIONS.md 17/11).
  - ✱ **Une seule page, sans onglets** : titre « Graphiques ». Sur téléphone, la carte « Répartition du mois » puis la carte « D'un mois à l'autre », à la suite (l'écran défile). Sur ordinateur, les deux cartes côte à côte, comme `ordinateur-05`.
  - ✱ **Mois couverts** : le mois en cours et jusqu'à 5 mois avant lui (6 au plus), sans remonter avant le mois de la plus ancienne dépense. Sans aucune dépense : le mois en cours seul. Mois du 1er au dernier jour (DECISIONS.md, 18/11). Un mois sans dépense vaut 0 DA (comme le conseil, H5).
  - **Carte « Répartition du mois »** :
    - ✱ En-tête : « Répartition du mois » et un sélecteur « ‹ Novembre 2026 › ». **À chaque ouverture de l'écran, le mois en cours.** « ‹ » recule d'un mois jusqu'au premier mois couvert, « › » avance jusqu'au mois en cours ; au bout, la flèche est grisée et inactive. Libellés accessibles « Mois précédent » / « Mois suivant », cibles d'au moins 44 px. Quand le mois choisi est le mois en cours, « en cours » s'affiche à côté de son nom.
    - Anneau segmenté : une part par catégorie qui a au moins une dépense dans le mois choisi ; au centre, le total (« 29 000 ») et « DA dépensés ».
    - ✱ Légende **sur une colonne**, de la plus grosse catégorie à la plus petite (à égalité, dans l'ordre des catégories) : pastille de couleur, nom, montant (« 22 500 DA »), pourcentage arrondi à l'unité ; « moins de 1 % » pour une part non nulle qui serait arrondie à 0 ; une catégorie seule = 100 %.
    - Couleurs : nuances de bleu nuit et de bleu vif de la charte, comme la maquette ; **jamais vert, orange ou rouge** (réservés aux budgets). S'il y a plus de catégories que de nuances, les nuances se répètent : la légende en texte suffit à distinguer les parts (jamais la couleur seule).
    - ✱ Mois choisi sans dépense : à la place de l'anneau, « Aucune dépense ce mois-ci » et un bouton « Ajouter une dépense » (formulaire H1) pour le mois en cours ; « Aucune dépense en [août 2026] », sans bouton, pour un mois passé.
  - **Carte « D'un mois à l'autre »** :
    - ✱ Menu « Toutes les dépenses ▾ » au-dessus des barres : « Toutes les dépenses », puis chaque catégorie dans l'ordre des catégories. Il revient à « Toutes les dépenses » à chaque ouverture de l'écran. Il change seulement les barres, pas l'anneau.
    - Une barre arrondie par mois couvert : total du mois, pour toutes les dépenses ou pour la catégorie choisie.
    - ✱ **Montant écrit au-dessus de chaque barre** (pas de survol sur téléphone ; rien à toucher pour lire). Mois à 0 : pas de barre, « 0 » écrit. Si la place manque sur téléphone pour « 44 000 DA », écrire « 44 000 » et indiquer une seule fois « Montants en DA » sous le titre de la carte.
    - ✱ La barre du **mois choisi dans l'anneau** est en bleu nuit, les autres en bleu clair (comme la maquette) ; elle suit les flèches.
    - ✱ Sous la barre du mois en cours : « en cours » (le mois n'est pas fini).
    - Étiquettes de mois abrégées comme la maquette : « Janv. », « Févr. », « Mars », « Avr. », « Mai », « Juin », « Juil. », « Août », « Sept. », « Oct. », « Nov. », « Déc. ».
  - ✱ Toucher l'anneau, une part ou une barre ne fait rien.
  - Calcul sur l'appareil à partir des dépenses : fonctionne hors connexion ; l'écran se met à jour dès qu'une dépense est ajoutée, modifiée ou supprimée.
  - Hors périmètre : phrase de synthèse, comparaison dans la légende, période autre que le mois, export.
- **Critères visés et comment** : C1 (on sait toujours quel mois est détaillé : nom du mois, « en cours », barre du mois choisi en bleu nuit) ; C2 (une seule page, montants écrits, rien à toucher pour lire) ; C6 (anneau et barres sur les mêmes mois ; mêmes formats de montant et de date ; mois du 1er au dernier jour, comme les budgets et le conseil) ; C7 (légende en texte avec montant et pourcentage, jamais la couleur seule ; ni vert, orange, rouge, ni ampoule, réservés aux budgets et au conseil) ; C8 (consultation sur ordinateur dans S3, montants en DA).
- **Critères d'acceptation** :
  - Tests Vitest : totaux par mois, pour toutes les dépenses et par catégorie ; mois sans dépense = 0 ; 6 mois au plus, sans remonter avant le mois de la plus ancienne dépense ; passage d'année (de novembre à avril) ; dépenses du 1er et du dernier jour comptées dans le bon mois ; pourcentages arrondis, « moins de 1 % », catégorie seule = 100 % ; ordre de la légende (montant décroissant, puis ordre des catégories).
  - Avec le jeu de démo (H8), quel que soit le jour : 5 barres, de M-4 à M ; « Toutes les dépenses » → 44 000, 43 800, 44 200 et 46 000 DA de M-4 à M-1 ; menu sur Sorties → 5 000, 4 800, 5 200 et 7 000 DA, et 0 en M (4 500 après la dépense de l'étape 2 du script) ; anneau reculé jusqu'à M-1 → 46 000 DA dépensés, Courses 30 000 DA 65 %, Sorties 7 000 DA 15 %, Repas 6 000 DA 13 %, Transport 3 000 DA 7 %.
  - Aucune information portée par la couleur seule ; ni vert, orange, rouge, ni ampoule sur l'écran.
  - Mêmes cartes et mêmes libellés sur téléphone et sur ordinateur.
  - Parcours dans un navigateur, en local et en ligne : `/demo` → Graphiques → anneau sur le mois en cours, « › » grisée → « ‹ » jusqu'à M-4, puis grisée → barre du mois choisi en bleu nuit à chaque pas → menu sur Sorties → hausse de M-1 → ajout de 4 500 DA en Sorties → barre de M à 4 500 → retour sur Graphiques : menu revenu à « Toutes les dépenses », anneau sur le mois en cours.
- **Maquette** : `telephone-05`, `ordinateur-05`. Écarts (DECISIONS.md prime) : onglets Répartition / Évolution retirés ; phrase de synthèse (fond orange clair, ampoule) retirée ; sélecteur de mois, menu de catégorie, montants au-dessus des barres, « en cours » et montants dans la légende non dessinés ; légende sur une colonne au lieu de deux ; la barre en bleu nuit est celle du mois choisi, pas toujours celle du mois en cours ; « Enfants » est une catégorie créée par l'utilisateur (S2), pas une catégorie par défaut.
- **Écarts constatés (rempli par Claude Code)** :
  - Tests Vitest : tous les cas demandés (totaux par mois et par catégorie, mois à 0, 6 mois au plus sans remonter avant la plus ancienne dépense, passage d'année novembre → avril et vers janvier, 1er et dernier jour, pourcentages, « moins de 1 % », 100 %, ordre de la légende) ; chiffres du jeu de démo vérifiés **pour chaque jour** du 1er au 31 janvier et du 1er au 28 février (5 barres ; 44 000, 43 800, 44 200, 46 000 ; Sorties 5 000, 4 800, 5 200, 7 000, 0 puis 4 500 ; M-1 : 46 000, Courses 65 %, Sorties 15 %, Repas 13 %, Transport 7 %).
  - Vérifié dans un navigateur piloté, en local et en ligne (parcours de la spec, 10 étapes) : `/demo` → anneau sur le mois en cours, « › » grisée → « ‹ » jusqu'à M-4 puis grisée, barre du mois choisi en bleu nuit à chaque pas (couleur lue dans le graphique) → menu Sorties, hausse de M-1 → ajout de 4 500 DA → retour : menu « Toutes les dépenses », anneau sur le mois en cours → Sorties : barre du mois à 4 500.
  - « Montants en DA » est toujours affiché sous le titre de la carte (téléphone et ordinateur, mêmes libellés) ; les montants au-dessus des barres sont écrits sans « DA » (« 44 000 »).
  - Mois à 0 : Recharts ne dessine ni barre ni étiquette ; le « 0 » est écrit sur la ligne de base par l'axe des mois. Les montants au-dessus des barres sont en couleur de texte (Recharts les dessinait de la couleur de la barre, illisibles sur le bleu clair).
  - Accessibilité : les graphiques eux-mêmes sont ignorés par les lecteurs d'écran et sortis du parcours au clavier, et ne réagissent ni au survol ni au toucher ; l'information passe par la légende (texte) et par un tableau caché « Montants par mois, … » ; le sélecteur est un groupe nommé « Mois détaillé » ; le menu a un libellé caché « Barres pour ».
  - Une dépense d'une catégorie supprimée (H7) compte dans « Autres », dans l'anneau comme dans les barres.
  - Si les données changent pendant que l'écran est ouvert (chargement de démo) et que le mois choisi n'est plus couvert, l'anneau revient au mois en cours.
  - Le titre de l'écran n'a pas de sous-titre de mois (le mois détaillé est dans le sélecteur).
  - Sélecteur : la place de « en cours » reste réservée et le libellé a une largeur fixe sur ordinateur, pour que « ‹ » ne bouge pas sous la souris ; sur téléphone, « en cours » passe sous le nom du mois (flèches de 44 px vérifiées à 360 px).
  - Couleur fixe par catégorie, selon l'ordre des catégories (Repas bleu nuit, Courses bleu vif, Transport, Sorties, Santé, Logement dans les autres nuances ; au-delà, les nuances se répètent) : une catégorie garde sa couleur d'un mois à l'autre (CLAUDE.md §8). Écart à la maquette, où la plus grosse part est toujours en bleu nuit. Une catégorie supprimée prend la couleur d'« Autres ».
  - Pourcentage de la légende plafonné à 99 % tant que la catégorie n'est pas seule : jamais « 100 % » à côté d'une autre part (comme H2 et H4).
  - Le tableau caché des barres nomme ce qu'il montre : « Montants par mois, toutes les dépenses » ou « Montants par mois, Sorties ».
  - Plan : `app/docs/plans/2026-11-20-h6-graphiques.md`.

---

### H7 Réglages — statut : fait (fusionné dans main le 20/11, PR n°7)
- **Scénario source** : S2 (Nadia crée la catégorie « Enfants », étape 1) ; S4 (« Gérer les alertes », étape 4) ; S3 (conseil désactivable) ; Accueil personnalisé par le prénom (DECISIONS.md, 17/11).
- **Fonctionnalité du sujet** : transversal (les catégories servent F1, F2 et F3 ; les interrupteurs servent INNOV).
- **Contenu et interactions** :
  - **Écran Réglages** (`/reglages`, remplace l'écran provisoire ; icône en haut à droite sur téléphone, bas de la barre latérale sur ordinateur, H0) : titre « Réglages », trois sections dans cet ordre : **Compte**, **Catégories**, **Alertes et conseils**. Sur ordinateur, deux colonnes comme `ordinateur-08` (Compte à gauche ; Catégories puis Alertes et conseils à droite).
  - ✱ **Retirés de la maquette** : interrupteur « Alerte de budget » et « Mois budgétaire » (DECISIONS.md, 18/11) ; section « Données de démonstration » (la démo passe par `/demo`, DECISIONS.md, 20/11).
  - ✱ **Compte** (DECISIONS.md, 20/11) :
    - Icône nuage, « Sans compte », « Vos données sont enregistrées de façon anonyme sur cet appareil. » **Pas de boutons « Créer un compte » ni « Se connecter »** : ils arrivent avec H9.
    - Champ « Votre prénom (facultatif) », aide « Affiché sur l'accueil : « Bonjour [prénom] » » (« Bonjour » si le champ est vide).
    - Enregistré en quittant le champ (ou avec Entrée), espaces de début et de fin retirés ; message « Prénom enregistré » seulement si la valeur a changé ; champ vide → prénom effacé. Longueur maximale au choix de Claude Code (à noter dans les écarts).
    - Accueil (DECISIONS.md, 17/11) : « Bonjour [prénom] » et bulle de profil avec l'initiale ; sans prénom, « Bonjour » et l'icône de profil.
  - **Catégories** :
    - Liste dans l'ordre des catégories : icône, nom, crayon (« Modifier [Courses] »), ✱ corbeille **grise** (« Supprimer [Courses] ») ; « Autres » en dernier, avec un cadenas et « Toujours présente », sans crayon ni corbeille. Bouton « Ajouter une catégorie » sous la liste.
    - ✱ **Ajouter / renommer** (DECISIONS.md, 20/11) : formulaire à part, plein écran sur téléphone comme le formulaire Dépense ; titre « Nouvelle catégorie » / « Modifier la catégorie ».
      - **Nom** : obligatoire, 20 caractères au plus ; vide → « Donnez un nom à la catégorie, par exemple Enfants » ; déjà pris (quelles que soient les majuscules, espaces de début et de fin ignorés) → « Cette catégorie existe déjà » ; en modification, garder son propre nom n'est pas un doublon.
      - **Icône** : choix dans la liste déjà prête (`CATEGORY_ICONS`) ; ✱ l'icône « … » d'« Autres » n'est pas proposée ; présélection : la première icône non utilisée par une autre catégorie (en modification, l'icône actuelle). Chaque icône a un nom accessible (« Bébé », « Cadeau »…).
      - Boutons « Ajouter la catégorie » / « Enregistrer ». Nouvelle catégorie en fin de liste, juste avant « Autres ».
      - Messages « Catégorie ajoutée : Enfants · Annuler » et « Catégorie modifiée · Annuler » (« Annuler » rétablit l'état d'avant).
      - Le nouveau nom s'affiche partout aussitôt (budgets, graphiques, phrases de l'alerte et du conseil, qui utilisent déjà le nom actuel).
    - ✱ **Supprimer** (DECISIONS.md, 20/11 ; maquette `telephone-09`) : la corbeille ouvre la fenêtre de confirmation commune (« Garder » / « Supprimer » en rouge) :
      - titre « Supprimer la catégorie [Sorties] ? » ;
      - avec des dépenses : « Les [12] dépenses de [Sorties] ne seront pas perdues : elles seront déplacées dans la catégorie choisie ci-dessous. » (au singulier pour une dépense) ; menu « Déplacer les dépenses vers », « Autres » par défaut, puis les autres catégories dans leur ordre ;
      - sans dépense : « Aucune dépense dans [Sorties]. », pas de menu ;
      - si la catégorie a un budget : « Le budget de [Sorties] sera supprimé. » ;
      - « Vous pourrez l'annuler juste après. »
      - Toutes les dépenses de la catégorie sont déplacées, quel que soit leur mois ; écriture groupée (atomique), comme le chargement de démo (H8) : jamais d'état à moitié fait, fonctionne hors connexion.
      - Message « Catégorie supprimée : Sorties · 12 dépenses déplacées vers Autres · Annuler » (sans la partie sur les dépenses s'il n'y en a pas). « Annuler » rétablit la catégorie (même identifiant, nom, icône et place), son budget, et remet dans la catégorie les dépenses déplacées, celles-là seulement.
      - La carte d'alerte suit la règle de H3 : si la dépense signalée change de catégorie, la carte disparaît ; « Annuler » la fait revenir.
  - ✱ **Alertes et conseils** (DECISIONS.md, 18/11 et 20/11) :
    - Deux lignes avec un interrupteur et le texte « Activé » / « Désactivé » à côté : « Dépenses inhabituelles », « Vous prévenir quand une dépense sort de vos habitudes » (`alertsEnabled`) ; « Conseils d'épargne », « Vous proposer comment atteindre un objectif plus tôt » (`adviceEnabled`).
    - Effet immédiat, enregistré dans le compte (tous les appareils) ; message court « Alertes désactivées » / « Alertes activées » / « Conseils désactivés » / « Conseils activés », sans « Annuler ».
    - Alertes désactivées : aucun contrôle à l'ajout (déjà en H3) et carte d'alerte en attente masquée ; elle revient à la réactivation si la dépense n'a pas changé (règle de H3).
    - Conseils désactivés : pas de carte Conseil (déjà en H5).
    - « Gérer les alertes » et « Gérer les conseils » (panneaux de H3 et H5) ouvrent Réglages directement sur la section « Alertes et conseils ».
  - Hors périmètre : créer un compte et se connecter (H9), réordonner les catégories, changer l'icône d'« Autres », mois budgétaire, notifications.
- **Critères visés et comment** : C1 (message après chaque action, liens qui mènent à la bonne section, aide « Bonjour [prénom] ») ; C3 (suppression confirmée et annulable ; alertes et conseils désactivables et réactivables d'un geste) ; C4 (catégories à son image, prénom, alertes et conseils réglés séparément) ; C5 (aucune dépense perdue, doublon refusé, erreurs au champ) ; C6 (mêmes formulaires, même fenêtre de confirmation et mêmes messages que les autres écrans) ; C7 (état des interrupteurs écrit en texte ; corbeilles grises, le rouge garde son sens ; cadenas « Toujours présente »).
- **Critères d'acceptation** :
  - Tests Vitest : nom vide, trop long, doublon (majuscules, espaces), propre nom accepté en modification ; icône présélectionnée ; suppression → toutes les dépenses déplacées vers la catégorie choisie, budget supprimé, « Annuler » rétablit catégorie, budget et seulement les dépenses déplacées ; « Autres » ni modifiable ni supprimable ; prénom : espaces retirés, vide → effacé ; alertes désactivées → carte masquée, réactivées → carte revenue.
  - S2 étape 1 : « Enfants » créée avec l'icône bébé apparaît en fin de liste, dans le formulaire Dépense, dans Budgets et dans le menu de Graphiques.
  - Parcours dans un navigateur, en local et en ligne : `/demo` → Réglages, prénom « Yasmine » → Accueil « Bonjour Yasmine » → 4 500 DA en Sorties → carte d'alerte → « Pourquoi ? » → « Gérer les alertes » → section affichée → désactiver → Accueil sans carte → réactiver → carte revenue → ajouter « Enfants » → renommer Sorties en « Loisirs » → Objectifs : conseil « vos loisirs » → supprimer « Loisirs » vers Autres → message avec le nombre de dépenses, budget retiré, carte d'alerte disparue → « Annuler » → catégorie, budget, dépenses et carte revenus. Recharger `/demo` à la fin.
  - Mêmes sections et libellés sur téléphone et sur ordinateur ; aucun état signalé par la couleur seule.
- **Maquette** : `telephone-08`, `ordinateur-08` (Réglages), `telephone-09`, `ordinateur-11` (suppression). Écarts (DECISIONS.md prime) : boutons « Créer un compte » / « Se connecter » retirés jusqu'à H9, message changé ; « Alerte de budget », « Mois budgétaire » et « Données de démonstration » retirés ; section « Alertes » renommée « Alertes et conseils », cases à cocher remplacées par des interrupteurs avec texte, ligne « Conseils d'épargne » ajoutée ; corbeilles grises au lieu de rouges ; « Enfants » est une catégorie créée par l'utilisateur (S2).
- **Écarts constatés (rempli par Claude Code)** :
  - Livré en trois lots, chacun fusionnable seul : (1) interrupteurs et prénom, (2) ajouter / renommer une catégorie, (3) supprimer une catégorie avec « Annuler ».
  - Tests Vitest : nom vide, 21 caractères, doublon (« sorties », «  Sorties  », « AUTRES »), propre nom accepté en modification ; icône présélectionnée (« Bébé » avec les catégories par défaut, puis « Cadeau ») ; « … » jamais proposée ; suppression → dépenses de tous les mois déplacées, budget supprimé, « Annuler » rétablit catégorie (id, nom, icône, place), budget et seulement les dépenses déplacées ; « Autres » ni modifiable ni supprimable ; prénom (espaces, vide, longueur) ; alertes désactivées → carte masquée, réactivées → carte revenue ; carte d'alerte qui disparaît à la suppression et revient avec « Annuler ».
  - Vérifié dans un navigateur piloté, en local et en ligne (parcours de la spec, 16 étapes) : prénom « Yasmine » → « Bonjour Yasmine » et bulle « Y » ; « Gérer les alertes » → section à l'écran ; désactiver → plus de carte ; réactiver → carte revenue ; « Enfants » (bébé) en fin de liste, présente dans le formulaire Dépense, Budgets et Graphiques ; Sorties → « Loisirs », conseil « vos loisirs » ; suppression de « Loisirs » → « 23 dépenses déplacées vers Autres », budget retiré, carte disparue ; « Annuler » → catégorie à sa place, budget, dépenses et carte revenus ; `/demo` rechargé.
  - Prénom : **30 caractères au plus** (choix). L'aide sous le champ montre l'aperçu en direct (« Bonjour Yasmine »).
  - Nom de catégorie : le champ accepte quelques caractères de plus que 20 pour afficher l'erreur « 20 caractères au plus » plutôt que de couper sans prévenir.
  - Noms accessibles des icônes : Couverts, Panier, Bus, Ticket, Cœur, Maison, Livre, Bébé, Cadeau, Vêtement, Téléphone, Voiture, Animal, Sport, Avion, Outil.
  - Confirmation à une seule dépense : « La dépense de Sorties ne sera pas perdue : elle sera déplacée dans la catégorie choisie ci-dessous. »
  - La fenêtre de confirmation commune ne remet plus le focus sur « Garder » à chaque changement : choisir la catégorie cible dans le menu garde le focus dans le menu.
  - « Gérer les alertes » et « Gérer les conseils » mènent tous deux à `/reglages#alertes` (une seule section).
  - Après un changement (interrupteur, liste), l'écran se met à jour quelques dizaines de millisecondes après le message (délai d'écriture déjà constaté en H3).
  - **Validé le 20/11 (conflit H3 / H7, ligne dans DECISIONS.md)** : H3 dit que la phrase « Pourquoi ? » de l'alerte est « calculée à l'ajout et gardée telle quelle », H7 qu'elle utilise « le nom actuel ». Choix fait : les **chiffres** restent ceux de l'ajout (H3), seul le **nom de la catégorie** suit un renommage (H7) ; « Pourquoi ? » après Sorties → Loisirs dit « une dépense en Loisirs ». Les alertes enregistrées avant ce changement gardent leur phrase d'origine.
  - Comptes créés avant le 19/11 (ancien nom d'icône de Repas) : l'icône est reconnue comme « Couverts » (présélection et modification justes).
  - Doublon de nom reconnu aussi pour un nom collé avec des accents décomposés ; « Sante » à côté de « Santé » reste accepté (la spec ne parle que des majuscules).
  - Prénom enregistré aussi si l'écran se ferme sans quitter le champ (geste retour Android). Prénom long : passe à la ligne sur l'Accueil, sans déborder (vérifié à 360 px avec 30 caractères).
  - Fenêtre de confirmation : ses phrases (dépenses déplacées, budget supprimé) sont lues par les lecteurs d'écran (vaut pour toutes les confirmations).
  - Plan : `app/docs/plans/2026-11-21-h7-reglages.md`.

---

### H9 Compte e-mail facultatif — statut : fait (fusionné dans main le 21/11, PR n°8)
- **Scénario source** : S3 (Yasmine a créé un compte sur son téléphone ; le soir, sur son PC, elle se connecte et retrouve ses dépenses, étapes 1 et 2). Choix proposés par Cowork et validés par le binôme le 21/11 (DECISIONS.md, 21/11).
- **Fonctionnalité du sujet** : transversal (retrouver F1 à F4 et INNOV sur un autre appareil).
- **Prérequis (Kader, console Firebase)** : connexion « Adresse e-mail/Mot de passe » activée (Authentication › Méthodes de connexion) ; langue des modèles d'e-mail en français (fait le 21/11).
- **Contenu et interactions** :
  - **Principe (version réduite)** :
    - **Créer un compte** = le compte anonyme de l'appareil devient un compte e-mail : même compte, même identifiant, rien n'est copié, rien n'est perdu.
    - **Se connecter** = rejoindre un compte qui existe déjà. Les données notées sans compte sur cet appareil **ne sont pas ajoutées** au compte rejoint (pas de fusion) ; elles restent dans l'ancien compte anonyme, qu'on ne peut plus rouvrir.
    - Règles de sécurité Firestore inchangées (chacun ses données, `users/{uid}`).
    - `auth.languageCode = 'fr'` dans le code (e-mail et page de réinitialisation en français, en plus du réglage de la console).
  - **Écran « Créer un compte »** (`/compte/creer`, remplace l'écran provisoire ; sans barre de navigation, bouton retour ; maquettes `telephone-10`, `ordinateur-09`) :
    - Titre « Créer un compte », sous-titre « Facultatif ». Bandeau avec icône nuage : « Retrouvez vos dépenses sur tous vos appareils. **Ce que vous avez déjà noté est conservé.** »
    - Champs : « Prénom (facultatif) », prérempli avec le prénom de Réglages, aide « Affiché sur l'accueil », mêmes règles qu'en H7 (30 caractères au plus, espaces de début et de fin retirés) ; « Adresse e-mail » ; « Mot de passe » avec « Afficher » / « Masquer ».
    - **Conditions du mot de passe**, en liste sous le champ, visibles dès l'ouverture : « Au moins 8 caractères », « Au moins un chiffre ». Chacune est grise avec un rond vide, puis **verte avec une coche** dès qu'elle est remplie pendant la saisie, et redevient grise si elle ne l'est plus. Annoncée aux lecteurs d'écran (« Condition remplie »). Le vert est admis ici, toujours avec la coche (DECISIONS.md, 21/11).
    - Bouton « Créer mon compte » ; lien « J'ai déjà un compte. Se connecter ».
    - Erreurs au champ concerné, au moment de « Créer mon compte » :
      - adresse vide ou incomplète : « Adresse incomplète : ajoutez la fin, par exemple yasmine@gmail.com » ;
      - adresse déjà utilisée : « Un compte existe déjà avec cette adresse. » avec un lien « Se connecter » ;
      - condition non remplie : la ligne concernée passe en erreur (rouge avec icône) et le message « Le mot de passe doit contenir au moins 8 caractères, dont un chiffre. » s'affiche sous le champ ;
      - pas de réseau : « Connectez-vous à internet pour créer votre compte. » ; autre échec : message général avec « Réessayer ».
    - Succès : retour à Réglages, message « Compte créé : vos données sont enregistrées dans votre compte. » ; prénom enregistré s'il a changé.
  - **Écran « Se connecter »** (`/compte/connexion`, remplace l'écran provisoire ; maquettes `telephone-11`, `ordinateur-10`) :
    - Accès : « Déjà un compte ? Se connecter » de la Première ouverture (déjà en place) ; bouton « Se connecter » de Réglages › Compte ; lien de l'écran Créer un compte.
    - Titre « Se connecter », sous-titre « Retrouvez vos données ». Champs « Adresse e-mail » et « Mot de passe » (« Afficher »), sans liste de conditions. Lien « Mot de passe oublié ? ». Bouton « Se connecter ». Lien « Pas encore de compte ? Créer un compte ».
    - **Avertissement**, seulement si l'appareil a au moins une dépense : encadré juste au-dessus du bouton, en bleu avec une icône (pas en orange, réservé aux budgets) : « Cet appareil contient **N dépenses** notées sans compte. Elles **ne seront pas ajoutées** à votre compte et ne seront plus visibles ici. » Au singulier : « Cet appareil contient **1 dépense** notée sans compte. Elle **ne sera pas ajoutée** à votre compte et ne sera plus visible ici. » Pas d'« Annuler » après la connexion (exception à CLAUDE.md §8, DECISIONS.md 21/11).
    - Erreurs au champ : adresse incomplète (même message qu'à la création) ; adresse ou mot de passe faux : « Adresse e-mail ou mot de passe incorrect. » sous le mot de passe (un seul message, Firebase ne dit pas lequel est faux) ; trop d'essais : « Trop d'essais. Réessayez dans quelques minutes, ou utilisez « Mot de passe oublié ? ». » ; pas de réseau : « Connectez-vous à internet pour vous connecter. »
    - Succès : Accueil avec les données du compte, message « Vous êtes connecté ». La Première ouverture ne s'affiche pas si le compte l'a déjà passée.
    - **Mot de passe oublié ?** : utilise l'adresse saisie ; vide ou incomplète → erreur au champ e-mail (« Saisissez votre adresse e-mail pour recevoir le lien. »), sans fenêtre ; sinon, **fenêtre de confirmation commune** (ajoutée le 21/11 après le test de Kader, DECISIONS.md) : titre « Recevoir un lien pour choisir un nouveau mot de passe ? », texte « Un e-mail sera envoyé à **[adresse saisie]**. Votre mot de passe actuel reste valable tant que vous n'en choisissez pas un nouveau. », boutons « Annuler » / « Envoyer le lien » (bleu, comme la déconnexion) ; « Envoyer le lien » → e-mail de réinitialisation de Firebase et message neutre « Si un compte existe pour cette adresse, un e-mail vient d'être envoyé pour choisir un nouveau mot de passe. », que l'adresse ait un compte ou non. Le nouveau mot de passe se choisit sur la page de Firebase : pas d'écran dans l'application.
  - **Se déconnecter** :
    - Bouton « Se déconnecter » (contour, pas rouge) dans Réglages › Compte, quand on est connecté.
    - Fenêtre de confirmation commune : titre « Se déconnecter ? », texte « Vos données restent dans votre compte : vous les retrouverez en vous reconnectant. Cet appareil repartira sans données. », boutons « Rester connecté » / « Se déconnecter » (bleu, pas rouge : rien n'est perdu).
    - Après : nouveau compte anonyme vide (comme une toute première ouverture, H0), écran Première ouverture, message « Vous êtes déconnecté ». Pas d'« Annuler » : on se reconnecte.
    - Sans réseau : pas de fenêtre, message « Connectez-vous à internet pour vous déconnecter : vos dernières dépenses doivent d'abord être enregistrées dans votre compte. » La déconnexion ne doit jamais faire perdre une écriture encore en attente d'envoi.
  - **Réglages › Compte** (remplace le texte provisoire de H7 ; maquettes `telephone-08`, `ordinateur-08`) :
    - Sans compte : icône nuage, « Sans compte pour l'instant », « Vos données sont enregistrées de façon anonyme. Créez un compte pour les retrouver sur un autre appareil. » ; boutons côte à côte « Créer un compte » (bleu, icône personne) et « Se connecter » (contour).
    - Connecté : icône nuage avec une coche, « Connecté », adresse e-mail du compte, « Vos données sont enregistrées dans votre compte : vous les retrouvez sur tous vos appareils. » ; bouton « Se déconnecter » (contour).
    - Champ prénom en dessous, inchangé (H7). Sur ordinateur, même section dans la colonne de gauche.
  - **Aucun texte souligné** (demande de Kader, DECISIONS.md 21/11), dans **toute l'application** et pas seulement les écrans de H9 : liens et boutons texte en bleu vif et en gras (par exemple « Créer un objectif », « Annuler » des messages, « Déjà un compte ? Se connecter », « Mot de passe oublié ? »). Repéré : la règle globale `a` de `ui/theme.css` laisse le soulignement par défaut ; `ui/Toast.css` souligne « Annuler ». Le contour de focus au clavier reste visible.
  - `/demo` inchangé : il remplace les données **du compte en cours**, y compris un compte e-mail connecté. La démo se fait donc sans compte (à rappeler dans le script de démo).
  - Hors périmètre : ajouter au compte les dépenses notées sans compte (fusion) ; e-mail de confirmation de l'adresse ; changer d'adresse ou de mot de passe depuis l'application ; supprimer le compte ; connexion avec Google.
- **Critères visés et comment** : C1 (conditions du mot de passe validées en direct ; état du compte écrit ; message après chaque action) ; C2 (aucun compte exigé ; Réglages ne propose que les actions possibles dans l'état courant) ; C3 (déconnexion confirmée et réversible en se reconnectant ; « Mot de passe oublié ? ») ; C5 (erreurs au bon champ avec la correction ; perte annoncée avant de se connecter ; création, connexion et déconnexion refusées sans réseau) ; C6 (mêmes champs, messages et fenêtre de confirmation que le reste ; aucun texte souligné, partout) ; C7 (état du compte en icône et texte ; vert avec coche ; liens en gras, pas seulement en couleur) ; C8 (données retrouvées sur un autre appareil, S3).
- **Critères d'acceptation** :
  - Tests Vitest : conditions du mot de passe (7 caractères ; 8 sans chiffre ; 8 avec un chiffre) ; messages selon les erreurs Firebase (adresse déjà utilisée, identifiants incorrects, trop d'essais, réseau) ; avertissement affiché seulement s'il y a des dépenses, au singulier pour une ; « Mot de passe oublié ? » : fenêtre avec l'adresse, « Annuler » → aucun envoi, « Envoyer le lien » → un envoi ; Réglages : bons boutons et textes dans les deux états ; déconnexion refusée hors connexion.
  - Parcours en ligne, dans deux navigateurs (ou une fenêtre normale et une fenêtre privée) :
    1. Navigateur A : `/demo` → Réglages → « Créer un compte » → conditions qui passent au vert → compte créé → mêmes données qu'avant ; Réglages affiche « Connecté » et l'adresse.
    2. Navigateur B, première ouverture : « Déjà un compte ? Se connecter » → pas d'avertissement → Accueil avec les données de A.
    3. Dans B, ajouter une dépense → visible dans A sans recharger.
    4. Dans B : « Se déconnecter » → confirmation → Première ouverture, appareil vide → noter 2 dépenses → Réglages › « Se connecter » → avertissement « 2 dépenses » → connexion → données du compte, sans les 2 dépenses.
    5. Mauvais mot de passe → message unique ; « Mot de passe oublié ? » → confirmation avec l'adresse → « Envoyer le lien » → e-mail reçu, en français.
    6. Hors connexion : création, connexion et déconnexion refusées avec leur message.
  - Aucun texte souligné dans l'application ; mêmes écrans et libellés sur téléphone et ordinateur.
  - Avant la fusion : `/demo` et le parcours de démo (`innovation.md` §5.3) fonctionnent toujours **sans compte**.
- **Maquette** : `telephone-10`, `ordinateur-09` (Créer un compte) ; `telephone-11`, `ordinateur-10` (Se connecter) ; `telephone-08`, `ordinateur-08` (Réglages › Compte). Écarts (DECISIONS.md prime) : liste de conditions qui passent au vert au lieu d'une ligne de règles ; encadré « seront ajoutées à votre compte » (beige) remplacé par l'avertissement « ne seront pas ajoutées » (bleu) ; liens non soulignés ; bouton « Se déconnecter » ajouté (absent des maquettes).
- **Écarts constatés (rempli par Claude Code)** :
  - **Vérifié** :
    - 532 tests Vitest et 7 tests des règles Firestore. Les tests couvrent : conditions du mot de passe, messages selon les erreurs Firebase, avertissement « N dépenses » (absent sans dépense, singulier pour une), Réglages › Compte dans ses deux états, déconnexion refusée hors connexion ou si l'attente échoue, confirmation de « Mot de passe oublié ? ».
    - Parcours de la spec (6 étapes, deux navigateurs) passé dans un navigateur piloté, en local puis sur le canal de prévisualisation `h9` (https://ecobudget-3b3a4--h9-baf0sy6c.web.app, expire le 28/11).
    - Aucun texte souligné sur 10 écrans, téléphone et ordinateur, dont Objectifs vide (« Créer un objectif »).
    - `/demo` et le parcours de démo (`innovation.md` §5.3) passent **sans compte**, en local et sur le canal. H7 repasse sur le canal.
    - **E-mail de réinitialisation reçu en français, vérifié par Kader sur le canal le 21/11.**
  - **Textes choisis (non fixés par la spec)** :
    - échecs généraux, avec le bouton « Réessayer » : « Le compte n'a pas pu être créé. », « La connexion n'a pas abouti. », « L'e-mail n'a pas pu être envoyé. » ;
    - « Mot de passe oublié ? » : « Connectez-vous à internet pour recevoir le lien. » hors connexion, « Trop d'essais. Réessayez dans quelques minutes. » après trop d'essais ;
    - mot de passe vide à la connexion : « Saisissez votre mot de passe. ».
  - **« Mot de passe oublié ? »** :
    - hors connexion, le message s'affiche tout de suite, sans fenêtre de confirmation (comme la déconnexion) ;
    - bouton protégé du double appui.
  - **« Annuler » des messages** : il reste en bleu clair (#C9D5FA) et en gras, sans soulignement, car le bleu vif serait illisible sur le bleu nuit (validé le 21/11). « Tout voir » passe en gras.
  - **« Un compte existe déjà avec cette adresse. »** : son lien « Se connecter » ouvre Se connecter avec l'adresse déjà remplie.
  - **Déconnexion** :
    - elle attend que les écritures en attente soient envoyées. L'attente est faite deux fois, pour couvrir une dépense notée pendant « Déconnexion… », et dure 10 s au plus. Pendant ce temps, le bouton est désactivé et affiche « Déconnexion… » ;
    - si le délai est dépassé ou si l'attente échoue, la déconnexion est refusée : le bouton redevient « Se déconnecter », avec le message hors connexion, affiché 8 s (message long).
  - **Changement de compte** : toute l'application repart de zéro (données et écrans). La navigation et le message (« Vous êtes connecté », « Vous êtes déconnecté ») sont conservés.
  - **Redirections** :
    - `/compte/creer` et `/compte/connexion` redirigent vers Réglages si un compte e-mail est connecté ;
    - après une connexion réussie, on arrive sur l'Accueil. Ce cas a été corrigé après l'E2E : sans le correctif, on arrivait sur Réglages, parce que l'application est remontée avant la fin de la navigation.
  - **Créer un compte ouvert directement** (rechargement de la page, application rouverte) : l'écran attend les données. Le prénom est donc prérempli, et jamais effacé par erreur.
  - **Accessibilité** :
    - après une validation ratée, le focus va sur le premier champ en erreur, comme pour le formulaire Dépense ;
    - les conditions sont lues en entier (« Au moins un chiffre : condition remplie ») ;
    - la confirmation de « Mot de passe oublié ? » est annoncée (`role="status"`).
  - **Fenêtres de confirmation** : un mot long, comme une adresse e-mail, passe à la ligne au lieu d'élargir la fenêtre au-delà de l'écran. Cela vaut pour toutes les fenêtres de confirmation.
  - **Données** :
    - les comptes de test `ecobudget.e2e.…@example.com` créés par l'E2E restent dans Firebase Auth et peuvent être supprimés depuis la console ;
    - le cache local du compte quitté reste sur l'appareil, sans être affiché.
  - **Points mineurs de la revue, non corrigés (décision de Kader, 21/11)** :
    - le drapeau interne « connexion en cours » peut rester actif si l'on quitte l'écran pendant la connexion (« Retour »). Un compte connecté qui tape ensuite `/compte/connexion` arrive alors sur l'Accueil au lieu de Réglages ;
    - un message « Annuler » de l'ancien compte survit à une connexion faite dans un autre onglet. Toucher « Annuler » écrit alors dans l'ancien compte : l'écriture est refusée, sans effet visible ;
    - réseau annoncé mais serveur injoignable, sans rien en attente : la déconnexion passe, puis l'écran « connectez-vous à internet » de la première ouverture s'affiche. Rien n'est perdu, et l'application réessaie toutes les 10 s.
  - **Pour la démo** : elle se fait sans compte, car `/demo` remplace les données du compte en cours. À rappeler dans `innovation.md` §5.3 (Cowork).
  - **Mise en production** le 21/11 à 12 h 53, en clonant le canal `h9` (code identique à `main`). Vérifié en production, sans compte : Réglages › Compte (« Sans compte pour l'instant ») et parcours de démo (`/demo`, alerte, conseil).
  - Plan : `app/docs/plans/2026-11-21-h9-compte.md`.

---

## Corrections après les tests sur l'application finale (21/11/2026)

Source : `docs/04_evaluation/synthese.md` (retours de P1, P2, P3) et `docs/DECISIONS.md` (21/11). Les détails marqués ✱ sont proposés par Cowork le 21/11 ; Kader a validé le lot et peut les corriger. Faire dans l'ordre H10 → H14 ; si le temps manque, les dernières tombent. `/demo` et le parcours de démo (`innovation.md` §5.3) doivent toujours passer sans compte.

### H10 Liste des dépenses du mois — statut : fait (fusionné dans main le 21/11, PR n°9)
- **Scénario source** : S2 (Nadia vérifie les dépenses du mois) ; retour n° 7 de P3 (impossible de voir plus que les 4 dernières dépenses, ni les mois passés, donc de corriger une dépense ancienne).
- **Fonctionnalité du sujet** : F1.
- **Contenu et interactions** :
  - **Accès** : sur l'Accueil, lien « Tout voir » à droite du titre « Dernières dépenses », même style que « Tout voir » de « Vos budgets » (bleu vif, gras, non souligné). ✱ Affiché dès qu'il y a au moins une dépense.
  - **Écran « Dépenses »** (✱ route `/depenses`) : bouton retour vers l'Accueil, titre « Dépenses ». Barre de navigation comme sur l'Accueil (téléphone) ; sur ordinateur, dans le panneau de contenu, même largeur que les autres écrans.
  - **Sélecteur de mois** : le même composant que Graphiques (« ‹ Novembre 2026 › », « en cours », flèches grisées et inactives au bout, libellés « Mois précédent » / « Mois suivant », cibles de 44 px, groupe nommé « Mois affiché »). ✱ Mois couverts : du mois de la plus ancienne dépense au mois en cours, **sans limite de 6 mois** (différent de Graphiques). À chaque ouverture de l'écran : le mois en cours.
  - ✱ Sous le sélecteur : « Total : 29 000 DA · 12 dépenses » (« 1 dépense » au singulier).
  - **Liste** : dépenses du mois choisi, de la plus récente à la plus ancienne, ✱ groupées par jour avec un intertitre (« Aujourd'hui », « Hier », puis « samedi 14 novembre », format de date de H0). Chaque ligne comme « Dernières dépenses » (H1) : icône de la catégorie, titre = la note, sinon le nom de la catégorie ; sous-titre = la catégorie ; montant « −250 DA ».
  - **Toucher une dépense** ouvre le formulaire de modification de H1 (« Enregistrer », « Supprimer la dépense ») ; après enregistrement ou suppression, ✱ retour à la liste sur le même mois, avec le message de H1 et « Annuler ».
  - **Mois sans dépense** : « Aucune dépense ce mois-ci » et un bouton « Ajouter une dépense » pour le mois en cours ; « Aucune dépense en août 2026 », sans bouton, pour un mois passé (comme Graphiques, H6).
  - Mise à jour immédiate après un ajout, une modification ou une suppression ; fonctionne hors connexion (données déjà sur l'appareil).
  - Hors périmètre : filtre par catégorie, recherche, export.
- **Critères visés et comment** : C2 (toutes les dépenses à un geste de l'Accueil) ; C5 (une erreur ancienne se corrige) ; C6 (mêmes flèches de mois que Graphiques, mêmes lignes que « Dernières dépenses », même formulaire) ; C1 (mois affiché, total et « en cours » toujours visibles).
- **Critères d'acceptation** :
  - Tests Vitest : mois couverts (de la plus ancienne dépense au mois en cours, passage d'année) ; dépenses du 1er et du dernier jour dans le bon mois ; groupement par jour et ordre ; total et nombre de dépenses (singulier) ; mois sans dépense.
  - Parcours dans un navigateur, en local et en ligne : `/demo` → Accueil → « Tout voir » → mois en cours, « › » grisée → « ‹ » jusqu'à M-4, puis grisée → toucher une dépense de M-2 → modifier le montant → retour sur M-2, message et « Annuler » → supprimer une dépense → « Annuler » → la dépense revient. Recharger `/demo` à la fin.
  - Mêmes libellés sur téléphone et ordinateur ; rien n'est porté par la couleur seule ; aucun texte souligné.
- **Maquette** : aucune (écran ajouté après les tests finaux ; maquettes gardées à l'état du 17/11, DECISIONS.md).
- **Écarts constatés (rempli par Claude Code)** :
  - **Vérifié** :
    - 568 tests Vitest. Ceux de H10 couvrent :
      - les mois couverts : sans limite de 6 mois, passage d'année, dépense future ignorée, mois de l'adresse gardé ou ignoré ;
      - les dépenses du 1er et du dernier jour dans le bon mois, y compris le 29 février ;
      - le groupement par jour et l'ordre ; le total et le nombre (« 1 dépense ») ; le mois sans dépense ;
      - les intertitres ;
      - l'écran : ouverture, flèches, retour vers l'Accueil, lignes sans le jour, `?mois=` faux ou futur, mois vide ;
      - la barre du bas sur `/depenses` et le lien « Tout voir » ;
      - le retour sur la liste après « Enregistrer » et « Supprimer », et l'historique.
    - Graphiques est inchangé : ses tests passent sans modification (même calcul des mois, toujours limité à 6), et son parcours E2E repasse.
    - Parcours de la spec passé dans un navigateur piloté, en local puis sur le canal `h10` (https://ecobudget-3b3a4--h10-kyq5toyh.web.app, expire le 28/11) :
      - `/demo` → « Tout voir » → mois en cours, « › » grisée → « ‹ » jusqu'à M-4, puis grisée → M-2 ;
      - montant modifié → retour sur M-2, avec le message et « Annuler » ;
      - dépense supprimée → retour sur M-2 → « Annuler » → la dépense revient ;
      - geste retour → Accueil ;
      - aucun débordement à 360 px ; mêmes libellés sur ordinateur ; aucun texte souligné.
    - Sur le canal, le premier passage, lancé juste après le déploiement, a échoué à l'étape du geste retour. Les trois suivants ont réussi, avec le même fichier servi que la version locale. Cause probable : la version précédente encore servie par le CDN.
    - `/demo` et le parcours de démo (`innovation.md` §5.3) passent sans compte, en local et sur le canal. `live` n'a pas changé.
  - **Choix (non fixés par la spec)** :
    - Le mois affiché est gardé dans l'adresse (`/depenses?mois=2026-09`) : le formulaire de modification revient dessus. « Tout voir » ouvre toujours le mois en cours.
    - Intertitres : « Aujourd'hui », « Hier », puis toujours « jeudi 19 novembre » (avec l'année si elle diffère, « 1er » pour le premier du mois), même dans la semaine en cours (validé par Kader le 21/11). « Dernières dépenses » garde « Jeudi » de 2 à 6 jours.
    - Mois sans dépense : pas de ligne « Total ».
    - Après la suppression de la seule dépense du plus ancien mois, l'écran reste sur ce mois (« Aucune dépense en … »). « Annuler » la fait revenir au même endroit.
    - **Différent de Graphiques** (validé par Kader le 21/11) : si les données changent pendant que l'écran est ouvert (chargement de démo), l'écran reste sur le mois affiché au lieu de revenir au mois en cours.
    - Sous-titre d'une ligne = la catégorie seule, puisque le jour est dans l'intertitre. Sans note, le titre et le sous-titre donnent tous les deux le nom de la catégorie (cas du jeu de démo).
    - Le bouton retour mène à l'Accueil (« Retour à l'Accueil »).
    - Sur l'Accueil, le nouveau « Tout voir » est lu « Tout voir les dépenses » par les lecteurs d'écran, pour le distinguer de celui des budgets.
    - Si la date d'une dépense passe dans un autre mois, le retour se fait sur l'ancien mois (« même mois », comme le dit la spec) : la dépense n'y apparaît plus.
    - « Ajouter une dépense » depuis un mois vide ramène à l'Accueil (comportement de H1, inchangé).
    - Aucune entrée de la barre du bas n'est en surbrillance sur `/depenses`.
  - **Corrigé en passant** :
    - `/depenses` était traité comme un formulaire plein écran (tout chemin commençant par `/depense`), donc sans barre du bas.
    - Deux appuis rapides sur une flèche n'avançaient que d'un mois (constaté en E2E) : le mois est maintenant tenu par l'écran, comme dans Graphiques.
    - Après une modification depuis la liste, la liste était empilée deux fois dans l'historique, et le geste retour semblait sans effet. C'est maintenant un vrai retour arrière (constaté à la relecture finale).
  - Le sélecteur de mois est un composant commun, `ui/MonthPicker.tsx` : groupe « Mois détaillé » dans Graphiques, « Mois affiché » dans Dépenses.
  - **Points mineurs de la relecture, non corrigés** :
    - « Tout voir » (le nouveau, et celui des budgets dont il reprend le style) fait environ 20 px de haut, sous les 44 px de la charte.
  - **Mise en production** le 21/11 à 20 h 00, en copiant le canal `h10` vers la production (`firebase hosting:clone ecobudget-3b3a4:h10 ecobudget-3b3a4:live`). Le code de l'application est identique à `main` : les commits faits après le déploiement du canal ne touchent que les tests et la documentation.
    - Le CDN a servi l'ancienne version pendant quelques minutes. Les essais n'ont été lancés qu'une fois le nouveau fichier servi sur `/` et `/demo`.
    - Vérifié en production, sans compte, dans un navigateur neuf :
      - `/demo` → « Tout voir » → mois en cours → « ‹ » jusqu'à M-4 → retour sur M-2 ;
      - montant modifié puis « Annuler » ; dépense supprimée puis « Annuler » ;
      - geste retour → Accueil ;
      - parcours de démo (`innovation.md` §5.3) : alerte « 4,5 fois » et conseil Sorties 2 000 DA.
  - Plan : `app/docs/plans/2026-11-21-h10-depenses.md`.

### H11 Lien « Gérer les catégories » — statut : fait (fusionné dans main le 21/11, PR n°10)
- **Scénario source** : S2 (Nadia crée la catégorie « Enfants ») ; retour n° 1 de P1 (gestion des catégories difficile à trouver dans Réglages).
- **Fonctionnalité du sujet** : transversal (F1, F2).
- **Contenu et interactions** :
  - **Formulaire Dépense** (ajout et modification, H1) : sous la grille des catégories, lien « Gérer les catégories » (bleu vif, gras, non souligné, cible de 44 px) qui ouvre Réglages directement sur la section « Catégories » (✱ `/reglages#categories`, comme `#alertes` en H7).
  - ✱ Si le formulaire contient une saisie non enregistrée (montant, note, catégorie ou date changés) : fenêtre de confirmation commune avant de quitter, titre « Quitter sans enregistrer la dépense ? », boutons « Rester » / « Quitter » (bleu, pas rouge). Sans saisie : pas de fenêtre.
  - **Écran Budgets** : ✱ sous la liste, le même lien « Gérer les catégories ».
  - Hors périmètre : créer une catégorie sans quitter le formulaire Dépense.
- **Critères visés et comment** : C1 (la gestion des catégories se trouve là où on en a besoin) ; C2 (un geste au lieu de chercher dans Réglages) ; C5 (aucune saisie perdue sans prévenir) ; C6 (même fenêtre de confirmation, même cible `#…` que « Gérer les alertes »).
- **Critères d'acceptation** :
  - Test Vitest : la fenêtre s'affiche seulement s'il y a une saisie non enregistrée.
  - Parcours dans un navigateur : formulaire vide → « Gérer les catégories » → section Catégories à l'écran ; formulaire avec un montant → fenêtre → « Rester » → montant conservé ; Budgets → lien → section Catégories.
- **Maquette** : aucune (maquettes gardées à l'état du 17/11).
- **Écarts constatés (rempli par Claude Code)** :
  - **Ajouté à la demande de Kader (21/11)** :
    - les deux « Tout voir » de l'Accueil ont une cible de 44 px, sans changement d'apparence : marges négatives, la ligne du titre garde sa hauteur ;
    - arriver sur un écran par un lien remet la page en haut (avant, `/depenses` s'ouvrait défilé comme l'Accueil). Le retour arrière garde la position, et une ancre (`#categories`, `#alertes`) défile vers sa section.
  - « Gérer les catégories » : icône réglages devant le texte ; sur Budgets, le lien est placé sous le bouton « Fixer un budget pour une catégorie ». La fenêtre n'a pas de phrase sous le titre (la spec n'en donne pas).
  - Saisie non enregistrée = montant, catégorie, date ou note différents des valeurs à l'ouverture du formulaire.
  - Vérifié : 569 tests, dont le test de la fenêtre (seulement s'il y a une saisie non enregistrée). Parcours dans un navigateur sur le canal `h11` (https://ecobudget-3b3a4--h11-3orn5787.web.app, expire le 28/11) :
    - formulaire vide → section Catégories à l'écran ;
    - montant saisi → fenêtre → « Rester » → montant conservé ;
    - Budgets → lien → section Catégories ;
    - Accueil défilé → « Tout voir » → `/depenses` en haut ;
    - `/demo` et parcours de démo sans compte : OK.
  - **Mise en production** le 21/11 à 20 h 19, en copiant le canal `h11` vers la production (code identique à `main` après la PR n°10). La nouvelle version était servie dès le premier contrôle, sur `/` et sur `/demo`. Vérifié en production, sans compte : parcours de H11 (« Tout voir » à 44 px, `/depenses` en haut, « Gérer les catégories » depuis le formulaire vide, avec montant, et depuis Budgets), parcours complet de H10, parcours de démo (`innovation.md` §5.3).

### H12 Logo et icône de l'application — statut : fait (fusionné dans main le 21/11, PR n°11)
- **Scénario source** : tous (identité de l'application) ; retour n° 2 de P1 ; décision du logo (DECISIONS.md, 21/11).
- **Fonctionnalité du sujet** : transversal.
- **Contenu et interactions** :
  - **Fichiers** : `docs/02_maquettes/logo/` (logo-blanc et logo-bleu-nuit, en PNG 512 × 512 et SVG, sans fond). Les copier dans `app/` ; ne pas les redessiner.
  - **À côté du titre « EcoBudget »**, partout où il apparaît (barre latérale sur ordinateur ; en-tête de Créer un compte et Se connecter sur ordinateur ; ✱ carte « Bienvenue sur EcoBudget » de la Première ouverture) : logo **à gauche** du titre, hauteur d'environ deux fois celle des lettres (✱ 32 px pour un titre de 22 px), centré verticalement, écart de 10 px. **Blanc sur fond bleu nuit, bleu nuit (#1E2B4F) sur fond clair**, comme le titre. ✱ `alt=""` : le titre à côté suffit.
  - **Icône de l'application** (onglet du navigateur, écran d'accueil du téléphone, manifeste de la PWA) : logo blanc sur un carré bleu nuit arrondi ; ✱ version « maskable » avec marge de sécurité ; remplace les icônes actuelles.
  - Hors périmètre : écran de démarrage animé, changement de couleur de thème.
- **Critères visés et comment** : C6 (même logo dans l'application et le diaporama, même couleur que le titre) ; C7 (un portefeuille se comprend sans texte) ; C8 (le cochon de l'ancien logo pouvait heurter le public algérien).
- **Critères d'acceptation** : logo visible et net (écran 2×) partout où le titre apparaît, sur téléphone et ordinateur ; icône correcte dans l'onglet et après installation sur Android ; aucun écran décalé.
- **Maquette** : aucune (logo non ajouté aux maquettes, DECISIONS.md 21/11).
- **Écarts constatés (rempli par Claude Code)** :
  - SVG de `docs/02_maquettes/logo/` copiés tels quels dans `app/src/assets/` (composant `ui/Brand.tsx`, 32 px, `alt=""`).
  - **En-tête de Créer un compte et Se connecter** : il n'existait pas dans l'application. Il est ajouté sur ordinateur seulement, comme les maquettes `ordinateur-09` et `10` (logo bleu nuit et « EcoBudget » en haut à gauche). Sur téléphone, rien ne change.
  - **Carte « Bienvenue sur EcoBudget »** : le titre de 26 px garde sa taille ; le logo de 32 px est centré sur ses deux lignes.
  - **Icônes** : `public/favicon.svg` est le logo blanc posé sur un carré bleu nuit arrondi (dessin du logo inchangé, métadonnées retirées). Les PNG (64, 192 et 512 px, Apple 180 px, favicon.ico, masquable 512 px avec 30 % de marge sur fond bleu nuit) sont générés par `@vite-pwa/assets-generator` (`app/pwa-assets.config.ts`). Le manifeste est inchangé (mêmes noms de fichiers).
  - **Vérifié** : 569 tests (aucun cassé, aucun ajouté). Contrôles dans un navigateur sur le canal `h12` (https://ecobudget-3b3a4--h12-ezts3iao.web.app, expire le 28/11) :
    - logo blanc dans la barre latérale et dans la carte de bienvenue ;
    - logo bleu nuit dans l'en-tête de Créer un compte et de Se connecter (ordinateur), absent sur téléphone ;
    - favicon de l'onglet et 4 icônes du manifeste servies ;
    - `/demo` et parcours de démo sans compte : OK.
  - Pas vérifié : l'installation réelle sur un téléphone Android (pas d'appareil disponible).
  - **Mise en production** le 21/11 à 20 h 33, en copiant le canal `h12` vers la production (code identique à `main` après la PR n°11). La nouvelle version et le nouveau favicon étaient servis dès le premier contrôle. Vérifié en production, sans compte : les mêmes contrôles que sur le canal, puis le parcours de démo (`innovation.md` §5.3).

### H13 Icône neutre de catégorie — statut : fait (fusionné dans main le 21/11, PR n°12)
- **Scénario source** : S2 (créer « Enfants ») ; retour n° 4 de P2 (une icône est imposée même quand aucune ne correspond).
- **Fonctionnalité du sujet** : transversal (catégories, H7).
- **Contenu et interactions** :
  - Ajouter à `CATEGORY_ICONS` une icône neutre **« Étiquette »** (contour d'étiquette, même style de trait que les autres), nom accessible « Étiquette ».
  - ✱ Formulaire « Nouvelle catégorie » : « Étiquette » **présélectionnée** (remplace « la première icône non utilisée », H7) et placée en tête de la liste. Elle peut servir à plusieurs catégories. En modification : l'icône actuelle reste sélectionnée.
  - ✱ Aide sous le choix d'icône : « Aucune ne correspond ? Gardez l'étiquette. »
  - L'icône « … » d'« Autres » n'est toujours pas proposée.
- **Critères visés et comment** : C4 (on n'est pas forcé de choisir une image qui ne correspond pas) ; C7 (une icône neutre ne trompe pas sur le contenu de la catégorie) ; C2 (rien à choisir si rien ne convient).
- **Critères d'acceptation** : tests Vitest de la présélection (nouvelle catégorie → « Étiquette » ; modification → icône actuelle) ; « Étiquette » affichée partout où l'icône d'une catégorie apparaît (listes, formulaire Dépense, Budgets, Graphiques) ; mettre à jour les tests de H7 qui attendaient « Bébé ».
- **Maquette** : aucune.
- **Écarts constatés (rempli par Claude Code)** :
  - Icône `Tag` de lucide (même style de trait que les autres), en tête de `PICKABLE_ICONS`, nom accessible « Étiquette ». Toujours présélectionnée pour une nouvelle catégorie, même si une autre l'utilise déjà : `defaultIcon` ne cherche plus « la première non utilisée ». En modification, l'icône actuelle est gardée.
  - Aide « Aucune ne correspond ? Gardez l'étiquette. » sous la grille d'icônes.
  - Tests : ceux de H7 qui attendaient « Bébé » attendent maintenant « Étiquette ». Un test ajouté : nouvelle catégorie → « Étiquette » en tête et présélectionnée ; modification → icône actuelle gardée. 570 tests au total.
  - Graphiques n'affiche pas d'icône (pastille de couleur et nom) : « Enfants » y est vérifiée dans la légende et dans le menu.
  - Vérifié dans un navigateur sur le canal `h13` (https://ecobudget-3b3a4--h13-ljv1kino.web.app, expire le 28/11) :
    - Réglages › Ajouter une catégorie → « Étiquette » en tête et sélectionnée, avec l'aide ;
    - « Enfants » créée : étiquette dans le formulaire Dépense et dans Budgets (Hors budget), présente dans Graphiques ;
    - `/demo` et parcours de démo sans compte : OK.
  - **Mise en production** le 21/11 à 20 h 42, en copiant le canal `h13` vers la production (code identique à `main` après la PR n°12). La nouvelle version était servie au deuxième contrôle. Vérifié en production, sans compte : les mêmes contrôles que sur le canal, puis le parcours de démo (`innovation.md` §5.3).

### H14 Compte plus visible — statut : à faire
- **Scénario source** : S3 (Yasmine crée un compte puis se connecte sur son PC) ; retour n° 6 de P3 (créer un compte ou se connecter n'est pas assez clair, surtout quand l'appareil contient déjà des dépenses).
- **Fonctionnalité du sujet** : transversal (H9).
- **Contenu et interactions** :
  - **Réglages › Compte, sans compte, si l'appareil a au moins une dépense** : ✱ sous le texte actuel, une ligne en gras « Vos 12 dépenses seront conservées si vous créez un compte. » (« Votre dépense sera conservée… » pour une seule). Sans dépense : texte de H9 inchangé. Boutons inchangés (« Créer un compte » en bleu, « Se connecter » en contour).
  - **Se connecter**, quand l'avertissement « Cet appareil contient N dépenses… » est affiché : ✱ juste sous l'avertissement, lien « Les garder : créer un compte » (bleu vif, gras, non souligné), qui ouvre Créer un compte avec l'adresse déjà saisie.
  - Rien d'autre ne change dans H9 (pas de fusion des données).
- **Critères visés et comment** : C1 (le bon choix est indiqué au bon moment) ; C5 (on évite de perdre ses dépenses en se connectant par erreur) ; C2 (le compte reste facultatif, rien n'est ajouté à l'Accueil).
- **Critères d'acceptation** : tests Vitest (ligne absente sans dépense, singulier pour une, lien seulement avec l'avertissement) ; parcours : `/demo` → Réglages › Compte → ligne avec le nombre de dépenses du jeu de démo → « Se connecter » → avertissement et lien → lien → Créer un compte avec l'adresse remplie.
- **Maquette** : aucune (maquettes gardées à l'état du 17/11).
- **Écarts constatés (rempli par Claude Code)** :
