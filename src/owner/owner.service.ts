import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOwnerDto } from './dtos/update-owner.dto';

@Injectable()
export class OwnerService {
  constructor(private prisma: PrismaService) {}

  async getProfile(ownerId: number) {
    return this.prisma.owner.findUnique({
      where: { id: ownerId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true
      }
    });
  }

  async updateProfile(ownerId: number, dto: UpdateOwnerDto) {
    return this.prisma.owner.update({
      where: { id: ownerId },
      data: dto,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true
      }
    });
  }

//   async getNotifications(ownerId: number) {
//     return this.prisma.notification.findMany({
//       where: { ownerId },
//       orderBy: { createdAt: 'desc' },
//       select: {
//         id: true,
//         title: true,
//         message: true,
//         read: true,
//         createdAt: true
//       }
//     });
//   }

//   async markNotificationAsRead(ownerId: number, notificationId: number) {
//     const notification = await this.prisma.notification.findUnique({
//       where: { id: notificationId }
//     });

//     if (!notification || notification.ownerId !== ownerId) {
//       throw new NotFoundException('Notification not found');
//     }

//     return this.prisma.notification.update({
//       where: { id: notificationId },
//       data: { read: true },
//       select: {
//         id: true,
//         read: true
//       }
//     });
//   }
}