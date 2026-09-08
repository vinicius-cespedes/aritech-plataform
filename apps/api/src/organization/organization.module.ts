import { Module } from "@nestjs/common";
import { CustomersController } from "./customers.controller";
import { CustomersService } from "./customers.service";
import { SuppliersController } from "./suppliers.controller";
import { SuppliersService } from "./suppliers.service";
import { EmployeesController } from "./employees.controller";
import { EmployeesService } from "./employees.service";

@Module({
  controllers: [CustomersController, SuppliersController, EmployeesController],
  providers: [CustomersService, SuppliersService, EmployeesService],
  exports: [CustomersService, SuppliersService, EmployeesService],
})
export class OrganizationModule {}
