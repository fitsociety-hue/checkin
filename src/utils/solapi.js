import CryptoJS from 'crypto-js';
import axios from 'axios';

export const sendSMS = async (apiKey, apiSecret, from, to, text, imageId = null) => {
  const date = new Date().toISOString();
  const salt = CryptoJS.lib.WordArray.random(16).toString(); // Generates a random salt
  const hmacData = date + salt;
  const signature = CryptoJS.HmacSHA256(hmacData, apiSecret).toString(CryptoJS.enc.Hex);

  const authHeader = `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;

  const message = {
    to: to,
    from: from,
    text: text
  };

  // If we had image upload capability for MMS, we would add imageId here. 
  // For now, we are sending text. If the QR code needs to be sent as an image:
  // 1. We need to upload the image to Solapi first to get an imageId.
  // 2. Then attach it.
  // However, simpler approach for "QR Code sending":
  // Usually, sending the *Image* itself via MMS is best.
  // Or sending a *Link* to the QR code.
  // The user said "QR Code sending".
  // If we generate the QR client-side, we have a base64 string.
  // Solapi supports uploading images.
  
  // Impl: We will try to rely on just text first (Link), but user likely wants the image.
  // Let's stick to text first or see if we can implement image upload.
  // UPLOADING IMAGE TO SOLAPI:
  // POST https://api.solapi.com/storage/v1/files
  // Body: { file: "base64..." } -> returns fileId.
  
  if (imageId) {
    message.imageId = imageId;
    message.type = 'MMS'; // Switch to MMS if image is present
  }

  try {
    const response = await axios.post('https://api.solapi.com/messages/v4/send', {
      message: message
    }, {
      headers: {
        Authorization: authHeader
      }
    });
    return response.data;
  } catch (error) {
    console.error("SMS Error:", error);
    throw error;
  }
};

export const uploadImage = async (apiKey, apiSecret, base64Image) => {
  const date = new Date().toISOString();
  const salt = CryptoJS.lib.WordArray.random(16).toString();
  const hmacData = date + salt;
  const signature = CryptoJS.HmacSHA256(hmacData, apiSecret).toString(CryptoJS.enc.Hex);
  const authHeader = `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;

  try {
    // Solapi expects just the base64 data, possibly without the header "data:image/png;base64,"
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const response = await axios.post('https://api.solapi.com/storage/v1/files', {
      file: cleanBase64,
      type: 'MMS' // or just leave it for auto detection, but usually specifying purpose helps
    }, {
      headers: {
        Authorization: authHeader
      }
    });
    return response.data.fileId;
  } catch (error) {
     console.error("Image Upload Error:", error);
     throw error;
  }
}
