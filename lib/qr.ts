import QRCode from "qrcode";

export async function qrDataUrl(text: string) {
  return QRCode.toDataURL(text, {
    margin: 1,
    width: 360,
    color: { dark: "#0f3d3a", light: "#ffffff" },
  });
}
