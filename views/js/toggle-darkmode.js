// Theme toggle logic for dark/light mode
const themeToggleBtn = document.getElementById('theme-toggle');
const darkIcon = document.getElementById('theme-toggle-dark-icon');
const lightIcon = document.getElementById('theme-toggle-light-icon');
if (
  localStorage.getItem('color-theme') === 'dark' ||
  (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
) {
  document.documentElement.classList.add('dark');
  darkIcon.classList.add('hidden');
  lightIcon.classList.remove('hidden');
} else {
  document.documentElement.classList.remove('dark');
  lightIcon.classList.add('hidden');
  darkIcon.classList.remove('hidden');
}
themeToggleBtn.addEventListener('click', function() {
  darkIcon.classList.toggle('hidden');
  lightIcon.classList.toggle('hidden');
  if (document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('color-theme', 'light');
  } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem('color-theme', 'dark');
  }
});