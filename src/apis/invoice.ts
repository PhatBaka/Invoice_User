"use server";

import invoiceSchema, { InvoiceResponseSchema } from "@/schemas/invoice.schema";
import { z } from "zod";

import { baseURL } from "@/lib/config";

export const createInvoice = async (
  invoiceData: z.infer<typeof invoiceSchema>
) => {
  try {
    const response = await fetch(`${baseURL}/invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invoiceData),
    });
    const responseData = await response.json();

    return {
      data: responseData,
      status: response.status,
    };
  } catch (e) {
    console.log("Error", e);
    throw new Error(`Failed: ${e}`);
  }
};

export const getInvoice = async ({ requestId }: { requestId: string }) => {
  const response = await fetch(`${baseURL}/invoices/${requestId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.log("Error Status", response.status);
    throw new Error("Failed to get invoice");
  }

  return {
    data: await response.json(),
    status: response.status,
  };
};

export const getInvoicePdf = async ({
  invoiceDate,
  requestId,
}: {
  invoiceDate: any;
  requestId: string;
}) => {
  const response = await fetch(
    `
    ${baseURL}/invoices-pdf?invoiceDate=${invoiceDate}&requestId=${requestId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    console.log("Error Status", response.status);
    throw new Error("Failed to get invoice pdf");
  }
  return {
    data: await response.json(),
    status: response.status,
  };
};

export const updateStatus = async ({ requestId }: { requestId: any }) => {
  const response = await fetch(
    `
    ${baseURL}/invoices/${requestId}/update-status?status=2`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    console.log("Error Status", response.status);
    throw new Error("Failed to update status");
  }

  return {
    data: await response.json(),
    status: response.status,
  };
};
