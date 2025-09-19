// app.js - Frontend JavaScript untuk Aplikasi Form Order WhatsApp (Grup Version)
const API_BASE_URL = 'https://67a5c1c179cf.ngrok-free.app';

// Elemen UI untuk status WhatsApp
const whatsappStatus = document.createElement('div');
whatsappStatus.id = 'whatsapp-status';
whatsappStatus.style.position = 'fixed';
whatsappStatus.style.top = '10px';
whatsappStatus.style.left = '10px';
whatsappStatus.style.padding = '10px';
whatsappStatus.style.borderRadius = '5px';
whatsappStatus.style.zIndex = '1000';
whatsappStatus.style.fontSize = '14px';
whatsappStatus.style.fontWeight = 'bold';
document.body.appendChild(whatsappStatus);
let orders = []; // Variabel global untuk menyimpan data orders

// Fungsi untuk menampilkan notifikasi
function showNotification(message, isSuccess = true) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    
    notificationText.textContent = message;
    notification.style.backgroundColor = isSuccess ? '#28a745' : '#dc3545';
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Fungsi untuk menyalin teks ke clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Teks form sudah disalin. Silakan paste di grup WhatsApp');
    }).catch(err => {
        console.error('Gagal menyalin teks: ', err);
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Teks form sudah disalin. Silakan paste di grup WhatsApp');
    });
}

// Fungsi untuk membuka WhatsApp dengan format pesan
function openWhatsApp() {
    const message = `Isi Form Order👇👇🔥🔥
a. Customer: 
b. Pesanan: 
c. Jenis Pesanan: 
d. Jumlah: 
e. Keterangan: 
f. Kain Jersey: 
g. Kain Celana: 
h. Catatan: 
i. Tanggal:  `;
    
    copyToClipboard(message);
}

// Fungsi untuk memuat data orders dari backend
async function loadOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/orders`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        orders = data; // simpan ulang ke variabel global
        renderOrders(orders);
    } catch (error) {
        console.error('Failed to load orders:', error);
        showNotification('Gagal memuat data orders', false);
    }
}


// Fungsi untuk memuat statistik dari backend
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/stats`);
        if (!response.ok) throw new Error('Gagal memuat statistik');
        
        const stats = await response.json();
        updateStatsUI(stats);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Fungsi untuk mengupdate UI statistik
function updateStatsUI(stats) {
    document.getElementById('total-orders').textContent = stats.total;
    document.getElementById('antri-orders').textContent = stats.antri;
    document.getElementById('proses-orders').textContent = stats.proses;
    document.getElementById('selesai-orders').textContent = stats.selesai;
}

