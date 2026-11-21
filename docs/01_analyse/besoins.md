# Besoins utilisateurs (E1)

Mis à jour le 16/11/2026. Méthode décidée : voir `docs/DECISIONS.md` (16/11/2026).

## 1. Méthode

Ni entretiens ni questionnaire (décisions du binôme). L'analyse s'appuie sur trois types de sources publiques et vérifiables :

- **Contexte algérien** : Banque mondiale (Global Findex 2025) et DataReportal (Digital 2025: Algeria).
- **Recherche** : IHM sur la gestion de l'argent et les applications de budget (Kaye et al. 2014 ; Alenazi & Sas 2023 et leur étude des fonctionnalités ; Herlocker et al. 2000 ; Fröhlich et al. 2021) et psychologie de la motivation (Kivetz et al. 2006).
- **Avis d'utilisateurs** : une analyse publiée d'avis négatifs sur des applications de budget. Source secondaire, utilisée seulement en appui.

**Statut « établi »** : le besoin est appuyé par au moins une source publiée. Il n'a pas été vérifié directement auprès de nos utilisateurs cibles : la confirmation se fait lors des tests L3, sur une première version de l'application (MVP), puis sur l'application finale.

## 2. Contexte d'usage : l'argent en Algérie

- Environ **35 %** des adultes avaient un compte dans une institution financière en 2024, en baisse (Global Findex, analysé par Achouri et al. 2026).
- Parmi les acheteurs en ligne interrogés par le Findex 2025 en Algérie, environ **60 %** paient en espèces à la livraison, 14 % en ligne et 26 % des deux façons. L'échantillon est petit (environ 100 personnes) : c'est une indication.
- L'écart entre hommes et femmes dans la détention de compte est de **34 points**, le plus élevé de la région Moyen-Orient et Afrique du Nord (FinDev Gateway, d'après le Findex 2025).
- **36,2 millions** d'internautes en janvier 2025 (DataReportal).

**Implication** : pour la majorité des gens, aucune connexion à un compte bancaire n'est possible. Les dépenses, souvent payées en espèces, se saisissent à la main, sur téléphone. La rapidité de saisie est donc le premier besoin.

## 3. Problématique

> Comment aider des personnes qui paient surtout en espèces à suivre leurs dépenses et à tenir leur budget, alors que les applications existantes découragent par l'effort de saisie, aident peu à budgéter, et préviennent trop tard ou sans s'expliquer ?

Elle repose sur trois constats :

1. **Le paiement en espèces domine.** Une connexion bancaire est impossible pour la majorité, donc la saisie est forcément manuelle (§2, Findex).
2. **Les applications suivent les dépenses mais aident peu à budgéter**, et la saisie rebute (§4, Alenazi & Sas ; Kaye et al.).
3. **Elles préviennent trop tard** (seulement 18 % le font avant le dépassement), **et une alerte sans explication suscite la méfiance** (§4, Alenazi & Sas ; Herlocker et al.).

### Problèmes rencontrés par les utilisateurs

Problèmes relevés dans les études publiées, pas auprès de nos propres participants. Repris dans L1 (diapositive « Les problèmes rencontrés par les utilisateurs »).

| Problème rencontré | Ce qu'on en tire | Besoins | Sources |
|---|---|---|---|
| Suivre ses dépenses demande trop d'effort : on paie en espèces, tout noter est fastidieux, et on finit par abandonner l'application | Une saisie en quelques secondes, une prise en main immédiate | B1, B2, B11 | Findex ; Alenazi & Sas ; Fröhlich et al. |
| On découvre trop tard un dépassement ou une dépense qui sort de l'ordinaire | Prévenir avant le seuil, repérer l'inhabituel | B6, B9 | Alenazi & Sas (18 %) |
| Quand l'application prévient, elle culpabilise ou ne dit pas pourquoi | Un ton qui ne juge pas, un « Pourquoi ? » sur chaque alerte | B9, B10, B12 | Kaye et al. ; Herlocker et al. |
| On ne sait pas où part son argent | Des graphiques par catégorie et d'un mois à l'autre | B5, B7 | Alenazi & Sas (recommandations) — le moins bien sourcé : aucune étude ne mesure ce problème directement |
| On a du mal à tenir ses objectifs d'épargne | Une progression visible et valorisée | B8 | Kivetz et al. |

Les besoins du §6 répondent à cette problématique ; l'innovation répond directement au troisième constat (§7).

## 4. Apports de la recherche

