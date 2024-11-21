import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';

@Injectable()
export class ShortCodeService {
  private readonly CODE_LENGTH = 6;

  generateCode(): string {
    return nanoid(this.CODE_LENGTH);
  }
}