// ===== FUNGSI RENDER ORDERS YANG BENAR =====
function renderOrders(ordersToRender) {
    const ordersContainer = document.getElementById('orders-list');
    ordersContainer.innerHTML = '';
    
    if (ordersToRender.length === 0) {
        ordersContainer.innerHTML = '<p class="no-orders">Tidak ada order yang ditemukan</p>';
        return;
    }
    
    ordersToRender.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
    
    ordersToRender.forEach(order => {
        const orderDate = new Date(order.tanggal).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
        
        const orderElement = document.createElement('div');
        orderElement.className = 'order-card';
        orderElement.setAttribute('data-id', order.id);
        orderElement.innerHTML = `
            <div class="order-actions">
                <button class="action-btn edit-btn" data-id="${order.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" data-id="${order.id}"><i class="fas fa-trash"></i></button>
            </div>
            
            <div class="order-main-info">
                <div class="order-title">${order.pesanan}</div>
                <div class="order-secondary-info">
                    <div class="order-customer">${order.customer}</div>
                    <div class="order-quantity">${order.jumlah} Pcs</div>
                </div>
                <div class="order-tertiary-info">
                    <div class="order-date">${orderDate}</div>
                    <div class="status-badge status-${order.status}">${getStatusText(order.status)}</div>
                </div>
            </div>
            
            <div class="order-status-container">
                <div class="status-dropdown">
                    <button class="status-dropdown-btn status-btn status-${order.status}">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="status-dropdown-content">
                        <button data-status="antri" data-id="${order.id}">
                            <span class="status-badge status-antri" style="margin-right: 5px;"></span> Antri
                        </button>
                        <button data-status="proses" data-id="${order.id}">
                            <span class="status-badge status-proses" style="margin-right: 5px;"></span> Proses
                        </button>
                        <button data-status="selesai" data-id="${order.id}">
                            <span class="status-badge status-selesai" style="margin-right: 5px;"></span> Selesai
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        ordersContainer.appendChild(orderElement);
    });
    
    // Setup event delegation setelah render
    setupEventDelegation();
}

// Fungsi untuk setup event delegation
function setupEventDelegation() {
    const ordersContainer = document.getElementById('orders-list');
    
    // Hapus event listeners lama jika ada
    const newContainer = ordersContainer.cloneNode(true);
    ordersContainer.parentNode.replaceChild(newContainer, ordersContainer);
    
    // Event delegation untuk semua interaksi
    document.getElementById('orders-list').addEventListener('click', (e) => {
        const target = e.target;
    
        // Edit button
        if (target.closest('.edit-btn')) {
            const btn = target.closest('.edit-btn');
            const id = btn.getAttribute('data-id');
            e.stopPropagation();
            openEditModal(id);
            return;
        }
        
        // Delete button
        if (target.closest('.delete-btn')) {
            const btn = target.closest('.delete-btn');
            const id = btn.getAttribute('data-id');
            e.stopPropagation();
            deleteOrder(id);
            return;
        }
    });
}
        
        document.addEventListener('click', (e) => {
    const target = e.target;

    // Status dropdown button
    if (target.closest('.status-dropdown-btn')) {
        e.stopPropagation();
        const dropdown = target.closest('.status-dropdown');

        // Tutup semua dropdown lainnya
        document.querySelectorAll('.status-dropdown').forEach(dd => {
            if (dd !== dropdown) dd.classList.remove('open');
        });

        // Toggle dropdown yang diklik
        dropdown.classList.toggle('open');
        return;
    }

    // Status change buttons
    if (target.closest('.status-dropdown-content button')) {
        e.stopPropagation();
        const button = target.closest('button');
        const status = button.getAttribute('data-status');
        const id = button.getAttribute('data-id');
        changeOrderStatus(id, status);

        // Tutup dropdown
        button.closest('.status-dropdown').classList.remove('open');
        return;
    }

    // Klik pada card (untuk detail)
    if (target.closest('.order-card') && 
        !target.closest('.order-actions') && 
        !target.closest('.status-dropdown')) {
        const card = target.closest('.order-card');
        const id = card.getAttribute('data-id');
        const order = orders.find(o => o.id == id);
        if (order) {
            showOrderDetail(order);
        }
    }

    // Tutup dropdown saat klik di luar
    document.querySelectorAll('.status-dropdown').forEach(dropdown => {
        dropdown.classList.remove('open');
    });
});


// Fungsi untuk mengkonversi kode status ke teks
function getStatusText(status) {
    const statusMap = {
        'antri': 'ANTRI',
        'proses': 'DIPROSES',
        'selesai': 'SELESAI'
    };
    return statusMap[status] || 'ANTRI';
}

// Fungsi untuk membuka modal edit
async function openEditModal(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${id}`);
        if (!response.ok) throw new Error('Gagal memuat data order');
        
        const order = await response.json();
        
        document.getElementById('edit-id').value = order.id;
        document.getElementById('edit-customer').value = order.customer;
        document.getElementById('edit-pesanan').value = order.pesanan;
        document.getElementById('edit-jenis').value = order.jenis;
        document.getElementById('edit-jumlah').value = order.jumlah;
        document.getElementById('edit-keterangan').value = order.keterangan || '';
        document.getElementById('edit-kain-jersey').value = order.kainJersey || '';
        document.getElementById('edit-kain-celana').value = order.kainCelana || '';
        document.getElementById('edit-catatan').value = order.catatan || '';
        document.getElementById('edit-tanggal').value = order.tanggal;
        document.getElementById('edit-status').value = order.status;
        
        document.getElementById('edit-modal').style.display = 'flex';
    } catch (error) {
        console.error('Error:', error);
        showNotification('Gagal memuat data order', false);
    }
    
    // Event listener untuk menutup modal saat klik di luar
    document.getElementById('edit-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('edit-modal')) {
            document.getElementById('edit-modal').style.display = 'none';
        }
    });
}

// Fungsi untuk menghapus order
async function deleteOrder(id) {
    if (confirm('Apakah Anda yakin ingin menghapus pesanan ini?')) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Gagal menghapus order');
            
            showNotification('Pesanan berhasil dihapus');
            loadOrders();
        } catch (error) {
            console.error('Error:', error);
            showNotification('Gagal menghapus order', false);
        }
    }
}