| Source | Constat (reformulé) | Implication pour EcoBudget |
|---|---|---|
| Kaye et al., CHI 2014 (14 personnes, région de San Francisco) | La relation à l'argent a une forte dimension émotionnelle. | Ton non culpabilisant (B12). |
| Études citées par Alenazi & Sas 2023 (Kaye ; Snow & Vyas ; Vyas et al.) | Les outils papier (enveloppes, carnets) sont préférés pour leur simplicité. Les applications sont freinées par la difficulté de saisir et le sentiment de manquer de contrôle. | Être au moins aussi simple qu'un carnet ; laisser le contrôle à l'utilisateur (B1, B10). |
| Alenazi & Sas, BCS HCI 2023 (45 applications bien notées) | Le suivi des dépenses est partout ; la gestion du budget est moins bien servie. Le nom des comptes varie et emprunte au vocabulaire bancaire. | F2 est un point où se démarquer ; un concept = un mot, sans jargon (B2, B4). |
| Alenazi & Sas, étude des fonctionnalités des mêmes 45 applications | Seules 8 applications (18 %) préviennent à l'approche d'une limite de budget. Recommandations : barres de progression qui passent du neutre à l'orange puis au rouge, notifications avant et après un seuil, valorisation des réussites, saisie et gestion souples des opérations, budgets multiples avec graphiques. | B3, B5, B6, B7, B8. |
| Herlocker et al., CSCW 2000 | Expliquer une recommandation améliore son acceptation. | Bouton « Pourquoi ? » de l'innovation (B9). |
| Kivetz, Urminsky & Zheng, Journal of Marketing Research 2006 | On redouble d'efforts quand on se sent proche de son objectif ; même un progrès apparent motive. L'étude porte sur des programmes de fidélité : c'est une transposition. | Progression visible de l'objectif d'épargne (B8). |
| Fröhlich et al., DIS 2021 | La première utilisation d'une application financière est décisive pour son adoption. | Prise en main immédiate (B11). |

## 5. Ce qui agace dans les applications existantes (source secondaire)

Unstar (2026) a analysé des avis à 1–3 étoiles sur 5 applications américaines. Deux plaintes nous concernent :

- les **erreurs de catégorisation**, que l'utilisateur doit corriger à la main (17 %) ;
- une **interface surchargée** et une prise en main confuse, qui font abandonner tôt (12 %).

