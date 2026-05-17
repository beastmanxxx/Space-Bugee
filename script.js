// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyA-Hhp8Q3NuQY2Z3Avt_6UoCsfPGKR1dqg",
    authDomain: "spacebugee-37edf.firebaseapp.com",
    projectId: "spacebugee-37edf",
    storageBucket: "spacebugee-37edf.firebasestorage.app",
    messagingSenderId: "708533904348",
    appId: "1:708533904348:web:49f0b119b4b87fb0f56519"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// Custom Premium Brown Toast System
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    
    // Choose icon based on type
    let iconClass = 'ph-fill ph-check-circle';
    if (type === 'error') {
        iconClass = 'ph-fill ph-warning-octagon';
    } else if (type === 'info') {
        iconClass = 'ph-fill ph-info';
    }
    
    toast.innerHTML = `
        <div class="toast-content">
            <i class="${iconClass}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close"><i class="ph ph-x"></i></button>
    `;
    
    toast.querySelector('.toast-close').onclick = () => {
        toast.classList.add('toast-fade-out');
        setTimeout(() => toast.remove(), 300);
    };
    
    container.appendChild(toast);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.add('toast-fade-out');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }
    }, 4000);
}

let initialPage = window.location.hash.slice(1) || 'home';
if (initialPage.startsWith('category-')) {
    initialPage = 'category';
}

let localCart = [];
try {
    localCart = JSON.parse(localStorage.getItem('space_bugee_cart')) || [];
} catch (e) {
    localCart = [];
}

let localFavourites = [];
try {
    localFavourites = JSON.parse(localStorage.getItem('space_bugee_favourites')) || [];
} catch (e) {
    localFavourites = [];
}

let state = {
    user: null,
    currentPage: initialPage,
    cart: localCart,
    favourites: localFavourites,
    searchQuery: '',
    selectedProduct: null,
    isAuthModalOpen: false,
    authMode: 'login',
    currentHeroSlide: 0,
    isMobileMenuOpen: false,
    liveProducts: [],
    liveCategories: [],
    isIconsDropdownOpen: false,
    activeCartDetailItem: null,
    cartDetailActiveImg: null,
    selectedShopCategory: 'All',
    selectedSaleCategory: 'All',
    maxSalePrice: 5000,
    selectedSaleDiscount: 0,
    liveSlideshow: []
};

const HERO_SLIDES = [
    {
        title: "Elevated Style. Everyday Comfort.",
        subtitle: "NEW SEASON COLLECTION",
        desc: "Timeless pieces, modern design. Made for the way you live.",
        img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2070",
        btnText: "SHOP NEW ARRIVALS"
    },
    {
        title: "Urban Essentials Redefined",
        subtitle: "ESTABLISHED 2026",
        desc: "Minimalist aesthetics meeting premium quality. Discover the pieces that define the new era.",
        img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=2070",
        btnText: "EXPLORE NOW"
    },
    {
        title: "The Summer Drop is Here",
        subtitle: "LIMITED EDITION",
        desc: "Lightweight fabrics, bold graphics. Stay cool while looking sharp this season.",
        img: "https://images.unsplash.com/photo-1523359346063-d8793b4bd00c?auto=format&fit=crop&q=80&w=2070",
        btnText: "SHOP SUMMER"
    }
];

// Categories will be loaded dynamically from Firestore

// Helper Functions
async function fetchProducts() {
    try {
        const snapshot = await db.collection('products').orderBy('createdAt', 'desc').get();
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Fetched Products:", products);
        setState({ liveProducts: products });
    } catch (err) {
        console.error("Error fetching products:", err);
    }
}

async function fetchCategories() {
    try {
        const snapshot = await db.collection('categories').orderBy('createdAt', 'desc').get();
        const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Fetched Categories:", categories);
        setState({ liveCategories: categories });
    } catch (err) {
        console.error("Error fetching categories:", err);
    }
}

async function fetchSlideshow() {
    try {
        const snapshot = await db.collection('slideshow').orderBy('createdAt', 'asc').get();
        const slides = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setState({ liveSlideshow: slides });
    } catch (err) {
        console.error("Error fetching slideshow:", err);
    }
}

// Auth Listener
auth.onAuthStateChanged(async user => {
    state.user = user;
    if (!user) {
        state.isAuthModalOpen = true;
        state.isAdmin = false;
        try {
            state.cart = JSON.parse(localStorage.getItem('space_bugee_cart')) || [];
        } catch (e) {
            state.cart = [];
        }
        try {
            state.favourites = JSON.parse(localStorage.getItem('space_bugee_favourites')) || [];
        } catch (e) {
            state.favourites = [];
        }
    } else {
        state.isAuthModalOpen = false;
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            let dbCart = [];
            let dbFavs = [];
            if (userDoc.exists) {
                state.isAdmin = userDoc.data().isAdmin || false;
                dbCart = userDoc.data().cart || [];
                dbFavs = userDoc.data().favourites || [];
            } else {
                state.isAdmin = false;
            }

            // Merge guest cart from localstorage with database cart
            let localCart = [];
            try {
                localCart = JSON.parse(localStorage.getItem('space_bugee_cart')) || [];
            } catch (e) {
                localCart = [];
            }

            const mergedCart = [...dbCart];
            localCart.forEach(localItem => {
                const existing = mergedCart.find(item => item.cartItemId === localItem.cartItemId);
                if (existing) {
                    existing.quantity = Math.max(existing.quantity, localItem.quantity);
                } else {
                    mergedCart.push(localItem);
                }
            });

            state.cart = mergedCart;
            saveCartToDb();

            // Merge guest favourites from localstorage with database favourites
            let localFavs = [];
            try {
                localFavs = JSON.parse(localStorage.getItem('space_bugee_favourites')) || [];
            } catch (e) {
                localFavs = [];
            }

            const mergedFavs = [...dbFavs];
            localFavs.forEach(localItem => {
                const existing = mergedFavs.find(item => item.id === localItem.id);
                if (!existing) {
                    mergedFavs.push(localItem);
                }
            });

            state.favourites = mergedFavs;
            saveFavouritesToDb();

        } catch (e) {
            console.error("Auth state cart & wishlist sync error:", e);
            state.isAdmin = false;
        }
    }
    render();
});

async function saveCartToDb() {
    localStorage.setItem('space_bugee_cart', JSON.stringify(state.cart));
    if (state.user) {
        try {
            await db.collection('users').doc(state.user.uid).set({
                cart: state.cart
            }, { merge: true });
        } catch (e) {
            console.error("Error saving cart to db:", e);
        }
    }
}

async function saveFavouritesToDb() {
    localStorage.setItem('space_bugee_favourites', JSON.stringify(state.favourites));
    if (state.user) {
        try {
            await db.collection('users').doc(state.user.uid).set({
                favourites: state.favourites
            }, { merge: true });
        } catch (e) {
            console.error("Error saving favourites to db:", e);
        }
    }
}

// Routing
window.addEventListener('hashchange', () => {
    const page = window.location.hash.slice(1) || 'home';
    if (page.startsWith('category-')) {
        state.currentPage = 'category';
    } else {
        state.currentPage = page;
    }
    window.scrollTo(0, 0);
    render();
});

// Helper Functions
function setState(newState) {
    state = { ...state, ...newState };
    render();
}

function navigate(page) {
    let targetPage = page;
    if (page.startsWith('category-')) {
        targetPage = 'category';
    }
    setState({ currentPage: targetPage });
    window.location.hash = page;
    window.scrollTo(0, 0);
}

