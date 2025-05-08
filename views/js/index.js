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

if (itemTable) createTable();

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
            statusBadge
        ]);
    });

    itemTable.order([[0, 'asc']]).draw(false); // sort ก่อน render
}

const seatMapContainer = document.getElementById('seat-map-container');

if (seatMapContainer) createSeat();

// createSeat function to render the seat map
// This function fetches the seat data and renders it in the seat map
async function createSeat() {
    //show seat content
    document.getElementById('seat-map-container').classList.remove('hidden');
    document.getElementById('seat-map').innerHTML = '<p class="text-center text-gray-500">กำลังโหลด...</p>';
    const seatItem = document.getElementById('seat-map');
    seatItem.innerHTML = ''; // re render

    try {
        const response = await fetch('/item');
        const data = await response.json();

        if (!data || data.length < 1) {
            seatItem.innerHTML = '<p class="text-center text-gray-500">ไม่มีที่นั่งให้เลือก</p>';
            return;
        }

        const groupAndSort = (items) => {
            const grouped = items.reduce((acc, item) => {
                const cat = item.category;
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(item);
                return acc;
            }, {});

            for (const key in grouped) {
                grouped[key].sort((a, b) => a.number - b.number);
            }

            const sortedCategories = Object.keys(grouped).sort();
            return sortedCategories.map(category => ({
                category,
                items: grouped[category]
            }));
        };

        // render the grouped and sorted items
        const result = groupAndSort(data);
        let seatCheckedCount = 0, seatAvailableCount = 0;

        result.forEach(group => {
            const { category, items } = group;
            
            const rowHTML = `
                <div class="flex space-x-2 my-2">
                    <span class="font-semibold text-gray-700 dark:text-gray-200 mr-2">
                        ${category.toUpperCase()}
                    </span>
                    ${items.map(seat => {
                        
                        if ((seat.status === 'available' || !seat.status) && !seat.booking) {
                            seatAvailableCount++;
                        } else {
                            seatCheckedCount++;
                        }
                        
                        const isChecked = seat.booking?.status === 'checked';
                        const btnClass = isChecked ? 'bg-gray-500' : 'bg-green-400';
                        const tooltip = isChecked
                            ? `${seat.booking.user} (${seat.booking.phone})`
                            : 'ว่าง';

                        return `
                            <button
                            id="${!isChecked ? seat._id : ''}" ${isChecked ? 'disabled' : ''}
                            class="check-in w-8 h-8 rounded text-white font-bold ${btnClass}"
                            title="${tooltip}"
                            >
                            ${seat.number}
                            </button>
                        `;
                    }).join('')}

                </div>
            `;

            //show count of checked and available seats
            document.getElementById('seat-checked-count').innerText = `ที่นั่งที่จองแล้ว: ${seatCheckedCount || 0}`;
            document.getElementById('seat-available-count').innerText = `ที่นั่งว่าง: ${seatAvailableCount || 0}`;

            // Append the row to the seat map
            seatItem.innerHTML += rowHTML;
        });
        
    } catch (error) {
        console.error('Error fetching seat data:', error);
        document.getElementById('seat-map').innerHTML = '<p class="text-center text-red-500">เกิดข้อผิดพลาดในการโหลดที่นั่ง</p>';
    }
}

const getSingleSeat = async (id) => {
    try {
      const res = await fetch(`/item/${id}`); // เรียก endpoint สำหรับดึงข้อมูลที่นั่งโดย id
      if (!res.ok) throw new Error('ไม่สามารถโหลดข้อมูลที่นั่งได้');

      const item = await res.json(); // ค่าที่ได้รับจะเป็นข้อมูลของที่นั่ง

      return item;
    } catch (err) {
      console.error('เกิดข้อผิดพลาด:', err);
      return null;
    }
};


const editSeat = async (id, element) => {

    //get seat data from element
    const category = $(element).closest('div').find('span').text().trim(); // Get the category name from the span element
    const number = $(element).text().trim(); // Get the seat number from the button text
    $(document).find('.item-detailed').text(`ที่นั่ง (${category}${number})`); // Set the modal title to the seat number
    const editModal = document.getElementById('edit-modal');
    $(document).find('.edit-modal-btn').trigger('click'); // Trigger the button click to open the modal

    const form = $(editModal).find('form');
    form.attr('data-id', id); // Set the data-id attribute to the form
    form.attr('data-status', 'checked'); // Set the data-status attribute to the form
    //reset the form
    form[0].reset();
}

//listen for click events on the seat map
document.getElementById('seat-map').addEventListener('click', function(e) {
  if (e.target.classList.contains('check-in')) {
    editSeat(e.target.id,e.target);
    
  }
});

//edit seat form submit
document.getElementById('edit-item-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const form = e.target;
    const id = $(this).attr('data-id'); // ดึง ID ของที่นั่ง

    const user = form.querySelector('[name="user"]').value;
    const phone = form.querySelector('[name="phone"]').value;

    try {
        const response = await fetch(`/user/booking/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user, phone }) // ส่ง user กับ phone ไป
        });

        const result = await response.json();

        if (response.ok) {
            $(form).find('#editMsg').text(result.message || 'จองที่นั่งเรียบร้อยแล้ว');
            createSeat(); // รีโหลดที่นั่ง
        } else {
            $(form).find('#editMsg').text(result.message || 'เกิดข้อผิดพลาดในการจอง');
        }
    } catch (error) {
        console.error('Error:', error);
        $(form).find('#editMsg').text('เกิดข้อผิดพลาด');
    }
});
