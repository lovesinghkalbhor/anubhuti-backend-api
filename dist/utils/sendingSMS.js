"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = sendMessage;
const twilio_1 = __importDefault(require("twilio"));
// Define environment variables for security
const accountSid = process.env.TWILIO_ACCOUNT_SID || ""; // Twilio Account SID
const authToken = process.env.TWILIO_AUTH_TOKEN || ""; // Twilio Auth Token
// Initialize the Twilio client
const client = (0, twilio_1.default)(accountSid, authToken);
// Function to create and send an SMS message
async function sendMessage(messageString, mobile = "+919340233410") {
    // const message = await client.messages.create({
    //   body: messageString,
    //   from: "+17726751887", // Replace with your Twilio phone number
    //   to: String(mobile), // Replace with the recipient's phone number
    // });
}
// Call the function to send the message
//# sourceMappingURL=sendingSMS.js.map