import { CreateUrlDto } from './dtos';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@url-shortener/prisma-url';
import { url } from '@database/url';

@Injectable()
export class UrlRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUrlDto & { shortCode: string }): Promise<url> {
    return this.prisma.url.create({ data });
  }

  async findByShortCode(shortCode: string): Promise<url | null> {
    return this.prisma.url.findUnique({
      where: { shortCode },
    });
  }

  async findById(id: string): Promise<url> {
    return this.prisma.url.findUniqueOrThrow({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<url[]> {
    return this.prisma.url.findMany({
      where: { userId },
    });
  }

  async update(id: string, data: Partial<url>): Promise<url> {
    return this.prisma.url.update({
      where: { id },
      data,
    });
  }

  async updateByShortCode(shortCode: string, data: Partial<url>): Promise<url> {
    return this.prisma.url.update({
      where: { shortCode },
      data,
    });
  }

  async softDelete(id: string): Promise<url> {
    return this.prisma.url.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async incrementClickCount(shortCode: string): Promise<url> {
    return this.prisma.url.update({
      where: { shortCode },
      data: {
        clickCount: {
          increment: 1,
        },
      },
    });
  }
}
