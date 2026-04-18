#!/usr/bin/env node

/**
 * CLI pour l'intégration Google Jules
 */

const { Command } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const ora = require('ora');
const path = require('path');

const JulesManager = require('../src/index');

const program = new Command();

program
  .name('jules-integration')
  .description('CLI pour gérer les sessions Google Jules depuis NudgeBot')
  .version('1.0.0');

// Commande pour lancer une session
program
  .command('run')
  .description('Lancer une nouvelle session Jules')
  .option('-p, --prompt <prompt>', 'Prompt pour Jules')
  .option('-r, --repo <repository>', 'Dépôt GitHub (owner/repo)')
  .option('-b, --branch <branch>', 'Branche de base', 'main')
  .option('--no-pr', 'Ne pas créer de PR automatiquement')
  .action(async (options) => {
    const spinner = ora('Lancement de la session Jules...').start();
    
    try {
      const manager = new JulesManager({
        githubToken: process.env.GITHUB_TOKEN
      });

      // Demander le prompt si non fourni
      let prompt = options.prompt;
      if (!prompt) {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'prompt',
            message: 'Quelle tâche veux-tu confier à Jules ?',
            validate: input => input.trim().length > 0 ? true : 'Le prompt ne peut pas être vide'
          }
        ]);
        prompt = answers.prompt;
      }

      // Dépôt par défaut si non fourni
      const repository = options.repo || 'ForceNova/jules-integration';

      const result = await manager.launchSession({
        prompt,
        repository,
        baseBranch: options.branch,
        autoPR: options.pr
      });

      spinner.succeed(chalk.green('Session Jules lancée avec succès !'));
      
      console.log(chalk.cyan('\n📋 Détails de la session :'));
      console.log(chalk.white(`  ID: ${chalk.bold(result.sessionId)}`));
      console.log(chalk.white(`  Dépôt: ${chalk.bold(repository)}`));
      console.log(chalk.white(`  Prompt: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`));
      console.log(chalk.white(`  Statut: ${chalk.yellow('running')}`));
      console.log(chalk.white(`  Créée: ${new Date().toLocaleString()}`));
      
      console.log(chalk.cyan('\n🔧 Commandes utiles :'));
      console.log(chalk.white(`  Vérifier le statut: ${chalk.bold(`jules-integration status ${result.sessionId}`)}`));
      console.log(chalk.white(`  Lister les sessions: ${chalk.bold('jules-integration list')}`));

    } catch (error) {
      spinner.fail(chalk.red('Erreur lors du lancement de la session'));
      console.error(chalk.red(`\n❌ ${error.message}`));
      process.exit(1);
    }
  });

// Commande pour lister les sessions
program
  .command('list')
  .description('Lister toutes les sessions Jules')
  .option('-a, --all', 'Afficher toutes les sessions (même terminées)')
  .action(async (options) => {
    const spinner = ora('Récupération des sessions...').start();
    
    try {
      const manager = new JulesManager({
        githubToken: process.env.GITHUB_TOKEN
      });

      const result = await manager.listSessions();
      
      spinner.succeed(chalk.green(`${result.count} session(s) trouvée(s)`));
      
      if (result.sessions.length === 0) {
        console.log(chalk.yellow('\nAucune session active.'));
        return;
      }

      console.log(chalk.cyan('\n📋 Sessions Jules :'));
      
      result.sessions.forEach((session, index) => {
        const statusColor = {
          'pending': chalk.yellow,
          'running': chalk.blue,
          'completed': chalk.green,
          'failed': chalk.red
        }[session.status] || chalk.white;

        console.log(chalk.white(`\n${index + 1}. ${chalk.bold(session.id)}`));
        console.log(chalk.white(`   Prompt: ${session.prompt}`));
        console.log(chalk.white(`   Dépôt: ${session.repository}`));
        console.log(chalk.white(`   Statut: ${statusColor(session.status)}`));
        console.log(chalk.white(`   Créée: ${new Date(session.createdAt).toLocaleString()}`));
      });

    } catch (error) {
      spinner.fail(chalk.red('Erreur lors de la récupération des sessions'));
      console.error(chalk.red(`\n❌ ${error.message}`));
      process.exit(1);
    }
  });

// Commande pour voir le statut d'une session
program
  .command('status <sessionId>')
  .description('Voir le statut d\'une session spécifique')
  .action(async (sessionId) => {
    const spinner = ora(`Vérification du statut de ${sessionId}...`).start();
    
    try {
      const manager = new JulesManager({
        githubToken: process.env.GITHUB_TOKEN
      });

      const status = await manager.getSessionStatus(sessionId);
      
      spinner.succeed(chalk.green('Statut récupéré avec succès'));
      
      console.log(chalk.cyan('\n📊 Statut de la session :'));
      console.log(chalk.white(`  ID: ${chalk.bold(status.sessionId)}`));
      console.log(chalk.white(`  Statut: ${chalk.bold(status.status)}`));
      console.log(chalk.white(`  Progression: ${chalk.bold(status.progress)}`));
      console.log(chalk.white(`  Créée: ${new Date(status.createdAt).toLocaleString()}`));
      console.log(chalk.white(`  Dernière mise à jour: ${new Date(status.updatedAt).toLocaleString()}`));
      
      if (status.logs && status.logs.length > 0) {
        console.log(chalk.cyan('\n📝 Derniers logs :'));
        status.logs.forEach(log => {
          const logColor = {
            'info': chalk.blue,
            'warning': chalk.yellow,
            'error': chalk.red,
            'success': chalk.green
          }[log.level] || chalk.white;

          console.log(chalk.white(`  [${new Date(log.timestamp).toLocaleTimeString()}] ${logColor(log.level.toUpperCase())}: ${log.message}`));
        });
      }

    } catch (error) {
      spinner.fail(chalk.red('Erreur lors de la récupération du statut'));
      console.error(chalk.red(`\n❌ ${error.message}`));
      process.exit(1);
    }
  });

