# ZELORA Luxury E-Commerce Design Specification

## 1. Project Overview

**Brand:** ZELORA  
**Category:** Women's Fashion E-Commerce  
**Positioning:** Modern luxury women's fashion

ZELORA should feel like an established international fashion house rather than a generic online clothing store.

The design must communicate:

- Elegance
- Sophistication
- Feminine confidence
- Minimalism
- Timeless style
- Editorial luxury
- Premium quality

The website should prioritize fashion imagery, typography, whitespace, product presentation, and subtle interactions.

---

## 2. Design Direction

Create an original luxury fashion experience inspired by the visual principles used by premium fashion brands.

### Core principles

1. Large editorial photography
2. Generous whitespace
3. Refined serif typography
4. Clean modern sans-serif interface typography
5. Restrained color palette
6. Minimal navigation
7. Strong visual hierarchy
8. Subtle animations
9. Premium product presentation
10. Calm, confident composition

Do **not** copy another fashion brand's website.

Avoid:

- Generic Shopify-style layouts
- SaaS/dashboard aesthetics
- Excessive rounded cards
- Heavy shadows
- Bright colors
- Neon colors
- Excessive gradients
- Oversized colorful buttons
- Crowded layouts
- Unnecessary decorative elements

---

# 3. Brand Identity

## Logo

Use the approved ZELORA logo:

- Stylized black "Z"
- Elegant dusty-rose flowing ribbon accent
- ZELORA wordmark
- Optional "WOMEN'S FASHION" descriptor

The logo should remain visually clean and should not be altered unnecessarily.

### Logo usage

Desktop:
- Full ZELORA logo in the main header

Mobile:
- Full wordmark or Z monogram depending on available space

Favicon:
- Stylized Z monogram

---

# 4. Color System

Use a restrained luxury palette.

### Primary

```text
Ivory:       #F8F5EF
Soft Black:  #171717
Charcoal:    #303030
White:       #FFFFFF
```

### Secondary

```text
Dusty Rose:  #C99A96
Warm Beige:  #E7DDD2
Champagne:   #B9955B
```

### Usage

Ivory:
- Main page backgrounds
- Editorial sections

Soft Black:
- Navigation
- Headings
- Primary buttons
- Product text

Dusty Rose:
- Small accents
- Logo ribbon
- Selected states
- Subtle highlights

Champagne:
- Use extremely sparingly

Do not use the accent colors everywhere. Luxury should come primarily from typography, spacing, photography, and composition.

---

# 5. Typography

Use two complementary font families.

## Display / Editorial Font

Use an elegant high-fashion serif.

Preferred options:

- Cormorant Garamond
- Playfair Display
- DM Serif Display
- Bodoni Moda

Use for:

- Hero headings
- Section headings
- Editorial statements
- Brand storytelling

## Interface Font

Use a clean modern sans-serif.

Preferred options:

- Inter
- Manrope
- DM Sans
- Helvetica Neue

Use for:

- Navigation
- Product names
- Prices
- Buttons
- Filters
- Forms
- Supporting text

### Typography rules

Headings should feel editorial and refined.

Navigation and product information should be understated.

Use uppercase text with letter spacing for small labels.

Example:

```text
NEW ARRIVALS
```

Use approximately:

```text
letter-spacing: 0.12em
```

Do not use excessively bold typography.

---

# 6. Global Layout

Use a wide desktop container.

Suggested maximum width:

```text
max-width: 1440px
```

Desktop horizontal padding:

```text
48px - 72px
```

Tablet:

```text
32px
```

Mobile:

```text
16px - 20px
```

Use generous vertical spacing.

Large editorial sections may use:

```text
padding-top: 100px - 160px
padding-bottom: 100px - 160px
```

Mobile:

```text
padding-top: 64px - 90px
padding-bottom: 64px - 90px
```

---

# 7. Header

Create a refined sticky header.

## Desktop

Left:

```text
ZELORA
```

Center navigation:

