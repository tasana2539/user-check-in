// ตัวอย่างข้อมูลผู้จอง
const bookings = [
  { name: 'สมชาย', row: 'A', seat: 3, time: '2025-05-07 13:00' },
  { name: 'สมหญิง', row: 'B', seat: 2, time: '2025-05-07 13:05' },
];
const tbody = document.getElementById('booking-table-body');
bookings.forEach(b => {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td class="px-4 py-2">${b.name}</td>
    <td class="px-4 py-2">${b.row}</td>
    <td class="px-4 py-2">${b.seat}</td>
    <td class="px-4 py-2">${b.time}</td>
  `;
  tbody.appendChild(tr);
});