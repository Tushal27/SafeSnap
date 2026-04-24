package com.safesnap.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.safesnap.exception.SafeSnapException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.Map;

@Slf4j
@Service
public class QrCodeService {

    private static final int QR_SIZE_PX   = 300;
    private static final String IMAGE_FMT = "PNG";

    /**
     * Encodes {@code content} into a QR code and returns it as a Base64 PNG string
     * suitable for embedding in a data URI: {@code data:image/png;base64,...}
     */
    public String generateQrCodeBase64(String content) {
        try {
            BitMatrix bitMatrix = encodeContent(content);
            return renderToBase64(bitMatrix);
        } catch (WriterException | IOException ex) {
            log.error("Failed to generate QR code", ex);
            throw new SafeSnapException("Could not generate QR code", HttpStatus.INTERNAL_SERVER_ERROR, ex);
        }
    }

    private BitMatrix encodeContent(String content) throws WriterException {
        Map<EncodeHintType, Object> hints = Map.of(
            EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M,
            EncodeHintType.MARGIN, 2
        );
        return new QRCodeWriter().encode(content, BarcodeFormat.QR_CODE, QR_SIZE_PX, QR_SIZE_PX, hints);
    }

    private String renderToBase64(BitMatrix bitMatrix) throws IOException {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            MatrixToImageWriter.writeToStream(bitMatrix, IMAGE_FMT, outputStream);
            return Base64.getEncoder().encodeToString(outputStream.toByteArray());
        }
    }
}
