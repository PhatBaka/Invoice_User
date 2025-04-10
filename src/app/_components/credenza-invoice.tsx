"use client";

import { InvoiceResponseSchema } from "@/schemas/invoice.schema";
import {
  Credenza,
  CredenzaTrigger,
  CredenzaClose,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaBody,
  CredenzaFooter,
} from "@/components/ui/credenza";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Download, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInvoice, getInvoicePdf, updateStatus } from "@/apis/invoice";
import { toast } from "sonner";
import { useEffect, useState } from "react";
type Props = {
  invoiceId?: string;
};
export default function InvoiceCredenza({ invoiceId }: Props) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [invoiceData, setInvoiceData] = useState<z.infer<
    typeof InvoiceResponseSchema
  > | null>(null);
  const [invoicePdf, setInvoicePdf] = useState<any>(null);
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await getInvoice({ requestId: invoiceId! });
        setInvoiceData(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy hóa đơn:", error);
      } finally {
        setIsCompleted(true); // Stop loading
      }
    };

    fetchInvoice();
  }, [isCompleted, invoiceId]);

  useEffect(() => {
    const fetchInvoicePdf = async () => {
      try {
        const today = new Date(Date.now() + 7 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
        const response = await getInvoicePdf({
          invoiceDate: today,
          requestId: invoiceId!,
        });
        setInvoicePdf(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy hóa đơn:", error);
      } finally {
        setIsCompleted(true);
      }
    };

    fetchInvoicePdf();
  }, [isCompleted, invoiceId]);

  const handleRefresh = () => {
    setIsCompleted(false); // Trigger data fetching
  };

  const handleDownload = () => {
    toast.success("Đang tải xuống...");
    window.open(invoicePdf?.downloadUrl, "_blank");
  };

  if (!invoiceData) {
    return <div>Loading...</div>;
  }

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleUpdateStatus = async () => {
    try {
      setIsUpdating(true); // Bắt đầu update
      const response = await updateStatus({ requestId: invoiceData.id! });

      // Chờ 10 giây trước khi cập nhật trạng thái
      await new Promise((resolve) => setTimeout(resolve, 10000));

      setIsCompleted(true);
      handleRefresh();
      if (response) {
        toast.success("Gửi hóa đơn thành công");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi gửi hóa đơn");
    } finally {
      setIsUpdating(false); // Kết thúc update
    }
  };

  const getStatusBadge = (status: number = 0) => {
    const statusMap = {
      0: { label: "Chờ xử lý", class: "bg-yellow-100 text-yellow-800" },
      1: { label: "Đã thanh toán", class: "bg-green-100 text-green-800" },
      2: { label: "Đã hủy", class: "bg-red-100 text-red-800" },
    };

    const statusInfo =
      statusMap[status as keyof typeof statusMap] || statusMap[0];
    return (
      <span className={`px-2 py-1 text-sm rounded-full ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <Credenza onOpenChange={(isOpen) => setIsCompleted(isOpen)}>
      <CredenzaTrigger asChild>
        <Button variant="outline" className="w-full mt-2">
          <FileText className="w-4 h-4 mr-2" />
          Xem chi tiết hóa đơn
        </Button>
      </CredenzaTrigger>

      <CredenzaContent className="max-w-5xl mx-auto">
        <CredenzaHeader className="border-b pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CredenzaTitle className="text-2xl font-bold">
                Hóa đơn #{invoiceData.invoiceCode}
              </CredenzaTitle>
              <p className="text-sm text-gray-500 mt-1">
                Ngày tạo:{" "}
                {new Date(invoiceData.createdDate || "").toLocaleDateString(
                  "vi-VN"
                )}
              </p>
            </div>
            {/* <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                In hóa đơn
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Tải PDF
              </Button>
            </div> */}
          </div>
        </CredenzaHeader>

        <CredenzaBody>
          <ScrollArea className="h-[calc(100vh-12rem)] w-full">
            <Tabs defaultValue="details" className="p-6">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Thông tin chung</TabsTrigger>
                <TabsTrigger value="items">Chi tiết sản phẩm</TabsTrigger>
                <TabsTrigger value="customer">Thông tin khách hàng</TabsTrigger>
                <TabsTrigger value="tax">Thông tin thuế</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                {/* Thông tin cơ bản */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Thông tin cơ bản
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Trạng thái</p>
                      <div className="mt-1">
                        {getStatusBadge(invoiceData.status)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mã biên lai</p>
                      <p className="font-medium">{invoiceData.billCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mã tra cứu</p>
                      <p className="font-medium">{invoiceData.lookupCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Phương thức thanh toán
                      </p>
                      <p className="font-medium">{invoiceData.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Đơn vị tiền tệ</p>
                      <p className="font-medium">{invoiceData.currencyUnit}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tỷ giá</p>
                      <p className="font-medium">
                        {invoiceData.currencyExchangeRate}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Tổng quan tài chính */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Tổng quan tài chính
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Tổng tiền hàng</p>
                      <p className="text-xl font-semibold">
                        {formatCurrency(invoiceData.totalSaleAmount)}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Chiết khấu</p>
                      <p className="text-xl font-semibold text-red-600">
                        -{formatCurrency(invoiceData.totalDiscountAmount)}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Tiền trước thuế</p>
                      <p className="text-xl font-semibold">
                        {formatCurrency(invoiceData.totalAmountWithoutTax)}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Tiền thuế</p>
                      <p className="text-xl font-semibold">
                        {formatCurrency(invoiceData.totalTaxAmount)}
                      </p>
                    </div>
                    <div className="col-span-2 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600">Tổng cộng</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {formatCurrency(invoiceData.totalAmount)}
                      </p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="items" className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Chi tiết sản phẩm
                  </h3>
                  <div className="space-y-4">
                    {invoiceData.items?.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 rounded-lg space-y-4"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">
                              Mã: {item.code}
                            </p>
                          </div>
                          <p className="font-semibold">
                            {formatCurrency(item.amount)}
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Số lượng</p>
                            <p>
                              {item.quantity} {item.unit}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Đơn giá</p>
                            <p>{formatCurrency(item.price)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Chiết khấu</p>
                            <p>
                              {item.discountRate}% (
                              {formatCurrency(item.discountAmount)})
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="customer" className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Thông tin khách hàng
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Tên khách hàng</p>
                      <p className="font-medium">
                        {invoiceData.invoiceDetail?.buyerFullName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mã số thuế</p>
                      <p className="font-medium">
                        {invoiceData.invoiceDetail?.buyerTaxCode}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Số điện thoại</p>
                      <p className="font-medium">
                        {invoiceData.invoiceDetail?.buyerPhoneNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">
                        {invoiceData.invoiceDetail?.buyerEmail}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Địa chỉ</p>
                      <p className="font-medium">
                        {invoiceData.invoiceDetail?.buyerAddress}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ngân hàng</p>
                      <p className="font-medium">
                        {invoiceData.invoiceDetail?.buyerBankName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Số tài khoản</p>
                      <p className="font-medium">
                        {invoiceData.invoiceDetail?.buyerBankAccountNumber}
                      </p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="tax" className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Thông tin thuế</h3>
                  <div className="space-y-4">
                    {invoiceData.taxTypes?.map((tax, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 rounded-lg grid grid-cols-3 gap-4"
                      >
                        <div>
                          <p className="text-sm text-gray-500">Loại thuế</p>
                          <p className="font-medium">{tax.tax}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Tiền trước thuế
                          </p>
                          <p className="font-medium">
                            {formatCurrency(tax.amountWithoutTax)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Tiền thuế</p>
                          <p className="font-medium">
                            {formatCurrency(tax.taxAmount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </ScrollArea>
        </CredenzaBody>

        <CredenzaFooter className="border-t pt-4">
          <div className="flex justify-between w-full">
            <Button variant="outline" asChild>
              <CredenzaClose>Đóng</CredenzaClose>
            </Button>
            {invoiceData.status == 0 ? (
              <Button
                onClick={handleUpdateStatus}
                disabled={!isCompleted || isUpdating}
              >
                {isUpdating ? "Đang xử lý..." : "Gửi"}
              </Button>
            ) : invoiceData.status == 1 ? (
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Tải PDF
              </Button>
            ) : (
              <Button onClick={handleRefresh}>Tải lại</Button>
            )}
          </div>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
