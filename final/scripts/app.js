(function() {
  'use strict';

  var app = {
    connection: {
      baseUrl: '!!!YOUR BASE URL!!!',
      consumerKey: '!!!YOUR CONSUMER KEY!!!',
      accessToken: '!!!YOUR ACCESS TOKEN!!!',
    },
    isLoading: true,
    visibleProducts: {},
    cartProducts: [],
    pagination: {
      currentPage: 1,
      perPage: 12,
    },
    state: {},
    productGridItemTemplate: document.getElementById('productGridItemTemplate'),
    paginationTemplate: document.getElementById('paginationTemplate'),
    spinner: document.querySelector('.loader'),
    container: document.querySelector('.main'),
  }

  document.getElementById('butRefresh').addEventListener('click', function() {
    // fetch all products from API and display them
    app.fetchProducts();
  });

  app.saveState = function() {
    var state = JSON.stringify(app.state);
    localStorage.state = state;
  }

  app.fetchProducts = function() {
    var page = app.pagination.currentPage;
    var perPage = app.pagination.perPage;

    var url = app.connection.baseUrl + 'rest/V1/products?' +
      'searchCriteria[currentPage]=' + page + '&' +
      'searchCriteria[pageSize]=' + perPage;

    // TODO: add cache logic here
    if ('caches' in window) {
      /*
       * Check if the service worker has already cached this city's weather
       * data. If the service worker has the data, then display the cached
       * data while the app fetches the latest data.
       */
      caches.match(url).then(function(response) {
        if (response) {
          response.json().then(function updateFromCache(json) {
            var results = json;
            app.updateProductsGrid(results);
          });
        }
      });
    }

    // fetch the latest data
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          app.updateProductsGrid(response);
        }
      } else {
        // Return the initial products since no data is available.
        // app.updateProductsGrid(initialProducts);
      }
    };
    request.open('GET', url);
    request.setRequestHeader('Authorization', 'Bearer ' + app.connection.accessToken);
    request.send();
  }

  app.updateProductsGrid = function(productsData) {
    app.state = productsData;
    var searchCriteria = app.state.search_criteria;
    var productsTotalCount = app.state.total_count;

    app.clearProductsGrid();

    app.renderPagination(searchCriteria, productsTotalCount);

    var i;
    for(i = 0; i < app.state.items.length; i++) {
      app.renderProductItem(app.state.items[i], i);
    }

    // save state to localStorage
    app.saveState();

    if (app.isLoading) {
      app.spinner.setAttribute('hidden', true);
      app.container.removeAttribute('hidden');
      app.isLoading = false;
    }
  }

  app.clearProductsGrid = function() {
    app.container.innerHTML = '';
  }

  app.renderPagination = function(searchCriteria, productsTotalCount) {
    app.pagination.currentPage = searchCriteria.current_page;
    app.pagination.perPage = searchCriteria.page_size;

    var paginationEl = app.container.querySelector('.pagination');
    if (!paginationEl) {
      paginationEl = app.paginationTemplate.cloneNode(true);

      paginationEl.removeAttribute('id');
      paginationEl.removeAttribute('hidden');
      app.container.appendChild(paginationEl);
    }

    var currentPageEl = document.getElementById('paginationCurrentPage');
    currentPageEl.textContent = searchCriteria.current_page;

    document.querySelector('.pages-item-previous').addEventListener('click', function() {
      app.pagination.currentPage--;
      app.fetchProducts();
    });

    document.querySelector('.pages-item-next').addEventListener('click', function() {
      app.pagination.currentPage++;
      app.fetchProducts();
    });
  }

  app.renderProductItem = function(productData, index) {
    var gridItem = app.productGridItemTemplate.cloneNode(true);

    var productSmallImgURI = app.searchProductCustomAttribute('small_image', productData.custom_attributes);

    gridItem.removeAttribute('id');
    gridItem.querySelector('.butAddToCart').setAttribute('data-index', index);
    gridItem.querySelector('.product__image img')
      .setAttribute('src', app.connection.baseUrl + 'pub/media/catalog/product' + productSmallImgURI);

    gridItem.querySelector('.product__name').textContent = productData.name;
    gridItem.querySelector('.product__sku').textContent = productData.sku;
    gridItem.querySelector('.product__price').textContent = productData.price;
    gridItem.removeAttribute('hidden');

    gridItem.querySelector('.butAddToCart').addEventListener('click', function(e) {
      app.addProductToCart(productData);
    });

    app.container.appendChild(gridItem);
  }

  app.addProductToCart = function(productData) {
    app.cartProducts.push(productData);
    app.updateCart();
  }

  app.updateCart = function() {
    document.getElementById('butViewCartCounter').textContent = app.cartProducts.length;
  }

  app.searchProductCustomAttribute  = function (key, customAttributesArray){
    for (var i=0; i < customAttributesArray.length; i++) {
        if (customAttributesArray[i].attribute_code === key) {
            return customAttributesArray[i].value;
        }
    }
    return null;
  }

  // Result of [domain]/rest/V1/products?searchCriteria[currentPage]=1&searchCriteria[pageSize]=3
  var initialProducts = {
    "items": [
        {
            "id": 1,
            "sku": "24-MB01",
            "name": "Joust Duffle Bag",
            "attribute_set_id": 15,
            "price": 34,
            "status": 1,
            "visibility": 4,
            "type_id": "simple",
            "created_at": "2018-04-23 09:09:42",
            "updated_at": "2018-04-23 09:09:42",
            "product_links": [],
            "tier_prices": [],
            "custom_attributes": [
                {
                    "attribute_code": "small_image",
                    "value": "/m/b/mb01-blue-0.jpg"
                },
            ]
        },
        {
            "id": 2,
            "sku": "24-MB04",
            "name": "Strive Shoulder Pack",
            "attribute_set_id": 15,
            "price": 32,
            "status": 1,
            "visibility": 4,
            "type_id": "simple",
            "created_at": "2018-04-23 09:09:42",
            "updated_at": "2018-04-23 09:09:42",
            "product_links": [],
            "tier_prices": [],
            "custom_attributes": [
                {
                    "attribute_code": "small_image",
                    "value": "/m/b/mb04-black-0.jpg"
                },
            ]
        },
        {
            "id": 3,
            "sku": "24-MB03",
            "name": "Crown Summit Backpack",
            "attribute_set_id": 15,
            "price": 38,
            "status": 1,
            "visibility": 4,
            "type_id": "simple",
            "created_at": "2018-04-23 09:09:42",
            "updated_at": "2018-04-23 09:09:42",
            "product_links": [],
            "tier_prices": [],
            "custom_attributes": [
                {
                    "attribute_code": "small_image",
                    "value": "/m/b/mb03-black-0.jpg"
                },
            ]
        }
      ],
      "search_criteria": {
          "filter_groups": [],
          "page_size": 3,
          "current_page": 1
      },
      "total_count": 2040
  }

  app.state = localStorage.state;
  if (app.state) {
    app.state = JSON.parse(app.state);
    app.updateProductsGrid(app.state);
  } else {
    // The user is using the app for the first time
    // To simplify this app we just fetch our products from server
    app.fetchProducts();
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./service-worker.js')
             .then(function() { console.log('Service Worker Registered'); });
  }
})();
