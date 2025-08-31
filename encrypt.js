// const CryptoJS = require('crypto-js');
// const dotenv = require('dotenv');
// dotenv.config();

// // Function to encrypt an object
// function encryptObject(object, key) {
//   try {
//     const jsonString = JSON.stringify(object);
//     const ciphertext = CryptoJS.AES.encrypt(jsonString, key).toString();
//     return ciphertext;
//   } catch (error) {
//     console.error('Encryption error:', error);
//     return null; // or throw an error depending on your error handling strategy
//   }
// }

// // Function to decrypt an object
// function decryptObject(ciphertext, key) {
//   try {
//     const bytes = CryptoJS.AES.decrypt(ciphertext, key);
//     const jsonString = bytes.toString(CryptoJS.enc.Utf8);
//     return JSON.parse(jsonString);
//   } catch (error) {
//     console.error('Decryption error:', error);
//     return null; // or throw an error depending on your error handling strategy
//   }
// }

// module.exports = {
//   encryptObject,
//   decryptObject
// };