const itemForm = document.getElementById('item-form');
if (itemForm) {
    itemForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(itemForm);
        const data = Object.fromEntries(formData.entries());
        console.log(data);
        
        try {
            const response = await fetch('/item', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
            });
            
            if (response.ok) {
                
                document.getElementById('itemMsg').textContent = '';
                Swal.fire({
                    position: "center-center",
                    icon: "success",
                    title: "สร้างที่นั่งสำเร็จ",
                    showConfirmButton: false,
                    timer: 1500
                });

                const responseData = await response.json();
                const itemData = await reGetitemSingle(responseData.itemId); // Fetch the newly created item data

                const booking = itemData.booking || '-';
                const seat = `${itemData.category}${itemData.number}`;
                const user = booking.user || '-';
                const phone = booking.phone || '-';
                const status = booking.status || 'available';
                const bookingDetailed = booking ? `<div class="text-sm text-gray-500">ผู้จอง: ${user}<br>เบอร์โทร: ${phone}</div>` : '-';
                const statusClass = status === 'available' ? 'text-green-600' : 'text-blue-600';
                const statusText = status === 'available' ? 'ว่าง' : 'จองแล้ว';
                const statusBadge = `<span class="${statusClass} font-bold">${statusText}</span>`;

                // update table with new data
                const newRow = [
                    seat,
                    bookingDetailed,
                    statusBadge,
                    `<a class="delete-item-btn text-red-600" data-id="${responseData.itemId}">ลบ</a>`
                ];
                
                itemTable.row.add(newRow).draw(false); 

                itemForm.reset();
            } else {
                    const errorData = await response.json();
                    document.getElementById('itemMsg').textContent = errorData.message;
            }
            if (user) createSeat(); // Call createSeat() only if user is logged in
        } catch (error) {
            document.getElementById('itemMsg').textContent = 'เกิดข้อผิดพลาดในการสร้างที่นั่ง';
        }
    });
}

async function reGetitemSingle(itemId) {
  try {
    const res = await fetch(`/item/${itemId}`); // เรียก endpoint สำหรับดึงข้อมูลที่นั่งโดย id
    if (!res.ok) throw new Error('ไม่สามารถโหลดข้อมูลที่นั่งได้');

    const item = await res.json(); // ค่าที่ได้รับจะเป็นข้อมูลของที่นั่ง

    return item;
  } catch (err) {
    console.error('เกิดข้อผิดพลาด:', err);
    return null;
  }
}
