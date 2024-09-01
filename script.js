class CartManager {
    constructor() {
        this.cartContainer = document.getElementById('cart-container');
        this.addProductButton = document.getElementById('add-product-button');
        this.productFormContainer = document.getElementById('product-form-container');
        this.productForm = document.getElementById('product-form');
        this.submitProductButton = document.getElementById('submit-product-button');
        this.cancelProductButton = document.getElementById('cancel-product-button');
        this.totalPriceElement = document.getElementById('total-price');
        this.editingIndex = null;
        this.currentImageIndex = null;

        this.addProductButton.onclick = this.showProductForm.bind(this);
        this.submitProductButton.onclick = this.addProduct.bind(this);
        this.cancelProductButton.onclick = this.hideProductForm.bind(this);
        document.getElementById('product-image').onchange = this.handleImageUpload.bind(this);

        this.loadCart();
    }

    loadCart() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.cartContainer.innerHTML = '';
        let total = 0;
        cart.forEach((item, index) => {
            total += item.price;
            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.innerHTML = `
                <img src="${item.image || 'placeholder.jpg'}" alt="Product Image" onclick="cartManager.editImage(${index})">
                <div>
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <p>Price: $${item.price.toFixed(2)}</p>
                    <button class="edit" onclick="cartManager.editProduct(${index})">Edit</button>
                    <button onclick="cartManager.removeProduct(${index})">Remove</button>
                </div>
            `;
            this.cartContainer.appendChild(itemDiv);
        });
        this.totalPriceElement.textContent = total.toFixed(2);
    }

    saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
        this.loadCart();
    }

    async addProduct(event) {
        event.preventDefault();
        const name = document.getElementById('product-name').value;
        const description = document.getElementById('product-description').value;
        const price = parseFloat(document.getElementById('product-price').value);
        if (isNaN(price) || price < 0) {
            alert('Invalid price entered.');
            return;
        }
        const fileInput = document.getElementById('product-image');
        const image = fileInput.files.length > 0 ? await this.getBase64Image(fileInput.files[0]) : '';
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        if (this.editingIndex !== null) {
            cart[this.editingIndex] = {
                name,
                description,
                price,
                image: cart[this.editingIndex].image // Keep existing image if editing
            };
            this.editingIndex = null;
        } else {
            cart.push({ name, description, price, image });
        }

        this.saveCart(cart);
        this.hideProductForm();
    }

    async getBase64Image(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    editProduct(index) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const item = cart[index];
        document.getElementById('product-name').value = item.name;
        document.getElementById('product-description').value = item.description;
        document.getElementById('product-price').value = item.price;
        document.getElementById('product-image').value = ''; // Reset file input
        document.getElementById('form-title').textContent = 'Edit Product';
        this.productFormContainer.classList.remove('hidden');
        this.editingIndex = index;
    }

    removeProduct(index) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.splice(index, 1);
        this.saveCart(cart);
    }

    editImage(index) {
        this.currentImageIndex = index;
        document.getElementById('product-image').click();
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.getBase64Image(file).then(imageUrl => {
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                if (this.currentImageIndex !== null && cart[this.currentImageIndex]) {
                    cart[this.currentImageIndex].image = imageUrl;
                    localStorage.setItem('cart', JSON.stringify(cart));
                    this.loadCart();
                }
            }).catch(error => console.error('Error reading image file:', error));
        }
    }

    showProductForm() {
        document.getElementById('form-title').textContent = 'Add Product';
        this.productForm.reset();
        this.productFormContainer.classList.remove('hidden');
        this.editingIndex = null; // Reset editing index
    }

    hideProductForm() {
        this.productFormContainer.classList.add('hidden');
    }
}

// Initialize the CartManager
const cartManager = new CartManager();