```text
NEW ARRIVALS

DRESSES
JEWELLERY
COLLECTIONS

```

Right:

```text
Search
Account
Wishlist
Shopping Bag
```

### Header behavior

Initially:

- Ivory/transparent background depending on hero design
- Minimal visual weight

After scrolling:

- Solid ivory background
- Subtle bottom border
- Smooth transition
- Slight backdrop blur if appropriate

### Navigation interactions

On hover:

- Elegant underline animation
- No large color change

Dropdown menus should be editorial and spacious rather than cramped.

---

# 8. Mobile Header

Mobile header:

```text
[Menu]       ZELORA       [Search] [Bag]
```

Use a slide-in navigation drawer.

Navigation:

```text
NEW ARRIVALS

DRESSES
JEWELLERY
COLLECTIONS
SALE
```

Add secondary links:

```text
Account
Wishlist
Contact
```

---

# 9. Homepage

## Hero Section

The hero should dominate the first screen.

Use:

- High-end editorial fashion image
- Full-width composition
- Approximately 75–90vh height on desktop
- Strong visual subject
- Minimal text

Suggested content:

```text
THE NEW SEASON

A study in modern femininity.

[ EXPLORE THE COLLECTION ]
```

Alternative:

```text
THE NEW EDIT

Discover the latest ZELORA collection.

[ SHOP THE COLLECTION ]
```

### Hero behavior

- Image should be edge-to-edge
- Text should remain minimal
- Use subtle dark/white overlay only when necessary
- CTA should be understated

Preferred CTA:

Black filled button with white text or transparent/light button depending on image contrast.

Avoid bright blue, pink, or gradient buttons.

---

# 10. Featured Collection

Use an editorial split layout.

Desktop:

```text
[ Large Image ] [ Editorial Text ]
```

Example:

```text
THE AUTUMN EDIT

Designed for moments
that deserve to be remembered.

[ EXPLORE COLLECTION ]
```

Mobile:

Stack image and content vertically.

Use generous whitespace.

---

# 11. Shop by Category

Do not use grey placeholder cards.

Use large fashion photography.

Categories:

- Dresses
- New Arrivals
- Jewellery
- Handbags
- Heels


### Category card

Image-first layout.

Overlay:

```text
DRESSES
```

On hover:

- Image zooms approximately 1.03–1.06
- Subtle dark overlay
- Text becomes more prominent
- Smooth transition

Avoid heavy card borders.

---

# 12. New Arrivals

Heading:

```text
NEW ARRIVALS
```

Optional supporting copy:

```text
The latest pieces from ZELORA.
```

## Product grid

Desktop:

```text
4 columns
```

Tablet:

```text
3 columns
```

Mobile:

```text
2 columns
```

Product card should contain:

- Product image
- New badge
- Product name
- Category/short descriptor
- Price
- Wishlist button
- Optional color indicator

Do not put heavy borders around cards.

---

# 13. Product Card

Product cards should feel editorial rather than like generic retail cards.

### Image

Use consistent aspect ratio:

```text
4:5
```

Images should be large and visually dominant.

### Hover

Desktop:

- Crossfade to second product image
- Slight image zoom
- Reveal QUICK VIEW
- Reveal wishlist icon

Mobile:

- Keep interaction simple
- Do not rely only on hover

### Product information

keep the same information in the current website

Keep text compact.

---

# 14. Editorial Banner

Create a full-width cinematic image section.

Example:

```text
THE ZELORA WOMAN

Confidence is timeless.

[ DISCOVER THE EDIT ]
```

Use large typography and minimal copy.

This section should feel like a fashion magazine spread.

---

# 15. Signature Collections

Create an asymmetric editorial layout.

Three featured collections:

```text
THE ESSENTIALS
EVENING EDIT
JEWELLERY
```

Do not make all three cards identical.

Use varied image sizes and editorial spacing.

---

# 16. Bestsellers

Heading:

```text
THE ZELORA EDIT
```

