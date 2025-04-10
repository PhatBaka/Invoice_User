"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import invoiceSchema from "@/schemas/invoice.schema";
import { createInvoice } from "@/apis/invoice";
import InvoiceCredenza from "./credenza-invoice";

export default function MyForm() {
  const [openCredenza, setOpenCredenza] = React.useState(false);
  const [existInvoice, setExistInvoice] = React.useState(false);
  const [invoiceId, setInvoiceId] = React.useState<string | undefined>(
    undefined
  );
  const [loading, setLoading] = React.useState(false);

  const form = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceCode: "",
      taxCode: "",
      fullName: "",
      address: "",
      phone: "",
      email: "",
    },
  });

  // 🔁 Reset các trường khác khi taxCode thay đổi
  React.useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name === "taxCode" && type === "change") {
        form.setValue("fullName", "");
        form.setValue("address", "");
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (values: z.infer<typeof invoiceSchema>) => {
    try {
      setLoading(true);
      const response = await createInvoice(values);
      if (response.status === 201) {
        toast.success("Hóa đơn đã được tạo thành công!");
        form.reset();
        setInvoiceId(response.data.id);
        setOpenCredenza(true);
        setExistInvoice(true);
      } else {
        toast.error("Đã có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi gửi form", error);
      toast.error("Gửi form thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Mã hóa đơn */}
          <FormField
            control={form.control}
            name="invoiceCode"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Nhập mã hóa đơn *"
                    className="text-sm"
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mã số thuế + nút kiểm tra */}
          <FormField
            control={form.control}
            name="taxCode"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nhập mã số thuế *"
                      className="text-sm"
                      disabled={loading}
                      {...field}
                    />
                  </div>
                </FormControl>
                <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={async () => {
              if (!field.value) {
                toast.warning("Vui lòng nhập mã số thuế trước.");
                return;
              }

              try {
                setLoading(true);
                const result = await checkTaxCode(field.value);
                if (result.code === "00") {
                  const data = result.data;

                  form.setValue("taxCode", data.taxCode);
                  form.setValue("fullName", data.fullName || "");
                  form.setValue("address", data.addressLine || "");

                  toast.success("Đã lấy thông tin từ mã số thuế.");
                } else {
                  toast.error("Không tìm thấy mã số thuế.");
                }
              } catch (error) {
                console.error(error);
                toast.error("Lỗi khi kiểm tra mã số thuế.");
              } finally {
                setLoading(false);
              }
            }}
          >
            Kiểm tra
          </Button>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tên đầy đủ */}
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Nhập tên đầy đủ"
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Địa chỉ */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Nhập địa chỉ"
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Số điện thoại */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Nhập số điện thoại *"
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Nhập email"
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nút Gửi */}
        <Button type="submit" className="w-full" disabled={loading}>
          Gửi
        </Button>
      </form>

      {/* Hiển thị invoice sau khi tạo thành công */}
      {existInvoice && <InvoiceCredenza invoiceId={invoiceId} />}
    </Form>
  );
}

// ✅ Gọi API check mã số thuế
const checkTaxCode = async (taxCode: string) => {
  const url = `https://admin.invoice.reso.vn/api/v1/tax-code/${taxCode}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Không thể kiểm tra mã số thuế.");
  return response.json();
};
