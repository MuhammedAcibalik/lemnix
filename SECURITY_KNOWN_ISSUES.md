# Known Security Issues

## Critical - xlsx Package Vulnerabilities

### Issue Description
The `xlsx` package version 0.18.5 (currently the latest available on npm) has two high-severity security vulnerabilities:

1. **Prototype Pollution in SheetJS** (GHSA-4r6h-8v6p-xvw6)
   - Severity: HIGH (CVSS 7.8)
   - Affected versions: < 0.19.3
   - CWE: CWE-1321 (Improperly Controlled Modification of Object Prototype Attributes)

2. **Regular Expression Denial of Service (ReDoS)** (GHSA-5pgg-2g8v-p4x9)
   - Severity: HIGH (CVSS 7.5)
   - Affected versions: < 0.20.2
   - CWE: CWE-1333 (Inefficient Regular Expression Complexity)

### Current Status
- **Patched versions (0.19.3, 0.20.2) are NOT yet available on npm**
- Latest version on npm: 0.18.5 (published 2022-03-24)
- The project is currently using version 0.18.5

### Mitigation Strategies
Until the patched versions become available, the following mitigations are in place:

1. **Input Validation**: All file uploads are validated for type and size
2. **Controlled Environment**: File processing happens on the backend with strict CORS policies
3. **Rate Limiting**: API endpoints that process Excel files have rate limiting enabled
4. **Sandboxed Execution**: File parsing is isolated from critical application logic
5. **User Authorization**: Only authenticated and authorized users can upload files

### Recommended Actions
1. **Monitor for Updates**: Check npm registry regularly for availability of xlsx >= 0.19.3 or >= 0.20.2
2. **Alternative Solutions**: Consider migrating to alternative Excel parsing libraries:
   - `exceljs` - Modern, actively maintained, TypeScript support
   - `xlsx-populate` - Promise-based API
   - `read-excel-file` - Simpler API with better type safety
3. **Temporary Workaround**: Continue using current version with enhanced input validation and monitoring

### References
- [GHSA-4r6h-8v6p-xvw6](https://github.com/advisories/GHSA-4r6h-8v6p-xvw6)
- [GHSA-5pgg-2g8v-p4x9](https://github.com/advisories/GHSA-5pgg-2g8v-p4x9)
- [SheetJS GitHub](https://github.com/SheetJS/sheetjs)

### Last Updated
2025-11-11

---

## Other Fixed Security Issues

### ✅ Multer DoS Vulnerabilities (FIXED)
- **Previous Version**: 1.4.5-lts.2
- **Fixed Version**: 2.0.2
- **Impact**: Multiple Denial of Service vulnerabilities
- **Status**: RESOLVED

### ✅ Supertest Security Issues (FIXED)
- **Previous Version**: 6.3.4
- **Fixed Version**: 7.1.4
- **Impact**: Various security issues and maintenance concerns
- **Status**: RESOLVED
