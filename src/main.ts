import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CreateRoleDto } from './roles/dtos/role.dto';
import { RolesService } from './roles/roles.service'; // Service des rôles
import { Resource } from './roles/enums/resource.enum';
import { Action } from './roles/enums/action.enum';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
   const roleService = app.get(RolesService);
  // Enable global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,         // Automatically strip non-whitelisted properties
    forbidNonWhitelisted: true,  // Throw an error if a non-whitelisted property is received
    transform: true,         // Automatically transform payloads to DTOs
  }));
  app.enableCors(); // Activez cette ligne si vous utilisez des appels API depuis l'application iOS
  await app.listen(3000, '0.0.0.0'); // Écoute sur toutes les interfaces
}

async function initializeRoles(roleService: RolesService) {
  const freelancerRole: CreateRoleDto = {
    name: 'Freelancer',
    permissions: [
      {
        resource: Resource.PROJECT, // Utilisation de l'enum
        actions: [Action.READ, Action.WRITE], // Assurez-vous également que les actions utilisent l'enum Action
      },
      {
        resource: Resource.PROFILE, // Utilisation de l'enum
        actions: [Action.READ, Action.UPDATE],
      },
    ],
  };
  
  const entrepreneurRole: CreateRoleDto = {
    name: 'Entrepreneur',
    permissions: [
      {
        resource: Resource.PROJECT, // Utilisation de l'enum
        actions: [Action.READ, Action.WRITE, Action.DELETE],
      },
      {
        resource: Resource.TASK, // Utilisation de l'enum
        actions: [Action.READ, Action.WRITE],
      },
    ],
  };

  // Vérifiez si les rôles existent déjà pour éviter les doublons
  const roles = await roleService.getRoles();
  if (!roles.some(role => role.name === freelancerRole.name)) {
    await roleService.createRole(freelancerRole);
  }
  if (!roles.some(role => role.name === entrepreneurRole.name)) {
    await roleService.createRole(entrepreneurRole);
  }

  console.log('Roles initialized successfully!');
}
bootstrap();
