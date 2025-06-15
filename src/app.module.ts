import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OwnerController } from './owner/owner.controller';
import { OwnerService } from './owner/owner.service';
import { OwnerModule } from './owner/owner.module';
import { MemberModule } from './member/member.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // This makes ConfigService available everywhere
    }),
    AuthModule,OwnerModule, MemberModule],
  controllers: [AppController, OwnerController],
  providers: [AppService, OwnerService],
})
export class AppModule {}
