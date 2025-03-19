package com.tripzin.eleganttex.service.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.File;
import java.util.List;
import java.util.Map;

/**
 * Email service implementation using SMTP via Spring's JavaMailSender
 */
@Service("smtpEmailService")
@Primary
@RequiredArgsConstructor
@Slf4j
public class SmtpEmailService implements EmailProvider {
    
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    
    @Value("${spring.mail.from:}")
    private String fromEmail;
    
    @Override
    @Async
    public void sendEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("Email sent to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
    
    @Override
    @Async
    public void sendEmailWithAttachments(String to, String subject, String htmlContent, List<File> attachments) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            // Add attachments
            if (attachments != null && !attachments.isEmpty()) {
                for (File file : attachments) {
                    FileSystemResource fileResource = new FileSystemResource(file);
                    helper.addAttachment(file.getName(), fileResource);
                }
            }
            
            mailSender.send(message);
            log.info("Email with attachments sent to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email with attachments to {}: {}", to, e.getMessage());
        }
    }
    
    @Override
    @Async
    public void sendTemplateEmail(String to, String subject, String templateName, Map<String, Object> variables) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            
            Context context = new Context();
            if (variables != null) {
                variables.forEach(context::setVariable);
            }
            
            String htmlContent = templateEngine.process(templateName, context);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("Email '{}' sent to: {}", templateName, to);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
    
    @Override
    @Async
    public void sendTemplateEmailWithAttachments(String to, String subject, String templateName, 
                                               Map<String, Object> variables, List<File> attachments) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            
            Context context = new Context();
            if (variables != null) {
                variables.forEach(context::setVariable);
            }
            
            String htmlContent = templateEngine.process(templateName, context);
            helper.setText(htmlContent, true);
            
            // Add attachments
            if (attachments != null && !attachments.isEmpty()) {
                for (File file : attachments) {
                    FileSystemResource fileResource = new FileSystemResource(file);
                    helper.addAttachment(file.getName(), fileResource);
                }
            }
            
            mailSender.send(message);
            log.info("Email '{}' with attachments sent to: {}", templateName, to);
        } catch (MessagingException e) {
            log.error("Failed to send email with attachments to {}: {}", to, e.getMessage());
        }
    }
}
