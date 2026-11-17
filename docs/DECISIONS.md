# Décisions du projet

Une ligne par décision. Rien de technique n'est fixé tant que ce n'est pas écrit ici.

| Date | Décision | Pourquoi | Critère(s) | Par |
|---|---|---|---|---|
| | Cible : grand public, découpé en 2 ou 3 personas contrastés | Rendre possible le choix d'utilisateurs représentatifs pour les tests (L3) | C4, C8 | binôme |
| | Support : web responsive (mobile et ordinateur) | Saisie en déplacement et consultation au calme | C6, C8 | binôme |
| | Innovation : alerte de dépense inhabituelle, puis conseil | Couvre « recommandations » et « détection » du sujet | INNOV | binôme |
| | Calcul de l'innovation : règles statistiques explicables | Bouton « Pourquoi ? » exact, démo fiable | C3, C7 | binôme |
| 2026-11-06 | Tests L3 avec au moins 3 participants réels, même si l'enseignant accepte des utilisateurs fictifs | Résultats défendables à l'oral, conformes à la démarche centrée utilisateur (§6) | C8 | binôme |
| 2026-11-06 | En plus du PowerPoint : une fiche produit Notion privée, au format WeValue | Choix personnel, hors exigences du sujet | — | Kader |
| 2026-11-06 | Code remis en zip ; application déployée en ligne tant que l'hébergement est gratuit (hébergeur choisi avec la stack) | Démo accessible sans installation | C8 | Kader |
| 2026-11-16 | Analyse des besoins sans entretiens ni questionnaire : recherche documentaire et études publiées ; besoins confirmés par les tests L3 | Sources vérifiables, rien d'inventé, tenable avant le 20/11 | C8 | binôme |
| 2026-11-16 | Livrables L1 et L3 en fichier PowerPoint (.pptx) dans livrables/, une seule charte pour les deux | Format demandé (§5), versionné dans le dépôt avec le reste | C6 | binôme |
| 2026-11-16 | Personas : Amine (étudiant), Yasmine (jeune active), Nadia (mère de famille) | Contrastés par revenu, paiement, aisance numérique et objectif ; servent de grille de recrutement L3 | C4, C8 | binôme |
| 2026-11-16 | Scénarios : S1 première dépense (Amine), S2 budget des courses (Nadia), S3 point du soir (Yasmine), S4 dépense inhabituelle (Amine) ; 7 écrans en découlent | Un écran = au moins un scénario (règle 7.2) ; S4 sert aussi de script de démo de l'innovation | C1, C3, C8 | binôme |
| 2026-11-17 | Support précisé : application web pensée d'abord pour le téléphone, installable (PWA), utilisable aussi sur ordinateur | Saisie au moment de la dépense, sensation d'application ; garde l'usage sur ordinateur et les tests par simple lien | C2, C6, C8 | binôme |
| 2026-11-17 | Stack : React + Vite + TypeScript, PWA, bibliothèque de graphiques, tests Vitest ; Firebase (Authentication, Firestore, Hosting) | Rapide à construire et à tester dans le délai ; comptes et synchronisation fournis par Firebase | C8 | binôme |
| 2026-11-17 | Données et comptes : compte anonyme créé automatiquement (aucune inscription), données dans Firestore avec copie hors connexion ; compte e-mail facultatif pour retrouver ses données sur un autre appareil ; message clair dans les réglages ; règles de sécurité « chacun ses données », testées à l'émulateur. Si retard : la création de compte est la première fonctionnalité retirée | Prise en main immédiate (B11) et synchronisation téléphone / ordinateur (Yasmine) ; transparence sur l'enregistrement anonyme | C2, C3, C8 | binôme |
| 2026-11-17 | Hébergement : Firebase Hosting (gratuit, HTTPS) | Même service que les données ; HTTPS nécessaire à l'installation de la PWA | C8 | binôme |
| 2026-11-17 | Maquettes : Claude Design, version téléphone d'abord puis ordinateur pour chaque écran ; exports (PDF/PNG) dans docs/02_maquettes/ | Gain de temps, même charte que L1, exports versionnés | C6, C8 | binôme |
| 2026-11-17 | Un seul diaporama (livrables/EcoBudget.pptx) qui suit le cycle de vie et couvre L1, la démo de L2, L3 et L4 ; parcours de 15 min indiqué dans les notes ; annexe PDF facultative regroupant les documents de docs/ (remplace la ligne du 16/11 sur L1 et L3 séparés) | Demande de l'enseignante (17/11) ; le plan montre lui-même le cycle de vie | C6 | binôme |
