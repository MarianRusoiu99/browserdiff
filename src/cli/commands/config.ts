import { Command } from 'commander';
import { ConfigService } from '../../services/ConfigService';

export const configCommand = new Command('config')
  .description('Manage configuration');

// config init
configCommand
  .command('init')
  .description('Initialize a new configuration file')
  .option('-p, --path <path>', 'Config file path', '.browserdiff.json')
  .action(async (options: { path: string }) => {
    try {
      const configService = new ConfigService(options.path);
      const configPath = await configService.init();
      // eslint-disable-next-line no-console
      console.log(`✓ Configuration file created: ${configPath}`);
      process.exit(0);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('✗ Error:', (error as Error).message);
      process.exit(1);
    }
  });

// config show
configCommand
  .command('show')
  .description('Display current configuration')
  .option('-p, --path <path>', 'Config file path', '.browserdiff.json')
  .action(async (options: { path: string }) => {
    try {
      const configService = new ConfigService(options.path);
      await configService.load();
      const configJson = await configService.show();
      // eslint-disable-next-line no-console
      console.log(configJson);
      process.exit(0);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('✗ Error:', (error as Error).message);
      process.exit(1);
    }
  });

// config validate
configCommand
  .command('validate')
  .description('Validate configuration file')
  .option('-p, --path <path>', 'Config file path', '.browserdiff.json')
  .action(async (options: { path: string }) => {
    try {
      const configService = new ConfigService(options.path);
      await configService.load();
      const isValid = await configService.validate();
      
      if (isValid) {
        // eslint-disable-next-line no-console
        console.log('✓ Configuration is valid');
        process.exit(0);
      } else {
        // eslint-disable-next-line no-console
        console.error('✗ Configuration is invalid');
        process.exit(1);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('✗ Error:', (error as Error).message);
      process.exit(1);
    }
  });
