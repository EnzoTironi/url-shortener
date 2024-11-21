import { IsNotEmpty, IsUrl } from 'class-validator';

export class CreateUrlDto {
  @IsUrl({}, { message: 'Invalid URL format' })
  @IsNotEmpty({ message: 'Original URL is required' })
  originalUrl!: string;
}
