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
  - Plan : `app/docs/plans/2026-11-19-h2-budgets.md`.
