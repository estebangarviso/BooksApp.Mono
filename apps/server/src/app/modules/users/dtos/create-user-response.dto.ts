import { PaginatedUserDto } from './paginated-user.dto';

export class CreateUserResponseDto extends PaginatedUserDto {}

// register DTO OpenApi schema to Swagger
CreateUserResponseDto.registerOpenApi();
