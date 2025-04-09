// Import the Twilio library
import { error } from "node:console";
import twilio, { Twilio } from "twilio";

// Define environment variables for security
const accountSid: string = process.env.TWILIO_ACCOUNT_SID || ""; // Twilio Account SID
const authToken: string = process.env.TWILIO_AUTH_TOKEN || ""; // Twilio Auth Token

// Initialize the Twilio client
const client: Twilio = twilio(accountSid, authToken);

// Function to create and send an SMS message
export async function sendMessage(
  messageString: string,
  mobile: string = "+919340233410"
): Promise<void> {
  const message = await client.messages.create({
    body: messageString,
    from: "+17726751887", // Replace with your Twilio phone number
    to: String(mobile), // Replace with the recipient's phone number
  });
}

// Call the function to send the message