function scrollToSection(id) {
    if (state.currentPage !== 'home') {
        setState({ currentPage: 'home' });
        window.location.hash = 'home';
        setTimeout(() => {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    } else {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
}

function addToCart(product) {
    if (!state.user) {
        state.isAuthModalOpen = true;
        setState({ authMode: 'login' });
        return;
    }

    const needsSize = product.sizes && product.sizes.length > 0;
    const needsColor = product.colors && product.colors.length > 0;

    if ((needsSize && !state.selectedSize) || (needsColor && !state.selectedColor)) {
        if (!state.selectedProduct || state.selectedProduct.id !== product.id) {
            viewProduct(product.id);
            showToast("Please select your preferred size and color first!", "info");
            return;
        }

        if (needsSize && !state.selectedSize) {
            showToast("Please select a size first!", "info");
            return;
        }
        if (needsColor && !state.selectedColor) {
            showToast("Please select a color first!", "info");
            return;
        }
    }

    const selectedColorObj = product.colors ? product.colors.find(c => c.hex === state.selectedColor) : null;
    const colorName = selectedColorObj ? selectedColorObj.name : '';
    const colorImg = (selectedColorObj && selectedColorObj.images && selectedColorObj.images.length > 0 && selectedColorObj.images[0] !== '') 
        ? selectedColorObj.images[0] 
        : (product.images && product.images.length > 0 ? product.images[0] : (product.img || ''));

    const selectedSizeObj = product.sizes ? product.sizes.find(s => s.name === state.selectedSize) : null;
    const finalPrice = selectedSizeObj && selectedSizeObj.price ? selectedSizeObj.price : product.price;

    const cartItemId = `${product.id}_${state.selectedSize || ''}_${state.selectedColor || ''}`;

    const existing = state.cart.find(item => item.cartItemId === cartItemId);
    if (existing) {
        state.cart = state.cart.map(item => item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item);
    } else {
        state.cart.push({
            ...product,
            cartItemId,
            selectedSize: state.selectedSize || '',
            selectedColor: state.selectedColor || '',
            selectedColorName: colorName,
            selectedColorImg: colorImg,
            price: finalPrice,
            quantity: 1
        });
    }
    
    saveCartToDb();
    render();
    showToast("Product added to cart successfully!", "success");
}

function toggleFavourite(product) {
    const index = state.favourites.findIndex(item => item.id === product.id);
    if (index > -1) {
        state.favourites.splice(index, 1);
        showToast("Removed from Wishlist!", "info");
    } else {
        state.favourites.push(product);
        showToast("Added to Wishlist!", "success");
    }
    saveFavouritesToDb();
    render();
}

// Initial Fetch
fetchProducts();
fetchCategories();
fetchSlideshow();

// Components Rendering
const Navbar = () => `
    <header class="top-bar">
        <div class="left">
            <i class="ph-fill ph-truck"></i>
            <span>Free Shipping on Orders Over ₹999</span>
        </div>
        <div class="right top-bar-links">
            <a href="#">Track Order</a>
            <span class="divider">|</span>
            <a href="#">Help & FAQs</a>
            <span class="divider">|</span>
            <a href="#">English <i class="ph ph-caret-down"></i></a>
        </div>
    </header>
    <nav class="navbar">
        <div class="menu-toggle" onclick="toggleMobileMenu()"><i class="ph ph-list"></i></div>
        <div class="logo" onclick="navigate('home')">space bugee</div>
        <div class="nav-links desktop-only">
            <span class="${state.currentPage === 'home' ? 'active' : ''}" onclick="navigate('home')">Home</span>
            <span class="${state.currentPage === 'shop' ? 'active' : ''}" onclick="navigate('shop')">Shop</span>
            <span onclick="scrollToSection('newArrivals')">New Arrivals</span>
            <span class="${state.currentPage === 'sale' ? 'active' : ''}" onclick="navigate('sale')">Sale</span>
        </div>
        <div class="nav-icons-wrapper">
            <div class="mobile-icons-toggle" onclick="toggleIconsDropdown()">
                <i class="ph ph-caret-down ${state.isIconsDropdownOpen ? 'rotate-180' : ''}"></i>
            </div>
            <div class="nav-icons ${state.isIconsDropdownOpen ? 'mobile-show' : ''}">
                <i class="ph ph-magnifying-glass" onclick="navigate('shop'); closeIconsDropdown()"></i>
                <i class="ph ph-user" onclick="navigate('profile'); closeIconsDropdown()"></i>
                <i class="ph ph-heart" onclick="navigate('favourites'); closeIconsDropdown()"></i>
                <div class="cart-icon" onclick="navigate('cart'); closeIconsDropdown()">
                    <i class="ph ph-shopping-cart"></i>
                    ${state.cart.length > 0 ? `<span class="cart-badge">${state.cart.length}</span>` : ''}
                </div>
                ${(state.isAdmin || (state.user && state.user.email === 'moghaeashu@gmail.com')) ? `<i class="ph ph-gear" onclick="window.open('admin.html', '_blank'); closeIconsDropdown()"></i>` : ''}
            </div>
        </div>
        
        <!-- Mobile Menu -->
        <div class="mobile-menu ${state.isMobileMenuOpen ? 'open' : ''}">
            <span onclick="navigate('home'); toggleMobileMenu()">Home</span>
            <span onclick="navigate('shop'); toggleMobileMenu()">Shop</span>
            <span onclick="scrollToSection('newArrivals'); toggleMobileMenu()">New Arrivals</span>
            <span onclick="navigate('sale'); toggleMobileMenu()">Sale</span>
            <span onclick="navigate('profile'); toggleMobileMenu()">Profile</span>
            <span onclick="navigate('favourites'); toggleMobileMenu()">Wishlist</span>
            <span onclick="navigate('cart'); toggleMobileMenu()">Cart</span>
        </div>
    </nav>
`;

const BenefitsBar = () => `
    <div class="benefits-bar">
        <div class="benefits-container">
            <div class="benefit-item">
                <i class="ph ph-arrows-clockwise"></i>
                <div class="benefit-text">
                    <h4>10 Days Return</h4>
                    <p>Easy Returns & Refunds</p>
                </div>
            </div>
            <div class="benefit-item">
                <i class="ph ph-shield-check"></i>
                <div class="benefit-text">
                    <h4>100% Original</h4>
                    <p>Authentic Products</p>
                </div>
            </div>
            <div class="benefit-item">
                <i class="ph ph-lock"></i>
                <div class="benefit-text">
                    <h4>Secure Payment</h4>
                    <p>100% Secure Payments</p>
                </div>
            </div>
            <div class="benefit-item">
                <i class="ph ph-headset"></i>
                <div class="benefit-text">
                    <h4>Customer Support</h4>
                    <p>24/7 Support</p>
                </div>
            </div>
        </div>
    </div>
`;

const Footer = () => `
    ${BenefitsBar()}
    <footer class="main-footer">
        <div class="footer-grid">
            <div class="footer-brand">
                <div class="footer-logo">space bugee</div>
                <p class="footer-desc">Defined by minimalist aesthetics and premium quality. Our collections represent the future of urban streetwear.</p>
                <div class="social-icons">
                    <i class="ph ph-instagram-logo"></i>
                    <i class="ph ph-facebook-logo"></i>
                    <i class="ph ph-twitter-logo"></i>
                </div>
            </div>
            <div class="footer-col">
                <h4>Shop</h4>
                <div class="footer-links">
                    <a onclick="scrollToSection('newArrivals')">New Arrivals</a>
                    <a onclick="navigate('shop')">Best Sellers</a>
                    <a onclick="navigate('sale')">Special Offers</a>
                </div>
            </div>
            <div class="footer-col">
                <h4>Support</h4>
                <div class="footer-links">
                    <a>Contact Us</a>
                    <a>Shipping Policy</a>
                    <a>Returns & Exchanges</a>
                </div>
            </div>
            <div class="footer-col">
                <h4>Legal</h4>
                <div class="footer-links">
                    <a>Privacy Policy</a>
                    <a>Terms of Service</a>
                </div>
            </div>
            <div class="footer-col">
                <h4>Newsletter</h4>
                <p class="newsletter-text">Subscribe to receive updates, access to exclusive deals, and more.</p>
                <div class="newsletter-form">
                    <input type="email" placeholder="Enter your email" />
                    <button><i class="ph ph-paper-plane-right"></i></button>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2026 Space Bugee. All rights reserved.</p>
        </div>
    </footer>
`;

const AuthModal = () => `
    <div class="auth-overlay ${state.isAuthModalOpen ? 'open' : ''}">
        <div class="auth-modal" onclick="event.stopPropagation()">
            <button class="auth-close" onclick="setState({isAuthModalOpen: false})"><i class="ph ph-x"></i></button>
            <div class="auth-left">
                <div class="auth-left-content">
                    <h3>SPACE BUGEE</h3>
                    <h2>Join the community</h2>
                    <p>Create an account to track orders, save items to your wishlist, and get personalized recommendations.</p>
                    <div class="auth-benefits">
                        <div class="auth-benefit">
                            <i class="ph ph-truck"></i>
                            <div class="auth-benefit-text">
                                <h4>Free Shipping</h4>
                                <p>On all orders above ₹1999</p>
                            </div>
                        </div>
                        <div class="auth-benefit">
                            <i class="ph ph-arrows-clockwise"></i>
                            <div class="auth-benefit-text">
                                <h4>Easy Returns</h4>
                                <p>30-day return policy</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="auth-right">
                <div class="auth-tabs">
                    <div class="auth-tab ${state.authMode === 'login' ? 'active' : ''}" onclick="setState({authMode: 'login'})">Login</div>
                    <div class="auth-tab ${state.authMode === 'register' ? 'active' : ''}" onclick="setState({authMode: 'register'})">Register</div>
                </div>
                <h2>${state.authMode === 'login' ? 'Welcome back' : 'Create Account'}</h2>
                <p class="auth-sub">Enter your details to continue</p>
                <button class="auth-social-btn" onclick="handleGoogleAuth()">
                    <i class="ph ph-google-logo"></i> Continue with Google
                </button>
                <div class="auth-divider">OR</div>
                <form class="auth-form" onsubmit="handleAuthSubmit(event)">
                    ${state.authMode === 'register' ? `
                        <div class="auth-form-group">
                            <label>Full Name</label>
                            <input type="text" id="auth-name" class="auth-input" placeholder="Enter your name" required />
                        </div>
                    ` : ''}
                    <div class="auth-form-group">
                        <label>Email Address</label>
                        <input type="email" id="auth-email" class="auth-input" placeholder="name@example.com" required />
                    </div>
                    <div class="auth-form-group">
                        <label>Password</label>
                        <input type="password" id="auth-password" class="auth-input" placeholder="••••••••" required />
                    </div>
                    <button type="submit" class="auth-submit">${state.authMode === 'login' ? 'Sign In' : 'Create Account'}</button>
                </form>
            </div>
        </div>
    </div>
`;

// Pages
const HomePage = () => {
    const slides = state.liveSlideshow && state.liveSlideshow.length > 0 ? state.liveSlideshow : HERO_SLIDES;
    const slide = slides[state.currentHeroSlide] || slides[0] || HERO_SLIDES[0];
    return `
    <section class="hero-slideshow">
        <div class="hero-slide active" style="background-image: url('${slide.img}')">
            <div class="hero-content">
                <p class="hero-subtitle">${slide.subtitle}</p>
                <h1 class="hero-title">${slide.title}</h1>
                <p class="hero-desc">${slide.desc}</p>
                <button class="btn-hero" onclick="navigate('shop')">${slide.btnText}</button>
            </div>
        </div>
        <button class="hero-arrow left" onclick="prevHeroSlide()"><i class="ph ph-caret-left"></i></button>
        <button class="hero-arrow right" onclick="nextHeroSlide()"><i class="ph ph-caret-right"></i></button>
        <div class="hero-dots">
            ${slides.map((_, idx) => `
                <div class="hero-dot ${idx === state.currentHeroSlide ? 'active' : ''}" onclick="setHeroSlide(${idx})"></div>
            `).join('')}
        </div>
    </section>

    <section class="section">
        <h2 class="section-title">Shop by Category</h2>
        <div class="category-grid">
            ${state.liveCategories.map(cat => `
                <div class="category-item" onclick="navigate('category-${encodeURIComponent(cat.name)}')">
                    <div class="img-wrapper"><img src="${cat.img}" alt="${cat.name}" /></div>
                    <h3>${cat.name}</h3>
                    <span>Explore <i class="ph ph-arrow-right"></i></span>
                </div>
            `).join('')}
            ${state.liveCategories.length === 0 ? '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">No categories found. Add some from Admin Panel!</p>' : ''}
        </div>
    </section>

    <section class="section" id="newArrivals">
        <div class="products-header">
            <h2 class="section-title">New Arrivals</h2>
            <div class="view-all" onclick="navigate('shop')">VIEW ALL <i class="ph ph-arrow-right"></i></div>
        </div>
        <div class="product-grid">
            ${state.liveProducts.slice(0, 5).map(p => `
                <div class="product-card" onclick="viewProduct('${p.id}')">
                    <div class="product-img-wrapper">
                        <img src="${p.images[0]}" alt="${p.name}" />
                        <button class="heart-btn" onclick="event.stopPropagation(); toggleFavourite(${JSON.stringify(p).replace(/"/g, '&quot;')})">
                            <i class="${state.favourites.some(f => f.id === p.id) ? 'ph-fill ph-heart' : 'ph ph-heart'}"></i>
                        </button>
                        ${p.saleBadge ? `<span class="product-badge">${p.saleBadge}</span>` : ''}
                    </div>
                    <div class="product-info">
                        <h4>${p.name}</h4>
                        <div class="price">₹${p.price} ${p.oldPrice ? `<span class="old-price">₹${p.oldPrice}</span>` : ''}</div>
                    </div>
                </div>
            `).join('')}
            ${state.liveProducts.length === 0 ? '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">No products found. Add some from Admin Panel!</p>' : ''}
        </div>
    </section>
    `;
};

