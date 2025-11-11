// Data storage - Now using Database instead of localStorage
let bookings = [];
let messages = [];
let vehicles = [];
let adminLoggedIn = false;

// API Base URL
const API_BASE = 'api/';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    setupEventListeners();
    loadVehicles();
    checkAdminSession();
});

// Navigation System
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            
            // Update active nav link
            navLinks.forEach(nl => nl.classList.remove('active'));
            this.classList.add('active');
            
            // Show target page
            showPage(targetPage);
        });
    });
}

function showPage(pageName) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Show target page
    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Update specific page content
        if (pageName === 'admin' && adminLoggedIn) {
            updateAdminDashboard();
        }
    }
}

// API Service Functions
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(API_BASE + endpoint, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'API call failed');
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Load vehicles from database
async function loadVehicles() {
    try {
        const result = await apiCall('vehicles.php');
        vehicles = result.data || [];
        renderVehicles();
    } catch (error) {
        console.error('Failed to load vehicles:', error);
        // Fallback to default vehicles
        vehicles = getDefaultVehicles();
        renderVehicles();
    }
}

function getDefaultVehicles() {
    return [
        {
            id: 1,
            name: "Mercedes-Benz S-Class",
            type: "car",
            price: 2500,
            description: "Ultimate luxury sedan with advanced features",
            features: ["Leather Seats", "Panoramic Roof", "Premium Sound", "Heated Seats"],
            image_url: "🚗"
        },
        {
            id: 2,
            name: "BMW 7 Series",
            type: "car",
            price: 2300,
            description: "German engineering at its finest",
            features: ["Executive Lounge", "Gesture Control", "Premium Sound", "Massage Seats"],
            image_url: "🚘"
        },
        {
            id: 3,
            name: "34-Ton Truck & Trailer",
            type: "truck",
            price: 110000,
            description: "Heavy-duty commercial truck with full service package",
            features: ["GIT Insurance Included", "Driver Salary Covered", "Mechanical Breakdown", "Unlimited Kilometers"],
            image_url: "🚛"
        }
    ];
}

function renderVehicles() {
    // Render cars
    const carGrids = document.querySelectorAll('#cars-page .vehicle-grid, #home-page .vehicle-grid');
    carGrids.forEach(grid => {
        const cars = vehicles.filter(v => v.type === 'car');
        if (cars.length > 0) {
            grid.innerHTML = cars.map(vehicle => `
                <div class="vehicle-card">
                    <div class="vehicle-image">${vehicle.image_url || '🚗'}</div>
                    <div class="vehicle-info">
                        <h3>${vehicle.name}</h3>
                        <div class="vehicle-price">R${vehicle.price.toLocaleString()}/day</div>
                        <p>${vehicle.description}</p>
                        <ul class="vehicle-features">
                            ${vehicle.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                        <button class="btn book-btn" data-vehicle="${vehicle.name}" data-price="${vehicle.price}">Book Now</button>
                    </div>
                </div>
            `).join('');
        }
    });

    // Render trucks
    const truckGrid = document.querySelector('#trucks-page .vehicle-grid');
    if (truckGrid) {
        const trucks = vehicles.filter(v => v.type === 'truck');
        if (trucks.length > 0) {
            truckGrid.innerHTML = trucks.map(vehicle => `
                <div class="vehicle-card">
                    <div class="vehicle-image">${vehicle.image_url || '🚛'}</div>
                    <div class="vehicle-info">
                        <h3>${vehicle.name}</h3>
                        <div class="vehicle-price">R${vehicle.price.toLocaleString()}/month</div>
                        <p>${vehicle.description}</p>
                        <ul class="vehicle-features">
                            ${vehicle.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                        <button class="btn book-btn" data-vehicle="${vehicle.name}" data-price="${vehicle.price}" data-type="truck">Inquire Now</button>
                    </div>
                </div>
            `).join('');
        }
    }
}

