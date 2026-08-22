import "server-only";
import QRCode from "qrcode";

// Generates a real, scannable QR code (as a PNG data URL) for the given
// URL — used to embed a live link in a PDF via @react-pdf/renderer's
// <Image>. No external API call: qrcode encodes and rasterizes locally.
export async function qrCodeDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    margin: 1,
    width: 480,
    color: { dark: "#12181f", light: "#ffffff" },
  });
}