const ShopPage = () => {
    const filteredProducts = state.liveProducts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(state.searchQuery.toLowerCase());
        const matchesCategory = state.selectedShopCategory === 'All' || 
                                (p.category === state.selectedShopCategory) || 
                                (p.categories && p.categories.includes(state.selectedShopCategory));
        return matchesSearch && matchesCategory;
    });

    return `
    <div class="page-header">
        <h1>Shop All</h1>
        <div class="breadcrumbs">
            <span onclick="navigate('home')">Home</span>
            <i class="ph ph-caret-right"></i>
            <span class="current">Shop</span>
        </div>
    </div>
    <div class="shop-layout">
        <aside class="shop-sidebar">
            <div class="filter-section">
                <div class="filter-title">Categories</div>
                <div class="filter-list">
                    <div class="filter-item ${state.selectedShopCategory === 'All' ? 'active' : ''}" onclick="selectShopCategory('All')">
                        <span>All Products</span>
                    </div>
                    ${state.liveCategories.map(cat => `
                        <div class="filter-item ${state.selectedShopCategory === cat.name ? 'active' : ''}" onclick="selectShopCategory('${cat.name}')">
                            <span>${cat.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="filter-section">
                <div class="filter-title">Gender</div>
                <div class="filter-list">
                    <div class="filter-item"><span>Men</span></div>
                    <div class="filter-item"><span>Women</span></div>
                    <div class="filter-item"><span>Unisex</span></div>
                </div>
            </div>
        </aside>
        <main class="shop-main">
            <div class="shop-toolbar">
                <div class="search-box">
                    <i class="ph ph-magnifying-glass"></i>
                    <input type="text" placeholder="Search products..." oninput="handleSearch(event)" value="${state.searchQuery}" />
                </div>
                <div class="sort-box desktop-sort-only">
                    <span>Sort by:</span>
                    <div class="sort-select">Newest Arrivals <i class="ph ph-caret-down"></i></div>
                </div>
                <div class="sort-box mobile-category-only">
                    <span>Category:</span>
                    <div class="sort-select-wrapper" style="position: relative; display: inline-flex; align-items: center;">
                        <select class="sort-select" onchange="selectShopCategory(this.value)" style="appearance: none; -webkit-appearance: none; padding-right: 32px; background: white; border: 1px solid var(--border); border-radius: 4px; font-weight: 600; cursor: pointer; padding-left: 12px; height: 38px; font-size: 13px;">
                            <option value="All" ${state.selectedShopCategory === 'All' ? 'selected' : ''}>All Products</option>
                            ${state.liveCategories.map(cat => `
                                <option value="${cat.name}" ${state.selectedShopCategory === cat.name ? 'selected' : ''}>${cat.name}</option>
                            `).join('')}
                        </select>
                        <i class="ph ph-caret-down" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #666;"></i>
                    </div>
                </div>
            </div>
            <div class="shop-grid">
                ${filteredProducts.map(p => `
                    <div class="product-card" onclick="viewProduct('${p.id}')">
                        <div class="product-img-wrapper">
                            <img src="${p.images[0]}" alt="${p.name}" />
                            <button class="heart-btn" onclick="event.stopPropagation(); toggleFavourite(${JSON.stringify(p).replace(/"/g, '&quot;')})">
                                <i class="${state.favourites.some(f => f.id === p.id) ? 'ph-fill ph-heart' : 'ph ph-heart'}"></i>
                            </button>
                            ${p.saleBadge ? `<span class="product-badge">${p.saleBadge}</span>` : ''}
                        </div>
                        <div class="product-info">
                            <h4>${p.name}</h4>
                            <div class="price">₹${p.price} ${p.oldPrice ? `<span class="old-price">₹${p.oldPrice}</span>` : ''}</div>
                        </div>
                    </div>
                `).join('')}
                ${filteredProducts.length === 0 ? '<p style="grid-column: 1/-1; text-align: center; padding: 80px; color: #666;">No products found.</p>' : ''}
            </div>
        </main>
    </div>
    `;
};

function selectShopCategory(categoryName) {
    setState({ selectedShopCategory: categoryName });
}

function selectSaleCategory(categoryName) {
    setState({ selectedSaleCategory: categoryName });
}

function handleSalePriceChange(val) {
    setState({ maxSalePrice: Number(val) });
}

function applySaleFilters() {
    render();
}

function clearSaleFilters() {
    setState({ maxSalePrice: 5000, selectedSaleCategory: 'All', selectedSaleDiscount: 0 });
}

function toggleSaleDiscount(pct) {
    setState({ selectedSaleDiscount: Number(pct) });
}

const CategoryPage = () => {
    const page = window.location.hash.slice(1) || 'home';
    let currentCategory = null;
    if (page.startsWith('category-')) {
        const catName = decodeURIComponent(page.split('-')[1]);
        currentCategory = state.liveCategories.find(c => c.name === catName);
    }

    if (!currentCategory) {
        if (state.liveCategories.length > 0) {
            currentCategory = state.liveCategories[0];
        } else {
            return `<div class="section" style="padding: 100px; text-align: center;"><p>Loading Category...</p></div>`;
        }
    }

    const catProducts = state.liveProducts.filter(p => ((p.categories && p.categories.includes(currentCategory.name)) || p.category === currentCategory.name) && p.name.toLowerCase().includes(state.searchQuery.toLowerCase()));

    return `
    <div class="category-page-container">
        <!-- Category Hero Banner -->
        <section class="category-hero-banner">
            <div class="category-hero-content">
                <h1 class="category-hero-title">${currentCategory.name}</h1>
                <p class="category-hero-desc">${currentCategory.description || `Discover our exclusive collection of ${currentCategory.name}. Designed with high-quality fabrics, combining timeless styling and maximum everyday comfort.`}</p>
                <button class="btn-dark" onclick="scrollToSection('categoryGrid')">EXPLORE COLLECTION</button>
            </div>
            <div class="category-hero-image">
                <img src="${currentCategory.img}" alt="${currentCategory.name} banner" />
            </div>
        </section>

        <!-- Breadcrumbs -->
        <div class="breadcrumbs-container" style="padding: 0 40px; margin-top: 20px;">
            <div class="breadcrumbs">
                <span onclick="navigate('home')">Home</span>
                <i class="ph ph-caret-right"></i>
                <span class="current">${currentCategory.name}</span>
            </div>
        </div>

        <div class="shop-layout section" id="categoryGrid" style="padding-top: 10px;">
            <aside class="shop-sidebar">
                <div class="filter-section">
                    <h3 class="filter-title">Categories</h3>
                    <div class="filter-list">
                        ${state.liveCategories.map(cat => `
                            <div class="filter-item ${cat.id === currentCategory.id ? 'active' : ''}" style="cursor:pointer;" onclick="navigate('category-${encodeURIComponent(cat.name)}')">
                                <span>${cat.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="filter-section">
                    <h3 class="filter-title">Filter By</h3>
                    <div class="filter-subtitle" style="font-weight: 600; margin-top: 15px; margin-bottom: 10px; font-size: 13px;">Size</div>
                    <div class="size-boxes" style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <span class="size-box" style="padding: 6px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 11px; cursor: pointer;">S</span>
                        <span class="size-box" style="padding: 6px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 11px; cursor: pointer;">M</span>
                        <span class="size-box" style="padding: 6px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 11px; cursor: pointer;">L</span>
                        <span class="size-box" style="padding: 6px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 11px; cursor: pointer;">XL</span>
                        <span class="size-box" style="padding: 6px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 11px; cursor: pointer;">XXL</span>
                    </div>

                    <div class="filter-subtitle" style="font-weight: 600; margin-top: 20px; margin-bottom: 10px; font-size: 13px;">Color</div>
                    <div class="color-circles" style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <span class="color-circle" style="width: 20px; height: 20px; border-radius: 50%; background: #000; cursor: pointer;"></span>
                        <span class="color-circle" style="width: 20px; height: 20px; border-radius: 50%; background: #c8b9a6; cursor: pointer; border: 1px solid #ddd;"></span>
                        <span class="color-circle" style="width: 20px; height: 20px; border-radius: 50%; background: #2b3e2a; cursor: pointer;"></span>
                        <span class="color-circle" style="width: 20px; height: 20px; border-radius: 50%; background: #1f2d3d; cursor: pointer;"></span>
                        <span class="color-circle" style="width: 20px; height: 20px; border-radius: 50%; background: #9c9c9c; cursor: pointer;"></span>
                    </div>

                    <div class="filter-subtitle" style="font-weight: 600; margin-top: 20px; margin-bottom: 10px; font-size: 13px;">Price</div>
                    <div class="price-slider-wrap" style="margin-bottom: 15px;">
                        <div class="price-slider-bg"><div class="price-slider-fill" style="width: 100%;"></div><div class="price-slider-thumb" style="left: 0%;"></div><div class="price-slider-thumb" style="right: 0%;"></div></div>
                        <div class="price-labels" style="display:flex; justify-content:space-between; font-size:11px; margin-top:8px;"><span>₹299</span><span>₹4999</span></div>
                    </div>
                    <button class="btn-filter" style="width: 100%; padding: 10px; background: var(--brown); color: white; border: none; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; cursor: pointer;">Apply Filter</button>
                    <div style="text-align:center; margin-top:12px"><a href="#" class="clear-all" style="font-size: 12px; color: #666; text-decoration: underline;">Clear All</a></div>
                </div>
            </aside>

            <main class="shop-main">
                <div class="shop-toolbar">
                    <div class="results-count">Showing 1–${catProducts.length} of ${catProducts.length} results</div>
                    <div class="sort-box desktop-sort-only">
                        <span>Sort By:</span>
                        <div class="sort-select" style="border: 1px solid #ddd; padding: 6px 12px; border-radius: 4px; font-size: 13px; cursor: pointer;">Featured <i class="ph ph-caret-down"></i></div>
                    </div>
                    <div class="sort-box mobile-category-only">
                        <span>Category:</span>
                        <div class="sort-select-wrapper" style="position: relative; display: inline-flex; align-items: center;">
                            <select class="sort-select" onchange="navigate('category-' + encodeURIComponent(this.value))" style="appearance: none; -webkit-appearance: none; padding-right: 32px; background: white; border: 1px solid var(--border); border-radius: 4px; font-weight: 600; cursor: pointer; padding-left: 12px; height: 38px; font-size: 13px;">
                                ${state.liveCategories.map(cat => `
                                    <option value="${cat.name}" ${currentCategory.name === cat.name ? 'selected' : ''}>${cat.name}</option>
                                `).join('')}
                            </select>
                            <i class="ph ph-caret-down" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #666;"></i>
                        </div>
                    </div>
                </div>

                <div class="shop-grid">
                    ${catProducts.map(p => `
                        <div class="product-card" onclick="viewProduct('${p.id}')">
                            <div class="product-img-wrapper">
                                <img src="${p.images[0]}" alt="${p.name}" />
                                <button class="heart-btn" onclick="event.stopPropagation(); toggleFavourite(${JSON.stringify(p).replace(/"/g, '&quot;')})">
                                    <i class="${state.favourites.some(f => f.id === p.id) ? 'ph-fill ph-heart' : 'ph ph-heart'}"></i>
                                </button>
                                ${p.saleBadge ? `<span class="product-badge sale-badge">${p.saleBadge}</span>` : ''}
                            </div>
                            <div class="product-info">
                                <h4>${p.name}</h4>
                                <div class="price">₹${p.price} ${p.oldPrice ? `<span class="old-price">₹${p.oldPrice}</span>` : ''}</div>
                                <div class="rating">
                                    <div class="stars"><i class="ph-fill ph-star"></i><i class="ph-fill ph-star"></i><i class="ph-fill ph-star"></i><i class="ph-fill ph-star"></i><i class="ph ph-star"></i></div>
                                    <span>(128 reviews)</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                    ${catProducts.length === 0 ? '<p style="grid-column: 1/-1; text-align: center; padding: 80px; color: #666;">No products found in this category.</p>' : ''}
                </div>

                <div class="pagination">
                    <div class="page-btn prev"><i class="ph ph-caret-left"></i></div>
                    <div class="page-item active">1</div>
                    <div class="page-item">2</div>
                    <div class="page-btn next"><i class="ph ph-caret-right"></i></div>
                </div>
            </main>
        </div>
    </div>
    `;
};

// Auth Handlers
async function handleGoogleAuth() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const userCred = await auth.signInWithPopup(provider);
        const userDoc = await db.collection('users').doc(userCred.user.uid).get();
        if (!userDoc.exists) {
            await db.collection('users').doc(userCred.user.uid).set({
                fullName: userCred.user.displayName,
                email: userCred.user.email,
                isAdmin: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    
    try {
        if (state.authMode === 'login') {
            await auth.signInWithEmailAndPassword(email, password);
        } else {
            const name = document.getElementById('auth-name').value;
            const userCred = await auth.createUserWithEmailAndPassword(email, password);
            await userCred.user.updateProfile({ displayName: name });
            await db.collection('users').doc(userCred.user.uid).set({
                fullName: name,
                email,
                isAdmin: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    } catch (err) {
        showToast(err.message, "error");
    }
}

function handleSearch(e) {
    state.searchQuery = e.target.value;
    render();
}

const CartPage = () => `
    <div class="cart-container">
        <h2 class="section-title">Your Cart (${state.cart.length})</h2>
        ${state.cart.length === 0 ? `
            <div style="text-align:center; padding: 40px;">
                <p>Your cart is empty.</p>
                <button class="btn-primary" style="margin-top:20px" onclick="navigate('shop')">CONTINUE SHOPPING</button>
            </div>
        ` : `
            <div class="cart-layout">
                <div class="cart-main">
                    ${state.cart.map(item => `
                        <div class="cart-card" style="cursor: pointer;" onclick="openCartItemDetail('${item.cartItemId || item.id}')">
                            <img src="${item.selectedColorImg || (item.images && item.images.length > 0 ? item.images[0] : (item.img || ''))}" class="cart-card-img" />
                            <div class="cart-card-body" onclick="event.stopPropagation()">
                                <h3 class="cart-card-title" style="cursor: pointer;" onclick="event.stopPropagation(); openCartItemDetail('${item.cartItemId || item.id}')">${item.name}</h3>
                                <div class="cart-card-options" style="font-size: 12px; color: #666; margin-top: 6px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">
                                    ${item.selectedSize ? `<span style="background: #f4f4f4; padding: 2px 8px; border-radius: 4px;"><strong>Size:</strong> ${item.selectedSize}</span>` : ''}
                                    ${item.selectedColor ? `
                                        <span style="background: #f4f4f4; padding: 2px 8px; border-radius: 4px; display: inline-flex; align-items: center; gap: 6px;">
                                            <strong>Color:</strong> 
                                            <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:${item.selectedColor}; border:1px solid #ccc;"></span>
                                            ${item.selectedColorName || item.selectedColor}
                                        </span>` : ''}
                                </div>
                                <div class="cart-card-row">
                                    <div class="cart-card-price">₹${item.price}</div>
                                    <div class="qty-control">
                                        <div class="qty-btn" onclick="updateQty('${item.cartItemId || item.id}', -1)">-</div>
                                        <div class="qty-val">${item.quantity}</div>
                                        <div class="qty-btn" onclick="updateQty('${item.cartItemId || item.id}', 1)">+</div>
                                    </div>
                                </div>
                            </div>
                            <i class="ph ph-trash cart-card-remove" onclick="event.stopPropagation(); removeFromCart('${item.cartItemId || item.id}')"></i>
                        </div>
                    `).join('')}
                </div>
                <div class="cart-sidebar">
                    <div class="order-summary">
                        <h3>Order Summary</h3>
                        <div class="summary-row"><span>Subtotal</span><span>₹${state.cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)}</span></div>
                        <div class="summary-row"><span>Shipping</span><span>Free</span></div>
                        <div class="summary-row total"><span>Total</span><span>₹${state.cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)}</span></div>
                        <button class="btn-checkout">PROCEED TO CHECKOUT</button>
                    </div>
                </div>
            </div>
        `}
    </div>