// Commande pour l'intégration NudgeBot
program
  .command('setup-nudgebot')
  .description('Configurer l\'intégration avec NudgeBot')
  .action(async () => {
    console.log(chalk.cyan('\n🔧 Configuration de l\'intégration NudgeBot...\n'));
    
    const questions = [
      {
        type: 'input',
        name: 'githubToken',
        message: 'Token GitHub (GITHUB_TOKEN):',
        default: process.env.GITHUB_TOKEN || ''
      },
      {
        type: 'confirm',
        name: 'autoSync',
        message: 'Activer la synchronisation automatique ?',
        default: true
      },
      {
        type: 'input',
        name: 'workspacePath',
        message: 'Chemin du workspace NudgeBot:',
        default: './workspace'
      }
    ];

    try {
      const answers = await inquirer.prompt(questions);
      
      const config = {
        githubToken: answers.githubToken || process.env.GITHUB_TOKEN,
        autoSync: answers.autoSync,
        workspacePath: answers.workspacePath
      };

      // Créer le fichier de configuration
      const fs = require('fs').promises;
      const configDir = path.join(process.cwd(), 'config');
      
      await fs.mkdir(configDir, { recursive: true });
      await fs.writeFile(
        path.join(configDir, 'nudgebot-integration.json'),
        JSON.stringify(config, null, 2)
      );

      console.log(chalk.green('\n✅ Configuration sauvegardée !'));
      console.log(chalk.white('\n📋 Fichier créé: config/nudgebot-integration.json'));
      
      console.log(chalk.cyan('\n🔧 Étapes suivantes :'));
      console.log(chalk.white('1. Ajoutez ce code à votre NudgeBot :'));
      console.log(chalk.gray(`
        const JulesManager = require('jules-integration');
        const manager = new JulesManager(require('./config/nudgebot-integration.json'));
        manager.integrateWithNudgeBot(nudgebotInstance);
      `));
      
      console.log(chalk.white('\n2. Testez avec :'));
      console.log(chalk.white('   jules-integration run --prompt "Test d\'intégration"'));

    } catch (error) {
      console.error(chalk.red(`\n❌ Erreur: ${error.message}`));
      process.exit(1);
    }
  });

// Commande d'aide
program
  .command('help')
  .description('Afficher l\'aide détaillée')
  .action(() => {
    console.log(chalk.cyan('\n🛠️  Intégration Google Jules pour NudgeBot\n'));
    
    console.log(chalk.white('Cette CLI permet de gérer les sessions de développement Google Jules'));
    console.log(chalk.white('directement depuis NudgeBot ou en ligne de commande.\n'));
    
    console.log(chalk.yellow('📋 Commandes disponibles :'));
    console.log(chalk.white('  run        - Lancer une nouvelle session Jules'));
    console.log(chalk.white('  list       - Lister toutes les sessions'));
    console.log(chalk.white('  status     - Voir le statut d\'une session'));
    console.log(chalk.white('  setup-nudgebot - Configurer l\'intégration avec NudgeBot'));
    console.log(chalk.white('  help       - Afficher cette aide\n'));
    
    console.log(chalk.yellow('🔧 Configuration requise :'));
    console.log(chalk.white('  • Token GitHub (GITHUB_TOKEN)'));
    console.log(chalk.white('  • Node.js 18+'));
    console.log(chalk.white('  • Accès à Google Jules\n'));
    
    console.log(chalk.yellow('📚 Exemples :'));
    console.log(chalk.white('  # Lancer une session avec prompt'));
    console.log(chalk.gray('  jules-integration run --prompt "Crée une API REST" --repo owner/repo\n'));
    
    console.log(chalk.white('  # Lister les sessions actives'));
    console.log(chalk.gray('  jules-integration list\n'));
    
    console.log(chalk.white('  # Vérifier une session spécifique'));
    console.log(chalk.gray('  jules-integration status jules-123456789\n'));
  });

// Gestion des erreurs
program.on('command:*', () => {
  console.error(chalk.red(`\n❌ Commande non reconnue: ${program.args.join(' ')}`));
  console.log(chalk.white(`Utilisez ${chalk.bold('jules-integration help')} pour voir les commandes disponibles.`));
  process.exit(1);
});

// Afficher l'aide si aucune commande
if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(0);
}

program.parse(process.argv);