package com.tripzin.eleganttex.service.email;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Email service facade that delegates to the appropriate email provider implementation
 */
@Service
@Slf4j
public class EmailService {
    
    private final EmailProvider emailProvider;
    private final String frontendUrl;
    
    public EmailService(
            @Value("${app.email.provider:smtp}") String providerType,
            @Value("${app.frontend-url:http://localhost:3000}") String frontendUrl,
            EmailProviderFactory emailProviderFactory) {
        
        this.frontendUrl = frontendUrl;
        
        // Use the factory to get the appropriate provider
        EmailProviderType type = EmailProviderType.fromString(providerType);
        this.emailProvider = emailProviderFactory.getProvider(type);
    }
    
    /**
     * Send verification email to a user
     * 
     * @param to recipient email address
     * @param token verification token
     */
    @Async("taskExecutor")
    public void sendVerificationEmail(String to, String token) {
        log.info("Sending verification email to: {}", to);
        
        Map<String, Object> variables = new HashMap<>();
        variables.put("verificationUrl", frontendUrl + "/verify-email?token=" + token);
        
        try {
            emailProvider.sendTemplateEmail(
                to, 
                "Verify Your Elegant Tex Account", 
                EmailTemplate.EMAIL_VERIFICATION.getTemplateName(), 
                variables
            );
            log.info("Verification email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send verification email to: {}", to, e);
            throw e;
        }
    }
    
    /**
     * Send password reset email to a user
     * 
     * @param to recipient email address
     * @param token reset token
     */
    @Async("taskExecutor")
    public void sendPasswordResetEmail(String to, String token) {
        log.info("Sending password reset email to: {}", to);
        
        Map<String, Object> variables = new HashMap<>();
        variables.put("resetUrl", frontendUrl + "/reset-password?token=" + token);
        
        try {
            emailProvider.sendTemplateEmail(
                to, 
                "Elegant Tex Password Reset Request", 
                EmailTemplate.PASSWORD_RESET.getTemplateName(), 
                variables
            );
            log.info("Password reset email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", to, e);
            throw e;
        }
    }
    
    /**
     * Send welcome email to a new user
     * 
     * @param to recipient email address
     * @param firstName user's first name
     */
    @Async("taskExecutor")
    public void sendWelcomeEmail(String to, String firstName) {
        log.info("Sending welcome email to: {}", to);
        
        Map<String, Object> variables = new HashMap<>();
        variables.put("firstName", firstName);
        variables.put("loginUrl", frontendUrl + "/login");
        
        try {
            emailProvider.sendTemplateEmail(
                to, 
                "Welcome to Elegant Tex", 
                EmailTemplate.WELCOME.getTemplateName(), 
                variables
            );
            log.info("Welcome email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", to, e);
            throw e;
        }
    }
    
    /**
     * Send a generic email
     * 
     * @param to recipient email address
     * @param subject email subject
     * @param htmlContent HTML content of the email
     */
    @Async("taskExecutor")
    public void sendEmail(String to, String subject, String htmlContent) {
        log.info("Sending email to: {} with subject: {}", to, subject);
        
        try {
            emailProvider.sendEmail(to, subject, htmlContent);
            log.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to: {} with subject: {}", to, subject, e);
            throw e;
        }
    }
    
    /**
     * Send an email with attachments
     * 
     * @param to recipient email address
     * @param subject email subject
     * @param htmlContent HTML content of the email
     * @param attachments list of files to attach
     */
    @Async("taskExecutor")
    public void sendEmailWithAttachments(String to, String subject, String htmlContent, List<File> attachments) {
        log.info("Sending email with {} attachments to: {} with subject: {}", 
                attachments.size(), to, subject);
        
        try {
            emailProvider.sendEmailWithAttachments(to, subject, htmlContent, attachments);
            log.info("Email with attachments sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email with attachments to: {} with subject: {}", 
                    to, subject, e);
            throw e;
        }
    }
}
