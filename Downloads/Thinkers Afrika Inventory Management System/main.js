// TIMS Main JavaScript - Enterprise Inventory Management System
import { inventoryData } from './data/inventoryData.js';

// Global State Management
const TIMS = {
    data: {
        products: inventoryData.map(product => ({ ...product })),
        consumption: [
            { id: 'C001', productId: 'PROD-001', quantity: 5, type: 'internal', consumer: 'Hydraulics Crew', date: '2024-03-03', remaining: 20 },
            { id: 'C002', productId: 'PROD-002', quantity: 2, type: 'internal', consumer: 'Maintenance Workshop', date: '2024-02-29', remaining: 10 },
            { id: 'C003', productId: 'PROD-003', quantity: 8, type: 'external', consumer: 'Fleet Services Ltd', date: '2024-02-27', remaining: 22 },
            { id: 'C004', productId: 'PROD-004', quantity: 12, type: 'external', consumer: 'Industrial Corp', date: '2024-02-25', remaining: 53 },
            { id: 'C005', productId: 'PROD-001', quantity: 3, type: 'internal', consumer: 'Mining Unit B', date: '2024-02-24', remaining: 22 }
        ],
        clients: [
            { id: 'CL001', name: 'Fleet Services Ltd', type: 'external', logo: 'FS' },
            { id: 'CL002', name: 'Industrial Corp', type: 'external', logo: 'IC' },
            { id: 'CL003', name: 'Mining Operations', type: 'internal', logo: 'MO' },
            { id: 'CL004', name: 'Machine Shop Division', type: 'internal', logo: 'MS' }
        ]
    },
    
    calculations: {
        getTotalStock() {
            return this.data.products.reduce((sum, product) => sum + product.stock, 0);
        },
        
        getWeeklyConsumption() {
            return this.data.consumption
                .filter(c => {
                    const consumptionDate = new Date(c.date);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return consumptionDate >= weekAgo;
                })
                .reduce((sum, c) => sum + c.quantity, 0);
        },
        
        getLowStockCount() {
            return this.data.products.filter(p => p.stock <= p.minStock).length;
        },
        
        getMonthlyRevenue() {
            return this.data.products.reduce((sum, product) => {
                const sellingPrice = product.sellingPrice ?? product.cost * (1 + product.markup / 100);
                return sum + (product.stock * sellingPrice * 0.1); // Assuming 10% monthly turnover
            }, 0);
        }
    },
    
    animations: {
        counter(element, start, end, duration = 2000) {
            const startTime = performance.now();
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const current = Math.floor(start + (end - start) * this.easeOutCubic(progress));
                element.textContent = current.toLocaleString();
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            requestAnimationFrame(animate);
        },
        
        easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        },
        
        fadeInUp(elements, stagger = 100) {
            elements.forEach((element, index) => {
                anime({
                    targets: element,
                    translateY: [30, 0],
                    opacity: [0, 1],
                    duration: 800,
                    delay: index * stagger,
                    easing: 'easeOutCubic'
                });
            });
        }
    },
    
    ui: {
        showNotification(title, message, type = 'success') {
            const toast = document.getElementById('notificationToast');
            const titleEl = document.getElementById('notificationTitle');
            const messageEl = document.getElementById('notificationMessage');
            
            titleEl.textContent = title;
            messageEl.textContent = message;
            
            // Update icon based on type
            const icon = toast.querySelector('svg');
            if (type === 'error') {
                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>';
                icon.className = 'w-4 h-4 text-red-400';
            }
            
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 4000);
        },
        
        updateKPICards() {
            const totalStock = TIMS.calculations.getTotalStock();
            const weeklyConsumption = TIMS.calculations.getWeeklyConsumption();
            const lowStockCount = TIMS.calculations.getLowStockCount();
            const monthlyRevenue = TIMS.calculations.getMonthlyRevenue();
            
            // Animate counters
            TIMS.animations.counter(document.getElementById('currentStock'), 0, totalStock);
            TIMS.animations.counter(document.getElementById('weeklyConsumption'), 0, weeklyConsumption);
            TIMS.animations.counter(document.getElementById('lowStockAlerts'), 0, lowStockCount);
            TIMS.animations.counter(document.getElementById('monthlyRevenue'), 0, Math.floor(monthlyRevenue));
        }
    }
};

