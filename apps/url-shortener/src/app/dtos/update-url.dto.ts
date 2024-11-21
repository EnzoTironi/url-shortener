import { IsNotEmpty, IsUrl } from 'class-validator';

export class UpdateUrlDto {
  @IsUrl({}, { message: 'Invalid URL format' })
  @IsNotEmpty({ message: 'URL is required' })
  url!: string;
}
