package com.tripzin.eleganttex.service.email;

import java.io.File;
import java.util.List;
import java.util.Map;

/**
 * Interface defining email provider capabilities
 */
public interface EmailProvider {
    
    /**
     * Send an email with HTML content
     * 
     * @param to recipient email address
     * @param subject email subject
     * @param htmlContent HTML content of the email
     */
    void sendEmail(String to, String subject, String htmlContent);
    
    /**
     * Send an email with HTML content and attachments
     * 
     * @param to recipient email address
     * @param subject email subject
     * @param htmlContent HTML content of the email
     * @param attachments list of files to attach
     */
    void sendEmailWithAttachments(String to, String subject, String htmlContent, List<File> attachments);
    
    /**
     * Send an email using a template
     * 
     * @param to recipient email address
     * @param subject email subject
     * @param templateName name of the template to use
     * @param variables variables to be used in the template
     */
    void sendTemplateEmail(String to, String subject, String templateName, Map<String, Object> variables);
    
    /**
     * Send an email using a template with attachments
     * 
     * @param to recipient email address
     * @param subject email subject
     * @param templateName name of the template to use
     * @param variables variables to be used in the template
     * @param attachments list of files to attach
     */
    void sendTemplateEmailWithAttachments(String to, String subject, String templateName, 
                                         Map<String, Object> variables, List<File> attachments);
}
