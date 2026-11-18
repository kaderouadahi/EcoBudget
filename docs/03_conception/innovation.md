# Fonctionnalité innovante — fiche de conception

**Sujet :** recommandations ou détection de dépenses inhabituelles, dans une interface simple et compréhensible.
**Décidé (voir DECISIONS.md) :** alerte de dépense inhabituelle, puis conseil, calculés par règles statistiques explicables.

## 1. Besoin réel adressé
Voir `docs/01_analyse/besoins.md` §7.
- **B6** Être prévenu avant de dépasser le budget : seules 18 % des 45 applications étudiées par Alenazi & Sas le font.
- **B9** Comprendre pourquoi une dépense est signalée : expliquer une recommandation améliore son acceptation (Herlocker et al., CSCW 2000).
- **B10** Garder la main (accepter, ignorer, désactiver) : le manque de contrôle freine l'usage des applications de budget (études citées par Alenazi & Sas 2023).

## 2. Comportement attendu
- **Alerte** : quand une dépense sort des habitudes (§2.1 à §2.3, décidé le 18/11/2026).
- **Conseil** : une action concrète et chiffrée, issue des mêmes données (§2.4, décidé le 18/11/2026).
- **Pourquoi ?** : la comparaison expliquée en une phrase.
- **Contrôle** : l'alerte informe sans rien déclencher ; « Compris », « Gérer les alertes », désactivation dans Réglages. Le conseil fonctionne de la même façon : « Compris », « Gérer les conseils ».

### 2.1 Alerte de dépense inhabituelle : la règle
Le calcul se fait à l'enregistrement d'une dépense, si les alertes sont activées dans Réglages.

1. **Historique de référence** : les dépenses de la même catégorie enregistrées avant celle-ci.
   - S'il y en a **au moins 5 sur les 8 dernières semaines** : on les prend toutes.
   - Sinon : les **5 dernières dépenses** de la catégorie, à condition que la plus ancienne date de **moins de 6 mois**.
   - Sinon : **pas d'alerte** (pas assez de données pour parler d'habitude).
2. **Habitude** = médiane des montants de cet historique.
3. La dépense est **inhabituelle** si son montant dépasse **3 fois la médiane** **et** la dépasse d'**au moins 1 000 DA**.

Pourquoi la médiane : on compare une dépense à une dépense habituelle (même unité des deux côtés), et une ancienne dépense exceptionnelle ne fausse pas le calcul.
Pourquoi le minimum de 1 000 DA : sans lui, un café à 200 DA au lieu de 50 DA (4 fois plus) déclencherait une alerte sans intérêt.
Les seuils (3 fois, 1 000 DA, 5 dépenses, 8 semaines, 6 mois) sont des choix de conception, pas des valeurs issues d'une étude : ils seront ajustés après les tests L3 si besoin.

| Cas | Historique retenu | Résultat |
|---|---|---|
| Sorties, environ deux fois par semaine | Les dépenses des 8 dernières semaines (environ 16) | Alerte possible ; S4 : 4 500 DA contre une médiane de 1 000 DA, soit 4,5 fois et 3 500 DA de plus → alerte |
| Santé, une fois par mois depuis 5 mois | 2 dépenses sur 8 semaines, donc les 5 dernières (toutes dans les 6 mois) | Alerte possible |
| Santé, 3 dépenses en tout sur 6 mois | Moins de 5 dépenses | Pas d'alerte |
| Café, médiane 50 DA, dépense de 200 DA | — | 4 fois plus, mais seulement 150 DA de plus → pas d'alerte |

### 2.2 La phrase « Pourquoi ? »
Toujours le même modèle (C6), avec les chiffres et la période du calcul (C1, C7) :

> « D'habitude, une dépense en [catégorie] est d'environ [médiane] DA. Celle-ci est [rapport] fois plus élevée. Calcul fait sur vos [N] dépenses en [catégorie] depuis le [date de la plus ancienne]. »

