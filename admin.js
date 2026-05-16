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

const AddProductModal = ({ onClose, onSaveSuccess }) => {
    const [product, setProduct] = React.useState({
        name: '',
        description: '',
        price: '',
        oldPrice: '',
        saleBadge: '',
        images: [''],
        sizes: [{ name: '', price: '', oldPrice: '' }],
        colors: []
    });

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
            await db.collection('products').add({
                ...product,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            alert("Product added successfully!");
            onSaveSuccess();
            onClose();
        } catch (err) {
            alert("Error adding product: " + err.message);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '20px' }}>Add New Product</h2>
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
                                <input type="color" id="colorPicker" style={{ display: 'none' }} onChange={(e) => addColor(e.target.value)} />
                                <button className="add-btn" onClick={() => document.getElementById('colorPicker').click()}><i className="ph ph-palette"></i> Add Color</button>
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
        </div>
    );
};

const AdminApp = () => {
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState('dashboard');
    const [usersList, setUsersList] = React.useState([]);
    const [productsList, setProductsList] = React.useState([]);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    React.useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser && currentUser.email === 'moghaeashu@gmail.com') {
                setUser(currentUser);
                fetchUsers();
                fetchProducts();
            } else {
                setUser(null);
                window.location.href = '/index.html';
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

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

    return (
        <div className="admin-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <i className="ph-fill ph-planet" style={{ fontSize: '28px', color: 'var(--primary)' }}></i>
                    <div className="sidebar-logo">space bugee</div>
                </div>
                <nav className="sidebar-nav">
                    <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                        <i className="ph ph-squares-four"></i> Dashboard
                    </div>
                    <div className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                        <i className="ph ph-users"></i> Users
                    </div>
                    <div className={`nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
                        <i className="ph ph-package"></i> Products
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
                <div className="header-top">
                    <h1 className="page-title">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Overview</h1>
                    <button className="btn-primary" onClick={() => setIsModalOpen(true)}><i className="ph ph-plus"></i> Add New</button>
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
                                        <td>-</td>
                                        <td><i className="ph ph-trash" style={{ cursor: 'pointer', color: '#dc3545' }} onClick={async () => { if(confirm('Delete?')) { await db.collection('products').doc(p.id).delete(); fetchProducts(); } }}></i></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
            {isModalOpen && <AddProductModal onClose={() => setIsModalOpen(false)} onSaveSuccess={fetchProducts} />}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AdminApp />);
