import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { UserModel } from './user-models/user.model';
import { UsersService } from './user.service';
import { CreateUserDto } from './user-models/create-user.model';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers(): Promise<UserModel[]> {
    return this.usersService.findAll();
  }

  @Post()
  createUser(@Body() body: CreateUserDto): Promise<UserModel> {
    return this.usersService.create(body);
  }

  @Delete(':id')
  deleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.usersService.delete(id);
  }
}
