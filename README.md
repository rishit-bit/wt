# KicksLab — Maximalist + Glassmorphism Sneaker Store

## Run
1. Extract `KicksLab_College_Project.zip`.
2. Open the `KicksLab` folder in VS Code.
3. Install/use the Live Server extension.
4. Right-click `index.html` → **Open with Live Server**. Do not use `file://` for the 3D viewer; browser module imports and GLB loading need a local server.
5. Admin demo: open `admin/login.html`, username `admin`, password `admin123`.

## Client pages
- `index.html`: home / featured sneakers
- `shop.html`: search, category filter, sorting
- `wishlist.html`: favorites
- `cart.html`: quantity changes, removal, shipping calculation, demo checkout

## Admin pages
- `admin/login.html`
- `admin/dashboard.html`
- `admin/products.html`: create, edit and delete products
- `admin/orders.html`: view orders, update status, delete orders
- `admin/customers.html`: view/delete customer records

## 3D sneaker model
The 3D Studio first tries to load `assets/models/sneaker.glb`. If the file is absent or fails to load, it automatically displays a built-in shoe-shaped  fallback with a sole, upper, tongue, heel detail and laces, so the customizer is not left blank. For a more realistic imported model, add a licensed GLB file at exactly `assets/models/sneaker.glb`.

The color picker recolors compatible upper materials. Separate recoloring for the sole, laces and panels requires an imported model with separate materials/meshes. Use Live Server (not `file://`) so the browser can load the  modules.

## Frontend-only limitations
- Products, cart, wishlist, orders and customers are stored in localStorage in the current browser/origin. They are not shared across users/devices.
- Admin demo credentials are hardcoded and are not secure. This is not production authentication.
- Checkout is a demonstration only; no real payment is collected.
- External images, Bootstrap, Google Fonts need internet access.
- Product cards use remote Unsplash image URLs; replace with licensed local images if needed.


This version intentionally removes the 3D Studio and all Three.js dependencies. The project uses standard HTML, CSS, JavaScript and Bootstrap for the storefront and admin demo.


## Updates in this version
- Added `contact.html` as the fifth client-facing page (Home, Shop, Wishlist, Bag, Contact). The form saves demo messages in browser localStorage; it does not send email.
- Cart migration now accepts older item shapes (`productId`, `product_id`, `shoeId`, `sneakerId`, `quantity`, `selectedSize`) and retains embedded product details so existing bag items can render.
- Add-to-bag buttons use delegated click handling and show an “Added” confirmation.
- Run using Live Server from the project root; use the same host/port for every page because localStorage is scoped to the browser origin.


## JavaScript form validation

The storefront and admin pages load `js/validation.js`. It checks required fields, email formats, name/message lengths, product prices and stock, and image URL formats. Checkout also validates the delivery name, address, and 10-digit Indian mobile number before creating a demo order. Invalid fields receive inline styling and browser validation messages. These are client-side demo checks only; a production application must repeat validation on a trusted server.


### Client account pages
- `login.html` — client sign-in demo.
- `register.html` — client registration form with name, email, 10-digit mobile, password confirmation, and terms validation.
- Registration demo accounts are stored in this browser using localStorage; this is not production authentication and passwords are not protected by a server.
