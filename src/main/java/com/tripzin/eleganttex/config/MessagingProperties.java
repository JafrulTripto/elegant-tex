package com.tripzin.eleganttex.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.messaging")
public class MessagingProperties {

    private Webhook webhook = new Webhook();
    private RateLimiting rateLimiting = new RateLimiting();
    private Facebook facebook = new Facebook();
    private WhatsApp whatsapp = new WhatsApp();
    private Processing processing = new Processing();

    // Getters and Setters
    public Webhook getWebhook() {
        return webhook;
    }

    public void setWebhook(Webhook webhook) {
        this.webhook = webhook;
    }

    public RateLimiting getRateLimiting() {
        return rateLimiting;
    }

    public void setRateLimiting(RateLimiting rateLimiting) {
        this.rateLimiting = rateLimiting;
    }

    public Facebook getFacebook() {
        return facebook;
    }

    public void setFacebook(Facebook facebook) {
        this.facebook = facebook;
    }

    public WhatsApp getWhatsapp() {
        return whatsapp;
    }

    public void setWhatsapp(WhatsApp whatsapp) {
        this.whatsapp = whatsapp;
    }

    public Processing getProcessing() {
        return processing;
    }

    public void setProcessing(Processing processing) {
        this.processing = processing;
    }

    // Inner classes for configuration sections
    public static class Webhook {
        private String baseUrl;
        private boolean verifySignatures = true;

        public String getBaseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
        }

        public boolean isVerifySignatures() {
            return verifySignatures;
        }

        public void setVerifySignatures(boolean verifySignatures) {
            this.verifySignatures = verifySignatures;
        }
    }

    public static class RateLimiting {
        private int requestsPerMinute = 60;
        private int maxRetryAttempts = 3;
        private int retryDelaySeconds = 5;

        public int getRequestsPerMinute() {
            return requestsPerMinute;
        }

        public void setRequestsPerMinute(int requestsPerMinute) {
            this.requestsPerMinute = requestsPerMinute;
        }

        public int getMaxRetryAttempts() {
            return maxRetryAttempts;
        }

        public void setMaxRetryAttempts(int maxRetryAttempts) {
            this.maxRetryAttempts = maxRetryAttempts;
        }

        public int getRetryDelaySeconds() {
            return retryDelaySeconds;
        }

        public void setRetryDelaySeconds(int retryDelaySeconds) {
            this.retryDelaySeconds = retryDelaySeconds;
        }
    }

    public static class Facebook {
        private String appId;
        private String appSecret;
        private String graphApiUrl = "https://graph.facebook.com";
        private String apiVersion = "v23.0";
        private String webhookVerifyToken;

        public String getAppId() {
            return appId;
        }

        public void setAppId(String appId) {
            this.appId = appId;
        }

        public String getAppSecret() {
            return appSecret;
        }

        public void setAppSecret(String appSecret) {
            this.appSecret = appSecret;
        }

        public String getGraphApiUrl() {
            return graphApiUrl;
        }

        public void setGraphApiUrl(String graphApiUrl) {
            this.graphApiUrl = graphApiUrl;
        }

        public String getApiVersion() {
            return apiVersion;
        }

        public void setApiVersion(String apiVersion) {
            this.apiVersion = apiVersion;
        }

        public String getWebhookVerifyToken() {
            return webhookVerifyToken;
        }

        public void setWebhookVerifyToken(String webhookVerifyToken) {
            this.webhookVerifyToken = webhookVerifyToken;
        }

        public String getBaseUrl() {
            return graphApiUrl + "/" + apiVersion;
        }
    }

    public static class WhatsApp {
        private String apiUrl = "https://graph.facebook.com";
        private String apiVersion = "v23.0";
        private String webhookVerifyToken;

        public String getApiUrl() {
            return apiUrl;
        }

        public void setApiUrl(String apiUrl) {
            this.apiUrl = apiUrl;
        }

        public String getApiVersion() {
            return apiVersion;
        }

        public void setApiVersion(String apiVersion) {
            this.apiVersion = apiVersion;
        }

        public String getWebhookVerifyToken() {
            return webhookVerifyToken;
        }

        public void setWebhookVerifyToken(String webhookVerifyToken) {
            this.webhookVerifyToken = webhookVerifyToken;
        }

        public String getBaseUrl() {
            return apiUrl + "/" + apiVersion;
        }
    }

    public static class Processing {
        private boolean asyncEnabled = true;
        private int threadPoolSize = 10;
        private int queueCapacity = 100;

        public boolean isAsyncEnabled() {
            return asyncEnabled;
        }

        public void setAsyncEnabled(boolean asyncEnabled) {
            this.asyncEnabled = asyncEnabled;
        }

        public int getThreadPoolSize() {
            return threadPoolSize;
        }

        public void setThreadPoolSize(int threadPoolSize) {
            this.threadPoolSize = threadPoolSize;
        }

        public int getQueueCapacity() {
            return queueCapacity;
        }

        public void setQueueCapacity(int queueCapacity) {
            this.queueCapacity = queueCapacity;
        }
    }
}
