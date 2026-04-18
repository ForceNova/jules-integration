# Intégration Google Jules pour NudgeBot

Système complet de gestion des sessions Google Jules pour NudgeBot, l'assistant IA personnel polyvalent.

## 🎯 Objectif

Fournir une intégration native de Google Jules dans NudgeBot permettant de :
- Lancer des sessions de développement via Jules
- Suivre l'état des tâches en cours
- Gérer les résultats et pull requests
- Intégrer avec l'architecture Dual-Repo de NudgeBot

## 📁 Architecture

```
jules-integration/
├── src/
│   ├── core/           # Module principal d'intégration
│   ├── cli/            # Commandes ligne de commande
│   ├── api/            # Interface REST (optionnel)
│   └── utils/          # Utilitaires
├── docs/               # Documentation
├── examples/           # Exemples d'utilisation
└── tests/              # Tests unitaires et d'intégration
```

## 🚀 Fonctionnalités

### 1. Gestion des Sessions
- Lancement de sessions Jules
- Suivi en temps réel
- Récupération des résultats
- Gestion des erreurs

### 2. Intégration NudgeBot
- Compatible avec l'architecture Dual-Repo
- Synchronisation avec GitHub
- Persistance des sessions
- Logs et monitoring

### 3. Interface
- CLI interactive
- Dashboard web (optionnel)
- Notifications
- Rapports automatiques

## 🔧 Installation

```bash
# Clone le dépôt
git clone https://github.com/ForceNova/jules-integration.git

# Installe les dépendances
cd jules-integration
npm install
```

## 📖 Utilisation

### Via CLI
```bash
# Lancer une session Jules
npx jules-integration run --prompt "Crée une API REST"

# Lister les sessions
npx jules-integration list

# Voir les détails d'une session
npx jules-integration status <session-id>
```

### Via NudgeBot
```javascript
const JulesManager = require('jules-integration');

const manager = new JulesManager({
  githubToken: process.env.GITHUB_TOKEN,
  autoSync: true
});

// Lancer une session
const session = await manager.launchSession({
  prompt: "Améliore le système de fichiers",
  repository: "owner/repo",
  autoPR: true
});
```

## 🔗 Intégration avec NudgeBot

Ce module s'intègre parfaitement avec l'architecture Dual-Repo de NudgeBot :

1. **Mémoire** : Sauvegarde automatique des sessions et configurations
2. **Workspace** : Synchronisation avec le dépôt GitHub de workspace
3. **Outils** : Utilisation des outils existants (fichiers, shell, etc.)

## 📊 Monitoring

- Logs détaillés des sessions
- Métriques de performance
- Alertes en cas d'erreur
- Rapports automatiques

## 🤝 Contribution

Les contributions sont les bienvenues ! Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour plus de détails.

## 📄 Licence

MIT