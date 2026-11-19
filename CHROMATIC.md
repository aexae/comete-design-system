# Guide d'utilisation de Chromatic avec Storybook

Ce guide explique comment utiliser Chromatic pour visualiser et tester Storybook déployé, ainsi que comment interagir avec l'instance Chromatic déployée.

## Qu'est-ce que Chromatic ?

Chromatic est une plateforme qui permet de :

- **Déployer automatiquement** votre Storybook sur le web
- **Visualiser** tous vos composants et leurs variantes
- **Détecter les changements visuels** (visual regression testing)
- **Partager** facilement votre Storybook avec votre équipe
- **Collaborer** sur les composants via des commentaires et des reviews

## Accès à votre Storybook déployé

Votre Storybook est déployé sur Chromatic et accessible à l'adresse suivante (si déploiement sur main):

**🔗 [https://main--693ad068fa0b790fc9c6441c.chromatic.com/?path=/story/docs-introduction--default](https://main--693ad068fa0b790fc9c6441c.chromatic.com/?path=/story/docs-introduction--default)**

### Structure de l'URL

L'URL Chromatic suit cette structure :

```
https://[branch]--[project-id].chromatic.com/?path=/story/[story-path]
```

Dans notre cas :

- **Branch** : `main` (la branche principale)
- **Project ID** : `693ad068fa0b790fc9c6441c`
- **Story path** : `docs-introduction--default` (la story "Introduction" dans la documentation)

### Navigation dans le Storybook déployé

1. **Panneau latéral gauche** : Liste de toutes vos stories organisées par catégories

   - Cliquez sur une story pour la charger
   - Utilisez la recherche pour trouver rapidement un composant

2. **Zone centrale** : Affiche le composant sélectionné

   - Vous pouvez interagir avec les contrôles (controls) pour modifier les props
   - Utilisez les outils de la barre d'outils en bas pour tester différentes configurations

### Fonctionnalités disponibles dans l'interface Chromatic

#### 1. **Sélecteur de thème**

Votre Storybook supporte deux thèmes (clair et sombre). Utilisez l'icône de thème dans la barre d'outils pour basculer entre :

- 🌞 **Light** : Thème clair
- 🌙 **Dark** : Thème sombre (par défaut)

#### 2. **Contrôles interactifs**

- Modifiez les props des composants directement dans le panneau "Controls"
- Les changements sont appliqués instantanément
- Parfait pour tester différentes variantes de vos composants

#### 3. **Vue responsive**

- Utilisez l'icône de viewport pour tester différentes tailles d'écran
- Options prédéfinies : Mobile, Tablet, Desktop, etc.

#### 4. **Mesure et inspection**

- **Règle** : Mesurer les distances entre éléments
- **Outline** : Voir la structure HTML
- **Grid** : Afficher une grille pour l'alignement

#### 5. **Accessibilité**

- Vérifiez les problèmes d'accessibilité directement dans l'interface
- Les violations sont signalées dans le panneau "Accessibility"

## Déploiement automatique avec GitHub Actions

Votre projet est configuré pour déployer automatiquement sur Chromatic via GitHub Actions.

### Workflow actuel

Le workflow se trouve dans `.github/workflows/chromatic.yml` et s'exécute :

- **Manuellement** via `workflow_dispatch` (déclenchement manuel depuis GitHub)

### Étapes du déploiement

1. **Checkout du code** : Récupération du code source
2. **Setup pnpm** : Installation de pnpm (version 10.22.0)
3. **Setup Node.js** : Configuration de Node.js (version 22)
4. **Installation des dépendances** :
   - Dépendances principales : `pnpm install --frozen-lockfile`
   - Dépendances Storybook : `cd storybook && pnpm install --frozen-lockfile`
5. **Build Storybook** : Construction du Storybook statique
6. **Déploiement Chromatic** : Upload vers Chromatic avec le token de projet

### Déclencher un déploiement

1. Allez sur votre repository GitHub
2. Cliquez sur l'onglet **"Actions"**
3. Sélectionnez le workflow **"Chromatic 🎨"**
4. Cliquez sur **"Run workflow"**
5. Choisissez la branche et cliquez sur **"Run workflow"**

### Configuration requise

Pour que le déploiement fonctionne, vous devez avoir configuré :

1. **Token Chromatic** :

   - Le secret GitHub dans : `Settings > Secrets and variables > Actions`
   - Nom du secret : `CHROMATIC_PROJECT_TOKEN`

### Prérequis

```bash
# Installer Chromatic CLI globalement (optionnel)
npm install -g chromatic

# Ou utiliser npx (recommandé, pas d'installation nécessaire)
```

### Commandes

```bash
# 1. Installer les dépendances
pnpm install

# 2. Installer les dépendances Storybook
cd storybook
pnpm install

# 3. Build Storybook
cd ..
pnpm build-storybook
```

### Token du projet en local

Le token n'est jamais écrit dans `storybook/chromatic.config.json` (fichier commité).
La CI le lit dans le secret `CHROMATIC_PROJECT_TOKEN`. En local, renseigner la même
clé dans `.env` (ignoré par git), puis l'exporter avant de lancer la CLI, qui lit
automatiquement `CHROMATIC_PROJECT_TOKEN` :

```bash
set -a && source .env && set +a
cd storybook && pnpm chromatic
```

### Options utiles

```bash
# Déployer une branche spécifique
npx chromatic --project-token=VOTRE_TOKEN --branch=feature/nouvelle-feature

# Déployer avec un build-storybook personnalisé
npx chromatic --project-token=VOTRE_TOKEN --build-script-name=build-storybook

# Ne pas quitter après l'upload (pour voir les résultats)
npx chromatic --project-token=VOTRE_TOKEN
```

## Visual Regression Testing

Chromatic peut détecter automatiquement les changements visuels entre les builds :

1. **Baseline** : Le premier build devient la référence
2. **Comparaisons** : Les builds suivants sont comparés pixel par pixel
3. **Détection** : Les différences sont signalées automatiquement
4. **Review** : Vous pouvez approuver ou rejeter les changements

## Partage et collaboration

### Commentaires et reviews

Dans l'interface Chromatic :

- Cliquez sur un composant pour ajouter un commentaire
- Partagez des screenshots annotés
- Collaborez avec votre équipe sur les designs

## Commandes utiles

### Build Storybook localement

```bash
# Build du Storybook
pnpm build-storybook

# Preview du build local
cd storybook
pnpm preview
# Ouvre sur http://localhost:6006
```

### Développement local

```bash
# Lancer Storybook en mode développement
cd storybook
pnpm start
# Ouvre sur http://localhost:6006
```

## Dépannage

### Le déploiement échoue

1. **Vérifiez le token** : Assurez-vous que `CHROMATIC_PROJECT_TOKEN` est correctement configuré
2. **Vérifiez les dépendances** : Toutes les dépendances doivent être installées
3. **Vérifiez le build** : Testez `pnpm build-storybook` localement d'abord

### Le Storybook ne se charge pas

1. **Vérifiez l'URL** : Assurez-vous que l'URL est correcte
2. **Vérifiez la branche** : La branche doit exister et avoir été déployée
3. **Vérifiez les logs** : Consultez les logs du workflow GitHub Actions

## Ressources supplémentaires

- [Documentation Chromatic](https://www.chromatic.com/docs)
- [Documentation Storybook](https://storybook.js.org/docs)
- [GitHub Actions pour Chromatic](https://www.chromatic.com/docs/github-actions)

## Support

Pour toute question ou problème :

1. Consultez la documentation Chromatic
2. Vérifiez les logs GitHub Actions
3. Contactez l'équipe de développement

---

**Note** : Ce guide est spécifique à ce projet.
