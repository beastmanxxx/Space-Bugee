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

const ProductModal = ({ onClose, onSaveSuccess, productToEdit }) => {
    const [product, setProduct] = React.useState(productToEdit || {
        name: '',
        description: '',
        price: '',
        oldPrice: '',
        saleBadge: '',
        images: [''],
        sizes: [{ name: '', price: '', oldPrice: '' }],
        colors: []
    });
    const [showColorPicker, setShowColorPicker] = React.useState(false);
    const [tempColor, setTempColor] = React.useState('#000000');

    const addImage = () => setProduct({ ...product, images: [...product.images, ''] });
    const removeImage = (index) => {
        const newImages = product.images.filter((_, i) => i !== index);
        setProduct({ ...product, images: newImages });
    };

    const addSize = () => setProduct({ ...product, sizes: [...product.sizes, { name: '', price: '', oldPrice: '' }] });
    const removeSize = (index) => {
        const newSizes = product.sizes.filter((_, i) => i !== index);
        setProduct({ ...product, sizes: newSizes });
    };

    const addColor = (hex) => {
        setProduct({ ...product, colors: [...product.colors, { hex, images: [''] }] });
    };
    const removeColor = (index) => {
        const newColors = product.colors.filter((_, i) => i !== index);
        setProduct({ ...product, colors: newColors });
    };

    const addColorImage = (colorIndex) => {
        const newColors = [...product.colors];
        newColors[colorIndex].images.push('');
        setProduct({ ...product, colors: newColors });
    };

    const handleSave = async () => {
        if (!product.name || !product.price) {
            alert("Please fill in at least Name and Price.");
            return;
        }
        try {
            if (productToEdit && productToEdit.id) {
                await db.collection('products').doc(productToEdit.id).update(product);
                alert("Product updated successfully!");
            } else {
                await db.collection('products').add({
                    ...product,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                alert("Product added successfully!");
            }
            onSaveSuccess();
            onClose();
        } catch (err) {
            alert("Error saving product: " + err.message);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '20px' }}>{productToEdit ? 'Edit Product' : 'Add New Product'}</h2>
                    <button onClick={onClose} style={{ fontSize: '24px', color: '#666', border: 'none', background: 'none' }}><i className="ph ph-x"></i></button>
                </div>
                <div className="modal-content">
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Product Name</label>
                            <input type="text" className="form-input" placeholder="e.g. Utility Overshirt" value={product.name} onChange={e => setProduct({ ...product, name: e.target.value })} />
                        </div>
                        <div className="form-group full-width">
                            <label>Description</label>
                            <textarea className="form-textarea" placeholder="Describe the product..." value={product.description} onChange={e => setProduct({ ...product, description: e.target.value })}></textarea>
                        </div>
                        <div className="form-group">
                            <label>Price (₹)</label>
                            <input type="number" className="form-input" placeholder="1499" value={product.price} onChange={e => setProduct({ ...product, price: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Old Price (₹)</label>
                            <input type="number" className="form-input" placeholder="2499" value={product.oldPrice} onChange={e => setProduct({ ...product, oldPrice: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Sale Badge (Optional)</label>
                            <input type="text" className="form-input" placeholder="e.g. 50% OFF" value={product.saleBadge} onChange={e => setProduct({ ...product, saleBadge: e.target.value })} />
                        </div>
                    </div>

                    <div className="dynamic-section">
                        <div className="section-header">
                            <div className="section-title">Product Images (General)</div>
                            <button className="add-btn" onClick={addImage}><i className="ph ph-plus"></i> Add Image</button>
                        </div>
                        {product.images.map((img, idx) => (
                            <div key={idx} className="input-row">
                                <input type="text" className="form-input" placeholder="Image URL" value={img} onChange={e => {
                                    const newImgs = [...product.images];
                                    newImgs[idx] = e.target.value;
                                    setProduct({ ...product, images: newImgs });
                                }} />
                                <i className="ph ph-trash remove-btn" onClick={() => removeImage(idx)}></i>
                            </div>
                        ))}
                    </div>

                    <div className="dynamic-section">
                        <div className="section-header">
                            <div className="section-title">Available Sizes</div>
                            <button className="add-btn" onClick={addSize}><i className="ph ph-plus"></i> Add Size</button>
                        </div>
                        {product.sizes.map((size, idx) => (
                            <div key={idx} className="input-row">
                                <input type="text" style={{ width: '80px' }} className="form-input" placeholder="Size" value={size.name} onChange={e => {
                                    const newSizes = [...product.sizes];
                                    newSizes[idx].name = e.target.value;
                                    setProduct({ ...product, sizes: newSizes });
                                }} />
                                <input type="number" className="form-input" placeholder="Price" value={size.price} onChange={e => {
                                    const newSizes = [...product.sizes];
                                    newSizes[idx].price = e.target.value;
                                    setProduct({ ...product, sizes: newSizes });
                                }} />
                                <input type="number" className="form-input" placeholder="Old Price" value={size.oldPrice} onChange={e => {
                                    const newSizes = [...product.sizes];
                                    newSizes[idx].oldPrice = e.target.value;
                                    setProduct({ ...product, sizes: newSizes });
                                }} />
                                <i className="ph ph-trash remove-btn" onClick={() => removeSize(idx)}></i>
                            </div>
                        ))}
                    </div>

                    <div className="dynamic-section">
                        <div className="section-header">
                            <div className="section-title">Product Colors & Images</div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button className="add-btn" onClick={() => setShowColorPicker(true)}><i className="ph ph-palette"></i> Add Color</button>
                            </div>
                        </div>
                        <div className="color-dots-grid">
                            {product.colors.map((color, cIdx) => (
                                <div key={cIdx} className="color-dot-wrapper">
                                    <div className="color-dot" style={{ background: color.hex }}>
                                        <i className="ph ph-x-circle remove-dot remove-btn" onClick={() => removeColor(cIdx)}></i>
                                    </div>
                                    <div className="color-images">
                                        {color.images.map((cImg, iIdx) => (
                                            <input key={iIdx} type="text" className="form-input color-img-input" placeholder="Img URL" value={cImg} onChange={e => {
                                                const newColors = [...product.colors];
                                                newColors[cIdx].images[iIdx] = e.target.value;
                                                setProduct({ ...product, colors: newColors });
                                            }} />
                                        ))}
                                        <button className="add-btn" style={{ width: '100%', fontSize: '10px', padding: '4px' }} onClick={() => addColorImage(cIdx)}><i className="ph ph-plus"></i> Add Image</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn-primary btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave}>Save Product</button>
                </div>
            </div>

            {showColorPicker && (
                <div className="modal-overlay" style={{ zIndex: 10001, background: 'rgba(0,0,0,0.6)' }} onClick={() => setShowColorPicker(false)}>
                    <div className="modal-container" style={{ maxWidth: '300px', textAlign: 'center', padding: '30px' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginBottom: '20px', fontFamily: 'var(--font-heading)' }}>Select Color</h3>
                        <input type="color" value={tempColor} onChange={e => setTempColor(e.target.value)} style={{ width: '100px', height: '100px', padding: '0', border: 'none', cursor: 'pointer', borderRadius: '50%', marginBottom: '20px' }} />
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button className="btn-primary btn-cancel" style={{ flex: 1 }} onClick={() => setShowColorPicker(false)}>Cancel</button>
                            <button className="btn-primary" style={{ flex: 1 }} onClick={() => { addColor(tempColor); setShowColorPicker(false); }}>OK</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AddCategoryModal = ({ onClose, onSaveSuccess, categoryToEdit }) => {
    const [category, setCategory] = React.useState(categoryToEdit || {
        name: '',
        img: '',
        description: ''
    });

    const handleSave = async () => {
        if (!category.name || !category.img) {
            alert("Please fill in both Name and Image URL.");
            return;
        }
        try {
            if (categoryToEdit && categoryToEdit.id) {
                await db.collection('categories').doc(categoryToEdit.id).update(category);
                alert("Category updated successfully!");
            } else {
                await db.collection('categories').add({
                    ...category,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                alert("Category added successfully!");
            }
            onSaveSuccess();
            onClose();
        } catch (err) {
            alert("Error saving category: " + err.message);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '20px' }}>{categoryToEdit ? 'Edit Category' : 'Add New Category'}</h2>
                    <button onClick={onClose} style={{ fontSize: '24px', color: '#666', border: 'none', background: 'none' }}><i className="ph ph-x"></i></button>
                </div>
                <div className="modal-content">
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label>Category Name</label>
                        <input type="text" className="form-input" placeholder="e.g. Shirts" value={category.name} onChange={e => setCategory({ ...category, name: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label>Image URL</label>
                        <input type="text" className="form-input" placeholder="Image URL" value={category.img} onChange={e => setCategory({ ...category, img: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label>Description (Optional)</label>
                        <textarea className="form-textarea" placeholder="Category description..." style={{ minHeight: '80px', resize: 'vertical' }} value={category.description || ''} onChange={e => setCategory({ ...category, description: e.target.value })}></textarea>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn-primary btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave}>Save Category</button>
                </div>
            </div>
        </div>
    );
};

const CategoryProductsModal = ({ category, products, onClose, onSaveSuccess }) => {
    const [selectedIds, setSelectedIds] = React.useState([]);
    const [searchQuery, setSearchQuery] = React.useState('');

    React.useEffect(() => {
        if (category && products) {
            const initial = products.filter(p => (p.categories && p.categories.includes(category.name)) || p.category === category.name).map(p => p.id);
            setSelectedIds(initial);
        }
    }, [category, products]);

    const handleToggle = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(x => x !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleSave = async () => {
        const batch = db.batch();
        products.forEach(p => {
            const shouldBeIn = selectedIds.includes(p.id);
            let currentCategories = Array.isArray(p.categories) ? [...p.categories] : (p.category ? [p.category] : []);
            const isIn = currentCategories.includes(category.name);

            if (shouldBeIn && !isIn) {
                currentCategories.push(category.name);
                batch.update(db.collection('products').doc(p.id), { categories: currentCategories, category: firebase.firestore.FieldValue.delete() });
            } else if (!shouldBeIn && isIn) {
                currentCategories = currentCategories.filter(c => c !== category.name);
                batch.update(db.collection('products').doc(p.id), { categories: currentCategories, category: firebase.firestore.FieldValue.delete() });
            }
        });
        try {
            await batch.commit();
            alert("Products updated successfully for category: " + category.name);
            onSaveSuccess();
            onClose();
        } catch (err) {
            alert("Error saving category products: " + err.message);
        }
    };

    const filtered = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', maxHeight: '90vh', width: '95%' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '20px' }}>Add Products to: {category.name}</h2>
                    <button onClick={onClose} style={{ fontSize: '24px', color: '#666', border: 'none', background: 'none' }}><i className="ph ph-x"></i></button>
                </div>
                <div className="modal-content" style={{ overflowY: 'auto', flex: 1, paddingRight: '10px' }}>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Search products..." 
                            value={searchQuery} 
                            onChange={e => setSearchQuery(e.target.value)} 
                        />
                    </div>
                    <div className="admin-select-grid">
                        {filtered.map(p => {
                            const isSelected = selectedIds.includes(p.id);
                            return (
                                <div 
                                    key={p.id} 
                                    onClick={() => handleToggle(p.id)}
                                    className={`admin-select-card ${isSelected ? 'selected-green' : ''}`}
                                >
                                    <div className="card-img-container">
                                        <img src={p.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        {p.saleBadge && (
                                            <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'var(--brown)', color: 'white', fontSize: '9px', padding: '2px 6px', borderRadius: '3px', fontWeight: 'bold', zIndex: 2 }}>
                                                {p.saleBadge}
                                            </span>
                                        )}
                                        <div style={{ 
                                            position: 'absolute', 
                                            top: '8px', 
                                            right: '8px', 
                                            width: '24px', 
                                            height: '24px', 
                                            borderRadius: '50%', 
                                            background: isSelected ? '#1e8e3e' : 'rgba(255,255,255,0.9)', 
                                            border: '1px solid #ccc',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '12px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            zIndex: 2
                                        }}>
                                            {isSelected && <i className="ph ph-check" style={{ fontWeight: 'bold' }}></i>}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '13px', color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e8e3e', marginTop: '2px' }}>₹{p.price}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {filtered.length === 0 && <p style={{ textAlign: 'center', color: '#999', margin: '20px 0' }}>No products found.</p>}
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
                    <button className="btn-primary btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave}>Save Changes</button>
                </div>
            </div>
        </div>
    );
};

const SalesModal = ({ products, onClose, onSaveSuccess }) => {
    const [selectedIds, setSelectedIds] = React.useState([]);
    const [searchQuery, setSearchQuery] = React.useState('');

    React.useEffect(() => {
        if (products) {
            const initial = products.filter(p => p.inSale).map(p => p.id);
            setSelectedIds(initial);
        }
    }, [products]);

    const handleToggle = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(x => x !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleSave = async () => {
        const batch = db.batch();
        products.forEach(p => {
            const shouldBeIn = selectedIds.includes(p.id);
            const isIn = p.inSale || false;
            if (shouldBeIn && !isIn) {
                batch.update(db.collection('products').doc(p.id), { inSale: true });
            } else if (!shouldBeIn && isIn) {
                batch.update(db.collection('products').doc(p.id), { inSale: firebase.firestore.FieldValue.delete() });
            }
        });
        try {
            await batch.commit();
            alert("Sales products updated successfully!");
            onSaveSuccess();
            onClose();
        } catch (err) {
            alert("Error saving sales products: " + err.message);
        }
    };

    const filtered = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', maxHeight: '90vh', width: '95%' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '20px' }}>Manage Sale Products</h2>
                    <button onClick={onClose} style={{ fontSize: '24px', color: '#666', border: 'none', background: 'none' }}><i className="ph ph-x"></i></button>
                </div>
                <div className="modal-content" style={{ overflowY: 'auto', flex: 1, paddingRight: '10px' }}>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Search products..." 
                            value={searchQuery} 
                            onChange={e => setSearchQuery(e.target.value)} 
                        />
                    </div>
                    <div className="admin-select-grid">
                        {filtered.map(p => {
                            const isSelected = selectedIds.includes(p.id);
                            return (
                                <div 
                                    key={p.id} 
                                    onClick={() => handleToggle(p.id)}
                                    className={`admin-select-card ${isSelected ? 'selected-brown' : ''}`}
                                >
                                    <div className="card-img-container">
                                        <img src={p.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        {p.saleBadge && (
                                            <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'var(--brown)', color: 'white', fontSize: '9px', padding: '2px 6px', borderRadius: '3px', fontWeight: 'bold', zIndex: 2 }}>
                                                {p.saleBadge}
                                            </span>
                                        )}
                                        <div style={{ 
                                            position: 'absolute', 
                                            top: '8px', 
                                            right: '8px', 
                                            width: '24px', 
                                            height: '24px', 
                                            borderRadius: '50%', 
                                            background: isSelected ? 'var(--brown)' : 'rgba(255,255,255,0.9)', 
                                            border: '1px solid #ccc',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '12px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            zIndex: 2
                                        }}>
                                            {isSelected && <i className="ph ph-check" style={{ fontWeight: 'bold' }}></i>}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '13px', color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                                        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--brown)', marginTop: '2px' }}>₹{p.price}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {filtered.length === 0 && <p style={{ textAlign: 'center', color: '#999', margin: '20px 0' }}>No products found.</p>}
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
                    <button className="btn-primary btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave}>Save Changes</button>
                </div>
            </div>
        </div>
    );
};


const AdminApp = () => {
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState('dashboard');
    const [usersList, setUsersList] = React.useState([]);
    const [productsList, setProductsList] = React.useState([]);
    const [categoriesList, setCategoriesList] = React.useState([]);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);
    const [isCategoryProductsModalOpen, setIsCategoryProductsModalOpen] = React.useState(false);
    const [isSalesModalOpen, setIsSalesModalOpen] = React.useState(false);
    const [selectedCategoryForProducts, setSelectedCategoryForProducts] = React.useState(null);
    const [editingProduct, setEditingProduct] = React.useState(null);
    const [editingCategory, setEditingCategory] = React.useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [slideshowList, setSlideshowList] = React.useState([]);
    const [isSlideshowModalOpen, setIsSlideshowModalOpen] = React.useState(false);
    const [editingSlide, setEditingSlide] = React.useState(null);

    React.useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                if (currentUser.email === 'moghaeashu@gmail.com') {
                    setUser(currentUser);
                    fetchUsers();
                    fetchProducts();
                    fetchCategories();
                    fetchSlideshow();
                } else {
                    try {
                        const userDoc = await db.collection('users').doc(currentUser.uid).get();
                        if (userDoc.exists && userDoc.data().isAdmin) {
                            setUser(currentUser);
                            fetchUsers();
                            fetchProducts();
                            fetchCategories();
                            fetchSlideshow();
                        } else {
                            setUser(null);
                            window.location.href = '/index.html';
                        }
                    } catch (e) {
                        setUser(null);
                        window.location.href = '/index.html';
                    }
                }
            } else {
                setUser(null);
                window.location.href = '/index.html';
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const fetchSlideshow = async () => {
        try {
            const snapshot = await db.collection('slideshow').orderBy('createdAt', 'desc').get();
            const slides = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSlideshowList(slides);
        } catch (err) {
            console.error("Error fetching slideshow:", err);
        }
    };

    const fetchUsers = async () => {
        try {
            const snapshot = await db.collection('users').orderBy('createdAt', 'desc').get();
            const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsersList(users);
        } catch (err) { console.error(err); }
    };

    const fetchProducts = async () => {
        try {
            const snapshot = await db.collection('products').orderBy('createdAt', 'desc').get();
            const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProductsList(products);
        } catch (err) { console.error(err); }
    };

    const fetchCategories = async () => {
        try {
            const snapshot = await db.collection('categories').orderBy('createdAt', 'desc').get();
            const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCategoriesList(categories);
        } catch (err) { console.error(err); }
    };


    const toggleAdmin = async (userId, currentStatus) => {
        if (!confirm(`Are you sure you want to ${currentStatus ? 'remove' : 'grant'} admin rights for this user?`)) return;
        try {
            await db.collection('users').doc(userId).update({ isAdmin: !currentStatus });
            fetchUsers();
        } catch (err) {
            alert('Error updating user: ' + err.message);
        }
    };

    const handleLogout = () => {
        auth.signOut().then(() => { window.location.href = '/index.html'; });
    };

    if (loading) {
        return (
            <div className="full-screen-msg">
                <div className="spinner"></div>
                <p>Verifying Admin Access...</p>
            </div>
        );
    }

    if (!user) return null;

    const handleNavClick = (tab) => {
        setActiveTab(tab);
        setIsSidebarOpen(false);
    };

    return (
        <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            {isSidebarOpen && <div className="sidebar-overlay-bg" onClick={() => setIsSidebarOpen(false)}></div>}
            <aside className="sidebar">
                <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <i className="ph-fill ph-planet" style={{ fontSize: '28px', color: 'var(--primary)' }}></i>
                        <div className="sidebar-logo">space bugee</div>
                    </div>
                    <button className="sidebar-toggle-btn" style={{ display: 'flex', border: 'none', background: 'none', padding: '4px' }} onClick={() => setIsSidebarOpen(false)}>
                        <i className="ph ph-x"></i>
                    </button>
                </div>
                <nav className="sidebar-nav">
                    <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => handleNavClick('dashboard')}>
                        <i className="ph ph-squares-four"></i> Dashboard
                    </div>
                    <div className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => handleNavClick('users')}>
                        <i className="ph ph-users"></i> Users
                    </div>
                    <div className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => handleNavClick('categories')}>
                        <i className="ph ph-tag"></i> Categories
                    </div>
                    <div className={`nav-item ${activeTab === 'sales' ? 'active' : ''}`} onClick={() => handleNavClick('sales')}>
                        <i className="ph ph-percent"></i> Sales
                    </div>
                    <div className={`nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => handleNavClick('products')}>
                        <i className="ph ph-package"></i> Products
                    </div>
                    <div className={`nav-item ${activeTab === 'slideshow' ? 'active' : ''}`} onClick={() => handleNavClick('slideshow')}>
                        <i className="ph ph-presentation"></i> Slideshow
                    </div>
                </nav>
                <div className="sidebar-footer">
                    <div className="admin-profile">
                        <div className="admin-avatar">{user.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}</div>
                        <div className="admin-info">
                            <div className="admin-name">{user.displayName || 'Admin'}</div>
                            <div className="admin-role">Super Admin</div>
                        </div>
                        <button className="logout-btn" onClick={handleLogout}><i className="ph ph-sign-out"></i></button>
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <div className="header-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(true)}>
                            <i className="ph ph-list"></i>
                        </button>
                        <h1 className="page-title" style={{ margin: 0 }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Overview</h1>
                    </div>
                    {activeTab !== 'users' && (
                        <button className="btn-primary" onClick={() => {
                            if (activeTab === 'categories') {
                                setEditingCategory(null);
                                setIsCategoryModalOpen(true);
                            } else if (activeTab === 'sales') {
                                setIsSalesModalOpen(true);
                            } else if (activeTab === 'slideshow') {
                                setEditingSlide(null);
                                setIsSlideshowModalOpen(true);
                            } else {
                                setEditingProduct(null);
                                setIsModalOpen(true);
                            }
                        }}><i className="ph ph-plus"></i> Add New</button>
                    )}
                </div>

                {activeTab === 'dashboard' && (
                    <>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-header"><div className="stat-icon"><i className="ph ph-users"></i></div></div>
                                <div className="stat-value">{usersList.length}</div>
                                <div className="stat-label">Total Users</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-header"><div className="stat-icon" style={{ color: '#f59e0b' }}><i className="ph ph-package"></i></div></div>
                                <div className="stat-value">{productsList.length}</div>
                                <div className="stat-label">Active Products</div>
                            </div>
                        </div>
                        <div className="card-panel">
                            <div className="panel-header"><div className="panel-title">Recent Products</div></div>
                            <table>
                                <thead><tr><th>Image</th><th>Name</th><th>Price</th><th>Badge</th></tr></thead>
                                <tbody>
                                    {productsList.slice(0, 5).map(p => (
                                        <tr key={p.id}>
                                            <td><img src={p.images[0]} style={{ width: '40px', borderRadius: '4px' }} /></td>
                                            <td>{p.name}</td>
                                            <td>₹{p.price}</td>
                                            <td>{p.saleBadge || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {activeTab === 'users' && (
                    <div className="card-panel">
                        <div className="panel-header"><div className="panel-title">All Registered Users</div></div>
                        <table>
                            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
                            <tbody>
                                {usersList.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.fullName || '-'}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', background: u.isAdmin || u.email === 'moghaeashu@gmail.com' ? '#e6f4ea' : '#f1f3f4', color: u.isAdmin || u.email === 'moghaeashu@gmail.com' ? '#1e8e3e' : '#5f6368' }}>
                                                {u.email === 'moghaeashu@gmail.com' ? 'Super Admin' : (u.isAdmin ? 'Admin' : 'User')}
                                            </span>
                                        </td>
                                        <td>
                                            {u.email !== 'moghaeashu@gmail.com' && (
                                                <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px', background: u.isAdmin ? '#dc3545' : '#1a1a1a' }} onClick={() => toggleAdmin(u.id, u.isAdmin)}>
                                                    {u.isAdmin ? 'Remove Admin' : 'Make Admin'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                 {activeTab === 'categories' && (
                    <div className="card-panel">
                        <div className="panel-header"><div className="panel-title">All Categories</div></div>
                        <table>
                            <thead><tr><th>Image</th><th>Name</th><th>Products</th><th>Actions</th></tr></thead>
                            <tbody>
                                {categoriesList.map(c => (
                                    <tr key={c.id}>
                                        <td><img src={c.img} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} /></td>
                                        <td>{c.name}</td>
                                        <td>{productsList.filter(p => (p.categories && p.categories.includes(c.name)) || p.category === c.name).length}</td>
                                        <td>
                                            <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px', marginRight: '12px', background: '#1a1a1a' }} onClick={() => { setSelectedCategoryForProducts(c); setIsCategoryProductsModalOpen(true); }}>
                                                <i className="ph ph-plus-circle" style={{ marginRight: '4px' }}></i> Add Products
                                            </button>
                                            <i className="ph ph-pencil-simple" style={{ cursor: 'pointer', color: '#0d6efd', fontSize: '18px', marginRight: '12px', verticalAlign: 'middle' }} onClick={() => { setEditingCategory(c); setIsCategoryModalOpen(true); }}></i>
                                            <i className="ph ph-trash" style={{ cursor: 'pointer', color: '#dc3545', fontSize: '18px', verticalAlign: 'middle' }} onClick={async () => { if(confirm('Delete Category?')) { await db.collection('categories').doc(c.id).delete(); fetchCategories(); } }}></i>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'sales' && (
                    <div className="card-panel">
                        <div className="panel-header"><div className="panel-title">Products on Sale</div></div>
                        <div className="admin-sales-grid">
                            {productsList.filter(p => p.inSale).map(p => (
                                <div key={p.id} className="admin-sales-card">
                                    <div className="card-img-container">
                                        <img src={p.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        {p.saleBadge && (
                                            <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'var(--brown)', color: 'white', fontSize: '10px', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                                                {p.saleBadge}
                                            </span>
                                        )}
                                        <button 
                                            style={{ position: 'absolute', top: '8px', right: '8px', background: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 5 }}
                                            onClick={async () => { if(confirm('Remove this product from Sale?')) { await db.collection('products').doc(p.id).update({ inSale: firebase.firestore.FieldValue.delete() }); fetchProducts(); } }}
                                        >
                                            <i className="ph ph-trash" style={{ color: '#dc3545', fontSize: '18px' }}></i>
                                        </button>
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div className="card-title" style={{ fontWeight: '600', fontSize: '14px', color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                                        <div className="card-price" style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                            <span style={{ fontWeight: '700', fontSize: '14px', color: '#1a1a1a' }}>₹{p.price}</span>
                                            {p.oldPrice && <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '12px' }}>₹{p.oldPrice}</span>}
                                        </div>
                                        {p.categories && p.categories.length > 0 && (
                                            <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                                                <i className="ph ph-tag" style={{ marginRight: '4px' }}></i>
                                                {p.categories.join(', ')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {productsList.filter(p => p.inSale).length === 0 && (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#999', padding: '40px 0' }}>
                                    <i className="ph ph-percent" style={{ fontSize: '48px', color: '#ddd', marginBottom: '12px' }}></i>
                                    <p>No products currently on sale. Click 'Add New' to add products to sale!</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}


                {activeTab === 'products' && (
                    <div className="card-panel">
                        <div className="panel-header"><div className="panel-title">All Products</div></div>
                        <table>
                            <thead><tr><th>Image</th><th>Name</th><th>Price</th><th>Category</th><th>Actions</th></tr></thead>
                            <tbody>
                                {productsList.map(p => (
                                    <tr key={p.id}>
                                        <td><img src={p.images[0]} style={{ width: '40px', borderRadius: '4px' }} /></td>
                                        <td>{p.name}</td>
                                        <td>₹{p.price}</td>
                                        <td>{(p.categories && p.categories.length > 0) ? p.categories.join(', ') : (p.category || '-')}</td>
                                        <td>
                                            <i className="ph ph-pencil-simple" style={{ cursor: 'pointer', color: '#0d6efd', marginRight: '12px' }} onClick={() => { setEditingProduct(p); setIsModalOpen(true); }}></i>
                                            <i className="ph ph-trash" style={{ cursor: 'pointer', color: '#dc3545' }} onClick={async () => { if(confirm('Delete?')) { await db.collection('products').doc(p.id).delete(); fetchProducts(); } }}></i>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'slideshow' && (
                    <div className="card-panel">
                        <div className="panel-header"><div className="panel-title">Home Hero Slideshow</div></div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Badge Name (Subtitle)</th>
                                    <th>Heading (Title)</th>
                                    <th>Button Text</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {slideshowList.map(slide => (
                                    <tr key={slide.id}>
                                        <td><img src={slide.img} style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} /></td>
                                        <td>{slide.subtitle || '-'}</td>
                                        <td>{slide.title || '-'}</td>
                                        <td>{slide.btnText || '-'}</td>
                                        <td>
                                            <i className="ph ph-pencil-simple" style={{ cursor: 'pointer', color: '#0d6efd', fontSize: '18px', marginRight: '12px', verticalAlign: 'middle' }} onClick={() => { setEditingSlide(slide); setIsSlideshowModalOpen(true); }}></i>
                                            <i className="ph ph-trash" style={{ cursor: 'pointer', color: '#dc3545', fontSize: '18px', verticalAlign: 'middle' }} onClick={async () => { if (confirm('Are you sure you want to delete this slide?')) { await db.collection('slideshow').doc(slide.id).delete(); fetchSlideshow(); } }}></i>
                                        </td>
                                    </tr>
                                ))}
                                {slideshowList.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                                            No custom slides found. Showing default slides on homepage. Click 'Add New' to create one!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
            {isModalOpen && <ProductModal productToEdit={editingProduct} onClose={() => { setIsModalOpen(false); setEditingProduct(null); }} onSaveSuccess={fetchProducts} />}
            {isCategoryModalOpen && <AddCategoryModal categoryToEdit={editingCategory} onClose={() => { setIsCategoryModalOpen(false); setEditingCategory(null); }} onSaveSuccess={fetchCategories} />}
            {isCategoryProductsModalOpen && <CategoryProductsModal category={selectedCategoryForProducts} products={productsList} onClose={() => { setIsCategoryProductsModalOpen(false); setSelectedCategoryForProducts(null); }} onSaveSuccess={() => { fetchProducts(); fetchCategories(); }} />}
            {isSalesModalOpen && <SalesModal products={productsList} onClose={() => setIsSalesModalOpen(false)} onSaveSuccess={fetchProducts} />}
            {isSlideshowModalOpen && <SlideshowModal slideToEdit={editingSlide} onClose={() => { setIsSlideshowModalOpen(false); setEditingSlide(null); }} onSaveSuccess={fetchSlideshow} />}
        </div>
    );
};

const SlideshowModal = ({ slideToEdit, onClose, onSaveSuccess }) => {
    const [slide, setSlide] = React.useState(slideToEdit || {
        title: '',
        subtitle: '',
        desc: '',
        btnText: '',
        img: ''
    });
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        if (slideToEdit) {
            setSlide(slideToEdit);
        }
    }, [slideToEdit]);

    const handleSave = async () => {
        if (!slide.title || !slide.subtitle || !slide.desc || !slide.btnText || !slide.img) {
            alert("Please fill in all the required fields.");
            return;
        }
        setSaving(true);
        try {
            const data = {
                title: slide.title,
                subtitle: slide.subtitle,
                desc: slide.desc,
                btnText: slide.btnText,
                img: slide.img,
                createdAt: slideToEdit ? slideToEdit.createdAt : firebase.firestore.FieldValue.serverTimestamp()
            };
            if (slideToEdit && slideToEdit.id) {
                await db.collection('slideshow').doc(slideToEdit.id).set(data, { merge: true });
                alert("Slide updated successfully!");
            } else {
                await db.collection('slideshow').add(data);
                alert("Slide added successfully!");
            }
            onSaveSuccess();
            onClose();
        } catch (err) {
            alert("Error saving slide: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '20px' }}>{slideToEdit ? 'Edit Hero Slide' : 'Add New Hero Slide'}</h2>
                    <button onClick={onClose} style={{ fontSize: '24px', color: '#666', border: 'none', background: 'none' }}><i className="ph ph-x"></i></button>
                </div>
                <div className="modal-content">
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label>Badge Name (Subtitle)</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="e.g. NEW SEASON COLLECTION" 
                            value={slide.subtitle} 
                            onChange={e => setSlide({ ...slide, subtitle: e.target.value })} 
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label>Heading (Title)</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="e.g. Elevated Style. Everyday Comfort." 
                            value={slide.title} 
                            onChange={e => setSlide({ ...slide, title: e.target.value })} 
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label>Description</label>
                        <textarea 
                            className="form-textarea" 
                            placeholder="e.g. Timeless pieces, modern design..." 
                            style={{ minHeight: '80px', resize: 'vertical' }}
                            value={slide.desc} 
                            onChange={e => setSlide({ ...slide, desc: e.target.value })}
                        ></textarea>
                    </div>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label>Button Name (Text)</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="e.g. SHOP NEW ARRIVALS" 
                            value={slide.btnText} 
                            onChange={e => setSlide({ ...slide, btnText: e.target.value })} 
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label>Background Image URL</label>
                        <input 
                            type="url" 
                            className="form-input" 
                            placeholder="https://images.unsplash.com/..." 
                            value={slide.img} 
                            onChange={e => setSlide({ ...slide, img: e.target.value })} 
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn-primary btn-cancel" onClick={onClose} disabled={saving}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : (slideToEdit ? 'Save Changes' : 'Add Slideshow')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AdminApp />);
