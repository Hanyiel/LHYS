package com.lhys.api.upload;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "lhys.upload")
public record UploadProperties(
        String rootDir,
        String publicPath) {
}
