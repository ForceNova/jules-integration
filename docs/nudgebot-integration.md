# Intégration avec NudgeBot

Guide complet pour intégrer le module Jules avec NudgeBot, l'assistant IA personnel polyvalent.

## 🎯 Vue d'ensemble

Ce module permet à NudgeBot de :
- **Lancer des sessions Google Jules** directement depuis l'interface
- **Suivre les développements** en temps réel
- **Gérer les résultats** (PR, fichiers, logs)
- **Synchroniser avec l'architecture Dual-Repo**

## 📦 Installation

### Option 1: Installation via npm
```bash
# Dans le projet NudgeBot
npm install jules-integration
```

### Option 2: Installation manuelle
```bash
# Clone le dépôt
git clone https://github.com/ForceNova/jules-integration.git

# Copie dans le projet NudgeBot
cp -r jules-integration/src ./nudgebot/modules/jules
```

## 🔧 Configuration

### 1. Variables d'environnement
```bash
# .env ou configuration NudgeBot
GITHUB_TOKEN=ghp_votre_token_github
JULES_AUTO_SYNC=true
JULES_LOG_LEVEL=info
```

### 2. Configuration dans NudgeBot
```javascript
// config/nudgebot.js
module.exports = {
  // ... autres configurations
  
  jules: {
    enabled: true,
    githubToken: process.env.GITHUB_TOKEN,
    autoSync: true,
    workspacePath: './workspace',
    maxSessions: 5,
    sessionTimeout: 3600000 // 1 heure
  }
};
```

## 🚀 Intégration complète

### Étape 1: Initialisation
```javascript
// Dans le fichier principal de NudgeBot (index.js ou app.js)

const NudgeBot = require('./core/nudgebot');
const JulesManager = require('jules-integration');

// Initialiser NudgeBot
const nudgebot = new NudgeBot({
  // configuration NudgeBot
});

// Initialiser Jules Manager
const julesManager = new JulesManager({
  githubToken: process.env.GITHUB_TOKEN,
  autoSync: true,
  logLevel: 'info'
});

// Intégrer avec NudgeBot
julesManager.integrateWithNudgeBot(nudgebot);

console.log('✅ Intégration Jules activée');
```

### Étape 2: Ajouter les commandes
Le manager Jules ajoute automatiquement les commandes suivantes à NudgeBot :

| Commande | Description | Exemple |
|----------|-------------|---------|
| `jules run <prompt>` | Lancer une session Jules | `jules run "Crée une API REST"` |
| `jules list` | Lister les sessions | `jules list` |
| `jules status <id>` | Voir le statut | `jules status jules-123456` |
| `jules help` | Afficher l'aide | `jules help` |

### Étape 3: Configuration des outils
```javascript
// Extension des outils NudgeBot existants

// 1. Intégration avec le système de fichiers
nudgebot.fileSystem.registerHandler('jules-session', {
  read: async (sessionId) => {
    return await julesManager.getSessionStatus(sessionId);
  },
  write: async (sessionData) => {
    return await julesManager.launchSession(sessionData);
  }
});

// 2. Intégration avec GitHub
nudgebot.github.registerHook('jules-pr', {
  onPRCreated: async (prData) => {
    // Notifier Jules des nouvelles PR
    await julesManager.handlePRNotification(prData);
  }
});

// 3. Intégration avec le scheduler
nudgebot.scheduler.registerTask('jules-cleanup', {
  schedule: '0 0 * * *', // Tous les jours à minuit
  handler: async () => {
    await julesManager.cleanupOldSessions();
  }
});
```

## 🔄 Architecture Dual-Repo

### Mémoire (GitHub Context Repo)
```javascript
// Les sessions Jules sont sauvegardées dans la mémoire
julesManager.on('session-update', async (session) => {
  // Sauvegarder dans la mémoire NudgeBot
  await nudgebot.memory.save(`jules/sessions/${session.id}`, session);
  
  // Synchroniser avec GitHub
  await nudgebot.memory.syncToGitHub();
});
```

### Workspace (GitHub Workspace Repo)
```javascript
// Les résultats Jules sont synchronisés avec le workspace
julesManager.on('session-completed', async (result) => {
  if (result.prUrl) {
    // Ajouter au workspace
    await nudgebot.workspace.addFile(
      `jules-results/${result.sessionId}/pr-info.json`,
      JSON.stringify(result, null, 2)
    );
    
    // Synchroniser avec GitHub
    await nudgebot.workspace.syncToGitHub();
  }
});
```

## 📊 Monitoring et Logs

