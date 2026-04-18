/**
 * Exemple d'utilisation basique de l'intégration Jules pour NudgeBot
 */

const JulesManager = require('../src/index');

async function main() {
  console.log('🚀 Exemple: Intégration Google Jules avec NudgeBot\n');

  // 1. Initialisation du manager
  const manager = new JulesManager({
    githubToken: process.env.GITHUB_TOKEN || 'your-github-token-here',
    autoSync: true,
    logLevel: 'info'
  });

  console.log('✅ Manager Jules initialisé');

  // 2. Lancer une session Jules
  console.log('\n📋 Lancement d\'une session Jules...');
  
  const sessionResult = await manager.launchSession({
    prompt: 'Crée une API REST avec Express.js et MongoDB pour un système de tâches',
    repository: 'ForceNova/jules-integration',
    baseBranch: 'main',
    autoPR: true
  });

  console.log(`✅ Session lancée: ${sessionResult.sessionId}`);
  console.log(`   Prompt: ${sessionResult.session.prompt.substring(0, 80)}...`);

  // 3. Vérifier le statut
  console.log('\n📊 Vérification du statut...');
  
  setTimeout(async () => {
    const status = await manager.getSessionStatus(sessionResult.sessionId);
    console.log(`✅ Statut: ${status.status}`);
    console.log(`   Progression: ${status.progress}`);
    
    if (status.logs.length > 0) {
      console.log(`   Dernier log: ${status.logs[status.logs.length - 1].message}`);
    }
  }, 2000);

  // 4. Lister toutes les sessions
  console.log('\n📋 Liste des sessions...');
  
  setTimeout(async () => {
    const sessions = await manager.listSessions();
    console.log(`✅ ${sessions.count} session(s) trouvée(s)`);
    
    sessions.sessions.forEach((session, index) => {
      console.log(`   ${index + 1}. ${session.id} - ${session.status}`);
    });
  }, 3000);

  // 5. Exemple d'intégration avec NudgeBot
  console.log('\n🔧 Intégration avec NudgeBot...');
  
  // Simuler une instance NudgeBot
  const mockNudgeBot = {
    addCommand: (name, handler) => {
      console.log(`✅ Commande "${name}" ajoutée à NudgeBot`);
      
      // Tester la commande
      if (name === 'jules') {
        console.log('\n🧪 Test de la commande "jules":');
        
        // Simuler différentes commandes
        const testCommands = [
          ['run', 'Test', 'de', 'commande'],
          ['list'],
          ['status', sessionResult.sessionId]
        ];
        
        testCommands.forEach(async (args, index) => {
          setTimeout(async () => {
            console.log(`\n   Commande: jules ${args.join(' ')}`);
            try {
              const result = await manager.handleNudgeBotCommand(args);
              console.log(`   Résultat: ${JSON.stringify(result, null, 2).substring(0, 100)}...`);
            } catch (error) {
              console.log(`   Erreur: ${error.message}`);
            }
          }, index * 1000);
        });
      }
    }
  };

  // Intégrer avec NudgeBot
  manager.integrateWithNudgeBot(mockNudgeBot);

  // 6. Sauvegarde et persistance
  console.log('\n💾 Système de persistance...');
  
  // Les sessions sont automatiquement sauvegardées dans ./sessions/
  console.log('✅ Sessions sauvegardées dans: ./sessions/');
  console.log('✅ Logs sauvegardés dans: jules-sessions.log');

  // 7. Configuration avancée
  console.log('\n⚙️  Configuration avancée:');
  
  const advancedConfig = {
    githubToken: process.env.GITHUB_TOKEN,
    autoSync: true,
    logLevel: 'debug',
    workspacePath: './workspace',
    maxSessions: 10,
    sessionTimeout: 3600000, // 1 heure
    retryAttempts: 3
  };

  console.log('✅ Configuration disponible pour:');
  console.log('   • Limite de sessions simultanées');
  console.log('   • Timeout des sessions');
  console.log('   • Tentatives de réessai');
  console.log('   • Chemins personnalisés');

  console.log('\n🎯 Exemple complet terminé !');
  console.log('\n📚 Prochaines étapes:');
  console.log('   1. Configurez votre token GitHub');
  console.log('   2. Testez avec: node examples/basic-usage.js');
  console.log('   3. Intégrez avec votre instance NudgeBot');
  console.log('   4. Utilisez la CLI: jules-integration run --prompt "Votre tâche"');
}

// Gestion des erreurs
main().catch(error => {
  console.error('❌ Erreur:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
});

module.exports = { main };