Les autres plaintes (synchronisation bancaire, prix de l'abonnement) ne s'appliquent pas à EcoBudget.

Limites : l'article ne donne ni le nombre d'avis, ni la période, ni la méthode de classement, et son éditeur vend des analyses d'avis.

## 6. Besoins identifiés

| ID | Besoin | Fonctionnalité | Critères | Sources | Statut |
|---|---|---|---|---|---|
| B1 | Noter une dépense en quelques secondes, au moment où elle a lieu, même payée en espèces | F1 | C2, C8 | Findex ; Alenazi & Sas 2023 (simplicité, difficulté de saisie) | Établi |
| B2 | Des catégories simples, sans jargon, que l'on peut modifier | F1 | C7, C4 | Alenazi & Sas 2023 (vocabulaire) ; Unstar (catégorisation) | Établi |
| B3 | Corriger ou supprimer facilement une dépense mal saisie | F1 | C5, C3 | Alenazi & Sas, fonctionnalités (gestion souple des opérations) ; Unstar | Établi |
| B4 | Un budget du mois par catégorie (logique d'enveloppes) | F2 | C4, C8 | Alenazi & Sas 2023 (budgets multiples, enveloppes) ; Kaye et al. 2014 | Établi |
| B5 | Voir d'un coup d'œil ce qui reste à dépenser et l'état du budget (couleur, icône et texte) | F2, F3 | C1, C7 | Alenazi & Sas, fonctionnalités (barres de progression) | Établi |
| B6 | Être prévenu **avant** de dépasser le budget, pas seulement après | F2, INNOV | C1, C5 | Alenazi & Sas, fonctionnalités (18 % seulement ; seuils) | Établi |
| B7 | Voir où part l'argent grâce à des graphiques simples : répartition par catégorie, évolution d'un mois à l'autre | F3 | C2, C7 | Alenazi & Sas, fonctionnalités (graphiques) ; sujet §2 (F3) | Établi |
| B8 | Suivre un objectif d'épargne, et que les progrès soient valorisés | F4 | C1 | Kivetz et al. 2006 ; Alenazi & Sas, fonctionnalités (réussites) | Établi |
| B9 | Repérer une dépense inhabituelle et comprendre pourquoi elle est signalée | INNOV | C1, C7 | Herlocker et al. 2000 ; sujet §2 (INNOV) | Établi |
| B10 | Recevoir un conseil concret tout en gardant la main : fermer (« Compris »), désactiver | INNOV | C3, C4 | Alenazi & Sas 2023 (manque de contrôle) ; Herlocker et al. 2000 | Établi |
| B11 | Une prise en main immédiate, sans configuration lourde | Transversal | C2, C1 | Fröhlich et al. 2021 ; Unstar (prise en main) | Établi |
| B12 | Un ton qui ne culpabilise pas | Transversal | C7, C8 | Kaye et al. 2014 (dimension émotionnelle) | Établi |
| B13 | Des montants en DA, des formats locaux, aucun lien bancaire exigé | Transversal | C8 | Findex ; DataReportal | Établi |

## 7. Pourquoi l'innovation répond à un vrai besoin

1. **Les applications actuelles réagissent trop tard ou pas du tout** : seules 18 % préviennent avant le dépassement (B6).
2. **Une alerte sans explication suscite la méfiance** ; une alerte expliquée est mieux acceptée (B9, Herlocker et al.).
3. **Les gens veulent garder le contrôle de leur argent** (B10 ; critère C3).

L'alerte de dépense inhabituelle, avec un « Pourquoi ? » et des boutons pour garder la main, répond donc à un manque constaté chez les concurrents. Ce n'est pas un gadget ajouté par-dessus.

## 8. Ce que l'application ne doit pas faire

Proposition du binôme, déduite des besoins :

- exiger un compte bancaire ou une connexion à la banque (B13) ;
- demander une configuration longue avant la première dépense (B11) ;
- envoyer une alerte sans pouvoir l'expliquer, ou sans pouvoir la désactiver (B9, B10) ;
- culpabiliser l'utilisateur, par la couleur seule ou par le texte (B12).

## 9. Limites (à assumer à l'oral)

- Aucune source n'a interrogé directement nos utilisateurs cibles. Les données Findex portent sur la population générale, pas spécialement sur les étudiants ou les jeunes actifs.
- Une partie des études IHM a été menée hors d'Algérie : au Royaume-Uni, aux États-Unis, ou sur des applications distribuées au Royaume-Uni.
- L'analyse d'avis (Unstar) est une source secondaire sans méthode publiée.
- Kivetz et al. portent sur des programmes de fidélité, pas sur l'épargne.
- **Réponse** : les besoins sont confirmés ou corrigés lors des tests L3, avec au moins 3 vrais participants, sur une première version de l'application (MVP), puis sur l'application finale.

## 10. Pistes pour les personas

Retenues le 16/11/2026 : voir `docs/01_analyse/personas.md`. Pistes de départ :

- **Étudiant** : petit budget, paie surtout en espèces, a besoin de saisir vite (B1, B5).
- **Jeune actif** : salaire mensuel, suit un budget par catégorie et un objectif d'épargne (B4, B8).
- **Parent** : gère le budget d'une famille, a besoin d'une vue d'ensemble et d'alertes (B6, B7).

Ces trois profils sont bien distincts, ce qui facilite le choix de testeurs représentatifs pour L3.

## Sources

- Achouri, Charif & Achour (2026). *Evolution of Financial Inclusion in Algeria: A Global Findex Database Analysis (2014-2024)*. https://journals.univ-msila.dz/index.php/jorfa/article/view/10489
- Banque mondiale, Global Findex 2025 — Algeria microdata, variable fin27 (mode de paiement en ligne). https://microdata.worldbank.org/index.php/catalog/7862/variable/F1/V95?name=fin27
- FinDev Gateway. *Financial Inclusion in the Middle East and North Africa*. https://www.findevgateway.org/region/financial-inclusion-middle-east-and-north-africa
- DataReportal (2025). *Digital 2025: Algeria*. https://datareportal.com/reports/digital-2025-algeria
- Kaye, McCuistion, Gulotta & Shamma (2014). *Money Talks: Tracking Personal Finances*. CHI 2014. https://doi.org/10.1145/2556288.2556975
- Alenazi & Sas (2023). *Evaluating Budgeting Apps: Limited Support for Budgeting Compared to Tracking*. BCS HCI 2023. https://scienceopen.com/document_file/7a8fc61e-92ae-4b33-accb-6c2a52e78e87/ScienceOpen/001_Alenazi_BCSHCI23.pdf
- Alenazi & Sas. *Creating and Managing Transactions and Budgets: Analysis of Marketplace Descriptions and Functionality Review of Budgeting Apps*. https://eprints.lancs.ac.uk/222780/3/Creating_and_Managing_Transactions_and_Budgets-PURE.pdf
- Herlocker, Konstan & Riedl (2000). *Explaining Collaborative Filtering Recommendations*. CSCW 2000. https://doi.org/10.1145/358916.358995
- Kivetz, Urminsky & Zheng (2006). *The Goal-Gradient Hypothesis Resurrected*. Journal of Marketing Research 43, 39–58. https://business.columbia.edu/faculty/research/goal-gradient-hypothesis-resurrected-purchase-acceleration-illusionary-goal
- Fröhlich, Kobiella, Schmidt & Alt (2021). *Is it Better With Onboarding? Improving First-Time Cryptocurrency App Experiences*. DIS 2021. https://www.unibw.de/usable-security-and-privacy/publikationen/pdf/froehlich2021dis1.pdf/@@download/file/froehlich2021dis1.pdf
- Unstar (2026). *YNAB vs Rocket Money vs Monarch: Budgeting Apps* (analyse d'avis 1–3 étoiles, source secondaire). https://unstar.app/blog/ynab-vs-rocket-money-vs-monarch-budgeting-apps-ranked-2026
