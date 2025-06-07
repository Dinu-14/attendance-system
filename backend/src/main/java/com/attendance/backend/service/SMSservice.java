package com.attendance.backend.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import org.springframework.stereotype.Service;

@Service
public class SMSservice {
    private final String ACCOUNT_SID = "YOUR_TWILIO_SID";
    private final String AUTH_TOKEN = "YOUR_TWILIO_AUTH_TOKEN";
    private final String FROM_NUMBER = "YOUR_TWILIO_PHONE_NUMBER";

    public SMSservice() {
        Twilio.init(ACCOUNT_SID, AUTH_TOKEN);
    }

    public void sendSms(String to, String body) {
        Message.creator(
                new com.twilio.type.PhoneNumber(to),
                new com.twilio.type.PhoneNumber(FROM_NUMBER),
                body
        ).create();
    }
}