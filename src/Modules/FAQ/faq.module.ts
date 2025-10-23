import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FAQService } from './faq.service';
import { FAQController } from './faq.controller';
import { FAQEntity } from './FAQEntities/FAQ.Entity';

@Module({
  imports: [TypeOrmModule.forFeature([FAQEntity])],
  providers: [FAQService],
  controllers: [FAQController],
})
export class FAQModule {}
