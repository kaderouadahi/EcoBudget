# EcoBudget — Projet IHM ING4 Software Engineering (USTHB)

Lu automatiquement par **Claude Code** (mémoire du dépôt) et par **Cowork** (instructions de dossier).
Source unique de règles pour les deux outils. Toute modification est décidée à deux et commitée.

## 1. Source de vérité
- Sujet officiel : `docs/00_sujet/Projet_IHM_ING4.pdf`, résumé dans `docs/00_sujet/exigences.md`.
- **Le sujet prime sur tout.** Ne jamais présenter comme obligatoire une exigence absente du sujet.
- Décisions prises : `docs/DECISIONS.md`. Ambiguïtés du sujet : `docs/QUESTIONS.md`. Ne rien trancher en silence.
- Une réponse de l'enseignant notée dans QUESTIONS.md a la même autorité que le sujet ; tant qu'une question est sans réponse, ne pas faire d'hypothèse.

## 2. Ce qu'on construit (sujet §2, Thème 4)
Application de gestion financière personnelle : suivre les dépenses, gérer le budget, planifier des objectifs financiers.
- **F1** Enregistrement et catégorisation des dépenses
- **F2** Budgets mensuels
- **F3** Graphiques
- **F4** Suivi des objectifs d'épargne
- **INNOV** Recommandations ou détection de dépenses inhabituelles, dans une interface simple et compréhensible.
  Clairement identifiée (§4), réellement intégrée à l'application (§6), démontrée (Livrable 2).

## 3. Les 8 critères de Bastien et Scapin (sujet §3)
Chaque critère doit être **justifié par des éléments concrets de l'application**. On s'en tient aux 8 critères du tableau du sujet, sans sous-critères (voir `docs/QUESTIONS.md`).

| ID | Critère | Attendu (formulation du sujet) |
|----|---------|--------------------------------|
| C1 | Guidage | Faciliter l'orientation et l'interaction grâce aux informations, aides et retours fournis par le système |
| C2 | Charge de travail | Minimiser les efforts cognitifs et les actions nécessaires à la réalisation des tâches |
| C3 | Contrôle explicite | Garantir que l'utilisateur conserve le contrôle des actions exécutées par le système |
| C4 | Adaptabilité | Adapter l'interface aux besoins, préférences et caractéristiques des utilisateurs |
| C5 | Gestion des erreurs | Prévenir les erreurs, les détecter et permettre leur correction |
| C6 | Homogénéité / Cohérence | Assurer une présentation et un fonctionnement cohérents à travers les écrans |
| C7 | Signifiance des codes et dénominations | Employer des termes, icônes, couleurs et symboles compréhensibles et adaptés |
| C8 | Compatibilité | Assurer l'adéquation entre l'interface, les utilisateurs, leurs tâches et leur environnement de travail |

Traçabilité : `docs/03_conception/matrice_criteres.md`, tenue à jour en permanence.

## 4. Exigences de réalisation (sujet §4)
- **E1** Analyse des besoins des utilisateurs
- **E2** Définition des profils utilisateurs et des scénarios d'utilisation
- **E3** Réalisation des maquettes et d'un prototype interactif
- **E4** Développement d'une application fonctionnelle
- **E5** Intégration d'une fonctionnalité innovante clairement identifiée
- **E6** Évaluation ergonomique de l'application
Technologies libres, à condition de permettre une application fonctionnelle et de qualité.

## 5. Livrables (sujet §5) — présentés en PowerPoint
Rendu le **17 novembre 2026**. L1 et L3 : diapositives uniquement, pas de rapport écrit. Code source remis en archive zip (voir `docs/QUESTIONS.md`).
- **L1 Rapport de conception** : présentation du thème ; analyse des besoins ; utilisateurs cibles ; scénarios d'utilisation ; maquettes et prototype ; justification de l'application des huit critères.
- **L2 Application réalisée** : code source ; application fonctionnelle ; démonstration de la fonctionnalité innovante.
- **L3 Rapport d'évaluation ergonomique** : tests avec au moins trois utilisateurs représentatifs ; problèmes ergonomiques identifiés ; améliorations proposées.
- **L4 Présentation** : présentation du projet ; démonstration pratique ; justification des choix ergonomiques et innovants.

## 6. Organisation et évaluation (sujet §6, §8)
- Binôme, un seul thème, démarche de conception centrée utilisateur.
- Innovation réellement intégrée ; présentation avec démonstration pratique.
- Consigne finale : ne pas se limiter à des fonctionnalités classiques. Essentiels : originalité, pertinence de l'innovation, qualité ergonomique, justification des choix de conception.

## 7. Règles de travail pour Claude
1. **Traçabilité.** Tout écran ou comportement se rattache à un besoin (E1), un scénario (E2) et un ou plusieurs critères C1–C8. Mettre la matrice à jour dans le même travail.
2. **Centré utilisateur.** Partir des personas et scénarios de `docs/01_analyse/`. Un écran sans scénario se signale, il ne se conçoit pas.
3. **Jamais de faux résultats.** Protocoles, grilles et analyses de notes réelles : oui. Participants, citations, mesures ou résultats inventés : jamais.
4. **Expliquer le pourquoi** de chaque choix en une ou deux phrases, avec le critère concerné, pour que le binôme puisse le défendre à l'oral.
5. **Rien sans feu vert.** Aucune modification de fichier ni de Notion (statut, commentaire, contenu) sans validation préalable. Claude liste les modifications prévues, attend l'accord, applique, puis répond seulement « Fait ». Pour un changement de périmètre ou de structure : options et recommandation avant la liste.
6. **Rien de technique tant que ce n'est pas dans DECISIONS.md** (stack, stockage, outils).
7. **Territoires** (voir `docs/WORKFLOW.md`) : Cowork écrit dans `docs/` et `livrables/`, Claude Code dans `app/`. Les demandes passent par `docs/HANDOFF.md`.
8. **Tâches** : la todo list du projet est dans Notion. En début de session, lire le dernier commentaire de la tâche en cours. En fin de session, mettre à jour le statut de la tâche et y ajouter un commentaire : ce qui a été fait, où on s'est arrêté, prochaine étape.
9. **Langue** : documents et interface en français.

## 8. Principes ergonomiques transverses (C1, C3, C5, C6, C7)
- Un concept = un mot, partout (« Dépense », « Budget », « Objectif d'épargne », « Catégorie »).
- Code couleur constant (ex. vert / orange / rouge pour l'état d'un budget), **jamais la couleur seule** : toujours icône et texte.
- Une seule charte graphique pour tous les écrans, mobile comme ordinateur : seule la disposition change.
- Formulaires : valeurs par défaut pertinentes, erreurs signalées au bon champ avec la façon de corriger.
- Action destructive : confirmation **et** possibilité d'annuler.
- Retour visible après chaque action.
- L'innovation est **explicable** (« Pourquoi ? ») et **contrôlable** (ignorer, accepter, désactiver).

## 9. Règles pour Claude Code (dossier app/, quand la stack sera décidée)
- Mode plan avant chaque fonctionnalité ; coder seulement après validation.
- Une branche par fonctionnalité, petits commits ; l'autre membre relit avant la fusion dans main.
- Tests pour la logique de l'innovation et des calculs de budget.
