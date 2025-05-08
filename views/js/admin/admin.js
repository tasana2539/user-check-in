// Login/dashboard logic: Render dashboard or login form based on user state
/**
 * Render the dashboard UI for a logged-in user
 * @param {Object} user - User object from localStorage or backend
 */
const renderDashboard = async(user) => {
    //if (user.token) console.log('JWT Token:', user.token);
    createTable(); // Fetch items from the server
    createSeat(); // Fetch seat data from the server

    //remove signin-content
    document.getElementById('signin-content').remove();

    // Create user icon with dropdown menu
    document.getElementsByClassName('login-status')[0].innerHTML = `
        <div class="relative">
        <button id="userMenuBtn" type="button" class="flex items-center text-sm rounded-full focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400" aria-expanded="false">
        <span class="sr-only">Open user menu</span>
        <svg class="w-8 h-8 text-gray-700 dark:text-gray-200" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/>
        </svg>
        </button>
        <div id="userDropdown" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg dark:bg-gray-800 z-50">
        <div class="px-4 py-3">
        <span class="block text-sm text-gray-900 dark:text-white">${user.name || ''}</span>
        <span class="block text-xs text-gray-500 dark:text-gray-400">${user.userlevel || 'other'}</span>
        </div>
        <div class="border-t border-gray-100 dark:border-gray-700"></div>
        <ul class="py-1">
        <li>
            <a id="logoutBtn" href="#" class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-red-500">ออกจากระบบ</a>
        </li>
        </ul>
        </div>
        </div>
    `;

    // Dropdown toggle logic
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    userMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        userDropdown.classList.toggle('hidden');
    });
    // Hide dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!userDropdown.classList.contains('hidden')) {
        userDropdown.classList.add('hidden');
        }
    });

    //remove status hidden class
    document.getElementsByClassName('login-status')[0].classList.remove('hidden');

    document.getElementById('logoutBtn').onclick = function() {
        localStorage.removeItem('user');
        location.reload();
    };
}

/**
 * Render the login form UI
 */
function renderLogin() {
    document.getElementById('signin-content').innerHTML = `
        <div class="w-full max-w-md bg-white rounded-lg shadow dark:bg-gray-800 p-8">
        <h1 class="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">เข้าสู่ระบบ</h1>
            <form id="loginForm" class="space-y-4">
                <div>
                <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                <input type="email" id="email" name="email" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                </div>
                <div>
                <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                <input type="password" id="password" name="password" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                </div>
                <button type="submit" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">เข้าสู่ระบบ</button>
                <div id="loginMsg" class="mt-3 text-center text-red-500"></div>
            </form>
        </div>
    `;
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        // Send login data to backend for MongoDB authentication
        const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok && data.user) {
        // Store both user info and token in localStorage
        localStorage.setItem('user', JSON.stringify({ ...data.user, token: data.token }));
        renderDashboard({ ...data.user, token: data.token });
        } else {
        // Show server response message if login fails
        document.getElementById('loginMsg').textContent = data.message || 'เข้าสู่ระบบไม่สำเร็จ';
        }
    });
}

// On page load: check localStorage for user and render appropriate UI
const user = localStorage.getItem('user');
if (user) {
try {
    renderDashboard(JSON.parse(user));
} catch {
    renderLogin();
}
} else {
    renderLogin();
}

//create table
const itemTable = $('#item-table').DataTable({
    pageLength: 10,
    lengthMenu: [10, 20, 50, 100],
    paging: true,
    drawCallback: function(settings) {
        const api = this.api();
        const maxPages = 20;
        const currentPages = api.page.info().pages;
        if (currentPages > maxPages) {
            api.page.len(Math.ceil(api.data().length / maxPages)).draw(false);
        }
    }
});

async function getItems() { 
    const res = await fetch('/item');
    if (!res.ok) {
        throw new Error('Failed to fetch items');
    }
    return await res.json();
}

async function createTable() {
    document.getElementById('item-table-container').classList.remove('hidden');
    const data = await getItems();
    itemTable.clear();

    data.forEach(item => {

        const booking = item.booking || '-';
        const seat = `${item.category}${item.number}`;
        const user = booking.user || '-';
        const phone = booking.phone || '-';
        const status = booking.status || 'available';
        const bookingDetailed = booking ? `<div class="text-sm text-gray-500">ผู้จอง: ${user}<br>เบอร์โทร: ${phone}</div>` : '-';
        const statusClass = status === 'available' ? 'text-green-600' : 'text-blue-600';
        const statusText = status === 'available' ? 'ว่าง' : 'จองแล้ว';
        const statusBadge = `<span class="${statusClass} font-bold">${statusText}</span>`;

        // Add row to DataTable
        itemTable.row.add([
            seat,
            bookingDetailed,
            statusBadge,
            `<a class="delete-item-btn text-red-600" data-id="${item._id}">ลบ</a>`
        ]);
    });

    itemTable.order([[0, 'asc']]).draw(false); // sort ก่อน render
}

// Attach delete listeners
$('#item-table tbody').on('click', '.delete-item-btn', async function () {
    const id = $(this).data('id');
    const row = itemTable.row($(this).closest('tr'));
    if (confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
        try {
            const res = await fetch(`/item/${id}`, { method: 'DELETE' });
            const resData = await res.json();
            if (res.ok) {
                row.remove().draw();
                createSeat(); // refresh seat map
            } else {
                alert(resData.message || 'เกิดข้อผิดพลาด');
            }
        } catch (err) {
            alert('เกิดข้อผิดพลาด');
        }
    }
});