// Fungsi untuk memfilter order
function filterOrders() {
    const monthFilter = document.getElementById('month-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    const searchTerm = document.getElementById('search').value.toLowerCase();
    
    let url = `${API_BASE_URL}/api/orders?`;
    const params = [];
    
    if (monthFilter) {
        params.push(`month=${monthFilter}`);
    }
    
    if (statusFilter) {
        params.push(`status=${statusFilter}`);
    }
    
    if (searchTerm) {
        params.push(`search=${encodeURIComponent(searchTerm)}`);
    }
    
    url += params.join('&');
    
    fetch(url)
        .then(response => response.json())
        .then(orders => renderOrders(orders))
        .catch(error => {
            console.error('Error:', error);
            showNotification('Gagal memfilter data', false);
        });
}

// Fungsi untuk generate laporan
async function generateReport() {
    const month = document.getElementById('report-month').value;
    const year = document.getElementById('report-year').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/orders?month=${month}`);
        if (!response.ok) throw new Error('Gagal memuat data laporan');
        
        const orders = await response.json();
        
        const filteredOrders = orders.filter(order => {
            const orderYear = new Date(order.tanggal).getFullYear();
            return orderYear == year;
        });
        
        const antri = filteredOrders.filter(order => order.status === 'antri').length;
        const proses = filteredOrders.filter(order => order.status === 'proses').length;
        const selesai = filteredOrders.filter(order => order.status === 'selesai').length;
        const total = filteredOrders.length;
        
        const monthNames = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        
        const reportResult = document.getElementById('report-result');
        reportResult.innerHTML = `
            <h3>Laporan Bulan ${monthNames[month-1]} ${year}</h3>
            <p>Total Pesanan: ${total}</p>
            <p>Dalam Antrian: ${antri}</p>
            <p>Dalam Proses: ${proses}</p>
            <p>Selesai: ${selesai}</p>
            
            <h4>Detail Pesanan:</h4>
            <ul>
                ${filteredOrders.map(order => `
                    <li>${order.customer} - ${order.pesanan} (${getStatusText(order.status)}) - ${order.tanggal}</li>
                `).join('')}
            </ul>
        `;
    } catch (error) {
        console.error('Error:', error);
        showNotification('Gagal generate laporan', false);
    }
}

// Fungsi untuk mengecek status koneksi grup WhatsApp
async function checkWhatsAppGroupStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/whatsapp/group`);
        const data = await response.json();
        
        if (data.connected) {
            whatsappStatus.textContent = `Terhubung ke grup: ${data.groupName} ✓`;
            whatsappStatus.style.backgroundColor = '#28a745';
            whatsappStatus.style.color = '#fff';
        } else if (data.savedGroup) {
            whatsappStatus.textContent = `Grup ${data.savedGroup} tersimpan, tetapi bot belum terhubung. Pastikan bot masih di grup dan restart server.`;
            whatsappStatus.style.backgroundColor = '#ff9800';
            whatsappStatus.style.color = '#000';
        } else {
            whatsappStatus.textContent = 'Bot belum ditambahkan ke grup';
            whatsappStatus.style.backgroundColor = '#ffc107';
            whatsappStatus.style.color = '#000';
        }
    } catch (error) {
        console.error('Error checking WhatsApp group status:', error);
        whatsappStatus.textContent = 'Error menghubungkan ke grup';
        whatsappStatus.style.backgroundColor = '#dc3545';
        whatsappStatus.style.color = '#fff';
    }
}

// Fungsi untuk mengecek status koneksi WhatsApp
async function checkWhatsAppStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/whatsapp/qr`);
        const data = await response.json();
        
        if (data.qrCode) {
            whatsappStatus.textContent = 'Scan QR Code untuk menghubungkan WhatsApp';
            whatsappStatus.style.backgroundColor = '#ffc107';
            whatsappStatus.style.color = '#000';
            
            if (confirm('QR Code tersedia. Ingin melihat?')) {
                const qrWindow = window.open('', '_blank');
                qrWindow.document.write(`
                    <html>
                    <body style="text-align: center; padding: 20px;">
                        <h2>Scan QR Code untuk WhatsApp</h2>
                        <img src="${data.qrCode}" alt="WhatsApp QR Code">
                        <p>Gunakan WhatsApp di phone Anda untuk scan QR code ini</p>
                        <p>Setelah terhubung, tambahkan bot ke grup WhatsApp Anda</p>
                    </body>
                    </html>
                `);
            }
        } else if (data.ready) {
            checkWhatsAppGroupStatus();
        }
    } catch (error) {
        console.error('Error checking WhatsApp status:', error);
        whatsappStatus.textContent = 'Error menghubungkan WhatsApp';
        whatsappStatus.style.backgroundColor = '#dc3545';
        whatsappStatus.style.color = '#fff';
    }
}

// ===== FUNGSI UNTUK FITUR BARU =====

// Fungsi untuk mengubah status order
async function changeOrderStatus(orderId, newStatus) {
    try {
        // Ambil data order terlebih dahulu
        const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`);
        if (!response.ok) throw new Error('Gagal mengambil data order');
        
        const order = await response.json();
        
        // Update hanya statusnya saja
        const updateResponse = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...order,
                status: newStatus
            })
        });
        
        if (!updateResponse.ok) throw new Error('Gagal update status order');
        
        showNotification(`Status berhasil diubah menjadi ${getStatusText(newStatus)}`);
        loadOrders(); // Reload data
    } catch (error) {
        console.error('Error:', error);
        showNotification('Gagal mengubah status', false);
    }
}

