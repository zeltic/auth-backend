import {
  IsArray,
  IsInt,
  IsNotEmpty,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class VotoIndividualDto {
  @IsInt()
  @IsNotEmpty()
  alternativaId: number;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  cantidadAcciones: number;
}

export class VotarDto {
  @IsInt()
  @IsNotEmpty()
  materiaId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VotoIndividualDto)
  votos: VotoIndividualDto[];
}
