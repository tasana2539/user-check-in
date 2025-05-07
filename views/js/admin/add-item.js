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

                // update table with new data
                const newRow = [
                    data.number || '-',
                    data.category || '-',
                    `<a class="delete-item-btn text-red-600" data-id="${data._id}">ลบ</a>`
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
