package com.tripzin.eleganttex.service.email;

/**
 * Enum representing the available email templates
 */
public enum EmailTemplate {
    EMAIL_VERIFICATION("email-verification"),
    PASSWORD_RESET("password-reset"),
    WELCOME("welcome");
    
    private final String templateName;
    
    EmailTemplate(String templateName) {
        this.templateName = templateName;
    }
    
    /**
     * Get the template name used in the template engine
     * 
     * @return the template name
     */
    public String getTemplateName() {
        return templateName;
    }
}
