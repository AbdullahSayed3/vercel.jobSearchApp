import CryptoJS from "crypto-js";

export const Encryption = async ({ value, secretKey } = {}) => {
  return CryptoJS.AES.encrypt(JSON.stringify(value), secretKey).toString();
};

export const Decryption = async ({ cipher, secretKey } = {}) => {
  return CryptoJS.AES.decrypt(cipher, secretKey).toString(CryptoJS.enc.Utf8);
};
