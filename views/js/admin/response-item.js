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
        
        result.forEach(group => {
            const { category, items } = group;

            const rowHTML = `
                <div class="flex space-x-2 my-2">
                    <span class="font-semibold text-gray-700 dark:text-gray-200 mr-2">
                        ${category.toUpperCase()}
                    </span>
                    ${items.map(seat => {
                        const isChecked = seat.booking?.status === 'checked';
                        const btnClass = isChecked ? 'bg-gray-500' : 'bg-green-400';
                        const tooltip = isChecked
                            ? `${seat.booking.user} (${seat.booking.phone})`
                            : 'ว่าง';

                        return `
                            <button
                            id="${seat._id}"
                            class="check-in w-8 h-8 rounded text-white font-bold ${btnClass}"
                            title="${tooltip}"
                            >
                            ${seat.number}
                            </button>
                        `;
                    }).join('')}

                </div>
            `;

            seatItem.innerHTML += rowHTML;
        });
    } catch (error) {
        console.error('Error fetching seat data:', error);
        document.getElementById('seat-map').innerHTML = '<p class="text-center text-red-500">เกิดข้อผิดพลาดในการโหลดที่นั่ง</p>';
    }
}

const getSingleSeat = async (id) => {
    try {
        const response = await fetch(`/booking/by-item/${id}`); // ใช้ itemId
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Error fetching seat data:', error);
    }
};


const editSeat = async (id, element) => {

    //get seat data from element
    const category = $(element).closest('div').find('span').text().trim(); // Get the category name from the span element
    const number = $(element).text().trim(); // Get the seat number from the button text
    $(document).find('.item-detailed').text(`แก้ไขที่นั่ง (${category}${number})`); // Set the modal title to the seat number

    const seatData = await getSingleSeat(id); // Fetch the seat data using the ID
    if (!seatData) return; // If seat data is not available, exit the function
    const editModal = document.getElementById('edit-modal');
    $(document).find('.edit-modal-btn').trigger('click'); // Trigger the button click to open the modal

    const form = $(editModal).find('form');
    form.attr('data-id', id); // Set the data-id attribute to the form
    //reset the form
    form[0].reset();

    $(form).find('#category').val(category); // Set the category value in the form
    $(form).find('#number').val(number); // Set the number value in the form

    $(editModal).find('#user').val(seatData.user || '');
    $(editModal).find('#phone').val(seatData.phone || '');
    $(editModal).find('#status').val(seatData.status || 'available');
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
    const id = $(this).attr('data-id'); // Get the ID from the form's data-id attribute
    
    const status = form.querySelector('#status').value;
    const user = form.querySelector('#user').value;
    const phone = form.querySelector('#phone').value;

    try {
        const response = await fetch(`/booking/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status, user, phone })
        });

        if (response.ok) {
            
            const result = await response.json(); // <-- อ่าน JSON ตอบกลับ
            $(form).find('#editMsg').text(result.message || 'อัปเดตที่นั่งเรียบร้อยแล้ว' // <-- แสดงข้อความใน modal
            ); // <-- แสดงข้อความใน modal


            //close modal
            $(document).find('.close-modal-btn').trigger('click');
            createSeat(); // Refresh the seat map after editing
        } else {
            console.error('Error updating seat:', response.statusText);
            const result = await response.json(); // <-- อ่าน JSON ตอบกลับ
            $(form).find('#editMsg').text(result.message || 'เกิดข้อผิดพลาดในการอัปเดตที่นั่ง'); // <-- แสดงข้อความใน modal
        }
    } catch (error) {
        console.error('Error updating seat:', error);
    }
});