import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min
} from 'class-validator';

export class VideoJobDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  prompt!: string;

  @IsOptional()
  @IsString()
  @IsIn([
    'veo-3.1-generate-preview',
    'veo-3.1-fast-generate-preview',
    'veo-3.1-lite-generate-preview'
  ])
  model?: string;

  @IsOptional()
  @IsString()
  @IsIn(['16:9', '9:16'])
  aspectRatio?: string;

  @IsOptional()
  @IsString()
  @IsIn(['720p', '1080p', '4k'])
  resolution?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  attempts?: number;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  idempotencyKey?: string;
}
