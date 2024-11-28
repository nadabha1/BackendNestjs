import { Controller, Post, Get, Param, Body, Query, NotFoundException } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dtos/role.dto';
import { Role } from './schemas/role.schema';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.createRole(createRoleDto);
  }

  @Get()
  async getRoles() {
    return this.rolesService.getRoles();
  }

  @Get('get-id')
  async getRoleById1(@Body('id') id: string) {
    return this.rolesService.getRoleById1(id);
  }

  @Get('getname')
  async getRoleNameByID(@Body('id') id: string) {
    return this.rolesService.getRoleNameById(id);
  }


}
