import { describe, expect, it } from "vitest";
import { isValidTwilioRequest } from "./twilio";

// Worked example from Twilio's request validation docs:
// https://www.twilio.com/docs/usage/security#validating-requests
const AUTH_TOKEN = "12345";
const URL = "https://example.com/myapp.php?foo=1&bar=2";
const PARAMS = new URLSearchParams({
  CallSid: "CA1234567890ABCDE",
  Caller: "+14158675310",
  Digits: "1234",
  From: "+14158675310",
  To: "+18005551212",
});
const VALID_SIGNATURE = "L/OH5YylLD5NRKLltdqwSvS0BnU=";

describe("isValidTwilioRequest", () => {
  it("accepts a correctly signed request", () => {
    expect(isValidTwilioRequest(AUTH_TOKEN, VALID_SIGNATURE, URL, PARAMS)).toBe(true);
  });

  it("rejects a tampered signature", () => {
    expect(isValidTwilioRequest(AUTH_TOKEN, "tampered", URL, PARAMS)).toBe(false);
  });

  it("rejects a mismatched auth token", () => {
    expect(isValidTwilioRequest("wrong-token", VALID_SIGNATURE, URL, PARAMS)).toBe(false);
  });

  it("rejects when params were altered", () => {
    const tampered = new URLSearchParams(PARAMS);
    tampered.set("Digits", "9999");
    expect(isValidTwilioRequest(AUTH_TOKEN, VALID_SIGNATURE, URL, tampered)).toBe(false);
  });
});
