# WCAG 2.2 AA Accessibility Audit Guide

## Overview

This guide provides a systematic approach to audit and improve accessibility compliance.

**Target**: WCAG 2.2 Level AA compliance

---

## Audit Checklist

### 1. Keyboard Navigation ⌨️

**Requirements:**
- [ ] All interactive elements are keyboard accessible
- [ ] Logical tab order (top-to-bottom, left-to-right)
- [ ] Visible focus indicators
- [ ] No keyboard traps
- [ ] Skip links for main content
- [ ] Modal/dialog focus management

**How to Test:**
```
1. Unplug mouse
2. Navigate using only:
   - Tab (forward)
   - Shift+Tab (backward)
   - Enter/Space (activate)
   - Arrow keys (within components)
   - Esc (close dialogs)
```

**Common Issues:**
- Buttons without proper `onClick` → use `<button>` not `<div>`
- Missing `tabIndex` on custom interactive elements
- Hidden focus outlines (never use `outline: none` without alternative)

**Fix Example:**
```tsx
// ❌ Bad
<div onClick={handleClick}>Click me</div>

// ✅ Good
<button
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  aria-label="Click me"
>
  Click me
</button>
```

---

### 2. Screen Reader Support 🔊

**Requirements:**
- [ ] Meaningful alt text for images
- [ ] ARIA labels for icons/buttons without text
- [ ] ARIA landmarks (`role="navigation"`, `main`, etc.)
- [ ] ARIA live regions for dynamic content
- [ ] Form labels properly associated
- [ ] Error messages announced

**How to Test:**
- **Windows**: NVDA (free) or JAWS
- **Mac**: VoiceOver (built-in, Cmd+F5)
- **Chrome Extension**: ChromeVox

**Common Issues:**
- Icon buttons without labels
- Form inputs without labels
- Dynamic content changes not announced

**Fix Example:**
```tsx
// ❌ Bad
<button><DeleteIcon /></button>

// ✅ Good
<button aria-label="Delete item">
  <DeleteIcon aria-hidden="true" />
</button>

// ❌ Bad
<input type="text" placeholder="Email" />

// ✅ Good
<label htmlFor="email">Email</label>
<input id="email" type="text" placeholder="Email" />
```

---

### 3. Color & Contrast 🎨

**Requirements:**
- [ ] Text contrast ratio ≥ 4.5:1 (normal text)
- [ ] Text contrast ratio ≥ 3:1 (large text 18pt+)
- [ ] UI component contrast ≥ 3:1
- [ ] Don't rely on color alone to convey information

**Tools:**
- Chrome DevTools: Lighthouse → Accessibility
- WebAIM Contrast Checker
- axe DevTools browser extension

**Common Issues:**
- Light gray text on white background
- Disabled buttons with too low contrast
- Error messages only in red color

**Fix Example:**
```tsx
// ❌ Bad - color only
<span style={{ color: 'red' }}>Error occurred</span>

// ✅ Good - icon + color + text
<span style={{ color: 'red' }} role="alert">
  <ErrorIcon aria-hidden="true" />
  Error: {message}
</span>
```

---

### 4. Forms & Validation 📝

**Requirements:**
- [ ] All inputs have labels
- [ ] Required fields indicated (not just color)
- [ ] Error messages associated with inputs
- [ ] Clear instructions
- [ ] Autocomplete attributes where appropriate

**Fix Example:**
```tsx
<TextField
  id="email"
  label="Email Address"
  required
  error={!!errors.email}
  helperText={errors.email?.message}
  aria-required="true"
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? 'email-error' : undefined}
/>
```

---

### 5. Responsive & Zoom 📱

**Requirements:**
- [ ] Text can zoom to 200% without loss of content
- [ ] No horizontal scrolling at 320px width
- [ ] Touch targets ≥ 44x44px (mobile)
- [ ] Content reflows responsively

**How to Test:**
```
1. Browser zoom to 200%
2. Resize to 320px width
3. Test on actual mobile device
```

---

### 6. Semantic HTML 📄

**Requirements:**
- [ ] Use semantic elements (`<nav>`, `<main>`, `<article>`, `<button>`)
- [ ] Heading hierarchy (h1 → h2 → h3, no skipping)
- [ ] Lists for list content (`<ul>`, `<ol>`)
- [ ] Proper table structure if using tables

**Fix Example:**
```tsx
// ❌ Bad
<div>
  <div className="title">Page Title</div>
  <div className="nav">...</div>
</div>

// ✅ Good
<main>
  <h1>Page Title</h1>
  <nav aria-label="Main navigation">...</nav>
</main>
```

---

### 7. Focus Management 🎯

**Requirements:**
- [ ] Focus moves to modal when opened
- [ ] Focus returns after modal closes
- [ ] Focus trapped inside modal (can't tab out)
- [ ] First focusable element receives focus

**Implementation:**
```tsx
const ModalComponent = ({ isOpen, onClose }) => {
  const firstElementRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      firstElementRef.current?.focus();
    }
  }, [isOpen]);
  
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <DialogTitle id="modal-title">...</DialogTitle>
      <DialogContent id="modal-description">...</DialogContent>
      <DialogActions>
        <Button ref={firstElementRef} onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
```

---

### 8. Dynamic Content 🔄

**Requirements:**
- [ ] Loading states announced
- [ ] Success/error messages announced
- [ ] Live regions for real-time updates

**Implementation:**
```tsx
// Live region for notifications
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {notification}
</div>

// For urgent alerts
<div
  role="alert"
  aria-live="assertive"
>
  {errorMessage}
</div>
```

---

## Automated Testing Tools

### 1. ESLint Plugin

```bash
npm install eslint-plugin-jsx-a11y --save-dev
```

```javascript
// .eslintrc.js
plugins: ['jsx-a11y'],
extends: ['plugin:jsx-a11y/recommended']
```

### 2. axe DevTools

Browser extension for Chrome/Firefox:
- Real-time accessibility checks
- Detailed violation reports
- Fix suggestions

### 3. Lighthouse

Built into Chrome DevTools:
```
1. Open DevTools
2. Lighthouse tab
3. Select "Accessibility"
4. Generate report
```

---

## Priority Levels

### P0 - Critical (Fix Immediately)
- Keyboard traps
- Missing form labels
- Severe contrast failures
- Missing alt text on important images

### P1 - High (Fix This Sprint)
- Focus indicators
- ARIA labels on icon buttons
- Heading hierarchy
- Modal focus management

### P2 - Medium (Plan For Next Sprint)
- Enhanced ARIA landmarks
- Improved error messages
- Better skip links
- Touch target sizes

### P3 - Low (Tech Debt Backlog)
- Redundant ARIA
- Non-critical contrast improvements
- Enhanced keyboard shortcuts

---

## Testing Workflow

### Development
1. ESLint catches basic issues
2. Manual keyboard test
3. Check with axe DevTools

### PR Review
1. Reviewer tests keyboard navigation
2. Run Lighthouse audit
3. Check color contrast

### Production
1. Regular automated scans
2. User feedback monitoring
3. Periodic manual audits

---

## Resources

- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [WebAIM Articles](https://webaim.org/articles/)

---

## Estimated Effort

**Full audit**: 2-3 days  
**High-priority fixes**: 1-2 sprints  
**Full compliance**: 3-4 sprints

**Recommendation**: Tackle P0/P1 issues first, then incorporate accessibility into regular development workflow.

