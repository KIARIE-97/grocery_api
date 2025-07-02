import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, User } from 'src/users/entities/user.entity';
import { ROLES_KEY } from '../decorators/role.decorator';
import { JWTPayload } from '../strategies/at.strategy';


interface UserRequest extends Request {
  user?: JWTPayload; // Define the user property to hold JWT payload;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector, // Import Reflector to access metadata
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const reqRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!reqRoles) {
      return true; // If no roles are specified, allow access
    }
    const request = context.switchToHttp().getRequest<UserRequest>();
    const user = request.user; // user is attached to the request object
    if (!user) {
      return false; // If user is not authenticated or role is not present, deny access
    }
    const hasRole = reqRoles.some((role) => user.role === role);
    return hasRole; // Return true if the user has one of the required roles, otherwise false
  }
}
