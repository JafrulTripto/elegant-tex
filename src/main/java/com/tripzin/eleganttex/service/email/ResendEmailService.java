package com.tripzin.eleganttex.service.email;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.Attachment;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import com.tripzin.eleganttex.util.FileUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Email service implementation using Resend API
 */
@Service("resendEmailService")
@Slf4j
public class ResendEmailService implements EmailProvider {

    private final Resend resend;
    private final TemplateEngine templateEngine;
    private final String fromEmail;

    public ResendEmailService(
            @Value("${app.email.resend.api-key:}") String apiKey,
            @Value("${spring.mail.from:}") String fromEmail,
            TemplateEngine templateEngine) {
        this.resend = new Resend(apiKey);
        this.fromEmail = fromEmail;
        this.templateEngine = templateEngine;
        log.info("Initialized ResendEmailService with from email: {}", fromEmail);
    }

    @Override
    @Async
    public void sendEmail(String to, String subject, String htmlContent) {
        try {
            CreateEmailOptions options = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(to)
                    .subject(subject)
                    .html(htmlContent)
                    .build();

            CreateEmailResponse response = resend.emails().send(options);
            log.info("Email sent to {} with Resend ID: {}", to, response.getId());
        } catch (ResendException e) {
            log.error("Failed to send email via Resend to {}: {}", to, e.getMessage());
        }
    }

    @Override
    @Async
    public void sendEmailWithAttachments(String to, String subject, String htmlContent, List<File> attachments) {
        try {
            List<Attachment> resendAttachments = new ArrayList<>();
            
            if (attachments != null && !attachments.isEmpty()) {
                for (File file : attachments) {
                    try {
                        String encodedContent = FileUtils.encodeFileToBase64(file);
                        Attachment attachment = Attachment.builder()
                                .fileName(file.getName())
                                .content(encodedContent)
                                .build();
                        resendAttachments.add(attachment);
                    } catch (IOException e) {
                        log.error("Failed to encode attachment {}: {}", file.getName(), e.getMessage());
                    }
                }
            }

            CreateEmailOptions.Builder optionsBuilder = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(to)
                    .subject(subject)
                    .html(htmlContent);
            
            if (!resendAttachments.isEmpty()) {
                optionsBuilder.attachments(resendAttachments);
            }

            CreateEmailResponse response = resend.emails().send(optionsBuilder.build());
            log.info("Email with attachments sent to {} with Resend ID: {}", to, response.getId());
        } catch (ResendException e) {
            log.error("Failed to send email with attachments via Resend to {}: {}", to, e.getMessage());
        }
    }

    @Override
    @Async
    public void sendTemplateEmail(String to, String subject, String templateName, Map<String, Object> variables) {
        try {
            Context context = new Context();
            if (variables != null) {
                variables.forEach(context::setVariable);
            }
            
            String htmlContent = templateEngine.process(templateName, context);
            
            CreateEmailOptions options = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(to)
                    .subject(subject)
                    .html(htmlContent)
                    .build();

            CreateEmailResponse response = resend.emails().send(options);
            log.info("Email '{}' sent to {} with Resend ID: {}", templateName, to, response.getId());
        } catch (ResendException e) {
            log.error("Failed to send email via Resend to {}: {}", to, e.getMessage());
        }
    }

    @Override
    @Async
    public void sendTemplateEmailWithAttachments(String to, String subject, String templateName, 
                                               Map<String, Object> variables, List<File> attachments) {
        try {
            Context context = new Context();
            if (variables != null) {
                variables.forEach(context::setVariable);
            }
            
            String htmlContent = templateEngine.process(templateName, context);
            
            List<Attachment> resendAttachments = new ArrayList<>();
            
            if (attachments != null && !attachments.isEmpty()) {
                for (File file : attachments) {
                    try {
                        String encodedContent = FileUtils.encodeFileToBase64(file);
                        Attachment attachment = Attachment.builder()
                                .fileName(file.getName())
                                .content(encodedContent)
                                .build();
                        resendAttachments.add(attachment);
                    } catch (IOException e) {
                        log.error("Failed to encode attachment {}: {}", file.getName(), e.getMessage());
                    }
                }
            }

            CreateEmailOptions.Builder optionsBuilder = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(to)
                    .subject(subject)
                    .html(htmlContent);
            
            if (!resendAttachments.isEmpty()) {
                optionsBuilder.attachments(resendAttachments);
            }

            CreateEmailResponse response = resend.emails().send(optionsBuilder.build());
            log.info("Email '{}' with attachments sent to {} with Resend ID: {}", 
                    templateName, to, response.getId());
        } catch (ResendException e) {
            log.error("Failed to send email with attachments via Resend to {}: {}", to, e.getMessage());
        }
    }
}
