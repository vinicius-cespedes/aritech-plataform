import { z } from "zod";
import { uuidSchema } from "./common";

/**
 * Contato adicional de fornecedor/cliente (docx: "mais de um contato").
 * O contato principal continua nos campos planos de Customer/Supplier
 * (cadastro rápido); esta lista cobre os demais.
 */
export const contactInputSchema = z.object({
  id: uuidSchema.optional(), // presente ao editar um contato já existente
  name: z.string().min(1),
  role: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phoneDdi: z.string().optional(),
  phone: z.string().optional(),
  isPrimary: z.boolean().default(false),
  notes: z.string().optional(),
});
export type ContactInput = z.infer<typeof contactInputSchema>;

export const createCustomerSchema = z.object({
  name: z.string().min(1),
  tradeName: z.string().optional(),
  taxId: z.string().optional(),
  stateRegistration: z.string().optional(),
  municipalRegistration: z.string().optional(),
  website: z.string().optional(),
  businessArea: z.string().optional(),
  addressZip: z.string().optional(),
  addressStreet: z.string().optional(),
  addressNumber: z.string().optional(),
  addressComplement: z.string().optional(),
  addressDistrict: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().optional(),
  addressCountry: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  notes: z.string().optional(),
  contacts: z.array(contactInputSchema).optional(),
});
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export const updateCustomerSchema = createCustomerSchema.partial();

export const createSupplierSchema = z.object({
  name: z.string().min(1),
  tradeName: z.string().optional(),
  taxId: z.string().optional(),
  stateRegistration: z.string().optional(),
  municipalRegistration: z.string().optional(),
  website: z.string().optional(),
  businessArea: z.string().optional(),
  addressZip: z.string().optional(),
  addressStreet: z.string().optional(),
  addressNumber: z.string().optional(),
  addressComplement: z.string().optional(),
  addressDistrict: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().optional(),
  addressCountry: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhoneDdi: z.string().optional(),
  contactPhone: z.string().optional(),
  notes: z.string().optional(),
  contacts: z.array(contactInputSchema).optional(),
});
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export const updateSupplierSchema = createSupplierSchema.partial();

export const createEmployeeSchema = z.object({
  name: z.string().min(1),
  taxId: z.string().optional(),
  employmentType: z.string().optional(),
  role: z.string().optional(),
  costCenterId: uuidSchema.optional(),
  admissionDate: z.string().optional(),
  pixKey: z.string().optional(),
  bankName: z.string().optional(),
});
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export const updateEmployeeSchema = createEmployeeSchema.partial();
