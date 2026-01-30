const API_URL = 'https://api.escuelajs.co/api/v1/products';

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let itemsPerPage = 5;

// DOM Elements
const searchInput = document.getElementById('searchInput');
const pageSizeSelect = document.getElementById('pageSize');
const tableBody = document.getElementById('productTableBody');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const sortPriceAscBtn = document.getElementById('sortPriceAsc');
const sortPriceDescBtn = document.getElementById('sortPriceDesc');
const sortNameAscBtn = document.getElementById('sortNameAsc');
const sortNameDescBtn = document.getElementById('sortNameDesc');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    getAllProducts();
    setupEventListeners();
});

function setupEventListeners() {
    searchInput.addEventListener('input', handleSearch);
    pageSizeSelect.addEventListener('change', handlePageSizeChange);
    prevPageBtn.addEventListener('click', () => changePage(-1));
    nextPageBtn.addEventListener('click', () => changePage(1));

    sortPriceAscBtn.addEventListener('click', () => sortProducts('price', 'asc'));
    sortPriceDescBtn.addEventListener('click', () => sortProducts('price', 'desc'));
    sortNameAscBtn.addEventListener('click', () => sortProducts('title', 'asc'));
    sortNameDescBtn.addEventListener('click', () => sortProducts('title', 'desc'));
}

async function getAllProducts() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        allProducts = data;
        filteredProducts = [...allProducts];
        renderTable();
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        tableBody.innerHTML = '<tr><td colspan="5">Lỗi khi tải dữ liệu</td></tr>';
    }
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    filteredProducts = allProducts.filter(product =>
        product.title.toLowerCase().includes(searchTerm)
    );
    currentPage = 1; // Reset to first page on search
    renderTable();
}

function handlePageSizeChange(e) {
    itemsPerPage = parseInt(e.target.value);
    currentPage = 1;
    renderTable();
}

function sortProducts(field, direction) {
    filteredProducts.sort((a, b) => {
        if (field === 'price') {
            return direction === 'asc' ? a.price - b.price : b.price - a.price;
        } else if (field === 'title') {
            const titleA = a.title.toLowerCase();
            const titleB = b.title.toLowerCase();
            if (titleA < titleB) return direction === 'asc' ? -1 : 1;
            if (titleA > titleB) return direction === 'asc' ? 1 : -1;
            return 0;
        }
    });
    renderTable();
}

function changePage(delta) {
    const maxPage = Math.ceil(filteredProducts.length / itemsPerPage);
    const newPage = currentPage + delta;

    if (newPage >= 1 && newPage <= maxPage) {
        currentPage = newPage;
        renderTable();
    }
}

function renderTable() {
    tableBody.innerHTML = '';

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = filteredProducts.slice(start, end);

    if (paginatedItems.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center">Không tìm thấy sản phẩm</td></tr>';
        pageInfo.innerText = `Trang 0 / 0`;
        return;
    }

    paginatedItems.forEach(product => {
        // Xử lý hình ảnh: Đôi khi hình ảnh là chuỗi JSON hoặc array
        // Placeholder ảnh (dùng base64 để không phụ thuộc mạng)
        const placeholderImg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzU1NSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';

        let imageUrl = product.images && product.images.length > 0 ? product.images[0] : placeholderImg;

        // Clean up url string if needed
        if (typeof imageUrl === 'string' && imageUrl.startsWith('["') && imageUrl.endsWith('"]')) {
            try {
                imageUrl = JSON.parse(imageUrl)[0];
            } catch (e) {
                // ignore
            }
        }

        // Fix: logic lọc bỏ các đường dẫn ảnh bị lỗi hoặc không hợp lệ từ API giả
        if (!imageUrl || imageUrl.includes('placeimg.com') || imageUrl.includes('lorempixel')) {
            imageUrl = placeholderImg;
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td><img src="${imageUrl}" alt="${product.title}" class="product-img" onerror="this.onerror=null;this.src='${placeholderImg}'"></td>
            <td>${product.title}</td>
            <td>$${product.price}</td>
            <td>${product.description.substring(0, 50)}...</td>
        `;
        tableBody.appendChild(row);
    });

    // Update pagination info
    const maxPage = Math.ceil(filteredProducts.length / itemsPerPage);
    pageInfo.innerText = `Trang ${currentPage} / ${maxPage}`;

    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === maxPage;
}
