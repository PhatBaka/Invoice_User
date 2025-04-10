import * as z from "zod";

const invoiceSchema = z.object({
  invoiceCode: z.string().nonempty("Mã hóa đơn là bắt buộc"),
  taxCode: z.string().nonempty("Mã số thuế là bắt buộc"),
  fullName: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().refine((val) => {
    // Validate số điện thoại Việt Nam
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    return phoneRegex.test(val);
  }, "Số điện thoại không hợp lệ"),
  email: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true; // Bỏ qua validate nếu không có giá trị
      // Validate email format
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(val);
    }, "Email không hợp lệ"),
});

export default invoiceSchema;

const InvoiceItemSchema = z.object({
  ordinalNumber: z.number().optional(),
  code: z.string().optional(),
  name: z.string().optional(),
  quantity: z.number().optional(),
  property: z.string().optional(),
  unit: z.string().optional(),
  price: z.number().optional(),
  discountRate: z.number().optional(),
  discountAmount: z.number().optional(),
  amountWithoutDiscount: z.number().optional(),
  amount: z.number().optional(),
  taxAmount: z.number().optional(),
  amountAfterTax: z.number().optional(),
  tax: z.string().optional(),
});

const TaxTypeSchema = z.object({
  tax: z.string().optional(),
  amountWithoutTax: z.number().optional(),
  taxAmount: z.number().optional(),
});

const InvoiceDetailSchema = z.object({
  receiptCode: z.string().optional(),
  buyerCustomerCode: z.string().optional(),
  buyerTaxCode: z.string().optional(),
  buyerName: z.string().optional(),
  buyerAddress: z.string().optional(),
  buyerFullName: z.string().optional(),
  buyerPhoneNumber: z.string().optional(),
  buyerEmail: z.string().optional(),
  buyerBankName: z.string().optional(),
  buyerBankAccountNumber: z.string().optional(),
  invoiceNote: z.string().optional(),
  internalNote: z.string().optional(),
  discount: z.boolean().optional(),
  code: z.string().optional(),
  quantity: z.number().optional(),
  totalAmount: z.number().optional(),
  discountAmount: z.number().optional(),
  finalAmount: z.number().optional(),
});

const ResponsePartnerSchema = z.object({
  code: z.string().optional(),
  message: z.string().optional(),
  data: z
    .object({
      requestId: z.string().optional(),
      invoiceNumber: z.string().optional(),
      invoiceSymbol: z.string().optional(),
      invoiceType: z.number().optional(),
      invoiceCreatedDate: z.string().optional(),
      taxAuthorityCode: z.string().optional(),
      lookupCode: z.string().optional(),
    })
    .optional(),
});

export const InvoiceResponseSchema = z.object({
  id: z.string().optional(),
  invoiceCode: z.string().optional(),
  createdDate: z.string().optional(),
  lookupCode: z.string().optional(),
  type: z.number().optional(),
  status: z.number().optional(),
  paymentMethod: z.string().optional(),
  currencyUnit: z.string().optional(),
  currencyExchangeRate: z.number().optional(),
  totalTaxAmount: z.number().optional(),
  totalAmountAfterTax: z.number().optional(),
  totalSaleAmount: z.number().optional(),
  totalDiscountAmount: z.number().optional(),
  totalAmountWithoutTax: z.number().optional(),
  totalAmount: z.number().optional(),
  billCode: z.string().optional(),
  templateId: z.string().optional(),
  partnerId: z.string().optional(),
  storeId: z.string().optional(),
  invoiceDetail: InvoiceDetailSchema.optional(),
  items: z.array(InvoiceItemSchema).optional(),
  taxTypes: z.array(TaxTypeSchema).optional(),
  responsePartNer: ResponsePartnerSchema.optional(),
});