// Global Search Functionality
function initializeGlobalSearch() {
    const searchInput = document.getElementById('globalSearch');
    const searchResults = document.getElementById('searchResults');
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length < 2) {
            searchResults.classList.add('hidden');
            return;
        }
        
        const results = [];
        
        // Search products
        TIMS.data.products.forEach(product => {
            if (product.id.toLowerCase().includes(query) || 
                product.name.toLowerCase().includes(query) ||
                product.category.toLowerCase().includes(query)) {
                results.push({
                    type: 'product',
                    id: product.id,
                    name: product.name,
                    category: product.category,
                    stock: product.stock
                });
            }
        });
        
        // Search clients
        TIMS.data.clients.forEach(client => {
            if (client.name.toLowerCase().includes(query)) {
                results.push({
                    type: 'client',
                    id: client.id,
                    name: client.name,
                    typeLabel: client.type
                });
            }
        });
        
        displaySearchResults(results, searchResults);
    });
    
    // Hide results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.add('hidden');
        }
    });
}

function displaySearchResults(results, container) {
    if (results.length === 0) {
        container.innerHTML = '<div class="p-4 text-gray-400 text-sm">No results found</div>';
        container.classList.remove('hidden');
        return;
    }
    
    const html = results.slice(0, 5).map(result => {
        if (result.type === 'product') {
            return `
                <div class="p-3 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-b-0" onclick="viewProduct('${result.id}')">
                    <div class="flex items-center justify-between">
                        <div>
                        <p class="font-medium text-primary">${result.name}</p>
                            <p class="text-sm text-gray-400">${result.id} • ${result.category}</p>
                        </div>
                        <span class="text-sm text-cyan-400">${result.stock} units</span>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="p-3 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-b-0" onclick="viewClient('${result.id}')">
                    <div class="flex items-center justify-between">
                        <div>
                        <p class="font-medium text-primary">${result.name}</p>
                            <p class="text-sm text-gray-400">${result.typeLabel} client</p>
                        </div>
                        <span class="text-sm text-purple-400">Client</span>
                    </div>
                </div>
            `;
        }
    }).join('');
    
    container.innerHTML = html;
    container.classList.remove('hidden');
}

// Chart Initialization
function initializeCharts() {
    // Stock vs Consumption Chart
    const stockConsumptionData = TIMS.data.products.slice(0, 6).map(product => ({
        name: product.name.split(' ').slice(0, 2).join(' '),
        stock: product.stock,
        consumption: Math.floor(Math.random() * 100) + 20
    }));
    
    // Category Distribution Chart
    const categoryData = {};
    TIMS.data.products.forEach(product => {
        categoryData[product.category] = (categoryData[product.category] || 0) + product.stock;
    });
    
    const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({
        name,
        value
    }));
    
    renderStockConsumptionChart(stockConsumptionData);
    renderCategoryChart(categoryChartData);
}

