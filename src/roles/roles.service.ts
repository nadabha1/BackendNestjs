import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from './schemas/role.schema';
import { CreateRoleDto } from './dtos/role.dto';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private RoleModel: Model<Role>) {}

  // Créer un rôle et l'enregistrer dans MongoDB
  async createRole(role: CreateRoleDto): Promise<Role> {
    const createdRole = new this.RoleModel(role);
    return createdRole.save();
  }

  // Récupérer tous les rôles
  async getRoles(): Promise<Role[]> {
    return this.RoleModel.find().exec();
  }

  // Récupérer un rôle par son ID
  async getRoleById(roleId: string): Promise<Role> {
    return this.RoleModel.findById(roleId).exec();
  }
  async getRoleByName(roleName: string): Promise<Role> {
    const role = await this.RoleModel.findOne({ name: roleName });
    if (!role) {
      throw new NotFoundException(`Role with name "${roleName}" not found`);
    }
    return role;
  }
}