// Event Listeners
function setupEventListeners() {
    // Book Now buttons (delegated)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('book-btn')) {
            const vehicle = e.target.getAttribute('data-vehicle');
            const price = parseInt(e.target.getAttribute('data-price'));
            const type = e.target.getAttribute('data-type') || 'car';
            
            if (type === 'truck') {
                openTruckInquiry();
            } else {
                openBookingModal(vehicle, price);
            }
        }
    });
     document.addEventListener('click', function(e) {
        if (e.target.textContent === 'Staff Login' || e.target.parentElement.textContent === 'Staff Login') {
            e.preventDefault();
            showPage('admin-login');
        }
    });
    
    // Booking form submission
    document.getElementById('booking-form').addEventListener('submit', function(e) {
        e.preventDefault();
        processBooking();
    });
    
    // Truck inquiry form submission
    document.getElementById('truck-inquiry-form').addEventListener('submit', function(e) {
        e.preventDefault();
        processTruckInquiry();
    });
    
    // Contact form submission
    document.getElementById('contact-form').addEventListener('submit', function(e) {
        e.preventDefault();
        processContactForm();
    });
    
    // Admin login form
    document.getElementById('admin-login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        processAdminLogin();
    });
    
    // Add vehicle form
    document.getElementById('add-vehicle-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addNewVehicle();
    });
    
    // Date change listeners for cost calculation
    document.getElementById('start-date').addEventListener('change', calculateTotalCost);
    document.getElementById('end-date').addEventListener('change', calculateTotalCost);
    
    // Truck rental period change
    document.getElementById('rental-period').addEventListener('change', calculateTruckCost);
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            closeAllModals();
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
    
    // Set default dates
    setDefaultDates();
}

// Modal Functions
function openBookingModal(vehicle, price) {
    document.getElementById('booking-vehicle-info').innerHTML = `
        <strong>${vehicle}</strong><br>
        R${price.toLocaleString()}/day
    `;
    
    const form = document.getElementById('booking-form');
    form.setAttribute('data-vehicle', vehicle);
    form.setAttribute('data-price', price);
    
    setDefaultDates();
    calculateTotalCost();
    
    document.getElementById('booking-modal').style.display = 'block';
}

function openTruckInquiry() {
    calculateTruckCost();
    document.getElementById('truck-inquiry-modal').style.display = 'block';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

function closeSuccessModal() {
    document.getElementById('success-modal').style.display = 'none';
    showPage('home');
}

function setDefaultDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    document.getElementById('start-date').value = todayStr;
    document.getElementById('end-date').value = tomorrowStr;
    document.getElementById('start-date').min = todayStr;
    document.getElementById('end-date').min = todayStr;
}

// Date Validation Functions
function validateBookingDates(startDate, endDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Clear previous errors
    clearDateErrors();
    
    let isValid = true;
    
    // Check if start date is in past
    if (start < today) {
        showDateError('start-date', '❌ Start date cannot be in the past');
        isValid = false;
    }
    
    // Check if end date is before start date
    if (end <= start) {
        showDateError('end-date', '❌ End date must be after start date');
        isValid = false;
    }
    
    return isValid;
}

function showDateError(fieldId, message) {
    const field = document.getElementById(fieldId);
    field.style.borderColor = '#e74c3c';
    
    let errorElement = document.getElementById(`${fieldId}-error`);
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = `${fieldId}-error`;
        errorElement.className = 'error-message';
        errorElement.style.color = '#e74c3c';
        errorElement.style.fontSize = '0.8rem';
        errorElement.style.marginTop = '0.3rem';
        field.parentNode.appendChild(errorElement);
    }
    errorElement.textContent = message;
}

function clearDateErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelectorAll('input[type="date"]').forEach(input => {
        input.style.borderColor = '#E8E8E8';
    });
}

// Cost Calculations
function calculateTotalCost() {
    const startDate = new Date(document.getElementById('start-date').value);
    const endDate = new Date(document.getElementById('end-date').value);
    const price = parseInt(document.getElementById('booking-form').getAttribute('data-price'));
    
    clearDateErrors();
    
    if (startDate && endDate && endDate > startDate) {
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const totalCost = days * price;
        document.getElementById('total-cost').textContent = `R${totalCost.toLocaleString()}`;
        return totalCost;
    } else {
        document.getElementById('total-cost').textContent = 'R0';
        return 0;
    }
}

