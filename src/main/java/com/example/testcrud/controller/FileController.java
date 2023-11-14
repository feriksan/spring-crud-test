package com.example.testcrud.controller;

import com.example.testcrud.entity.FileEntity;
import com.example.testcrud.entity.User;
import com.example.testcrud.payload.UploadFileResponse;
import com.example.testcrud.service.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.HandlerMapping;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.security.Security;
import java.util.List;

@RestController
@RequestMapping("uploadFile")
@RequiredArgsConstructor
public class FileController {
    private static final Logger logger = LoggerFactory.getLogger(FileController.class);

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private FileEncrypterService encrypterService;

    @Autowired
    private FetchUserFromPayload fetchUserFromPayload;

    @PostMapping("/uploadSatu")
    public UploadFileResponse uploadFile(@RequestParam("file") MultipartFile file, @RequestParam("subfolder") String subfolder){
        String encrypt = encrypterService.base64Encoding(file, subfolder);
        String fileName = fileStorageService.storeFile(file, subfolder);

        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/downloadFile/")
                .path(fileName)
                .toUriString();

        return new UploadFileResponse(fileName, fileDownloadUri,
                file.getContentType(), file.getSize());
    }

//    @PostMapping("/uploadBanyak")
//    public ResponseEntity<List<UploadFileResponse>> uploadMultipleFiles(@RequestParam("files") MultipartFile[] files, @RequestParam("subfolder") String subfolder) {
//        return new ResponseEntity<>(Arrays.stream(files)
//                .map(this::uploadFile)
//                .collect(Collectors.toList()), HttpStatus.OK);
//    }

    @RequestMapping("/downloadFile/{fileName:.+}/**")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName, HttpServletRequest request) throws Exception {
        // Load file as Resource
        String restOfTheUrl = new AntPathMatcher().extractPathWithinPattern(request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE).toString(),request.getRequestURI());
        Resource resource;

        resource = fileStorageService.loadFileAsResource(fileName, restOfTheUrl);

        // Try to determine file's content type
        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            logger.info("Could not determine file type.");
        }

        // Fallback to the default content type if type could not be determined
        if(contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }


}
