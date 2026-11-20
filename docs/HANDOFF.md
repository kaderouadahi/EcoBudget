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

## Ordre de priorité (décidé le 18/11/2026, H8 avancée le 20/11/2026)
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
| 10 | H9 Compte e-mail facultatif | Transversal (première fonction retirée en cas de retard) |

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

### H5 Conseil d'épargne — statut : fait (branche h5-conseil, à relire avant fusion)
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

### H8 Données de démo — statut : à faire
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
