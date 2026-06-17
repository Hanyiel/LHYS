package com.lhys.api.product;

import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/servers")
    public List<ServerProductResponse> listServers(Principal principal) {
        return productService.listServers(principal);
    }

    @PostMapping("/servers")
    @ResponseStatus(HttpStatus.CREATED)
    public ServerProductResponse createServer(
            Principal principal,
            @Valid @RequestBody ServerProductRequest request) {
        return productService.createServer(principal, request);
    }

    @PutMapping("/servers/{id}")
    public ServerProductResponse updateServer(
            Principal principal,
            @PathVariable Long id,
            @Valid @RequestBody ServerProductRequest request) {
        return productService.updateServer(principal, id, request);
    }

    @DeleteMapping("/servers/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteServer(Principal principal, @PathVariable Long id) {
        productService.deleteServer(principal, id);
    }

    @GetMapping("/domains")
    public List<DomainProductResponse> listDomains(Principal principal) {
        return productService.listDomains(principal);
    }

    @PostMapping("/domains")
    @ResponseStatus(HttpStatus.CREATED)
    public DomainProductResponse createDomain(
            Principal principal,
            @Valid @RequestBody DomainProductRequest request) {
        return productService.createDomain(principal, request);
    }

    @PutMapping("/domains/{id}")
    public DomainProductResponse updateDomain(
            Principal principal,
            @PathVariable Long id,
            @Valid @RequestBody DomainProductRequest request) {
        return productService.updateDomain(principal, id, request);
    }

    @DeleteMapping("/domains/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDomain(Principal principal, @PathVariable Long id) {
        productService.deleteDomain(principal, id);
    }
}