Subheading:

```text
Pieces chosen for their timeless appeal.
```

Use the same premium product-card system as New Arrivals.

Include:

- Product image
- Product name
- Price
- Wishlist
- Quick view

---

# 17. Brand Story

Create a strong visual storytelling section.

Desktop:

```text
[ Lifestyle Image ] [ Text ]
```

Heading:

```text
MADE FOR HER.
```

Body:

```text
ZELORA celebrates modern femininity through
considered silhouettes, refined details and
timeless design.
```

CTA:

```text
OUR STORY
```

Keep copy short.

---

# 18. Newsletter

Create an editorial newsletter section.

Heading:

```text
ENTER THE WORLD OF ZELORA
```

Supporting text:

```text
Be the first to discover new collections,
private edits and stories from ZELORA.
```

Input:

```text
Your email address
```

Button:

```text
JOIN ZELORA
```

Keep the section spacious.

Do not make it look like a generic dark SaaS newsletter box.

---

# 19. Footer

Create a premium multi-column footer.

## Brand

```text
ZELORA

Modern women's fashion,
thoughtfully designed.
```

## Shop

```text
New Arrivals
Dresses

Jewellery
Collections
Sale
```

## Client Services

```text
Contact
Shipping
Returns

FAQ
```

## About

```text
Our Story
Journal

Privacy
Terms
```

## Social

```text
Instagram
Pinterest
Facebook
```

Bottom:

```text
© 2026 ZELORA. All rights reserved.
```

Use subtle separators and generous spacing.

---

# 20. Product Detail Page

Create a premium product detail experience.

Desktop:

```text
[ Large Product Gallery ] [ Product Information ]
```

Product information:

```text
PRODUCT NAME

₹4,999

Short description



SIZE

[ XS ] [ S ] [ M ] [ L ] [ XL ]

Size Guide

[ ADD TO BAG ]

♡ ADD TO WISHLIST
```

Add expandable sections:

```text
DESCRIPTION
DETAILS & MATERIALS
SIZE & FIT
SHIPPING & RETURNS
```

Below:

```text
YOU MAY ALSO LIKE
```

Use a product carousel/grid.

---

# 21. Collection / Category Page

Top:

Large editorial collection banner.

Example:

```text
DRESSES

Silhouettes designed for every occasion.
```

Then:

```text
24 ITEMS

FILTER
SORT
```

Desktop:

- Left filter sidebar
- Product grid on right

Mobile:

- Filter button
- Sort button
- Slide-out filter drawer

Filters:

```text
Size
Color
Price
Category
Availability
```

---

# 22. Cart Drawer

Use a slide-out cart drawer.

Display:

```text
YOUR BAG

Product
Quantity
Price
Remove
```

Bottom:

```text
Subtotal

[ CHECKOUT ]
```

Add:

```text
You may also like
```

Do not overwhelm the user with recommendations.

---

# 23. Search

Create a refined search overlay.

When search is opened:

```text
SEARCH ZELORA

[ Search products... ]

TRENDING SEARCHES

Dresses
New Arrivals
Jewellery
Evening Wear
```

Results should update smoothly.

---

# 24. Wishlist

Wishlist should have a clean editorial product grid.

Each item:

- Image
- Product name
- Price
- Remove
- Add to Bag

---

# 25. Micro-interactions

Use subtle premium animations.

Recommended:

- Image hover zoom
- Product image crossfade
- Navigation underline
- Smooth wishlist animation
- Add-to-cart feedback
- Fade/reveal on scroll
- Subtle page transitions
- Gentle parallax on selected editorial imagery
- Sticky header transition

Animation timing:

```text
200ms - 400ms
```

Editorial image transitions can be slightly slower.

Avoid:

- Bouncing
- Flashing
- Excessive motion
- Large page transitions
- Distracting effects

---

# 26. Responsive Design

The mobile design must be intentionally designed, not simply scaled down.

## Desktop