Exemple S4 (chiffres d'illustration, le jeu de démo est fixé au §5) : « D'habitude, une dépense en Sorties est d'environ 1 000 DA. Celle-ci est 4,5 fois plus élevée. Calcul fait sur vos 16 dépenses en Sorties depuis le 21 septembre. »
Affichage : médiane arrondie à la centaine de DA, rapport avec une décimale.

### 2.3 Écran Alerte et contrôle
- L'alerte **informe seulement** : elle ne déclenche aucune action et ne modifie rien.
- Un seul bouton, **« Compris »**, qui ferme l'alerte. La dépense compte ensuite dans l'historique comme les autres.
- Un lien **« Gérer les alertes »** vers Réglages, pour désactiver les alertes là où elles gênent.
- Réglages, section « Alertes et conseils » : interrupteur « Dépenses inhabituelles » et la phrase « Les alertes d'une catégorie démarrent après 5 dépenses. »
- Pas d'historique des alertes dans cette version. Une marque « Inhabituelle » sur la dépense (avec accès au « Pourquoi ? ») est prévue après les tests L3.

### 2.4 Conseil d'épargne : la règle
Calculé au début de chaque mois, si les conseils sont activés dans Réglages. Un seul conseil à la fois, pour l'objectif en cours dont la date visée est la plus proche.

1. **Catégorie visée** : celle dont la dépense du **mois dernier** dépasse le plus son **habitude**, c'est-à-dire la médiane des dépenses mensuelles des **3 mois précédents**. Santé et Logement sont exclues.
2. **Réduction proposée** : cette hausse, arrondie à 500 DA en dessous. Si elle vaut 0, pas de conseil.
3. **Rythme prévu** : reste à épargner ÷ mois restants jusqu'au mois visé (novembre 2026 → juin 2027 : 7 mois).
4. **Mois nécessaires avec la réduction** : reste ÷ (rythme prévu + réduction), arrondi au mois supérieur.
5. **Gain** = mois restants − mois nécessaires. Le conseil ne s'affiche que si le gain est d'au moins 1 mois.

Pas de conseil si :
- il n'y a pas au moins 4 mois d'historique (le mois dernier et les 3 mois précédents) ;
- l'objectif est atteint ou sa date visée est passée ;
- aucune catégorie n'a augmenté d'au moins 500 DA.

Pourquoi le rythme prévu : l'application n'enregistre pas les versements datés sur un objectif ; la date visée suffit, dès la création de l'objectif. Limite assumée : le calcul suppose que l'utilisateur suit son plan, et la phrase le dit (« pour atteindre… en juin 2027, il faut… »).

Vérification sur le prototype : reste 60 000 DA, 7 mois, rythme prévu ≈ 8 600 DA par mois ; avec 2 000 DA de plus, 60 000 ÷ 10 571 ≈ 5,7, donc 6 mois : un mois plus tôt.

**Carte Conseil** (écran Objectifs) :
> « En réduisant vos [catégorie] de [réduction] DA par mois, vous atteindriez « [objectif] » [gain] mois plus tôt. »

**« Pourquoi ? »** (même principe que l'alerte : chiffres et période) :
> « Pour atteindre « [objectif] » en [mois visé], il faut mettre de côté environ [rythme prévu] DA par mois. Avec [réduction] DA de plus, [mois nécessaires] mois suffiraient au lieu de [mois restants]. Le mois dernier, vos dépenses en [catégorie] ont atteint [montant] DA, contre environ [habitude] DA d'habitude. »

Exemple S3 : « Pour atteindre « Ordinateur portable » en juin 2027, il faut mettre de côté environ 8 600 DA par mois. Avec 2 000 DA de plus, 6 mois suffiraient au lieu de 7. Le mois dernier, vos dépenses en Sorties ont atteint 7 000 DA, contre environ 5 000 DA d'habitude. »
Affichage : montants arrondis à la centaine de DA.

**Contrôle** :
- Le conseil **informe seulement** : il ne modifie aucun budget ni objectif.
- **« Compris »** masque le conseil jusqu'au mois suivant, quand le calcul est refait.
- Lien **« Gérer les conseils »** vers Réglages, section « Alertes et conseils », interrupteur « Conseils d'épargne ».
- Pas d'historique des conseils dans cette version (voir DECISIONS.md, à vérifier pendant les tests L3).

## 3. Critères servis
Alerte :
- **C1 Guidage** : l'alerte et son « Pourquoi ? » préviennent et expliquent ; la phrase de Réglages dit quand les alertes démarrent.
- **C2 Charge de travail** : rien à décider devant l'alerte, un seul bouton.
- **C3 Contrôle explicite** : l'alerte ne déclenche aucune action ; l'utilisateur la ferme ou la désactive.
- **C4 Adaptabilité** : alertes désactivables ; l'habitude est calculée sur les dépenses de chaque utilisateur.
- **C5 Gestion des erreurs** : peu de fausses alertes (5 dépenses minimum, 3 fois et au moins 1 000 DA de plus).
- **C6 Homogénéité** : même modèle de phrase pour toutes les catégories.
- **C7 Signifiance** : une phrase en langage courant, avec les chiffres et la période du calcul.

Conseil :
- **C1 Guidage** : la carte et son « Pourquoi ? » montrent comment avancer vers l'objectif.
- **C2 Charge de travail** : rien à décider, un seul bouton.
- **C3 Contrôle explicite** : le conseil ne modifie rien ; l'utilisateur le ferme ou le désactive.
- **C4 Adaptabilité** : conseils désactivables séparément des alertes ; calcul fait sur les dépenses et l'objectif de chaque utilisateur.
- **C5 Gestion des erreurs** : pas de conseil sur des données insuffisantes ou un objectif clos.
- **C6 Homogénéité** : même fonctionnement que l'alerte (« Pourquoi ? », « Compris », lien vers Réglages).
- **C7 Signifiance** : revenir à son habitude plutôt que se priver ; phrase sans reproche, avec les chiffres.
- **C8 Compatibilité** : s'appuie sur la comparaison mensuelle que l'utilisateur voit déjà dans Graphiques.

## 4. Au-delà du classique (§8)
Sources : voir `docs/01_analyse/besoins.md`. Rien n'est affirmé sur les applications concurrentes au-delà de ce que disent ces sources.

**Originalité**
- Les applications de budget enregistrent, classent et affichent ; le suivi des dépenses se retrouve partout (Alenazi & Sas 2023). EcoBudget ajoute une couche qui **lit les dépenses et prévient l'utilisateur**.
- Chaque alerte et chaque conseil a son **« Pourquoi ? » chiffré** : l'habitude, l'écart et la période du calcul. Pas de boîte noire : des règles simples (une médiane), choisies exprès pour pouvoir tout expliquer.
- L'utilisateur est comparé à **ses propres habitudes**, pas à une moyenne générale.
- Le conseil relie les dépenses à un projet : un écart de dépenses devient du **temps gagné sur un objectif** (« un mois plus tôt »), et non un reproche.

**Pertinence**
- Répond au troisième constat de la problématique : les applications préviennent trop tard (18 %, Alenazi & Sas) ou sans dire pourquoi, alors qu'une explication rend une recommandation mieux acceptée (Herlocker et al. 2000). Besoins B6 et B9.
- Fonctionne **sans banque**, avec les seules dépenses saisies, ce qui convient à un pays où l'on paie surtout en espèces (Findex).
- Ton sans reproche, « revenir à son habitude » plutôt que se priver, parce que l'argent touche aux émotions (Kaye et al. 2014). Besoin B12.
- L'utilisateur garde la main : l'innovation ne déclenche jamais d'action, et chaque partie se désactive séparément. Besoin B10.

**Intégration dans le parcours** (sujet §6, « réellement intégrée »)
- L'alerte naît de l'action la plus fréquente (ajouter une dépense) et s'affiche sur l'Accueil ; le conseil apparaît dans Objectifs ; les réglages sont dans Réglages. Ni écran à part ni module séparé.
- Elle n'utilise que les données déjà saisies pour F1, F2 et F4 : rien à configurer en plus (C2).
- Même fonctionnement partout : « Pourquoi ? », « Compris », lien vers Réglages (C6).

**Limites assumées** (à dire si on nous les oppose)
- Les seuils (3 fois, 1 000 DA, 5 dépenses) sont des choix de conception, à ajuster après les tests.
- Le conseil suppose que l'utilisateur suit son plan d'épargne.
- Pas d'alerte dans une catégorie rare tant qu'elle n'a pas 5 dépenses sur 6 mois.
- Les besoins viennent de la recherche publiée et restent à confirmer en L3.

**Dans le diaporama** (tâche 15) : la pertinence est déjà sur la diapositive 21 ; originalité, intégration et règle de calcul à ajouter dans la partie 09, avant la démo ; limites dans les notes de l'orateur.

## 5. Démonstration

### 5.1 Principe
- **Un seul profil** de démo, sans prénom (l'Accueil affiche « Bonjour »), qui enchaîne l'alerte (S4) et le conseil (S3) sans changer de compte.
- Dates **relatives au jour de la démo** : M = mois de la démo, M-1 = mois dernier, etc. Jours entre le 1er et le 28.
- Chiffres vérifiés par calcul : la médiane des Sorties reste à 1 000 DA pour n'importe quel jour de démo du 1er au 28.
- La façon de charger ces données dans l'application relève de la spec pour Claude Code (tâche 09, `HANDOFF.md`).

### 5.2 Données
**Sorties** (aucune dépense en M avant la démo) :

| Mois | Jour : montant (DA) | Total |
|---|---|---|
| M-4 | 3 : 800 · 9 : 900 · 15 : 1 000 · 21 : 1 100 · 26 : 1 200 | 5 000 |
| M-3 | 2 : 600 · 8 : 900 · 14 : 1 000 · 20 : 1 100 · 27 : 1 200 | 4 800 |
| M-2 | 4 : 700 · 10 : 1 000 · 16 : 1 000 · 22 : 1 200 · 27 : 1 300 | 5 200 |
| M-1 | 2 : 600 · 6 : 800 · 10 : 1 000 · 14 : 1 000 · 18 : 1 000 · 22 : 1 200 · 27 : 1 400 | 7 000 |

**Autres catégories**, stables pour que Sorties soit la seule à augmenter : Courses 30 000 DA par mois, Transport 3 000 DA par mois, de M-4 à M-1, répartis en plusieurs dépenses.

**Objectifs d'épargne** :

| Objectif | Épargné | Montant visé | Date visée |
|---|---|---|---|
| Ordinateur portable | 90 000 DA | 150 000 DA | M+7 |
| Réserve de sécurité | 12 000 DA | 50 000 DA | M+13 |

Résultats attendus :
- Alerte : médiane des Sorties = 1 000 DA ; une dépense de 4 500 DA donne 4,5 fois et 3 500 DA de plus → alerte.
- Conseil : Sorties M-1 = 7 000 DA contre une habitude de 5 000 DA (médiane de 5 000, 4 800, 5 200) → réduction de 2 000 DA. Ordinateur portable (date la plus proche) : 60 000 DA en 7 mois, soit environ 8 600 DA par mois ; avec 2 000 DA de plus, 6 mois → un mois plus tôt. Réserve de sécurité : pas de conseil (un seul conseil à la fois).

### 5.3 Script de démo
1. **Accueil** : présenter le reste à dépenser et les budgets.
2. **Ajouter une dépense** : 4 500 DA en Sorties (« anniversaire d'un ami »), puis « Enregistrer la dépense ».
3. **Alerte** : la carte « Dépense inhabituelle en Sorties » apparaît sur l'Accueil ; toucher « Pourquoi ? ». Phrase attendue : « D'habitude, une dépense en Sorties est d'environ 1 000 DA. Celle-ci est 4,5 fois plus élevée. Calcul fait sur vos [N] dépenses en Sorties depuis le [date]. » N et la date dépendent du jour de la démo.
4. Toucher **« Compris »** ; montrer le lien « Gérer les alertes ».
5. **Objectifs** : carte Conseil « En réduisant vos sorties de 2 000 DA par mois, vous atteindriez « Ordinateur portable » un mois plus tôt. » ; toucher « Pourquoi ? » : « Pour atteindre « Ordinateur portable » en [M+7], il faut mettre de côté environ 8 600 DA par mois. Avec 2 000 DA de plus, 6 mois suffiraient au lieu de 7. Le mois dernier, vos dépenses en Sorties ont atteint 7 000 DA, contre environ 5 000 DA d'habitude. » Puis « Compris ».
6. **Réglages**, section « Alertes et conseils » : les deux interrupteurs, et la phrase « Les alertes d'une catégorie démarrent après 5 dépenses. »
