import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto } from './dtos/create-member.dto';
import { UpdateMemberDto } from './dtos/update-member.dto';
import { RenewMemberDto } from './dtos/renew-member.dto';

@Injectable()
export class MemberService {
  constructor(private prisma: PrismaService) {}

  async getMembers(ownerId: number, status: string, page: number = 1, limit: number = 10) {
    const where: any = { ownerId };
    
    if (status === 'active') {
      where.expiryDate = { gte: new Date() };
    } else if (status === 'expired') {
      where.expiryDate = { lt: new Date() };
    }
    
    const skip = (page - 1) * limit;
    
    const [members, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          expiryDate: true,
          createdAt: true
        }
      }),
      this.prisma.member.count({ where })
    ]);
    
    return {
      data: members,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getMember(ownerId: number, memberId: number) {
    const member = await this.prisma.member.findFirst({
      where: {
        id: memberId,
        ownerId
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    if (!member) throw new NotFoundException('Member not found');
    
    return member;
  }

  async createMember(ownerId: number, dto: CreateMemberDto) {
    return this.prisma.member.create({
      data: {
        ...dto,
        ownerId,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });
  }

  async updateMember(ownerId: number, memberId: number, dto: UpdateMemberDto) {
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, ownerId }
    });
    
    if (!member) throw new NotFoundException('Member not found');
    
    return this.prisma.member.update({
      where: { id: memberId },
      data: dto
    });
  }

  async deleteMember(ownerId: number, memberId: number) {
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, ownerId }
    });
    
    if (!member) throw new NotFoundException('Member not found');
    
    // Soft delete implementation
    return this.prisma.member.update({
      where: { id: memberId },
      data: { deletedAt: new Date() }
    });
  }

  async renewMember(ownerId: number, memberId: number, dto: RenewMemberDto) {
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, ownerId }
    });
    
    if (!member) throw new NotFoundException('Member not found');
    
    const currentExpiry = member.expiryDate > new Date() 
      ? member.expiryDate 
      : new Date();
    
    const newExpiry = new Date(currentExpiry);
    newExpiry.setMonth(newExpiry.getMonth() + dto.months);
    
    return this.prisma.member.update({
      where: { id: memberId },
      data: { expiryDate: newExpiry }
    });
  }

  async getMemberAttendance(memberId: number) {
    return this.prisma.attendance.findMany({
      where: { memberId },
      orderBy: { date: 'desc' },
      take: 30 // Last 30 sessions
    });
  }

  async getMemberOrders(memberId: number) {
    return this.prisma.order.findMany({
      where: { memberId },
      orderBy: { date: 'desc' }
    });
  }
}