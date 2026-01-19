import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  data?: T;

  @ApiProperty({ type: [String], required: false })
  errors?: string[];
}

export class PaginationDto {
  @ApiProperty({ example: 1, default: 1 })
  page: number = 1;

  @ApiProperty({ example: 10, default: 10 })
  limit: number = 10;

  @ApiProperty({ required: false })
  search?: string;
}

export class PagedResultDto<T> {
  @ApiProperty()
  items: T[];

  @ApiProperty()
  totalCount: number;

  @ApiProperty()
  pageNumber: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  totalPages: number;
}