`;

const FavouritesPage = () => `
    <div class="fav-container">
        <h2 class="section-title">My Wishlist (${state.favourites.length})</h2>
        <div class="fav-grid">
            ${state.favourites.map(p => `
                <div class="product-card" onclick="viewProduct('${p.id}')">
                    <div class="product-img-wrapper">
                        <img src="${p.img || (p.images && p.images.length > 0 ? p.images[0] : '')}" alt="${p.name}" />
                        <button class="heart-btn" onclick="event.stopPropagation(); toggleFavourite(${JSON.stringify(p).replace(/"/g, '&quot;')})">
                            <i class="ph-fill ph-heart"></i>
                        </button>
                        ${p.saleBadge ? `<span class="product-badge">${p.saleBadge}</span>` : ''}
                    </div>
                    <div class="product-info">
                        <h4>${p.name}</h4>
                        <div class="price">₹${p.price}</div>
                        <button class="btn-primary" style="width:100%; margin-top:10px" onclick="event.stopPropagation(); viewProduct('${p.id}')">ADD TO CART</button>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
`;

const ProfilePage = () => `
    <div class="profile-container">
        <h2 class="section-title">My Account</h2>
        <div class="profile-layout">
            <aside class="profile-sidebar">
                <div class="profile-card">
                    <div class="profile-avatar">${state.user?.displayName?.charAt(0) || 'U'}</div>
                    <div class="profile-name">${state.user?.displayName || 'User'}</div>
                    <div class="profile-email">${state.user?.email || ''}</div>
                    <button class="btn-outline" onclick="auth.signOut()">Logout</button>
                </div>
            </aside>
            <main class="profile-main">
                <div class="profile-section">
                    <h3>Account Settings</h3>
                    <p>Manage your profile and security settings.</p>
                </div>
            </main>
        </div>
    </div>
`;

const SalePage = () => {
    const getDiscountFromBadge = (p) => {
        if (!p.saleBadge) return 0;
        const match = p.saleBadge.match(/\d+/);
        return match ? Number(match[0]) : 0;
    };

    const getDiscountCount = (minPercent) => {
        return state.liveProducts.filter(p => {
            if (!p.inSale) return false;
            const matchesCategory = state.selectedSaleCategory === 'All' || 
                                    (p.category === state.selectedSaleCategory) || 
                                    (p.categories && p.categories.includes(state.selectedSaleCategory));
            if (!matchesCategory) return false;
            const matchesPrice = Number(p.price) <= (state.maxSalePrice || 5000);
            if (!matchesPrice) return false;
            
            const disc = getDiscountFromBadge(p);
            return disc >= minPercent;
        }).length;
    };

    const saleProducts = state.liveProducts.filter(p => {
        const isSale = p.inSale;
        const matchesCategory = state.selectedSaleCategory === 'All' || 
                                (p.category === state.selectedSaleCategory) || 
                                (p.categories && p.categories.includes(state.selectedSaleCategory));
        const matchesPrice = Number(p.price) <= (state.maxSalePrice || 5000);
        
        const disc = getDiscountFromBadge(p);
        const matchesDiscount = !state.selectedSaleDiscount || disc >= state.selectedSaleDiscount;
        
        return isSale && matchesCategory && matchesPrice && matchesDiscount;
    });
    
    return `
    <div class="sale-page-container">
        <!-- Sale Hero Section -->
        <section class="sale-hero-banner">
            <div class="sale-hero-content">
                <span class="sale-subtitle">Special Offer</span>
                <h1 class="sale-title">THE BIG SALE<br>Up to 60% Off</h1>
                <p class="sale-desc">Fresh styles. Major markdowns. Don't miss out on the best deals!</p>
                <button class="btn-dark" onclick="scrollToSection('saleProducts')">SHOP THE SALE</button>
            </div>
            <div class="sale-hero-image">
                <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200" alt="Sale Banner" />
            </div>
            <div class="sale-floating-badge">
                <span>UP TO</span>
                <span class="percent">60%</span>
                <span>OFF</span>
            </div>
        </section>
 
        <div class="shop-layout section" id="saleProducts">
            <aside class="shop-sidebar">
                <div class="filter-section">
                    <h3 class="filter-title">Categories</h3>
                    <div class="filter-list">
                        <div class="filter-item ${state.selectedSaleCategory === 'All' ? 'active' : ''}" onclick="selectSaleCategory('All')">
                            <span>All Products</span>
                        </div>
                        ${state.liveCategories.map(cat => {
                            const count = state.liveProducts.filter(p => p.inSale && (p.category === cat.name || (p.categories && p.categories.includes(cat.name)))).length;
                            return `
                                <div class="filter-item ${state.selectedSaleCategory === cat.name ? 'active' : ''}" onclick="selectSaleCategory('${cat.name}')">
                                    <span>${cat.name}</span>
                                    <span>(${count})</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div class="filter-section">
                    <h3 class="filter-title">Discount</h3>
                    <div style="position: relative; display: flex; align-items: center; margin-top: 12px;">
                        <select class="sort-select" onchange="toggleSaleDiscount(this.value)" style="width: 100%; appearance: none; -webkit-appearance: none; padding-right: 32px; background: white; border: 1px solid var(--border); border-radius: 4px; font-weight: 600; cursor: pointer; padding-left: 12px; height: 40px; font-size: 13px; outline: none; color: #1a1a1a;">
                            <option value="0" ${state.selectedSaleDiscount === 0 ? 'selected' : ''}>All Discounts</option>
                            ${[10, 20, 30, 40, 50, 60, 70, 80].map(pct => {
                                const count = getDiscountCount(pct);
                                return `
                                    <option value="${pct}" ${state.selectedSaleDiscount === pct ? 'selected' : ''}>
                                        ${pct}% and above (${count})
                                    </option>
                                `;
                            }).join('')}
                        </select>
                        <i class="ph ph-caret-down" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #666;"></i>
                    </div>
                </div>
 
                <div class="filter-section">
                    <h3 class="filter-title">Price Range</h3>
                    <div class="price-slider-wrap" style="margin: 15px 0;">
                        <input type="range" min="0" max="5000" step="100" value="${state.maxSalePrice || 5000}" oninput="handleSalePriceChange(this.value)" style="width: 100%; accent-color: var(--brown); height: 6px; background: #ddd; border-radius: 3px; outline: none; cursor: pointer;" />
                        <div class="price-labels" style="display:flex; justify-content:space-between; font-size:12px; margin-top:10px; font-weight:600; color:#555;">
                            <span>Max Price:</span>
                            <span style="color:var(--brown)">₹${state.maxSalePrice || 5000}</span>
                        </div>
                    </div>
                    <button class="btn-filter" onclick="applySaleFilters()" style="width: 100%; padding: 10px; background: var(--brown); color: white; border: none; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; cursor: pointer;">Apply Filter</button>
                    <div style="text-align:center; margin-top:12px"><a href="javascript:void(0)" onclick="clearSaleFilters()" class="clear-all" style="font-size: 12px; color: #666; text-decoration: underline;">Clear All</a></div>
                </div>
            </aside>
 
            <main class="shop-main">
                <div class="shop-toolbar">
                    <div class="results-count">Showing 1–${saleProducts.length} of ${saleProducts.length} results</div>
                    <div class="sort-box desktop-sort-only">
                        <span>Sort By:</span>
                        <div class="sort-select">Featured <i class="ph ph-caret-down"></i></div>
                    </div>
                    <div class="sort-box mobile-category-only">
                        <span>Category:</span>
                        <div class="sort-select-wrapper" style="position: relative; display: inline-flex; align-items: center;">
                            <select class="sort-select" onchange="selectSaleCategory(this.value)" style="appearance: none; -webkit-appearance: none; padding-right: 32px; background: white; border: 1px solid var(--border); border-radius: 4px; font-weight: 600; cursor: pointer; padding-left: 12px; height: 38px; font-size: 13px;">
                                <option value="All" ${state.selectedSaleCategory === 'All' ? 'selected' : ''}>All Products</option>
                                ${state.liveCategories.map(cat => `
                                    <option value="${cat.name}" ${state.selectedSaleCategory === cat.name ? 'selected' : ''}>${cat.name}</option>
                                `).join('')}
                            </select>
                            <i class="ph ph-caret-down" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #666;"></i>
                        </div>
                    </div>
                </div>
 
                <div class="shop-grid">
                    ${saleProducts.map(p => `
                        <div class="product-card" onclick="viewProduct('${p.id}')">
                            <div class="product-img-wrapper">
                                <img src="${p.images[0]}" alt="${p.name}" />
                                <button class="heart-btn" onclick="event.stopPropagation(); toggleFavourite(${JSON.stringify(p).replace(/"/g, '&quot;')})">
                                    <i class="${state.favourites.some(f => f.id === p.id) ? 'ph-fill ph-heart' : 'ph ph-heart'}"></i>
                                </button>
                                <span class="product-badge sale-badge">${p.saleBadge}</span>
                            </div>
                            <div class="product-info">
                                <h4>${p.name}</h4>
                                <div class="price">₹${p.price} ${p.oldPrice ? `<span class="old-price">₹${p.oldPrice}</span>` : ''}</div>
                                <div class="rating">
                                    <div class="stars"><i class="ph-fill ph-star"></i><i class="ph-fill ph-star"></i><i class="ph-fill ph-star"></i><i class="ph-fill ph-star"></i><i class="ph ph-star"></i></div>
                                    <span>(128 reviews)</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                    ${saleProducts.length === 0 ? '<p style="grid-column: 1/-1; text-align: center; padding: 80px; color: #666;">No products found on sale for this category.</p>' : ''}
                </div>

                <div class="pagination">
                    <div class="page-btn prev"><i class="ph ph-caret-left"></i></div>
                    <div class="page-item active">1</div>
                    <div class="page-item">2</div>
                    <div class="page-item">3</div>
                    <div class="page-btn next"><i class="ph ph-caret-right"></i></div>
                </div>
            </main>
        </div>
    </div>
    `;
};

function updateQty(cartItemId, delta) {
    state.cart = state.cart.map(item => {
        if (item.cartItemId === cartItemId || item.id === cartItemId) {
            const newQty = Math.max(1, item.quantity + delta);
            return { ...item, quantity: newQty };
        }
        return item;
    });
    saveCartToDb();
    render();
}

function removeFromCart(cartItemId) {
    state.cart = state.cart.filter(item => (item.cartItemId && item.cartItemId !== cartItemId) && item.id !== cartItemId);
    saveCartToDb();
    render();
}

const ProductDetailsPage = () => {
    const p = state.selectedProduct;
    if (!p) return `<div class="section"><p>Loading product...</p></div>`;

    // Calculate dynamic price based on selected size
    const selectedSizeObj = p.sizes.find(s => s.name === state.selectedSize);
    const displayPrice = (selectedSizeObj && selectedSizeObj.price) ? selectedSizeObj.price : p.price;
    const displayOldPrice = (selectedSizeObj && selectedSizeObj.oldPrice) ? selectedSizeObj.oldPrice : p.oldPrice;

    // Filter images based on selected color
    const selectedColorObj = p.colors.find(c => c.hex === state.selectedColor);
    const galleryImages = (selectedColorObj && selectedColorObj.images.length > 0 && selectedColorObj.images[0] !== '') 
        ? selectedColorObj.images 
        : p.images;
    
    return `
    <div class="product-page">
        <div class="breadcrumbs">
            <span onclick="navigate('home')">Home</span> <i class="ph ph-caret-right"></i>
            <span onclick="navigate('shop')">Shop</span> <i class="ph ph-caret-right"></i>
            <span class="current">${p.name}</span>
        </div>
        <div class="product-detail-layout">
            <div class="product-gallery">
                <div class="thumbnail-list">
                    ${galleryImages.map(img => `
                        <img src="${img}" class="thumb ${img === (state.currentProductImg || galleryImages[0]) ? 'active' : ''}" onclick="setProductImg('${img}')" />
                    `).join('')}
                </div>
                <div class="main-image-wrapper">
                    <img src="${state.currentProductImg || galleryImages[0]}" class="main-image" id="mainProdImg" />
                    <button class="gallery-nav prev" onclick="cycleProductImg(-1)"><i class="ph ph-caret-left"></i></button>
                    <button class="gallery-nav next" onclick="cycleProductImg(1)"><i class="ph ph-caret-right"></i></button>
                    <div class="badge-large">${p.saleBadge || ''}</div>
                </div>
            </div>
            <div class="product-info-panel">
                <h1 class="prod-title">${p.name}</h1>
                <div class="prod-rating">
                    <div class="stars">
                        <i class="ph-fill ph-star"></i><i class="ph-fill ph-star"></i><i class="ph-fill ph-star"></i><i class="ph-fill ph-star"></i><i class="ph ph-star"></i>
                    </div>
                    <span>(128 reviews)</span>
                    <button class="share-btn"><i class="ph ph-share-network"></i> Share</button>
                </div>
                <div class="prod-price-box">
                    <span class="price-now">₹${displayPrice}</span>
                    ${displayOldPrice ? `<span class="price-old">₹${displayOldPrice}</span>` : ''}
                    ${p.saleBadge ? `<span class="price-discount">${p.saleBadge}</span>` : ''}
                </div>
                <p class="prod-taxes">Inclusive of all taxes</p>
                <p class="prod-desc">${p.description}</p>
                
                <div class="prod-option">
                    <div class="option-label">Color: <span>${state.selectedColorName || 'Select Color'}</span></div>
                    <div class="color-options">
                        ${p.colors.map(c => `
                            <div class="color-swatch ${state.selectedColor === c.hex ? 'active' : ''}" 
                                 style="background: ${c.hex}" 
                                 onclick="selectColor('${c.hex}', '${c.name}', '${c.images[0]}')"></div>
                        `).join('')}
                    </div>
                </div>

                <div class="prod-option">
                    <div class="option-label">Size: <span id="sizeGuide"><i class="ph ph-ruler"></i> Size Guide</span></div>
                    <div class="size-options">
                        ${p.sizes.map(s => `
                            <div class="size-box ${state.selectedSize === s.name ? 'active' : ''}" onclick="setState({selectedSize: '${s.name}'})">${s.name}</div>
                        `).join('')}
                    </div>
                </div>

                <div class="delivery-info">
                    <i class="ph ph-truck"></i>
                    <div class="delivery-text">
                        <p>Get it between 24 - 27 May</p>
                        <span>Free Shipping on orders over ₹1999</span>
                    </div>
                </div>

                <div class="action-buttons">
                    <button class="btn-add-cart" onclick="addToCart(state.selectedProduct)">
                        <i class="ph ph-shopping-cart"></i> Add to Cart
                    </button>
                    <button class="btn-buy-now">Buy Now</button>
                </div>

                <button class="btn-wishlist" onclick="toggleFavourite(state.selectedProduct)">
                    <i class="${state.favourites.some(f => f.id === p.id) ? 'ph-fill ph-heart' : 'ph ph-heart'}"></i> 
                    Add to Wishlist
                </button>

                <div class="trust-badges">
                    <div class="trust-item"><i class="ph ph-arrows-clockwise"></i> 10 Days Return</div>
                    <div class="trust-item"><i class="ph ph-check-circle"></i> 100% Original</div>
                    <div class="trust-item"><i class="ph ph-shield-check"></i> Secure Payment</div>
                </div>
            </div>
        </div>

        <!-- Related Products -->
        <div class="related-products">
            <h2 class="related-title">You May Also Like</h2>
            <div class="product-grid">
                ${state.liveProducts.filter(item => item.id !== p.id).slice(0, 5).map(rp => `
                    <div class="product-card" onclick="viewProduct('${rp.id}')">
                        <div class="product-img-wrapper">
                            <img src="${rp.images[0]}" alt="${rp.name}" />
                            <button class="heart-btn" onclick="event.stopPropagation(); toggleFavourite(${JSON.stringify(rp).replace(/"/g, '&quot;')})">
                                <i class="${state.favourites.some(f => f.id === rp.id) ? 'ph-fill ph-heart' : 'ph ph-heart'}"></i>
                            </button>
                            ${rp.saleBadge ? `<span class="product-badge">${rp.saleBadge}</span>` : ''}
                        </div>
                        <div class="product-info">
                            <h4>${rp.name}</h4>
                            <div class="price">₹${rp.price} ${rp.oldPrice ? `<span class="old-price">₹${rp.oldPrice}</span>` : ''}</div>
                            <div class="prod-rating" style="margin-top: 8px; font-size: 12px;">
                                <div class="stars"><i class="ph-fill ph-star"></i><i class="ph-fill ph-star"></i><i class="ph-fill ph-star"></i><i class="ph-fill ph-star"></i><i class="ph ph-star"></i></div>
                                <span>(86)</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
    `;
};

function viewProduct(id) {
    const p = state.liveProducts.find(item => item.id === id);
    if (p) {
        setState({ 
            selectedProduct: p, 
            currentProductImg: p.images[0],
            selectedSize: '',
            selectedColor: '',
            selectedColorName: ''
        });
        navigate('product');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function setProductImg(img) {
    setState({ currentProductImg: img });
}

function selectColor(hex, name, img) {
    setState({ selectedColor: hex, selectedColorName: name, currentProductImg: img });
}

function cycleProductImg(delta) {
    const p = state.selectedProduct;
    if (!p) return;
    
    const selectedColorObj = p.colors.find(c => c.hex === state.selectedColor);
    const galleryImages = (selectedColorObj && selectedColorObj.images.length > 0 && selectedColorObj.images[0] !== '') 
        ? selectedColorObj.images 
        : p.images;

    let idx = galleryImages.indexOf(state.currentProductImg);
    if (idx === -1) idx = 0;
    idx = (idx + delta + galleryImages.length) % galleryImages.length;
    setState({ currentProductImg: galleryImages[idx] });
}

// Hero Slideshow Logic
function nextHeroSlide() {
    const len = state.liveSlideshow && state.liveSlideshow.length > 0 ? state.liveSlideshow.length : HERO_SLIDES.length;
    state.currentHeroSlide = (state.currentHeroSlide + 1) % len;
    render();
}

function prevHeroSlide() {
    const len = state.liveSlideshow && state.liveSlideshow.length > 0 ? state.liveSlideshow.length : HERO_SLIDES.length;
    state.currentHeroSlide = (state.currentHeroSlide - 1 + len) % len;
    render();
}

function setHeroSlide(idx) {
    state.currentHeroSlide = idx;
    render();
}

// Mobile Menu Logic
function toggleMobileMenu() {
    state.isMobileMenuOpen = !state.isMobileMenuOpen;
    render();
}

function toggleIconsDropdown() {
    state.isIconsDropdownOpen = !state.isIconsDropdownOpen;
    render();
}

function closeIconsDropdown() {
    state.isIconsDropdownOpen = false;
    render();
}


// Auto Transition
setInterval(() => {
    if (state.currentPage === 'home') {
        nextHeroSlide();
    }
}, 5000);

// Main Render Function
function render() {
    const root = document.getElementById('root');
    let content = Navbar();
    
    switch(state.currentPage) {
        case 'home': content += HomePage(); break;
        case 'shop': content += ShopPage(); break;
        case 'cart': content += CartPage(); break;
        case 'favourites': content += FavouritesPage(); break;
        case 'profile': content += ProfilePage(); break;
        case 'search': content += SearchPage(); break;
        case 'sale': content += SalePage(); break;
        case 'product': content += ProductDetailsPage(); break;
        case 'category': content += CategoryPage(); break;
        default: content += HomePage();
    }
    
    content += Footer();
    content += AuthModal();
    content += CartItemDetailModal();
    
    root.innerHTML = content;
}

// Cart Item Details Modal and Helpers
function openCartItemDetail(cartItemId) {
    const item = state.cart.find(i => i.cartItemId === cartItemId || i.id === cartItemId);
    if (item) {
        setState({
            activeCartDetailItem: item,
            cartDetailActiveImg: null
        });
    }
}

function closeCartDetailModal(e) {
    if (e.target.className === 'cart-detail-modal-overlay') {
        setState({ activeCartDetailItem: null });
    }
}

function cycleCartDetailImg(delta) {
    const item = state.activeCartDetailItem;
    if (!item) return;
    const selectedColorObj = item.colors ? item.colors.find(c => c.hex === item.selectedColor) : null;
    let galleryImages = [];
    if (selectedColorObj && selectedColorObj.images && selectedColorObj.images.length > 0 && selectedColorObj.images[0] !== '') {
        galleryImages = selectedColorObj.images;
    } else {
        galleryImages = [item.selectedColorImg || item.img || (item.images && item.images.length > 0 ? item.images[0] : '')].filter(Boolean);
    }
    const currentImg = state.cartDetailActiveImg || galleryImages[0] || '';
    let idx = galleryImages.indexOf(currentImg);
    if (idx === -1) idx = 0;
    idx = (idx + delta + galleryImages.length) % galleryImages.length;
    setState({ cartDetailActiveImg: galleryImages[idx] });
}

function moveCartItemToWishlist(cartItemId) {
    const item = state.cart.find(i => i.cartItemId === cartItemId || i.id === cartItemId);
    if (item) {
        // Prepare base product structure for favourites
        const baseProduct = {
            id: item.id,
            name: item.name,
            img: item.img || (item.images && item.images.length > 0 ? item.images[0] : ''),
            images: item.images || [],
            price: item.price,
            oldPrice: item.oldPrice || null,
            colors: item.colors || [],
            sizes: item.sizes || [],
            description: item.description || ''
        };
        toggleFavourite(baseProduct);
        removeFromCart(cartItemId);
        setState({ activeCartDetailItem: null });
    }
}

function removeCartItemFromDetail(cartItemId) {
    removeFromCart(cartItemId);
    setState({ activeCartDetailItem: null });
}

const CartItemDetailModal = () => {
    const item = state.activeCartDetailItem;
    if (!item) return '';

    // Calculate dynamic discount percentage if present
    const priceNow = item.price;
    const priceOld = item.oldPrice || (priceNow * 1.5); 
    const discountPercent = Math.round(((priceOld - priceNow) / priceOld) * 100);

    // Selected options string
    const colorPart = item.selectedColorName ? `${item.selectedColorName}` : '';
    const sizePart = item.selectedSize ? `Size: ${item.selectedSize}` : '';
    const optionsText = [colorPart, sizePart].filter(Boolean).join('  •  ');

    // Resolve color specific gallery images
    const selectedColorObj = item.colors ? item.colors.find(c => c.hex === item.selectedColor) : null;
    let galleryImages = [];
    if (selectedColorObj && selectedColorObj.images && selectedColorObj.images.length > 0 && selectedColorObj.images[0] !== '') {
        galleryImages = selectedColorObj.images;
    } else {
        galleryImages = [item.selectedColorImg || item.img || (item.images && item.images.length > 0 ? item.images[0] : '')].filter(Boolean);
    }
    const currentImg = state.cartDetailActiveImg || galleryImages[0] || '';

    return `
    <div class="cart-detail-modal-overlay" onclick="closeCartDetailModal(event)">
        <div class="cart-detail-modal-content">
            <div class="modal-header">
                <h2>Item Details</h2>
                <button class="modal-close-btn" onclick="setState({ activeCartDetailItem: null })"><i class="ph ph-x"></i></button>
            </div>
            <div class="modal-body-layout">
                <!-- Left Column: Gallery & Details -->
                <div class="modal-left-column">
                    <div class="gallery-container">
                        <div class="thumbnail-column">
                            ${galleryImages.map(img => `
                                <img src="${img}" class="thumb-item ${img === currentImg ? 'active' : ''}" onclick="setState({ cartDetailActiveImg: '${img}' })" />
                            `).join('')}
                        </div>
                        <div class="main-image-viewport">
                            <img src="${currentImg}" class="viewport-image" />
                            <button class="viewport-arrow prev" onclick="cycleCartDetailImg(-1)"><i class="ph ph-caret-left"></i></button>
                            <button class="viewport-arrow next" onclick="cycleCartDetailImg(1)"><i class="ph ph-caret-right"></i></button>
                        </div>
                    </div>
                    <div class="product-details-specs">
                        <h3>Product Details</h3>
                        <ul>
                            ${item.description ? item.description.split('.').filter(Boolean).map(desc => `
                                <li>${desc.trim()}</li>
                            `).join('') : `
                                <li>Premium quality material</li>
                                <li>Relaxed fit for everyday comfort</li>
                                <li>Detailed finish & styling</li>
                            `}
                        </ul>
                    </div>
                </div>

                <!-- Right Column: Info & Actions -->
                <div class="modal-right-column">
                    <h1 class="modal-prod-title">${item.name}</h1>
                    ${optionsText ? `<div class="modal-selected-options">${optionsText}</div>` : ''}
                    <div class="modal-stock-status">In Stock</div>

                    <div class="modal-price-row">
                        <span class="price-current">₹${item.price}</span>
                        ${item.oldPrice ? `<span class="price-slashed">₹${item.oldPrice}</span>` : ''}
                        ${discountPercent > 0 ? `<span class="price-discount-badge">${discountPercent}% OFF</span>` : ''}
                    </div>

                    <div class="modal-delivery-returns-box">
                        <div class="info-row">
                            <i class="ph ph-truck"></i>
                            <div>
                                <span class="title">Delivery by</span>
                                <span class="value">24 - 27 May</span>
                            </div>
                        </div>
                        <div class="info-row">
                            <i class="ph ph-arrows-clockwise"></i>
                            <div>
                                <span class="title">Returns</span>
                                <span class="value">10 Days Return Policy</span>
                            </div>
                        </div>
                    </div>

                    <div class="modal-quantity-section">
                        <label>Quantity</label>
                        <div class="quantity-picker">
                            <button onclick="updateQty('${item.cartItemId || item.id}', -1)">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateQty('${item.cartItemId || item.id}', 1)">+</button>
                        </div>
                    </div>

                    <div class="modal-total-price-section">
                        <span>Total Price</span>
                        <span class="total-value">₹${item.price * item.quantity}</span>
                    </div>

                    <div class="modal-action-buttons">
                        <button class="btn-wishlist-action" onclick="moveCartItemToWishlist('${item.cartItemId || item.id}')">
                            <i class="ph ph-heart"></i> Move to Wishlist
                        </button>
                        <button class="btn-remove-action" onclick="removeCartItemFromDetail('${item.cartItemId || item.id}')">
                            <i class="ph ph-trash"></i> Remove Item
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
};

// Initial Render
render();
