package com.tripzin.eleganttex.service.email;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

/**
 * Factory for creating EmailProvider instances based on configuration
 */
@Component
@Slf4j
public class EmailProviderFactory {
    
    private final EmailProvider smtpEmailProvider;
    private final EmailProvider resendEmailProvider;
    
    public EmailProviderFactory(
            @Qualifier("smtpEmailService") EmailProvider smtpEmailProvider,
            @Qualifier("resendEmailService") EmailProvider resendEmailProvider) {
        this.smtpEmailProvider = smtpEmailProvider;
        this.resendEmailProvider = resendEmailProvider;
    }
    
    /**
     * Get the appropriate email provider based on the provider type
     * 
     * @param providerType the type of provider to use
     * @return the email provider instance
     */
    public EmailProvider getProvider(EmailProviderType providerType) {
        if (providerType == EmailProviderType.RESEND) {
            log.info("Using Resend email provider");
            return resendEmailProvider;
        } else {
            log.info("Using SMTP email provider");
            return smtpEmailProvider;
        }
    }
}