### Logs intégrés
```javascript
// Les logs Jules sont intégrés aux logs NudgeBot
julesManager.logger.on('log', (logEntry) => {
  nudgebot.logger.log({
    level: logEntry.level,
    message: `[JULES] ${logEntry.message}`,
    timestamp: logEntry.timestamp,
    sessionId: logEntry.sessionId
  });
});
```

### Dashboard (Optionnel)
```javascript
// Ajouter une route au dashboard NudgeBot
if (nudgebot.dashboard) {
  nudgebot.dashboard.addRoute('/jules', {
    title: 'Sessions Jules',
    component: JulesDashboard,
    props: { manager: julesManager }
  });
}
```

## 🧪 Tests d'intégration

### Test 1: Lancement de session
```javascript
// test-jules-integration.js
const test = async () => {
  console.log('🧪 Test d\'intégration Jules...');
  
  // Simuler une commande NudgeBot
  const result = await nudgebot.executeCommand('jules run "Test d\'intégration"');
  
  console.log('✅ Résultat:', result);
  
  // Vérifier la session
  const sessions = await nudgebot.executeCommand('jules list');
  console.log('📋 Sessions:', sessions);
};

test().catch(console.error);
```

### Test 2: Persistance
```javascript
// Vérifier que les sessions sont sauvegardées
const testPersistence = async () => {
  // Lancer une session
  await nudgebot.executeCommand('jules run "Test persistance"');
  
  // Redémarrer NudgeBot
  console.log('🔄 Redémarrage...');
  
  // Vérifier que la session est toujours là
  const sessions = await nudgebot.executeCommand('jules list');
  console.log('✅ Sessions après redémarrage:', sessions.count);
};
```

## 🔧 Dépannage

### Problèmes courants

#### 1. Token GitHub invalide
```
❌ Erreur: Invalid GitHub token
✅ Solution: Vérifiez GITHUB_TOKEN dans .env
```

#### 2. Jules non disponible
```
❌ Erreur: Jules service unavailable
✅ Solution: Vérifiez la connectivité, attendez quelques minutes
```

#### 3. Dépôt non trouvé
```
❌ Erreur: Repository not found
✅ Solution: Vérifiez le format owner/repo, permissions GitHub
```

### Logs de débogage
```javascript
// Activer les logs détaillés
const julesManager = new JulesManager({
  logLevel: 'debug', // 'error', 'warn', 'info', 'debug'
  debug: true
});

// Voir les logs
julesManager.on('debug', (data) => {
  console.log('🔍 DEBUG Jules:', data);
});
```

## 🚀 Exemples avancés

### Workflow complet
```javascript
// Exemple: Pipeline de développement avec Jules
async function developmentPipeline(task) {
  // 1. Analyser la tâche avec NudgeBot
  const analysis = await nudgebot.analyzeTask(task);
  
  // 2. Générer un prompt pour Jules
  const julesPrompt = await nudgebot.generateJulesPrompt(analysis);
  
  // 3. Lancer Jules
  const session = await nudgebot.executeCommand(`jules run "${julesPrompt}"`);
  
  // 4. Suivre la progression
  const interval = setInterval(async () => {
    const status = await nudgebot.executeCommand(`jules status ${session.sessionId}`);
    
    nudgebot.notifyUser(`Progression: ${status.progress}`);
    
    if (status.status === 'completed') {
      clearInterval(interval);
      await handleCompletion(status);
    }
  }, 30000);
  
  // 5. Traiter le résultat
  async function handleCompletion(result) {
    // Réviser le code
    const review = await nudgebot.reviewCode(result.prUrl);
    
    // Intégrer au projet
    await nudgebot.integrateChanges(result);
    
    // Notifier l'utilisateur
    nudgebot.notifyUser(`✅ Tâche "${task}" terminée par Jules!`);
  }
}
```

## 📚 Ressources

- [Documentation Jules](https://jules.ai/docs)
- [API GitHub](https://docs.github.com/en/rest)
- [NudgeBot Documentation](https://github.com/ForceNova/nudgebot)
- [Exemples complets](./examples/)

## 🤝 Support

Pour des problèmes d'intégration :
1. Vérifiez les logs NudgeBot et Jules
2. Consultez la [FAQ](./docs/faq.md)
3. Ouvrez une [issue GitHub](https://github.com/ForceNova/jules-integration/issues)
4. Contactez l'équipe NudgeBot

---

**✅ Intégration réussie !** NudgeBot peut maintenant utiliser Google Jules pour le développement automatisé. 🚀