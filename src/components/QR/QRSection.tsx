import React, { useState, useEffect } from "react";
import { CreditCard, Download } from "lucide-react";

interface VietQRBankingProps {
  amount: number;
  content: string;
  accountNumber?: string;
  bankCode?: string;
  accountName?: string;
}

const VietQRBanking: React.FC<VietQRBankingProps> = ({
  amount,
  content,
  accountNumber = "0979781768",
  bankCode = "MB",
  accountName = "VU QUANG MINH",
}) => {
  const [qrImageUrl, setQrImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateVietQR();
  }, [amount, content, accountNumber, bankCode]);

  const generateVietQR = async () => {
    try {
      setIsLoading(true);

      const vietQRUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
        content
      )}&accountName=${encodeURIComponent(accountName)}`;

      setQrImageUrl(vietQRUrl);
      setIsLoading(false);
    } catch (error) {
      console.error("Error generating VietQR:", error);
      setIsLoading(false);
    }
  };

  // Alternative: Generate using QR API service
  const generateAlternativeQR = () => {
    // Using api.qrserver.com với VietQR format
    const vietQRData = createVietQRString();
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      vietQRData
    )}`;
    return qrUrl;
  };

  // Create proper VietQR format string
  const createVietQRString = () => {
    // Simplified VietQR format (not full EMVCo spec but more compatible)
    const bankInfo = {
      bankCode: bankCode,
      accountNumber: accountNumber,
      accountName: accountName,
      amount: amount,
      content: content,
      currency: "VND",
    };

    return JSON.stringify(bankInfo);
  };

  const handleDownloadQR = () => {
    if (qrImageUrl) {
      const link = document.createElement("a");
      link.href = qrImageUrl;
      link.download = `VietQR-${accountNumber}-${Date.now()}.png`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-white/10 rounded-xl p-6 text-center border border-blue-500/30 max-w-sm mx-auto">
      <div className="flex items-center justify-center gap-2 mb-4">
        <CreditCard className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-black">QR Payment</h3>
      </div>

      {/* QR Code */}
      <div className="bg-white p-4 rounded-lg mb-4 relative">
        {isLoading ? (
          <div className="w-[200px] h-[200px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <img
            src={qrImageUrl}
            alt="VietQR Code"
            className="w-[200px] h-[200px] mx-auto object-contain"
            onError={(e) => {
              // Fallback to alternative QR if VietQR API fails
              (e.target as HTMLImageElement).src = generateAlternativeQR();
            }}
          />
        )}

        {/* QR Corner decoration */}
        <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-blue-600 rounded-tl"></div>
        <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-blue-600 rounded-tr"></div>
        <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-blue-600 rounded-bl"></div>
        <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-blue-600 rounded-br"></div>
      </div>

      {/* Bank Info */}
      <div className="bg-blue-500/10 rounded-lg p-4 mb-4 text-left">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-black">Bank:</span>
            <span className="text-black font-medium">MB Bank</span>
          </div>
          <div className="flex justify-between">
            <span className="text-black">Account:</span>
            <span className="text-black font-medium">{accountName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-black">Account number:</span>
            <span className="text-black font-mono">{accountNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-black">Amount:</span>
            <span className="text-green-400 font-bold">
              {amount.toLocaleString("vi-VN")} ₫
            </span>
          </div>
          <div className="pt-2 flex items-center text-black border-t border-blue-500/20">
            <p className="text-gray-400 text-xs mb-1">Content payment:</p>
            <p className=" text-sm font-medium bg-white/10 p-2 rounded">
              {content}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 flex justify-center w-full">
        <div>
          <button
            onClick={handleDownloadQR}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
          >
            <Download className="h-3 w-3" />
            View QR
          </button>
        </div>
      </div>

      <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
        <p className="text-orange-400 text-xs font-medium mb-1">
          ⚠️ IMPORTANT
        </p>
        <p className="text-black text-xs">
          Enter the correct transfer content to be processed automatically.
        </p>
      </div>
    </div>
  );
};

export default VietQRBanking;
