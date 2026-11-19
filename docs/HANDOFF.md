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

## Ordre de priorité (décidé le 18/11/2026)
Si le temps manque, les specs du bas sont les premières à tomber. Sources : `docs/DECISIONS.md` (prime en cas d'écart avec une maquette), `docs/01_analyse/scenarios.md`, `docs/03_conception/innovation.md`, `docs/02_maquettes/`.

| Ordre | Spec | Fonctionnalité |
|---|---|---|
| 1 | H0 Socle | Transversal |
| 2 | H1 Dépenses | F1 |
| 3 | H2 Budgets | F2 |
| 4 | H3 Alerte de dépense inhabituelle | INNOV |
| 5 | H4 Objectifs d'épargne | F4 |
| 6 | H5 Conseil d'épargne | INNOV |
| 7 | H6 Graphiques | F3 |
| 8 | H7 Réglages | Transversal |
| 9 | H8 Données de démo | Démo (L2, L4) |
| 10 | H9 Compte e-mail facultatif | Transversal (première fonction retirée en cas de retard) |

Les choix marqués ✱ ont été proposés par Cowork et validés par le binôme le 19/11/2026.

---

### H0 Socle — statut : fait (branche h0-socle, à relire avant fusion)
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

### H1 Dépenses — statut : fait (branche h1-depenses, à relire avant fusion)
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

### H2 Budgets — statut : fait (branche h2-budgets, à relire avant fusion)
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

### H3 Alerte de dépense inhabituelle — statut : fait (branche h3-alerte, à relire avant fusion)
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
