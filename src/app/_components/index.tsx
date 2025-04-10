import React from "react";
import FormInvoice from "./form-invoice";
import Image from "next/image";
import { Coffee, Receipt, Mail, Phone } from "lucide-react";

const PageIndex = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="container mx-auto p-8">
        {/* Header */}
        {/* <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <Coffee className="w-8 h-8 text-amber-700" />
            <h2 className="text-2xl font-bold text-amber-900">Passio Coffee</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-amber-700" />
              <span className="text-gray-600">1800 6779</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-amber-700" />
              <span className="text-gray-600">support@passio.com</span>
            </div>
          </div>
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Left section - Form */}
          <div className="w-full lg:w-full">
            <div className=" p-4">
              <div className="flex items-center gap-2 mb-6">
                <Receipt className="w-6 h-6 text-amber-700" />
                <h1 className="text-2xl font-semibold text-amber-900">
                  Thông tin xuất hóa đơn
                </h1>
              </div>

              <div className="space-y-1 mb-8">
                <p className="text-md text-gray-600">
                  Hóa đơn điện tử có mã xác thực của cơ quan thuế sẽ gởi về qua
                  email.
                </p>
                <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-2 rounded-lg">
                  <Mail className="w-5 h-5" />
                  <p className="text-sm">
                    Vui lòng kiểm tra kĩ địa chỉ email để đảm bảo nhận được hóa
                    đơn
                  </p>
                </div>
              </div>

              <FormInvoice />
            </div>
          </div>

          {/* Right section - Image and Info */}
          <div className="w-full lg:w-full space-y-8">
            <div className="relative w-full h-[calc(100vh-5rem)] rounded-2xl shadow-xl overflow-hidden">
              <Image
                src="/images/logo-v2.png"
                alt="Passio Coffee"
                layout="fill"
                objectFit="cover"
                className="rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageIndex;
