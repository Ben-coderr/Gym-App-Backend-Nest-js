import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ('OWNER' | 'MEMBER')[]) => SetMetadata(ROLES_KEY, roles);