- Large editorial photography
- 4-column product grid
- Spacious navigation
- Asymmetric layouts

## Tablet

- 3-column product grid
- Reduced spacing
- Adaptive editorial sections

## Mobile

- 2-column product grid
- Compact header
- Large editorial imagery
- Horizontal collection sliders where useful
- Comfortable touch targets
- Simplified navigation
- Optimized typography

Recommended mobile product image ratio:

```text
4:5
```

---

# 27. Accessibility

Maintain:

- Good color contrast
- Keyboard navigation
- Visible focus states
- Semantic HTML
- Alt text for product/editorial images
- Accessible form labels
- Accessible buttons
- Touch targets at least approximately 44px

Do not sacrifice accessibility for visual style.

---

# 28. Performance

Luxury design should not mean a slow website.

Use:

- Responsive images
- Lazy loading
- Modern image formats where possible
- Proper image dimensions
- Avoid unnecessary JavaScript
- Avoid excessive animation
- Optimize fonts
- Avoid loading huge images unnecessarily

Prioritize fast initial rendering.

---

# 29. Component Architecture

Create reusable components.

Suggested structure:

```text
components/
├── layout/
│   ├── Header
│   ├── MobileMenu
│   ├── Footer
│   └── Container
│
├── home/
│   ├── Hero
│   ├── FeaturedCollection
│   ├── CategoryGrid
│   ├── ProductSection
│   ├── EditorialBanner
│   ├── SignatureCollections
│   ├── BrandStory
│   └── Newsletter
│
├── product/
│   ├── ProductCard
│   ├── ProductGrid
│   ├── ProductGallery
│   ├── ProductInfo
│   ├── SizeSelector
│   ├── WishlistButton
│   └── QuickView
│
├── shop/
│   ├── FilterSidebar
│   ├── FilterDrawer
│   ├── SortDropdown
│   └── CollectionHeader
│
└── cart/
    ├── CartDrawer
    ├── CartItem
    └── CartSummary
```

Keep components reusable and avoid duplicating UI logic.

---

# 30. Design Tokens

Create centralized design tokens.

Example:

```css
:root {
  --color-ivory: #F8F5EF;
  --color-black: #171717;
  --color-charcoal: #303030;
  --color-white: #FFFFFF;
  --color-dusty-rose: #C99A96;
  --color-beige: #E7DDD2;
  --color-champagne: #B9955B;

  --font-display: "Cormorant Garamond", serif;
  --font-body: "Inter", sans-serif;

  --radius-sm: 2px;
  --radius-md: 4px;

  --container-max: 1440px;

  --transition-fast: 200ms ease;
  --transition-normal: 300ms ease;
  --transition-slow: 500ms ease;
}
```

Avoid excessive border radius.

---

# 31. Buttons

Primary button:

```text
ADD TO BAG
```

Style:

- Soft black background
- White text
- Small uppercase typography
- Letter spacing
- Minimal radius
- Smooth hover transition

Hover:

- Slightly lighter/darker black
- No dramatic scaling

Secondary button:

```text
EXPLORE COLLECTION
```

Can use an outlined or text-based style.

---

# 32. Visual Hierarchy

Always prioritize:

```text
1. Fashion imagery
2. ZELORA branding
3. Editorial typography
4. Products
5. Supporting information
6. Utility UI
```

The website should never feel crowded.

Whitespace is part of the brand.

---

# 33. Final Quality Standard

Before considering a page complete, ask:

- Does this look like a luxury fashion brand?
- Is the photography the visual focus?
- Is the typography sophisticated?
- Is there enough whitespace?
- Does the page feel calm rather than crowded?
- Are product cards premium?
- Are interactions subtle?
- Does the mobile version feel intentionally designed?
- Is the ZELORA identity consistent?
- Does the website avoid generic e-commerce patterns?

The final result should feel like a professionally designed commercial fashion brand website, not a template.

Build the interface with production-quality responsive code and reusable components while preserving the existing e-commerce functionality and product data.
