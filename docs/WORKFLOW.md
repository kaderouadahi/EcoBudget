# Workflow : Projet Claude (Conversation + Cowork) · Claude Code · GitHub · Notion

## Rôles
| Espace | Rôle | Écrit dans |
|---|---|---|
| GitHub | Source de vérité des fichiers | — |
| Notion | Todo du projet (seule liste de tâches) | Tâches |
| Projet Claude, mode Conversation | Réfléchir, brainstormer, décider | Rien : propose les lignes pour DECISIONS.md |
| Projet Claude, mode Cowork | Produire les documents, l'évaluation et le PowerPoint | `docs/`, `livrables/` |
| Claude Code | Produire l'application (une fois la stack décidée) | `app/` |

## Phases
| Phase | Espace | Exigence |
|---|---|---|
| Analyse des besoins, personas, scénarios | Conversation puis Cowork | E1, E2 |
| Maquettes et prototype interactif | Cowork + outil de maquettage | E3 |
| Matrice des critères, fiche innovation, specs | Cowork | C1–C8, E5 |
| Développement | Claude Code | E4, E5 |
| Évaluation avec ≥ 3 utilisateurs réels | Cowork + binôme | E6, L3 |
| Corrections issues des tests | Claude Code | L3 |
| PowerPoint et script de démo | Cowork | L1–L4 |

## Passage de relais
1. Cowork écrit une spec dans `HANDOFF.md`.
2. Claude Code planifie, implémente, met le statut à jour.
3. Cowork ajoute les preuves dans la matrice.
Jamais les deux outils sur les mêmes fichiers en même temps.

## Rituel de session
Pull → prendre une tâche Notion (statut En cours) → lire son dernier commentaire → travailler → commit et push → commentaire de fin de session sur la tâche (fait, arrêt, prochaine étape) → statut mis à jour.
Documents : commit directement sur main. Code : branche par fonctionnalité, relue par l'autre avant fusion.