function renderStockConsumptionChart(data) {
    const container = document.getElementById('stockConsumptionChart');
    
    // Simple bar chart implementation
    const maxValue = Math.max(...data.map(d => Math.max(d.stock, d.consumption)));
    const html = `
        <div class="space-y-4">
            ${data.map(item => `
                <div class="flex items-center space-x-4">
                    <div class="w-24 text-xs text-gray-400 truncate">${item.name}</div>
                    <div class="flex-1 flex space-x-2">
                        <div class="bg-green-400 h-4 rounded" style="width: ${(item.stock / maxValue) * 60}%"></div>
                        <div class="bg-blue-400 h-4 rounded" style="width: ${(item.consumption / maxValue) * 40}%"></div>
                    </div>
                    <div class="w-16 text-xs text-right">
                        <div class="text-green-400">${item.stock}</div>
                        <div class="text-blue-400">${item.consumption}</div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="flex justify-center space-x-6 mt-4 text-xs">
            <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-green-400 rounded"></div>
                <span class="text-gray-400">Stock</span>
            </div>
            <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-blue-400 rounded"></div>
                <span class="text-gray-400">Consumption</span>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

function renderCategoryChart(data) {
    const container = document.getElementById('categoryChart');
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    const colors = ['#4F6F68', '#9FB59E', '#C9A755', '#B67C55', '#7C8261', '#8FA6B2'];
    
    const html = `
        <div class="space-y-3">
            ${data.map((item, index) => {
                const percentage = (item.value / total) * 100;
                return `
                    <div class="flex items-center space-x-3">
                        <div class="w-3 h-3 rounded-full" style="background-color: ${colors[index % colors.length]}"></div>
                        <div class="flex-1">
                            <div class="flex justify-between text-sm mb-1">
                                <span class="text-gray-300">${item.name}</span>
                                <span class="text-gray-400">${item.value}</span>
                            </div>
                            <div class="w-full bg-gray-700 rounded-full h-2">
                                <div class="h-2 rounded-full" style="width: ${percentage}%; background-color: ${colors[index % colors.length]}"></div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    container.innerHTML = html;
}

// Recent Activity
function initializeRecentActivity() {
    const container = document.getElementById('recentActivity');
    const activities = [
        { type: 'stock', message: 'Replenished 10L Hydraulic Oil 225 in main depot', time: '2 hours ago', icon: 'plus' },
        { type: 'consumption', message: 'Hydraulics crew issued 5L Hydraulic Oil 225 for shovel repairs', time: '4 hours ago', icon: 'minus' },
        { type: 'alert', message: 'Low stock alert: 30A Blade Fuse approaching reorder point', time: '6 hours ago', icon: 'alert' },
        { type: 'stock', message: 'Received 40 Amber Indicator Bulbs from supplier', time: '1 day ago', icon: 'plus' }
    ];
    
    const html = activities.map(activity => {
        const iconColor = {
            stock: 'text-green-400',
            consumption: 'text-blue-400',
            alert: 'text-amber-400'
        }[activity.type];
        
        const iconPath = {
            stock: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
            consumption: 'M20 12H4',
            alert: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
        }[activity.icon];
        
        return `
            <div class="flex items-center space-x-4 p-3 hover:bg-white/5 rounded-lg transition-colors">
                <div class="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 ${iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconPath}"></path>
                    </svg>
                </div>
                <div class="flex-1">
                    <p class="text-sm text-gray-300">${activity.message}</p>
                    <p class="text-xs text-gray-500">${activity.time}</p>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// Modal Functions
function openStockModal() {
    const modal = document.getElementById('stockModal');
    const content = document.getElementById('modalContent');
    
    modal.classList.remove('hidden');
    
    setTimeout(() => {
        content.style.transform = 'scale(1)';
        content.style.opacity = '1';
    }, 10);
}

function closeStockModal() {
    const modal = document.getElementById('stockModal');
    const content = document.getElementById('modalContent');
    
    content.style.transform = 'scale(0.95)';
    content.style.opacity = '0';
    
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// Stock Form Handling
function initializeStockForm() {
    const form = document.getElementById('stockForm');
    const costPrice = document.getElementById('costPrice');
    const markup = document.getElementById('markup');
    const sellingPrice = document.getElementById('sellingPrice');
    
    function calculateSellingPrice() {
        const cost = parseFloat(costPrice.value) || 0;
        const mark = parseFloat(markup.value) || 0;
        const price = cost * (1 + mark / 100);
        sellingPrice.value = price.toFixed(2);
    }
    
    costPrice.addEventListener('input', calculateSellingPrice);
    markup.addEventListener('input', calculateSellingPrice);
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            id: document.getElementById('productId').value,
            name: document.getElementById('productDescription').value,
            quantity: parseInt(document.getElementById('quantity').value),
            unit: document.getElementById('unit').value,
            cost: parseFloat(costPrice.value),
            markup: parseFloat(markup.value)
        };
        const calculatedSellingPrice = formData.cost * (1 + formData.markup / 100);
        
        // Add to products array
        TIMS.data.products.push({
            id: formData.id,
            name: formData.name,
            description: formData.name,
            category: 'New Product',
            stock: formData.quantity,
            remaining: formData.quantity,
            unit: formData.unit,
            cost: formData.cost,
            markup: formData.markup,
            sellingPrice: Number(calculatedSellingPrice.toFixed(2)),
            minStock: 50,
            purchaseDate: new Date().toISOString().split('T')[0]
        });
        
        // Update UI
        TIMS.ui.updateKPICards();
        initializeCharts();
        closeStockModal();
        TIMS.ui.showNotification('Stock Added', `${formData.name} has been added to inventory`);
        
        // Reset form
        form.reset();
    });
}

// Navigation Functions
function viewProduct(productId) {
    TIMS.ui.showNotification('Product Details', `Viewing details for ${productId}`, 'info');
}

function viewClient(clientId) {
    TIMS.ui.showNotification('Client Details', `Viewing details for ${clientId}`, 'info');
}

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize hero animations
    const heroElements = [
        document.getElementById('heroTitle'),
        document.getElementById('heroSubtitle'),
        document.getElementById('heroActions')
    ];
    
    TIMS.animations.fadeInUp(heroElements, 200);
    
    // Initialize components
    setTimeout(() => {
        TIMS.ui.updateKPICards();
        initializeCharts();
        initializeRecentActivity();
        initializeGlobalSearch();
        initializeStockForm();
    }, 1000);
    
    // Start real-time updates
    setInterval(() => {
        // Simulate real-time data updates
        TIMS.ui.updateKPICards();
    }, 30000); // Update every 30 seconds
    
    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe KPI cards for scroll animations
    document.querySelectorAll('.kpi-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s ease-out';
        observer.observe(card);
    });
});

// Expose globals for inline handlers and other modules
window.TIMS = TIMS;
window.openStockModal = openStockModal;
window.closeStockModal = closeStockModal;
window.viewProduct = viewProduct;
window.viewClient = viewClient;
