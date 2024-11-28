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
  async getRoleById1(roleId: string): Promise<{id:String}> {
    const role = await this.RoleModel.findById(roleId);
    return { id: role.id};
  }
  async getRoleNameById(roleId: string): Promise<{name:String}> {
    const role = await this.RoleModel.findById(roleId);
    console.log(role.name);
    const roleName = role.name
    return { name: roleName};
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