// Fungsi untuk menampilkan modal detail (hanya view)
function showOrderDetail(order) {
    const orderDate = new Date(order.tanggal).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    const modal = document.getElementById('detail-modal');
    const modalContent = document.getElementById('detail-content');
    
    modalContent.innerHTML = `
        <div class="detail-modal-header">
            <h2>Detail Pesanan #${order.id}</h2>
            <span class="close" id="close-detail">&times;</span>
        </div>
        <div class="detail-modal-body">
            <div class="detail-item">
                <span class="detail-label">Customer:</span>
                <div class="detail-value">${order.customer}</div>
            </div>
            <div class="detail-item">
                <span class="detail-label">Pesanan:</span>
                <div class="detail-value">${order.pesanan}</div>
            </div>
            <div class="detail-item">
                <span class="detail-label">Jenis Pesanan:</span>
                <div class="detail-value">${order.jenis}</div>
            </div>
            <div class="detail-item">
                <span class="detail-label">Jumlah:</span>
                <div class="detail-value">${order.jumlah}</div>
            </div>
            <div class="detail-item">
                <span class="detail-label">Tanggal:</span>
                <div class="detail-value">${orderDate}</div>
            </div>
            <div class="detail-item">
                <span class="detail-label">Status:</span>
                <div class="detail-value">
                    <span class="status-badge status-${order.status}">${getStatusText(order.status)}</span>
                </div>
            </div>
            <div class="detail-item">
                <span class="detail-label">Keterangan:</span>
                <div class="detail-value">${order.keterangan || '-'}</div>
            </div>
            <div class="detail-item">
                <span class="detail-label">Kain Jersey:</span>
                <div class="detail-value">${order.kainJersey || '-'}</div>
            </div>
            <div class="detail-item">
                <span class="detail-label">Kain Celana:</span>
                <div class="detail-value">${order.kainCelana || '-'}</div>
            </div>
            <div class="detail-item" style="grid-column: 1 / -1;">
                <span class="detail-label">Catatan:</span>
                <div class="detail-value">${order.catatan || '-'}</div>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    
    // Event listener untuk tombol close
    document.getElementById('close-detail').addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Close modal ketika klik di luar content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// PWA Install Prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installButton = document.getElementById('installButton');
    if (installButton) {
        installButton.style.display = 'block';
        
        installButton.addEventListener('click', async () => {
            installButton.style.display = 'none';
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('User accepted install');
            }
            deferredPrompt = null;
        });
    }
});

// Check if app is already installed
window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    const installButton = document.getElementById('installButton');
    if (installButton) {
        installButton.style.display = 'none';
    }
});

// Event Listeners dan Inisialisasi
document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
    loadStats();
    checkWhatsAppStatus();
    
    document.getElementById('month-filter').addEventListener('change', filterOrders);
    document.getElementById('status-filter').addEventListener('change', filterOrders);
    document.getElementById('search').addEventListener('input', filterOrders);
    
    document.getElementById('edit-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('edit-id').value;
        const formData = {
            customer: document.getElementById('edit-customer').value,
            pesanan: document.getElementById('edit-pesanan').value,
            jenis: document.getElementById('edit-jenis').value,
            jumlah: document.getElementById('edit-jumlah').value,
            keterangan: document.getElementById('edit-keterangan').value,
            kainJersey: document.getElementById('edit-kain-jersey').value,
            kainCelana: document.getElementById('edit-kain-celana').value,
            catatan: document.getElementById('edit-catatan').value,
            tanggal: document.getElementById('edit-tanggal').value,
            status: document.getElementById('edit-status').value
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) throw new Error('Gagal update order');
            
            document.getElementById('edit-modal').style.display = 'none';
            showNotification('Pesanan berhasil diperbarui');
            loadOrders();
        } catch (error) {
            console.error('Error:', error);
            showNotification('Gagal update order', false);
        }
    });
    
    document.getElementById('close-edit').addEventListener('click', () => {
        document.getElementById('edit-modal').style.display = 'none';
    });
    
    document.getElementById('report-btn').addEventListener('click', () => {
        document.getElementById('report-modal').style.display = 'flex';
    });
    
    document.getElementById('close-report').addEventListener('click', () => {
        document.getElementById('report-modal').style.display = 'none';
    });
    
    document.getElementById('generate-report').addEventListener('click', generateReport);
    
    document.getElementById('whatsapp-btn').addEventListener('click', openWhatsApp);
    
    document.getElementById('login-btn').addEventListener('click', () => {
        checkWhatsAppStatus();
    });
});