function calculateTruckCost() {
    const basePrice = 110000;
    const months = parseInt(document.getElementById('rental-period').value) || 1;
    let additionalCost = 0;
    
    const checkboxes = document.querySelectorAll('input[name="additional-services"]:checked');
    checkboxes.forEach(checkbox => {
        if (checkbox.value === 'truck-pack') additionalCost += 5000;
        if (checkbox.value === 'additional-driver') additionalCost += 15000;
    });
    
    const totalCost = (basePrice * months) + additionalCost;
    document.getElementById('truck-total-cost').textContent = `R${totalCost.toLocaleString()}`;
    return totalCost;
}

// Form Processing
async function processBooking() {
    const form = document.getElementById('booking-form');
    const vehicle = form.getAttribute('data-vehicle');
    const price = parseInt(form.getAttribute('data-price'));
    
    const customerName = document.getElementById('customer-name').value;
    const customerEmail = document.getElementById('customer-email').value;
    const customerPhone = document.getElementById('customer-phone').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    
    // Validate dates
    if (!validateBookingDates(startDate, endDate)) {
        return;
    }
    
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const totalAmount = days * price;
    
    try {
        const bookingData = {
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            vehicle_name: vehicle,
            vehicle_type: 'car',
            vehicle_price: price,
            start_date: startDate,
            end_date: endDate,
            total_amount: totalAmount,
            status: 'pending'
        };
        
        const result = await apiCall('bookings.php', 'POST', bookingData);
        
        if (result.success) {
            // Show success modal
            document.getElementById('booking-details').innerHTML = `
                <div style="text-align: left; background: #f8f9fa; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                    <p><strong>Vehicle:</strong> ${vehicle}</p>
                    <p><strong>Customer:</strong> ${customerName}</p>
                    <p><strong>Period:</strong> ${formatDate(startDate)} - ${formatDate(endDate)}</p>
                    <p><strong>Total:</strong> R${totalAmount.toLocaleString()}</p>
                    <p><strong>Confirmation:</strong> #BK${result.booking_id}</p>
                </div>
            `;
            
            closeAllModals();
            document.getElementById('success-modal').style.display = 'block';
            form.reset();
            
            if (adminLoggedIn) {
                updateAdminDashboard();
            }
        } else {
            alert('Booking failed: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        alert('Booking failed: ' + error.message);
    }
}

async function processTruckInquiry() {
    const form = document.getElementById('truck-inquiry-form');
    const customerName = document.getElementById('truck-customer-name').value;
    const customerEmail = document.getElementById('truck-customer-email').value;
    const customerPhone = document.getElementById('truck-customer-phone').value;
    const company = document.getElementById('truck-customer-company').value;
    const months = parseInt(document.getElementById('rental-period').value);
    const message = document.getElementById('truck-message').value;
    
    const totalAmount = calculateTruckCost();
    
    try {
        const inquiryData = {
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            company: company,
            vehicle_name: "34-Ton Truck & Trailer",
            vehicle_type: 'truck',
            vehicle_price: 110000,
            period: `${months} month(s)`,
            total_amount: totalAmount,
            message: message,
            status: 'pending'
        };
        
        const result = await apiCall('bookings.php', 'POST', inquiryData);
        
        if (result.success) {
            alert('Thank you for your truck rental inquiry! We will contact you within 24 hours.');
            closeAllModals();
            form.reset();
            
            if (adminLoggedIn) {
                updateAdminDashboard();
            }
        } else {
            alert('Inquiry submission failed: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        alert('Inquiry submission failed: ' + error.message);
    }
}

async function processContactForm() {
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const phone = document.getElementById('contact-phone').value;
    const type = document.getElementById('contact-type').value;
    const message = document.getElementById('contact-message').value;
    
    try {
        const messageData = {
            customer_name: name,
            customer_email: email,
            customer_phone: phone,
            subject: `${type} Inquiry`,
            message: message,
            type: type,
            status: 'unread'
        };
        
        const result = await apiCall('messages.php', 'POST', messageData);
        
        if (result.success) {
            alert('Thank you for your message! We will get back to you soon.');
            document.getElementById('contact-form').reset();
            
            if (adminLoggedIn) {
                updateAdminDashboard();
            }
        } else {
            alert('Message sending failed: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        alert('Message sending failed: ' + error.message);
    }
}

// Admin Functions
async function processAdminLogin() {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    try {
        const result = await apiCall('admin.php?action=login', 'POST', {
            username: username,
            password: password
        });
        
        if (result.success) {
            adminLoggedIn = true;
            localStorage.setItem('adminLoggedIn', 'true');
            showPage('admin');
            updateAdminDashboard();
        } else {
            alert('Invalid admin credentials!');
        }
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
}

function checkAdminSession() {
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        adminLoggedIn = true;
        // Don't auto-show admin page, keep it hidden as per requirements
    }
}

function logoutAdmin() {
    adminLoggedIn = false;
    localStorage.removeItem('adminLoggedIn');
    showPage('home');
}

async function updateAdminDashboard() {
    if (!adminLoggedIn) return;
    
    try {
        // Load bookings
        const bookingsResult = await apiCall('bookings.php');
        bookings = bookingsResult.data || [];
        
        // Load messages
        const messagesResult = await apiCall('messages.php');
        messages = messagesResult.data || [];
        
        // Update stats
        document.getElementById('total-bookings').textContent = bookings.length;
        
        const revenue = bookings.reduce((sum, booking) => sum + parseFloat(booking.total_amount || 0), 0);
        document.getElementById('total-revenue').textContent = `R${revenue.toLocaleString()}`;
        
        const pendingMessages = messages.filter(msg => msg.status === 'unread').length;
        document.getElementById('pending-messages').textContent = pendingMessages;
        
        // For active users, we'll use a simple count of unique customers
        const uniqueCustomers = [...new Set(bookings.map(b => b.customer_email))].length;
        document.getElementById('active-users').textContent = uniqueCustomers;
        
        // Update bookings tab
        updateBookingsTab();
        
        // Update messages tab
        updateMessagesTab();
        
        // Update vehicles tab
        updateVehiclesTab();
        
    } catch (error) {
        console.error('Failed to update admin dashboard:', error);
    }
}

function updateBookingsTab() {
    const container = document.getElementById('bookings-container');
    
    if (bookings.length === 0) {
        container.innerHTML = '<p>No bookings yet. Bookings will appear here.</p>';
    } else {
        const recentBookings = bookings.slice(-10).reverse();
        container.innerHTML = recentBookings.map(booking => `
            <div class="booking-item">
                <strong>${booking.vehicle_name}</strong><br>
                <small>Customer: ${booking.customer_name} (${booking.customer_email})</small><br>
                <small>Phone: ${booking.customer_phone}</small><br>
                <small>Period: ${booking.period ? booking.period : `${formatDate(booking.start_date)} - ${formatDate(booking.end_date)}`}</small><br>
                <strong>R${parseFloat(booking.total_amount).toLocaleString()}</strong>
                <span class="booking-status status-${booking.status}">${booking.status}</span>
                <div class="message-actions">
                    <button class="btn btn-primary" onclick="updateBookingStatus(${booking.id}, 'confirmed')">Confirm</button>
                    <button class="btn btn-secondary" onclick="updateBookingStatus(${booking.id}, 'completed')">Complete</button>
                </div>
            </div>
        `).join('');
    }
}

function updateMessagesTab() {
    const container = document.getElementById('messages-container');
    
    if (messages.length === 0) {
        container.innerHTML = '<p>No messages yet. Customer inquiries will appear here.</p>';
    } else {
        const recentMessages = messages.slice(-10).reverse();
        container.innerHTML = recentMessages.map(message => `
            <div class="message-item">
                <strong>${message.customer_name}</strong> - ${message.type}<br>
                <small>Email: ${message.customer_email} | Phone: ${message.customer_phone}</small><br>
                <p>${message.message}</p>
                <span class="booking-status status-${message.status}">${message.status}</span>
                ${message.reply ? `<div style="background: #e8f4fd; padding: 0.5rem; border-radius: 5px; margin-top: 0.5rem;"><strong>Reply:</strong> ${message.reply}</div>` : ''}
                <div class="message-actions">
                    <button class="btn btn-primary" onclick="replyToMessage(${message.id})">Reply</button>
                    <button class="btn btn-secondary" onclick="markMessageRead(${message.id})">Mark Read</button>
                </div>
            </div>
        `).join('');
    }
}

async function updateBookingStatus(bookingId, status) {
    try {
        const result = await apiCall('bookings.php', 'PUT', {
            id: bookingId,
            status: status
        });
        
        if (result.success) {
            updateAdminDashboard();
        } else {
            alert('Failed to update booking status: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        alert('Failed to update booking status: ' + error.message);
    }
}

async function replyToMessage(messageId) {
    const message = messages.find(m => m.id == messageId);
    if (message) {
        const reply = prompt(`Reply to ${message.customer_name}:`);
        if (reply) {
            try {
                const result = await apiCall('messages.php', 'PUT', {
                    id: messageId,
                    reply: reply,
                    status: 'replied'
                });
                
                if (result.success) {
                    updateAdminDashboard();
                } else {
                    alert('Failed to send reply: ' + (result.error || 'Unknown error'));
                }
            } catch (error) {
                alert('Failed to send reply: ' + error.message);
            }
        }
    }
}

async function markMessageRead(messageId) {
    try {
        const result = await apiCall('messages.php', 'PUT', {
            id: messageId,
            status: 'read'
        });
        
        if (result.success) {
            updateAdminDashboard();
        } else {
            alert('Failed to mark message as read: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        alert('Failed to mark message as read: ' + error.message);
    }
}

// Vehicle Management
function updateVehiclesTab() {
    const container = document.getElementById('vehicles-list');
    container.innerHTML = vehicles.map(vehicle => `
        <div class="vehicle-item" style="border: 1px solid #ddd; padding: 1rem; margin: 0.5rem 0; border-radius: 5px;">
            <strong>${vehicle.name}</strong> - R${vehicle.price.toLocaleString()}/day<br>
            <small>${vehicle.description}</small><br>
            <button class="btn btn-secondary" onclick="deleteVehicle(${vehicle.id})" style="margin-top: 0.5rem;">Delete</button>
        </div>
    `).join('');
}

async function addNewVehicle() {
    const name = document.getElementById('vehicle-name').value;
    const price = parseInt(document.getElementById('vehicle-price').value);
    const type = document.getElementById('vehicle-type').value;
    const description = document.getElementById('vehicle-description').value;
    const features = document.getElementById('vehicle-features').value.split(',').map(f => f.trim());
    const image = document.getElementById('vehicle-image').value || '🚗';
    
    try {
        const vehicleData = {
            name: name,
            type: type,
            price: price,
            description: description,
            features: JSON.stringify(features),
            image_url: image
        };
        
        const result = await apiCall('vehicles.php', 'POST', vehicleData);
        
        if (result.success) {
            alert('Vehicle added successfully!');
            document.getElementById('add-vehicle-form').reset();
            await loadVehicles(); // Reload vehicles from database
            updateVehiclesTab();
        } else {
            alert('Failed to add vehicle: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        alert('Failed to add vehicle: ' + error.message);
    }
}

async function deleteVehicle(vehicleId) {
    if (confirm('Are you sure you want to delete this vehicle?')) {
        try {
            const result = await apiCall(`vehicles.php?id=${vehicleId}`, 'DELETE');
            
            if (result.success) {
                await loadVehicles(); // Reload vehicles from database
                updateVehiclesTab();
            } else {
                alert('Failed to delete vehicle: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            alert('Failed to delete vehicle: ' + error.message);
        }
    }
}

// Admin Tabs
function openAdminTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Add active class to clicked tab button
    event.target.classList.add('active');
}

// Utility Functions
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// PWA Support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Direct admin access (hidden from navigation)
function showAdminLogin() {
    showPage('admin-login');
}