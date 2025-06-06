import { 
    Controller, Get, Post, Put, Delete, 
    Param, Query, UseGuards, Req, Body 
  } from '@nestjs/common';
  import { MemberService } from './member.service';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/guards/roles.decorator';
  import { Request } from 'express';
  import { CreateMemberDto } from './dtos/create-member.dto';
  import { UpdateMemberDto } from './dtos/update-member.dto';
  import { RenewMemberDto } from './dtos/renew-member.dto';
  import { AuthenticatedRequest } from '../interfaces/request.interface';
  
  @Controller('members')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  export class MemberController {
    constructor(private readonly memberService: MemberService) {}
  
    @Get()
    getMembers(
      @Req() req: AuthenticatedRequest,
      @Query('status') status: string,
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10
    ) {
      return this.memberService.getMembers(
        req.user.id,
        status,
        parseInt(page as any),
        parseInt(limit as any)
      );
    }
  
    @Get(':id')
    getMember(
      @Req() req: Request,
      @Param('id') memberId: string
    ) {
      return this.memberService.getMember(
        req.user.id,
        parseInt(memberId)
      );
    }
  
    @Post()
    createMember(
      @Req() req: Request,
      @Body() dto: CreateMemberDto
    ) {
      return this.memberService.createMember(
        req.user.id,
        dto
      );
    }
  
    @Put(':id')
    updateMember(
      @Req() req: Request,
      @Param('id') memberId: string,
      @Body() dto: UpdateMemberDto
    ) {
      return this.memberService.updateMember(
        req.user.id,
        parseInt(memberId),
        dto
      );
    }
  
    @Delete(':id')
    deleteMember(
      @Req() req: Request,
      @Param('id') memberId: string
    ) {
      return this.memberService.deleteMember(
        req.user.id,
        parseInt(memberId)
      );
    }
  
    @Put(':id/renew')
    renewMember(
      @Req() req: Request,
      @Param('id') memberId: string,
      @Body() dto: RenewMemberDto
    ) {
      return this.memberService.renewMember(
        req.user.id,
        parseInt(memberId),
        dto
      );
    }
  
    @Get(':id/attendance')
    getMemberAttendance(
      @Param('id') memberId: string
    ) {
      return this.memberService.getMemberAttendance(
        parseInt(memberId)
      );
    }
  
    @Get(':id/orders')
    getMemberOrders(
      @Param('id') memberId: string
    ) {
      return this.memberService.getMemberOrders(
        parseInt(memberId)
      );
    }
  }